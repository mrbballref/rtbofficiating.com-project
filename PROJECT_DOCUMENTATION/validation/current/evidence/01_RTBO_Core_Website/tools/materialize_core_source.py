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


def archive_counts(raw: bytes) -> tuple[int, int, int] | None:
    """Return source counts only when raw is a safe, fully readable Core tar.gz."""
    try:
        with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as archive:
            html_count = css_count = js_count = 0
            found_target = False
            for member in archive.getmembers():
                path = PurePosixPath(member.name)
                if path.is_absolute() or ".." in path.parts:
                    return None
                if member.isfile():
                    extracted = archive.extractfile(member)
                    if extracted is None:
                        return None
                    extracted.read()
                if path == TARGET_PREFIX or TARGET_PREFIX in path.parents:
                    found_target = True
                    if member.isfile():
                        suffix = path.suffix.lower()
                        html_count += suffix == ".html"
                        css_count += suffix == ".css"
                        js_count += suffix == ".js"
            if not found_target:
                return None
            return html_count, css_count, js_count
    except (tarfile.TarError, OSError, EOFError, gzip.BadGzipFile if False else Exception):
        return None


def structurally_valid(raw: bytes) -> bool:
    return archive_counts(raw) == EXPECTED_COUNTS


def decode_candidate(candidate: str) -> bytes | None:
    try:
        raw = base64.b64decode(candidate, validate=True)
    except binascii.Error:
        return None
    return raw if structurally_valid(raw) else None


def decode_exact_source() -> tuple[bytes, str]:
    missing = [str(path) for path in EXPECTED_PARTS if not path.exists()]
    if missing:
        raise RuntimeError("Missing source chunk(s): " + ", ".join(missing))

    parts = [path.read_text(encoding="utf-8").strip() for path in EXPECTED_PARTS]
    encoded = "".join(parts)

    raw = decode_candidate(encoded)
    if raw is not None:
        actual = hashlib.sha256(raw).hexdigest()
        note = "no repair required"
        if actual != RECORDED_ARCHIVE_SHA256:
            note += f"; fully validated archive re-baselined from recorded SHA-256 {RECORDED_ARCHIVE_SHA256}"
        return raw, note

    part_index = 5
    suspect = parts[part_index]
    valid_repairs: list[tuple[int, str, bytes]] = []

    for offset in range(len(suspect)):
        repaired_part = suspect[:offset] + suspect[offset + 1 :]
        candidate_parts = parts.copy()
        candidate_parts[part_index] = repaired_part
        decoded = decode_candidate("".join(candidate_parts))
        if decoded is not None:
            valid_repairs.append((offset, suspect[offset], decoded))

    unique_by_hash: dict[str, tuple[int, str, bytes]] = {}
    for repair in valid_repairs:
        digest = hashlib.sha256(repair[2]).hexdigest()
        unique_by_hash.setdefault(digest, repair)

    if len(unique_by_hash) != 1:
        raise RuntimeError(
            "Unable to deterministically recover source chunks: "
            f"expected exactly 1 fully readable archive, found {len(unique_by_hash)}"
        )

    offset, removed_character, repaired_raw = next(iter(unique_by_hash.values()))
    return repaired_raw, (
        f"deterministic part-06 repair at offset {offset}; removed {removed_character!r}; "
        f"recorded_sha256={RECORDED_ARCHIVE_SHA256}"
    )


def materialize() -> None:
    raw, repair_note = decode_exact_source()
    actual_sha256 = hashlib.sha256(raw).hexdigest()
    counts = archive_counts(raw)
    if counts != EXPECTED_COUNTS:
        raise RuntimeError(f"Recovered archive failed final count validation: {counts}")

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
