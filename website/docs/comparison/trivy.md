---
title: DockSec vs Trivy
sidebar_position: 1
description: How OWASP DockSec relates to Trivy - which it runs internally rather than competes with.
---

# DockSec vs Trivy

**Short answer: DockSec runs Trivy.** They are not alternatives in the usual
sense, and any comparison that treats them as rivals is misleading.

## The relationship

Trivy is the detection engine. DockSec shells out to it for image
vulnerability scanning and `trivy config` misconfiguration checks, structures
the results into its own finding shape, and then does the work Trivy does not
attempt: ranking by exploitation likelihood, correlating across services, and
emitting runnable fixes.

If you install DockSec, you are running Trivy. The container image bundles a
pinned version of it.

## Where Trivy is the better choice

Be clear about this, because it is often the right answer:

- **You want raw detection.** Trivy finds the CVEs. DockSec adds no detection
  capability whatsoever.
- **You need Kubernetes, Helm, Terraform or registry scanning.** Trivy does all
  of these well. DockSec deliberately does not re-expose them - claiming them
  would invite the fair question "why not just run Trivy?"
- **Speed matters most.** DockSec adds an EPSS lookup, chain analysis and
  report generation on top of a Trivy scan. It is necessarily slower.
- **You already have working triage.** If your team has a process that turns
  Trivy output into decisions, DockSec is solving a problem you do not have.

## Where DockSec adds something

| | Trivy | DockSec |
|---|---|---|
| Output on `node:18` | 2,200 findings, severity-sorted | 2,200 findings, **9 ranked `Fix Now`** |
| Ordering | Severity | EPSS exploitation likelihood, then severity |
| Compose stack | Each service scanned separately | Topology analysed; cross-service chains reported |
| Remediation | Fixed version in a column | `apt-get install --only-upgrade -y openssl=3.5.7-1~deb13u2` |
| Applying fixes | Manual | `--fix` edits the Dockerfile, keeps a `.bak` |
| Incomplete scan | Reported on stderr | Reported in the output, `--json`, and exit code 3 |

The `node:18` row is the crux. Both tools find the same 2,200 findings -
DockSec found them *using* Trivy. The difference is that one output can be
acted on this week and the other cannot.

## On EPSS

Trivy can surface EPSS scores in some configurations. DockSec's difference is
not access to the data but what it does with it: findings are sorted into four
tiers, the tier drives the order of the fix commands, and the tier is carried
into SARIF so GitHub Code Scanning sees it too.

## Running both

Generally unnecessary - DockSec's findings include Trivy's. If you already run
Trivy in CI and want to try DockSec, replace the step rather than add one, and
compare the output on the same image.

The exception is Kubernetes and registry scanning, which DockSec does not do.
Those remain Trivy's job.
