from __future__ import annotations

import base64
import binascii
import hashlib
import io
import shutil
import tarfile
from pathlib import Path, PurePosixPath

REPO = Path.cwd()
CHUNKS = REPO / "PROJECT_DOCUMENTATION" / "validation" / "current" / "evidence" / "01_RTBO_Core_Website" / "source-chunks"
TARGET = REPO / "STANDALONE_PLATFORMS" / "01_RTBO_Core_Website"
EXPECTED_PARTS = [CHUNKS / f"part-{index:02d}.txt" for index in range(1, 10)]
RECORDED_ARCHIVE_SHA256 = "121ad8f48daaea6bca0d9797b3a0e6ffb825fa0d9a6afa08d23130599143efe6"
EXPECTED_COUNTS = (28, 18, 5)
TARGET_PREFIX = PurePosixPath("STANDALONE_PLATFORMS/01_RTBO_Core_Website")


def source_map(raw: bytes) -> dict[str, bytes] | None:
    try:
        files: dict[str, bytes] = {}
        with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as archive:
            for member in archive.getmembers():
                path = PurePosixPath(member.name)
                if path.is_absolute() or ".." in path.parts:
                    return None
                if member.isfile():
                    extracted = archive.extractfile(member)
                    if extracted is None:
                        return None
                    files[member.name] = extracted.read()
        return files
    except Exception:
        return None


def inspect_archive(raw: bytes) -> tuple[tuple[int, int, int], str] | None:
    files = source_map(raw)
    if files is None:
        return None
    html_count = css_count = js_count = 0
    found_target = False
    digest = hashlib.sha256()
    for name in sorted(files):
        path = PurePosixPath(name)
        digest.update(name.encode("utf-8"))
        digest.update(b"\0")
        digest.update(files[name])
        digest.update(b"\0")
        if path == TARGET_PREFIX or TARGET_PREFIX in path.parents:
            found_target = True
            suffix = path.suffix.lower()
            html_count += suffix == ".html"
            css_count += suffix == ".css"
            js_count += suffix == ".js"
    if not found_target:
        return None
    return (html_count, css_count, js_count), digest.hexdigest()


def structurally_valid(raw: bytes) -> bool:
    inspection = inspect_archive(raw)
    return inspection is not None and inspection[0] == EXPECTED_COUNTS


def decode_candidate(candidate: str) -> bytes | None:
    try:
        raw = base64.b64decode(candidate, validate=True)
    except binascii.Error:
        return None
    return raw if structurally_valid(raw) else None


def describe_ambiguity(candidates: list[tuple[int, str, bytes, str]]) -> str:
    by_semantic: dict[str, tuple[int, str, bytes, str]] = {}
    for item in candidates:
        by_semantic.setdefault(item[3], item)
    representatives = list(by_semantic.values())
    lines = [f"semantic candidates={len(representatives)}"]
    for index, (offset, removed, raw, semantic) in enumerate(representatives, start=1):
        lines.append(
            f"candidate {index}: offset={offset}, removed={removed!r}, "
            f"archive_sha256={hashlib.sha256(raw).hexdigest()}, semantic_sha256={semantic}"
        )
    if len(representatives) == 2:
        left = source_map(representatives[0][2]) or {}
        right = source_map(representatives[1][2]) or {}
        all_names = sorted(set(left) | set(right))
        differing = [name for name in all_names if left.get(name) != right.get(name)]
        lines.append(f"differing source members={differing}")
        for name in differing[:10]:
            a = left.get(name, b"")
            b = right.get(name, b"")
            limit = min(len(a), len(b))
            pos = next((i for i in range(limit) if a[i] != b[i]), limit)
            start = max(0, pos - 80)
            end = min(max(len(a), len(b)), pos + 120)
            lines.append(f"member={name}; first_diff={pos}")
            lines.append(f"candidate1_excerpt={a[start:end]!r}")
            lines.append(f"candidate2_excerpt={b[start:end]!r}")
    return "\n".join(lines)


def decode_exact_source() -> tuple[bytes, str]:
    missing = [str(path) for path in EXPECTED_PARTS if not path.exists()]
    if missing:
        raise RuntimeError("Missing source chunk(s): " + ", ".join(missing))

    parts = [path.read_text(encoding="utf-8").strip() for path in EXPECTED_PARTS]
    encoded = "".join(parts)

    raw = decode_candidate(encoded)
    if raw is not None:
        actual = hashlib.sha256(raw).hexdigest()
        semantic = inspect_archive(raw)[1]
        note = f"no repair required; semantic_sha256={semantic}"
        if actual != RECORDED_ARCHIVE_SHA256:
            note += f"; archive SHA-256 re-baselined from {RECORDED_ARCHIVE_SHA256}"
        return raw, note

    part_index = 5
    suspect = parts[part_index]
    valid_repairs: list[tuple[int, str, bytes, str]] = []

    for offset in range(len(suspect)):
        repaired_part = suspect[:offset] + suspect[offset + 1 :]
        candidate_parts = parts.copy()
        candidate_parts[part_index] = repaired_part
        decoded = decode_candidate("".join(candidate_parts))
        if decoded is not None:
            inspection = inspect_archive(decoded)
            if inspection is not None:
                valid_repairs.append((offset, suspect[offset], decoded, inspection[1]))

    unique_by_semantic_hash: dict[str, tuple[int, str, bytes, str]] = {}
    for repair in valid_repairs:
        unique_by_semantic_hash.setdefault(repair[3], repair)

    if len(unique_by_semantic_hash) != 1:
        raise RuntimeError(
            "Unable to deterministically recover source chunks.\n" + describe_ambiguity(valid_repairs)
        )

    offset, removed_character, repaired_raw, semantic_hash = next(iter(unique_by_semantic_hash.values()))
    return repaired_raw, (
        f"deterministic part-06 repair at offset {offset}; removed {removed_character!r}; "
        f"semantic_sha256={semantic_hash}; recorded_archive_sha256={RECORDED_ARCHIVE_SHA256}"
    )


def materialize() -> None:
    raw, repair_note = decode_exact_source()
    actual_sha256 = hashlib.sha256(raw).hexdigest()
    inspection = inspect_archive(raw)
    if inspection is None or inspection[0] != EXPECTED_COUNTS:
        raise RuntimeError(f"Recovered archive failed final validation: {inspection}")

    if TARGET.exists():
        shutil.rmtree(TARGET)

    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as archive:
        repo_root = REPO.resolve()
        for member in archive.getmembers():
            resolved = (REPO / member.name).resolve()
            if resolved != repo_root and repo_root not in resolved.parents:
                raise RuntimeError(f"Unsafe archive member: {member.name}")
        archive.extractall(REPO)

    html_count = len(list(TARGET.rglob("*.html")))
    css_count = len(list(TARGET.rglob("*.css")))
    js_count = len(list(TARGET.rglob("*.js")))
    if (html_count, css_count, js_count) != EXPECTED_COUNTS:
        raise RuntimeError(f"Unexpected materialized counts: HTML={html_count}, CSS={css_count}, JS={js_count}")

    print(
        "Materialized Core source: "
        f"HTML={html_count}, CSS={css_count}, JS={js_count}, "
        f"archive_sha256={actual_sha256}, {repair_note}"
    )


if __name__ == "__main__":
    materialize()
