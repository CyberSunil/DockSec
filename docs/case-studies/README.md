# Case studies

Real scans of official Docker Hub images, recorded so the numbers can be
checked rather than taken on trust. Every command is copy-pasteable and every
figure below came from running it.

Official images were chosen deliberately: they are maintained by people who
know what they are doing, they are what most teams actually build on, and
publishing their findings names no third party unfavourably. If DockSec finds
something here, the point is not that the maintainers were careless - it is
that a base image is a supply chain you inherit whether or not you look at it.

**Scanned 2026-09-20** with DockSec 2026.9.21, Trivy 0.74.0. Vulnerability
counts move as advisories are published, so expect your numbers to differ;
the shape of the result is what these studies are about.

| Study | Image | Findings | The point |
| --- | --- | --- | --- |
| [1](node-18.md) | `node:18` | 2,200 | Triage: 9 CVEs deserve attention today, not 2,200 |
| [2](python-slim.md) | `python:3.12-slim` | 44 | A well-maintained image with nothing you can fix |
| [3](nginx-alpine.md) | `nginx:1.31.6-alpine` | 0 | What a clean result looks like, and what it does not prove |

## Why these three

They are the three outcomes a user will actually meet, and each one needs a
different response:

- **Overwhelming** (`node:18`) - the case for prioritisation.
- **Unactionable** (`python:3.12-slim`) - findings with no available fix, where
  the honest answer is "change the base image or accept the risk".
- **Clean** (`nginx:1.31.6-alpine`) - where the interesting question becomes
  what the scan did *not* check.
