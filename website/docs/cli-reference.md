---
title: CLI reference
sidebar_position: 1
---

# CLI reference

Generated from `docksec --help`. If this page and the tool disagree, the tool
is right - please [open an issue](https://github.com/OWASP/DockSec/issues).

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Clean - no findings at or above `--fail-on` |
| `1` | Findings at or above `--fail-on` |
| `2` | Usage error - bad flags, missing or invalid input |
| `3` | Incomplete scan - a scanner could not run, or an image was missing |

Exit `3` is distinct on purpose: "could not look" is not "nothing found".

## Common invocations

```bash
docksec Dockerfile --scan-only                    # lint a Dockerfile
docksec Dockerfile -i myapp:latest --scan-only    # and scan the built image
docksec --image-only -i myapp:latest              # image only
docksec --compose docker-compose.yml --scan-only  # a whole stack
docksec Dockerfile --scan-only --fix --dry-run    # preview mechanical fixes
docksec Dockerfile --scan-only --fail-on high     # gate a build
```

## Full options

```text
usage: docksec [-h] [-i IMAGE] [-c [COMPOSE]] [--ai-only] [--scan-only]
               [--image-only] [--provider {openai,anthropic,google,ollama}]
               [--model MODEL] [--compact-output] [--skip-ai-scoring]
               [--severity SEVERITY] [--fail-on SEVERITY] [--format FORMAT]
               [--output-dir DIR] [--json] [--sarif] [--sbom] [--offline]
               [--fix] [--dry-run] [--force] [--no-epss]
               [--incomplete-policy {warn,fail}] [--no-redact] [--no-cache]
               [--ignore-file FILE] [--baseline FILE] [--update-baseline]
               [--config FILE] [--no-config] [--print-config-schema] [--quiet]
               [-v] [--log-file FILE] [--no-color] [--version]
               [dockerfile]

Docker Security Analysis Tool

positional arguments:
  dockerfile            Path to the Dockerfile to analyze (optional when using
                        --image-only or --compose)

options:
  -h, --help            show this help message and exit
  -i, --image IMAGE     Docker image name to scan
  -c, --compose [COMPOSE]
                        Path to docker-compose file to scan. If no path is
                        provided, auto-detects in current directory.
  --ai-only             Run only AI-based recommendations (requires
                        Dockerfile)
  --scan-only           Run only Dockerfile/image scanning (requires --image)
  --image-only          Scan only the Docker image without Dockerfile analysis
  --provider {openai,anthropic,google,ollama}
                        LLM provider to use (default: openai, can also set
                        LLM_PROVIDER env var)
  --model MODEL         Model name to use (e.g., gpt-4o, claude-haiku-4-5,
                        gemini-1.5-pro, llama3.1)
  --compact-output      Use compact output format (less verbose)
  --skip-ai-scoring     Deprecated and ignored: scoring is always
                        deterministic. Removed in a future release.
  --severity SEVERITY   Comma-separated severity levels to scan for (default:
                        CRITICAL,HIGH; or set DOCKSEC_DEFAULT_SEVERITY)
  --fail-on SEVERITY    Exit with code 1 if any finding is at or above this
                        severity (CRITICAL, HIGH, MEDIUM, or LOW)
  --format FORMAT       Comma-separated report formats to write: json, csv,
                        pdf, html, markdown (default: all)
  --output-dir DIR      Directory to write reports to (default:
                        ~/.docksec/results or DOCKSEC_RESULTS_DIR)
  --json                Print scan results as JSON to stdout (no report files
                        unless --format is also given)
  --sarif               Write a SARIF 2.1.0 report for GitHub Code Scanning
                        and other SARIF-compatible tools
  --sbom                Write a CycloneDX SBOM (.cdx.json) of the scanned
                        image for supply-chain tooling (requires an image)
  --offline             Run without network access: use the local Trivy DB (no
                        DB update) and skip AI analysis
  --fix                 Apply the safe subset of the suggested Dockerfile
                        changes, keep a .bak, and re-scan to show the delta.
                        Refuses to run on a dirty git working tree unless
                        --force is given.
  --dry-run             With --fix, print the diff without writing anything
  --force               With --fix, apply changes even when the git working
                        tree has uncommitted changes to the target file
  --no-epss             Skip the EPSS exploitation-likelihood lookup and rank
                        findings by severity alone (only CVE IDs are ever
                        sent; implied by --offline)
  --incomplete-policy {warn,fail}
                        What to do when a scanner could not run: 'warn'
                        reports the gap and continues (default), 'fail' exits
                        3 so CI cannot pass on an incomplete scan
  --no-redact           Do not mask secret-looking values before sending file
                        content to the AI provider
  --no-cache            Bypass the scan results cache and force a fresh scan
  --ignore-file FILE    Path to an ignore file listing findings to suppress
                        (default: .docksec-ignore.yml in the current
                        directory, if present)
  --baseline FILE       Path to a baseline file; with --fail-on, only findings
                        not present in the baseline trigger the gate
  --update-baseline     Write the current scan findings to --baseline instead
                        of gating against it
  --config FILE         Path to a DockSec config file (default: nearest
                        .docksec.yml, searching up to the repository root)
  --no-config           Ignore any .docksec.yml and use only flags,
                        environment variables, and defaults
  --print-config-schema
                        Print the JSON Schema for .docksec.yml to stdout and
                        exit
  --quiet               Reduce output to warnings, errors, and the result
                        summary
  -v, --verbose         Show INFO-level log lines on stderr
  --log-file FILE       Also append log lines to FILE, creating missing parent
                        directories; combine with --verbose to capture INFO-
                        level logs
  --no-color            Disable colored output (also honors the NO_COLOR env
                        var)
  --version             show program's version number and exit
```

## Environment variables

| Variable | Effect |
| --- | --- |
| `DOCKSEC_RESULTS_DIR` | Where reports are written |
| `DOCKSEC_USE_CACHE` | `false` bypasses the scan cache |
| `DOCKSEC_CACHE_TTL_HOURS` | Cache lifetime, default 24 |
| `DOCKSEC_PULL_MISSING_IMAGES` | `false` fails instead of pulling a missing image |
| `DOCKSEC_DEFAULT_SEVERITY` | Default severity filter |
| `LLM_PROVIDER` / `LLM_MODEL` | AI provider selection |
| `NO_COLOR` | Disables colour, same as `--no-color` |
