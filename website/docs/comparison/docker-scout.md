---
title: DockSec vs Docker Scout
sidebar_position: 3
description: OWASP DockSec compared with Docker Scout - the scanner built into Docker Desktop.
---

# DockSec vs Docker Scout

Docker Scout is built into Docker Desktop and Docker Hub, which makes it the
path of least resistance for anyone already in that ecosystem. That
convenience is real and worth weighing.

## Comparison

| | Docker Scout | DockSec |
|---|---|---|
| Setup | Already installed with Docker Desktop | `pip install docksec` |
| Account required | Docker Hub account for most features | No |
| Where analysis runs | Largely server-side | Entirely local |
| Base image recommendations | Yes, and good | Digest pinning only |
| Policy evaluation | Yes, via Docker Hub | Local config file and waivers |
| Compose topology analysis | No | Yes |
| Cross-service exploit chains | No | Yes |
| Automatic Dockerfile repair | No | Yes |
| EPSS tiering | Partial | Yes, four tiers, carried into SARIF |
| Works without Docker Hub | Limited | Fully |
| Licence | Proprietary | MIT |

## Where Docker Scout is the better choice

- **You want zero setup.** It is already there.
- **You want base image recommendations.** Scout's suggestions for a less
  vulnerable base are genuinely useful and DockSec does not offer an
  equivalent.
- **You are entirely inside Docker Hub** and want policies alongside your
  registry.

## Where DockSec is the better choice

- **You cannot send images or findings to a third party.** Scout's model
  assumes Docker Hub; DockSec assumes nothing leaves.
- **You run Compose stacks.** Scout analyses images. DockSec analyses the
  relationships between services, which is where the interesting failures are.
- **You are not on Docker Desktop.** Scout is least useful outside it; DockSec
  is a Python package and a container image.
- **You need the output in CI, ranked.** DockSec's exit codes, `--fail-on`
  gating and SARIF with EPSS are built for a pipeline rather than a desktop.

## Using both

Reasonable. Scout for base image recommendations during development, DockSec
in CI for gating, chains and offline operation. They overlap on CVE detection
but their strengths sit in different places.
