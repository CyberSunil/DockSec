---
title: Get started
sidebar_position: 1
---

# Get started

DockSec scans a Dockerfile, a built image, or a whole Compose stack, and tells
you which findings matter and what to run. The deterministic core needs no API
key and no account.

## Install

```bash
pip install docksec
```

DockSec shells out to [Trivy](https://github.com/aquasecurity/trivy) and
[Hadolint](https://github.com/hadolint/hadolint). Install both:

```bash
python -m docksec.setup_external_tools
```

Prefer no install at all? The container bundles pinned versions of both:

```bash
docker run --rm -v "$PWD:/github/workspace" \
  -e INPUT_DOCKERFILE=Dockerfile \
  -e INPUT_SCAN_ONLY=true \
  ghcr.io/owasp/docksec:2026.9.21
```

## First scan

```bash
docksec Dockerfile --scan-only
```

`--scan-only` runs the full deterministic pipeline: scanners, EPSS priority,
exploit chains, the score, fix commands and coverage notes. Everything on this
site's front page comes from that mode.

Add an image to include operating-system and language package vulnerabilities:

```bash
docksec Dockerfile -i myapp:latest --scan-only
```

Scan a Compose stack, which is where cross-service [exploit
chains](./exploit-chains) are detected:

```bash
docksec --compose docker-compose.yml --scan-only
```

## Gate a build

```bash
docksec Dockerfile --scan-only --fail-on high
```

Exit codes are deliberately distinct, because "found problems" and "could not
look" need different responses in CI:

| Code | Meaning |
| --- | --- |
| `0` | No findings at or above `--fail-on` |
| `1` | Findings at or above `--fail-on` |
| `2` | Usage error - bad flags or missing input |
| `3` | Incomplete scan - a scanner could not run |

Exit `3` matters. A scan that could not inspect an image is not a clean scan,
and treating it as one is how a broken gate passes silently.

## Add the AI pass

Optional, and off by default. It correlates over the finished finding set
rather than reading the file on its own:

```bash
pip install "docksec[ai]"
export ANTHROPIC_API_KEY=...
docksec Dockerfile --provider anthropic
```

Secret-looking values are masked before anything reaches a provider. Run
`--scan-only` if you would rather nothing left the machine at all.

## Next

- [Why DockSec](./why-docksec) - what it does that a scanner alone does not
- [Reading the output](./reading-output) - what each block means
- [CI integration](./ci) - GitHub Actions, GitLab, Jenkins, pre-commit
- [What it does not do](./limitations) - read before adopting
