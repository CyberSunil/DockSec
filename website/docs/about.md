---
title: About the project
sidebar_position: 6
description: Who builds OWASP DockSec, how it is governed, and how to get involved.
---

# About DockSec

DockSec is an **OWASP Lab Project**, released under the MIT licence. It is
built in the open, it collects no telemetry, and it has no commercial tier.

## Who builds it

**[Advait Patel](https://github.com/advaitpatel)** created DockSec and leads
the project. He is a Senior Site Reliability Engineer working in cloud
security, an IEEE Senior Member, a Chair of the IEEE Chicago Section, and the
author of *Implementing Identity Management on GCP* and *Implementing Security
with AI in GCP* (Springer/Apress).

He has presented DockSec at OWASP Global AppSec USA, OWASP Global AppSec EU,
OWASP SnowFROC, the Open Cloud Security Conference, IEEE EIT and the Silicon
Valley Cybersecurity Conference. See [press and talks](./press).

**[Arkadii Yakovets](https://github.com/arkid15r)** is the project co-lead.

DockSec is also shaped by everyone who has filed an issue, sent a pull request
or told us the output was confusing. The
[contributor list](https://github.com/OWASP/DockSec/graphs/contributors) is on
GitHub.

## Why it exists

Container scanners got very good at finding problems and never got good at
telling you which ones matter. A scan of a common base image returns thousands
of findings; a team either ignores that output or spends a sprint on it, and
both are the wrong call.

DockSec sits one layer above detection. It runs Trivy and Hadolint, then ranks
what they find by real exploitation likelihood, reasons across the services in
a Compose stack, and emits commands you can paste. The reasoning behind that
positioning is in [why DockSec](./why-docksec), and the limits are in
[what it does not do](./limitations).

## How it is governed

As an OWASP project, DockSec is vendor-neutral and community-serving. It will
not gain a paid tier, a hosted service that ingests your findings, or
telemetry - those are not roadmap gaps, they are decisions, and they are
recorded as such.

## Getting involved

- **Report something** -
  [open an issue](https://github.com/OWASP/DockSec/issues). Output that
  confused you is as useful as a crash.
- **Contribute** - see
  [CONTRIBUTING.md](https://github.com/OWASP/DockSec/blob/main/CONTRIBUTING.md).
- **Talk to us** - `#project-docksec` on the
  [OWASP Slack](https://owasp.slack.com/).
- **Security issues** - see
  [SECURITY.md](https://github.com/OWASP/DockSec/blob/main/SECURITY.md).
  Please do not open a public issue for a vulnerability.
