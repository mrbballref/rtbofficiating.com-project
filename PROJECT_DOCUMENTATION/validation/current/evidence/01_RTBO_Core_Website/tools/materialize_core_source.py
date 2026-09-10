from __future__ import annotations

import base64
import binascii
import hashlib
import io
import shutil
import tarfile
from pathlib import Path

REPO = Path.cwd()
CHUNKS = REPO / "PROJECT_DOCUMENTATION" / "validation" / "current" / "evidence" / "01_RTBO_Core_Website" / "source-chunks"
TARGET = REPO / "STANDALONE_PLATFORMS" / "01_RTBO_Core_Website"
EXPECTED_PARTS = [CHUNKS / f"part-{index:02d}.txt" for index in range(1, 10)]
EXPECTED_ARCHIVE_SHA256 = "121ad8f48daaea6bca0d9797b3a0e6ffb825fa0d9a6afa08d23130599143efe6"


def decode_exact_source() -> tuple[bytes, str]:
    missing = [str(path) for path in EXPECTED_PARTS if not path.exists()]
    if missing:
        raise RuntimeError("Missing source chunk(s): " + ", ".join(missing))

    parts = [path.read_text(encoding="utf-8").strip() for path in EXPECTED_PARTS]
    encoded = "".join(parts)

    def try_decode(candidate: str) -> bytes | None:
        try:
            raw = base64.b64decode(candidate, validate=True)
        except binascii.Error:
            return None
        return raw if hashlib.sha256(raw).hexdigest() == EXPECTED_ARCHIVE_SHA256 else None

    raw = try_decode(encoded)
    if raw is not None:
        return raw, "no repair required"

    # Historical connector transfer added exactly one character to part 06.
    # Do not guess which character: test every possible one-character removal and
    # accept only a candidate whose decoded bytes match the previously recorded
    # immutable SHA-256 of the original source archive.
    part_index = 5
    suspect = parts[part_index]
    valid_repairs: list[tuple[int, str, bytes]] = []

    for offset in range(len(suspect)):
        repaired_part = suspect[:offset] + suspect[offset + 1 :]
        candidate_parts = parts.copy()
        candidate_parts[part_index] = repaired_part
        candidate = "".join(candidate_parts)
        decoded = try_decode(candidate)
        if decoded is not None:
            valid_repairs.append((offset, suspect[offset], decoded))

    if len(valid_repairs) != 1:
        raise RuntimeError(
            "Unable to deterministically repair source chunks: "
            f"expected exactly 1 SHA-256-matching candidate, found {len(valid_repairs)}"
        )

    offset, removed_character, repaired_raw = valid_repairs[0]
    return repaired_raw, f"deterministic part-06 repair at offset {offset}; removed {removed_character!r}"


def materialize() -> None:
    raw, repair_note = decode_exact_source()
    actual_sha256 = hashlib.sha256(raw).hexdigest()

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
    if (html_count, css_count, js_count) != (28, 18, 5):
        raise RuntimeError(f"Unexpected materialized counts: HTML={html_count}, CSS={css_count}, JS={js_count}")

    print(
        "Materialized Core source: "
        f"HTML={html_count}, CSS={css_count}, JS={js_count}, "
        f"archive_sha256={actual_sha256}, {repair_note}"
    )


if __name__ == "__main__":
    materialize()
