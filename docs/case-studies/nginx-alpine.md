# Case study 3: `nginx:1.31.6-alpine`

**Zero findings. Here is what that does and does not mean.**

```bash
docksec -i nginx:1.31.6-alpine --image-only --scan-only
```

## Result

| | |
| --- | --- |
| Total findings | 0 |
| CRITICAL / HIGH | 0 |
| Security score | 100 / 100 |

Alpine's package set is small, musl replaces glibc, and the image carries
almost nothing beyond nginx itself. Fewer packages means fewer advisories -
this is the strongest practical argument for a minimal base image, and it is
worth more than any amount of post-hoc hardening.

## What a clean result does not prove

This is the part most tools leave out, and the reason DockSec prints coverage
notes on every run including this one:

- **Not "no vulnerabilities".** It means no *known, published* advisory matches
  a package in this image today. Tomorrow's advisory applies to the same bytes.
- **Not "your application is safe".** Nothing here scanned your code, your
  dependencies, your Dockerfile or your compose file. A clean base image with
  a root-running service and a mounted Docker socket is not a secure
  deployment - see
  [`examples/compose/docker-compose-insecure.yml`](../../examples/compose/docker-compose-insecure.yml).
- **Not "reachability was checked".** DockSec does not prove a vulnerable code
  path is invoked, and does not claim to.
- **Not a statement about configuration.** Run the Dockerfile and compose
  scans for that; they are where most real findings live.

## What to actually do

Pin it and keep it pinned:

```dockerfile
FROM nginx:1.31.6-alpine@sha256:<digest>
```

A tag moves; a digest does not. Then re-scan on a schedule, because the result
above has a shelf life. Use `--baseline` so CI tells you when a new advisory
lands against an image that was clean yesterday - that transition is the
signal worth alerting on.
