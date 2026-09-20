---
title: DockSec vs Hadolint
sidebar_position: 6
description: How OWASP DockSec relates to Hadolint, which it runs internally.
---

# DockSec vs Hadolint

As with Trivy: **DockSec runs Hadolint.** It is a dependency, not a rival.

## The relationship

Hadolint is the Dockerfile linter. DockSec calls it with `-f json`, maps its
output into the same finding shape as everything else, and applies a
documented severity mapping:

| Hadolint level | DockSec severity |
|---|---|
| `error` | HIGH |
| `warning` | MEDIUM |
| `info` | LOW |
| `style` | LOW |

That mapping is a deliberate, conservative convention rather than a
measurement, and it is stated plainly in the
[limitations](../limitations) because reasonable people would map it
differently.

Where Hadolint and `trivy config` both report the same problem, a tested
collision map decides the winner - Trivy takes precedence, and Hadolint's line
number is carried across when Trivy lacks one.

## What DockSec adds

| | Hadolint | DockSec |
|---|---|---|
| Dockerfile rules | The engine | Runs Hadolint, plus `trivy config` |
| Image CVEs | No | Yes, via Trivy |
| Compose files | No | Yes, 17 rules plus chain analysis |
| Prioritisation | No | EPSS tiering |
| Fixes | Advice in the message | Runnable commands and `--fix` |
| Line numbers in SARIF | Yes | Yes, carried through |

## When to use Hadolint alone

- **You only lint Dockerfiles** and do not scan images. Hadolint is a single
  fast binary with no other dependencies, and DockSec would be overhead.
- **You want the raw rule set** without severity remapping.
- **Pre-commit on every save.** Hadolint is quick enough for that; a full
  DockSec scan is not.

A reasonable setup is Hadolint in pre-commit for instant feedback, DockSec in
CI for the full picture. DockSec ships a
[pre-commit hook](https://github.com/OWASP/DockSec/blob/main/.pre-commit-hooks.yaml)
too, if you would rather run one tool.
