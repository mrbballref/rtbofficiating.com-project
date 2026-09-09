from __future__ import annotations

import base64
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


def materialize() -> None:
    missing = [str(path) for path in EXPECTED_PARTS if not path.exists()]
    if missing:
        raise RuntimeError("Missing source chunk(s): " + ", ".join(missing))

    decoded_parts: list[bytes] = []
    for path in EXPECTED_PARTS:
        encoded = path.read_text(encoding="utf-8").strip()
        decoded_parts.append(base64.b64decode(encoded, validate=True))

    raw = b"".join(decoded_parts)
    actual_sha256 = hashlib.sha256(raw).hexdigest()
    if actual_sha256 != EXPECTED_ARCHIVE_SHA256:
        raise RuntimeError(
            f"Source archive SHA-256 mismatch: expected {EXPECTED_ARCHIVE_SHA256}, got {actual_sha256}"
        )

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
        f"HTML={html_count}, CSS={css_count}, JS={js_count}, archive_sha256={actual_sha256}"
    )


if __name__ == "__main__":
    materialize()
