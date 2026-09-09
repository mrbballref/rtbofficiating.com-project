from __future__ import annotations

import base64
import io
import shutil
import tarfile
from pathlib import Path

REPO = Path.cwd()
CHUNKS = REPO / "PROJECT_DOCUMENTATION" / "validation" / "current" / "evidence" / "01_RTBO_Core_Website" / "source-chunks"
TARGET = REPO / "STANDALONE_PLATFORMS" / "01_RTBO_Core_Website"
EXPECTED_PARTS = [CHUNKS / f"part-{index:02d}.txt" for index in range(1, 10)]


def materialize() -> None:
    missing = [str(path) for path in EXPECTED_PARTS if not path.exists()]
    if missing:
        raise RuntimeError("Missing source chunk(s): " + ", ".join(missing))

    encoded = "".join(path.read_text(encoding="utf-8").strip() for path in EXPECTED_PARTS)
    raw = base64.b64decode(encoded, validate=True)

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

    print(f"Materialized Core source: HTML={html_count}, CSS={css_count}, JS={js_count}")


if __name__ == "__main__":
    materialize()
