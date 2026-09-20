"""Merge per-file DockSec scans into the single artifact stage two reads."""

import json
import sys
from pathlib import Path


def main() -> int:
    tmp = Path(sys.argv[1])
    out = Path(sys.argv[2])

    files = []
    for path_file in sorted(tmp.glob("entry-*.path")):
        scan_file = path_file.with_suffix(".json")
        if not scan_file.exists():
            continue
        try:
            data = json.loads(scan_file.read_text())
        except ValueError:
            continue
        files.append({"file": path_file.read_text().strip(), "data": data})

    out.write_text(json.dumps({"files": files}, indent=2))
    print(f"scanned {len(files)} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
