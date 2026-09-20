---
title: "node:18 - 2,200 findings, 9 that matter"
sidebar_position: 1
---

**2,200 findings. Nine of them matter this week.**

```bash
docksec -i node:18 --image-only --scan-only
```

## Result

| | |
| --- | --- |
| Total findings | 2,200 |
| CRITICAL | 226 |
| HIGH | 1,974 |
| With a fix available | 1,712 |
| **`Fix Now`** | **9 distinct CVEs** |
| Security score | 28.6 / 100 |

## Why this image is like this

`node:18` is built on Debian and ships a full userland: a compiler toolchain,
`linux-libc-dev`, OpenSSL, SQLite, and the rest. None of that is a mistake -
it is what makes the image useful for building native modules. It is also
2,200 findings worth of surface area, and Node 18 reached end of life in
April 2025, so the base is no longer refreshed on the old cadence.

A conventional scanner reports all 2,200 and stops. That output cannot be
acted on: the team either ignores it or spends a sprint on it, and both
choices are wrong.

## What DockSec does with it

EPSS is exploitation data - the modelled probability that a CVE is exploited
in the wild in the next 30 days - and it separates the list sharply:

```
CVE-2026-31431   HIGH   EPSS 0.999  (100th percentile)  linux-libc-dev
CVE-2026-43284   HIGH   EPSS 0.932  (99.8th)            linux-libc-dev
CVE-2026-43500   HIGH   EPSS 0.929  (99.8th)            linux-libc-dev
CVE-2025-6965    HIGH   EPSS 0.725  (99.4th)            libsqlite3-0
CVE-2025-15467   HIGH   EPSS 0.482  (98.8th)            libssl-dev
CVE-2025-37924   HIGH   EPSS 0.207  (97.4th)            linux-libc-dev
```

`CVE-2026-31431` sits at the 100th percentile: near-certain exploitation. It
is rated HIGH, not CRITICAL, so a severity-sorted list puts it below 226
CRITICAL findings that nobody is exploiting. **That inversion is the entire
argument for this tool.**

Note what the ranking does *not* claim. EPSS says a CVE is being exploited
somewhere, not that it is reachable in your image. DockSec does not prove
reachability and says so in its coverage notes.

## What to actually do

The ranked list makes the decision obvious:

1. **Move off `node:18`.** It is end-of-life. `node:22-alpine` is a different
   base with a fraction of the surface - see
   [`examples/dockerfile/Dockerfile.node-hardened`](https://github.com/OWASP/DockSec/tree/main/examples/dockerfile/Dockerfile.node-hardened).
2. **If you cannot move yet**, `docksec --fix` and the printed `apt-get`
   commands resolve 1,712 of the 2,200, including all nine `Fix Now` CVEs.
3. **Gate on the ones that matter**, not the total:
   `docksec -i node:18 --image-only --fail-on high --baseline .docksec-baseline.json`

## The honest caveat

A scan of `node:18` measures the base image, not your application. Your own
dependencies, your configuration and your secrets are separate problems -
scan the Dockerfile and the compose file too.
