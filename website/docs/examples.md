---
title: Examples
sidebar_position: 3
---

Ten examples with documented expected findings. Each insecure file has a
hardened counterpart, so the delta is the lesson rather than the absolute
number.

Every figure below was produced by running the command shown. Rule findings
are stable; image CVE counts move as advisories are published.

## Dockerfiles

```bash
docksec examples/dockerfile/Dockerfile.node-insecure --scan-only
```

| File | Findings | Rules fired |
| --- | --- | --- |
| `Dockerfile.node-insecure` | 1 CRITICAL, 1 HIGH, 2 MEDIUM, 2 LOW | DS031, DS001, DS026, DS029, DL3008, DL3009 |
| `Dockerfile.node-hardened` | none | - |
| `Dockerfile.python-insecure` | 2 CRITICAL, 2 HIGH, 2 MEDIUM, 3 LOW | DS031, DS005, DS026, DS029, DL3008, DL3009, DL3020, DL3042 |
| `Dockerfile.python-hardened` | none | - |
| `Dockerfile.java-insecure` | 2 CRITICAL, 1 HIGH, 1 MEDIUM, 2 LOW | DS031, DS026, DS029, DL3008, DL3009 |
| `Dockerfile.java-hardened` | none | - |
| `Dockerfile.golang-multistage` | 1 LOW | DS026 |
| `Dockerfile.buildkit-secrets` | none | - |

Two of these are worth a second look:

**`Dockerfile.golang-multistage`** reports `DS026` (no HEALTHCHECK) and that is
correct, not a false positive: the image is distroless, so there is no shell
for a healthcheck to run. This is what the per-rule documentation means by
"when you might legitimately keep it" - orchestrator-level health probes are
the right answer here. See [`docs/rules/`](https://github.com/OWASP/DockSec/tree/main/docs/rules/).

**`Dockerfile.buildkit-secrets`** scans clean, which is the point. It uses
`RUN --mount=type=secret`, so the credential never enters a layer or the image
history. Compare it with the `ENV`-based secrets in the insecure files, which
are reported as CRITICAL (`DS031`) - both "pass a secret to the build", only
one of them safely.

## Compose stacks

```bash
docksec --compose examples/compose/docker-compose-insecure.yml --scan-only
```

| File | Findings | Notable |
| --- | --- | --- |
| `docker-compose-insecure.yml` | 6 CRITICAL/HIGH config findings | 3 exploit chains, score 0 |
| `docker-compose-secure.yml` | 0 config findings | base-image CVEs only |

The insecure stack is the best demonstration of what DockSec does that a
per-file scanner cannot: it reports **exploit chains** across services -
a socket mount plus a published port is one path to host compromise, not two
unrelated findings.

The hardened stack reports zero configuration findings but still shows CVEs
from its pinned base images. That is deliberate and worth understanding: the
configuration is correct, and the remaining findings are in upstream packages
with no fix available. A scanner that showed zero here would be hiding
something. See [`docs/case-studies/python-slim.md`](./case-studies/python-slim).

## Config file

[`.docksec.yml`](https://github.com/OWASP/DockSec/blob/main/examples/.docksec.yml) is an annotated repo-level config showing every
supported key.
