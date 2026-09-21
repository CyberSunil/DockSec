---
title: DockSec vs Dependabot
sidebar_position: 5
description: Why OWASP DockSec and GitHub Dependabot solve different problems and work well together.
---

# DockSec vs Dependabot

These two are not competitors, and choosing between them is usually the wrong
question. They operate on different inputs at different points in the
lifecycle.

## The difference in one line

**Dependabot updates the dependencies you declare. DockSec analyses the image
you ship.**

Dependabot reads manifests - `package.json`, `requirements.txt`, `go.mod` - and
opens pull requests to bump versions. It also watches `FROM` lines in
Dockerfiles and will propose a base image bump.

DockSec reads the built image and the Compose file. Most of what it finds is in
operating-system packages installed *inside* the base image, which no manifest
declares and Dependabot never sees.

## Concretely

Scanning `node:18` produces 2,200 findings, almost all in Debian packages:
`linux-libc-dev`, `libssl`, `perl`, `libsqlite3`. Your `package.json` declares
none of them. Dependabot's only available move is to suggest a different base
image tag; it cannot tell you which of those 2,200 matter, and it has no
visibility into your Compose topology at all.

Equally, DockSec will not open a pull request when your `express` dependency
has a CVE in a manifest. That is Dependabot's job and it does it well.

## Comparison

| | Dependabot | DockSec |
|---|---|---|
| Input | Declared manifests, `FROM` lines | Built image, Dockerfile, Compose file |
| OS packages inside an image | No | Yes |
| Opens pull requests | Yes | No |
| Runs locally | No | Yes |
| Requires GitHub | Yes | No |
| Prioritises by exploitation | No | Yes |
| Compose topology | No | Yes |
| Automatic fixes | Version bumps via PR | Dockerfile edits via `--fix` |

## Use both

The sensible configuration:

- **Dependabot** keeps declared dependencies and base image tags current.
- **DockSec** gates the build on what is actually in the image, ranked by
  exploitation likelihood, and catches the cross-service problems that no
  manifest describes.

They do not overlap enough to make either redundant.
