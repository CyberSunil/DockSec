# Changelog

All notable changes to DockSec are documented in this file.

## Unreleased

### Changed (breaking: security score)

- **The security score now weights severity over volume, so most scores will
  move - usually downward.** The bundled insecure compose example scored
  `60.5/100 "FAIR"` while mounting the Docker socket, running `privileged: true`
  and host networking, and carrying two plaintext passwords. It now scores
  `0.8/100`. The hardened example scores `89.3`. Four defects caused the old
  number:
  - Findings were deducted additively, so fifty LOW findings outweighed three
    CRITICALs. Deductions are now damped by count and each severity imposes a
    ceiling, so a single CRITICAL always outranks any number of LOW findings.
  - The Dockerfile axis scored 95/100 when there was no Dockerfile at all. Axes
    that were not measured are now excluded from the average rather than
    contributing a near-perfect score.
  - Compose misconfigurations never reached the configuration axis, so a stack
    mounting the Docker socket scored a clean 100 there.
  - The credential cap inspected Dockerfile `ENV` only, so a compose file with a
    plaintext password was never capped.

  Findings that represent an unambiguous compromise - a mounted Docker socket, a
  privileged container, host networking or namespaces, dangerous capabilities, a
  plaintext credential - now cap the overall score directly.

  `score_version` is included in `--json` output and the JSON report (currently
  `2`) so automation can distinguish a scoring-model change from a real change
  in posture. **Baselines and waivers are unaffected**: they match on finding
  fingerprints, not scores, so nothing needs to be re-baselined.

### Fixed

- **A compose scan whose services could not be scanned now exits `3` instead of
  `0`.** Scanning a compose file whose images are not available locally printed
  a full severity table and a security score, then exited successfully - so a CI
  job passed on a scan that never inspected a single image. The failure is now
  reported as an error and the run exits `3` (tool/runtime error), with the
  summary stating that results cover the compose file's static rules only.
- **`formats: [markdown]` in `.docksec.yml` no longer aborts the scan.** The
  CLI accepted `--format markdown`, and the README, the annotated example
  config, and the setting's own description all documented it as valid, but the
  config validator's allow-list omitted it - so a documented value exited `2`. A
  test now asserts the CLI and config-file format lists stay in step.
- **Relative paths that traverse upward are accepted again.** Path validation
  rejected any path containing `..`, which blocked
  `docksec ../service/Dockerfile` - the standard invocation in a monorepo where
  each service has its own directory. The check protected nothing: the path
  comes from the user's own command line and is read with their own
  permissions. Paths are now resolved, and a directory is rejected with a
  message pointing at the Dockerfile instead of failing later inside a scanner.
- Compose environment variables ending in `_FILE`, `_PATH`, or `_FILEPATH` are
  no longer reported as plaintext secrets. `POSTGRES_PASSWORD_FILE=/run/secrets/
  db_password` is the Docker secrets pattern and holds a path, not a credential;
  flagging it penalized the recommended practice. The bundled hardened example
  was itself being flagged for this.

- **The container image and GitHub Action now work.** The image installed Trivy
  from `raw.githubusercontent.com/aquasec/trivy/...`; the organization is
  `aquasecurity`, so the URL returned 404. Because `curl -sfL ... | sh` exits 0
  when the download fails, the build succeeded and produced an image with no
  Trivy in it, and every Action run failed with "Missing required tools: trivy".
  Trivy and Hadolint are now installed from version-pinned release artifacts
  with `curl -f`, and the build asserts both binaries run before the image is
  published. The Hadolint step had the same latent flaw (`curl -sL` without
  `-f`, which would have written an HTTP error page to the binary path).
- The Action failed with a `ValueError` traceback on any run that did not set
  `llm_provider`, including `--scan-only` runs that need no provider at all.
  `entrypoint.sh` exported every LLM variable unconditionally, and an empty
  `LLM_PROVIDER` fails configuration validation. Only variables with a value
  are exported now.
- The image installed DockSec into `/github/workspace`, the directory the
  Action mounts the repository into. This shipped DockSec's own source tree to
  every user and left files that the bind mount then hid. The build now installs
  from `/src` and leaves the workspace empty.

### Added

- A `.dockerignore`, so local-only files are no longer copied into the published
  image, and the build context stays small.
- A container image smoke test workflow: it builds the image, asserts the
  bundled tools run, asserts the workspace mount point is empty, runs a real
  scan through the Action entrypoint, and checks that `--fail-on` still gates
  the build. A build that succeeds while producing a non-functional image now
  fails CI.
- Markdown report format (`--format markdown`): a lightweight `.md` report with
  severity counts and a vulnerability table (including fixed versions) that
  renders natively in pull request comments and CI/CD job summaries. Opt-in, so
  the default report output is unchanged.

### Repository housekeeping

- `SECURITY.md` moved from `docs/` to the repository root, where GitHub picks it
  up for the Security tab and OpenSSF Scorecard can find it.
- The two changelogs are now one. `docs/CHANGELOG.md` and `CHANGELOG.md` had
  diverged and each held releases the other was missing; the full history lives
  in `CHANGELOG.md` at the root.
- Removed the duplicate CodeQL workflow. `codeql.yml` was the unmodified GitHub
  template running alongside the project's own `codeql-analysis.yml`, so every
  push triggered two near-identical analyses.
- Removed a duplicated "Report formats" section from the README and documented
  the `markdown` format in the table that remains.

### Changed

- The container image now installs the `[ai]` extra. The Action exposes AI
  analysis inputs, but the image installed the scan-only core, so those inputs
  could never work.
- Trivy is pinned to 0.74.0 and Hadolint to 2.15.1 in the image, so scan results
  no longer change because of an upstream release.

## 2026.8.19

Adds a committed configuration file so a team's scan policy lives in the repository
instead of in per-developer flags and environment variables.

### Added

- Repo-level configuration file (`.docksec.yml`): commit scan policy - severity,
  `fail_on`, report formats, output directory, provider/model, waiver and baseline
  paths, and disabled rules - to the repository instead of passing per-developer
  flags. Discovery starts in the working directory and walks up to the repository
  root, so a monorepo subdirectory inherits the policy committed at the top level.
- Precedence is CLI flag > environment variable > `.docksec.yml` > built-in default,
  so committed policy never overrides an explicit flag or an exported variable.
- `--config FILE` to use a specific config file, and `--no-config` to ignore config
  discovery entirely for reproducible CI runs.
- `rules.disabled` in the config file switches individual rules off before scoring,
  reports, `--json`, and the `--fail-on` gate. The waiver file remains the right tool
  for individual findings, since its entries carry a reason and an expiry date.
- `--print-config-schema` emits the JSON Schema for the config file. The schema is
  committed at `docs/docksec-config-schema.json`, and the `# yaml-language-server:`
  comment in the example config enables editor autocomplete and inline validation.
- An annotated example config at `examples/.docksec.yml`.

A config file that exists but is invalid (unknown key, bad severity value) exits `2`
with the offending key named, rather than warning and continuing - a broken policy
file must not silently scan under rules the team did not commit.

### Changed

- `--offline`, `--no-cache`, `--no-redact`, and `--skip-ai-scoring` now default to
  `None` rather than `False` internally, so an absent flag is distinguishable from an
  explicit `false` and no longer overrides a config file value. Behavior is unchanged
  when no config file is present.

### Fixed

- Lint rules are now pinned in `pyproject.toml` (`[tool.ruff.lint] select`) instead of
  inheriting ruff's defaults. Ruff 0.16 enabled several new rule groups by default,
  which failed CI on every pull request without any code change.

## 2026.7.5

### Fixed

- Anthropic models newer than the Claude 4 generation (e.g. claude-sonnet-5)
  failed with a 400 error because the deprecated `temperature` parameter was
  still sent; temperature is now only passed to the old Claude 2/3 generations
  that support it.

## 2026.7.4

Industry-readiness release: privacy hardening, cache correctness, waivers, and a
slimmer install.

### Added

- Secret redaction before AI analysis: secret-looking values (passwords, tokens,
  API keys, private key blocks) in Dockerfiles and compose files are masked before
  any content is sent to the configured LLM provider. Key names remain visible so
  exposed credentials are still flagged. Opt out with `--no-redact`.
- Ignore file support (`--ignore-file`, or an auto-detected `.docksec-ignore.yml`):
  suppress individual triaged findings by vulnerability or rule ID, with a required
  reason and optional expiry date per entry. Suppressions apply to scoring, reports,
  `--json` output, and the `--fail-on` gate.
- `--no-cache` flag to bypass the scan results cache for a run.
- Cache TTL: cached scan results now expire (default 24 hours; configurable with
  `DOCKSEC_CACHE_TTL_HOURS`).
- "Data flow and privacy" documentation describing exactly what leaves the machine.
- Optional dependency extra: `pip install "docksec[ai]"` installs AI analysis
  support; the base `pip install docksec` is now a slim, scan-only core with no
  LLM dependencies.

- HTML report improvements: a rating badge (Excellent/Good/Fair/Poor) next to the
  security score matching the terminal bands, a "Fixed In" column in the
  vulnerability table, a "fix available" summary line, and a note showing how many
  findings were waived via the ignore file. Waiver information also appears in the
  terminal Quick take and in `--json` output (`scan_info.suppressed_count`,
  `scan_info.ignore_file`).

### Changed

- AI analysis input limits raised from 50 lines / 2,000 characters to 400 lines /
  16,000 characters for Dockerfiles (600 lines / 24,000 characters for compose
  files), and a warning is now printed whenever input is truncated.
- Scan cache is keyed by the image content digest instead of the tag, so a rebuilt
  tag (for example a reused `:latest`) never serves stale results. Full-scan cache
  entries also include the Dockerfile content hash, so results are never reused
  across different Dockerfiles that share an image.
- Compose rule severities tuned to reduce noise: `compose-no-non-root-user` is now
  MEDIUM (was HIGH); `compose-no-resource-limits` and `compose-writable-root-fs`
  are now LOW (was MEDIUM).
- `compose-port-bound-all-interfaces` now flags only sensitive ports (remote admin,
  databases, caches, brokers, Docker API) instead of every published port, and now
  correctly flags bare container-port entries (for example `"6379"`), which bind
  0.0.0.0.
- GitHub Action usage examples now reference the pinned release tag instead of
  `@main`.
- Dependency pins relaxed from exact (`==`) to compatible ranges, and unused
  dependencies (pandas, tqdm, tenacity) removed.

### Fixed

- The Quick take in `--image-only` runs suggested removing `--scan-only` (the wrong
  flag for that mode); it now suggests adding a Dockerfile scan.
- The Trivy progress spinner no longer prints a half-drawn progress bar into
  non-terminal output such as CI logs.
- The Dockerfile scan block in the HTML report used a hardcoded light background
  that was unreadable in dark mode; it now follows the report theme.

- A narrower cached scan could previously be reused in situations where the image
  had been rebuilt under the same tag; digest keying fixes this class of stale
  results.

## [2026.7.3] - 2026-07-02

### Fixed

- **AI analysis without an image wrote no report, but claimed it did**: running an AI analysis with a Dockerfile but no image (e.g. `docksec Dockerfile --provider anthropic`, or `--ai-only`) set the tool into a mode where the AI pass ran but the scan pass — the only place reports were generated — did not. No report file was written, yet the tool still printed "For detailed AI analysis, check the generated reports at: ...", pointing at a directory that contained only stale files from previous runs. Since the on-screen findings are truncated to the top few per section, the full AI findings were effectively unreachable. AI-only runs now write the complete findings to a report (JSON/CSV/PDF/HTML, plus SARIF with `--sarif`), honoring `--format` and `--output-dir`, and the "reports written" message is only shown when a report was actually generated.

## [2026.7.2] - 2026-07-02

### Fixed

- **Scan cache ignored `--severity`**: `ScanResultsCache` keyed cached results by image name only, so scanning an image at a narrow severity (e.g. `CRITICAL`) and then re-scanning the same image at a wider severity (e.g. `CRITICAL,HIGH,MEDIUM`) silently served the stale, narrower cached result instead of re-scanning, dropping HIGH/MEDIUM findings from the report. The cache key now includes the normalized severity list.
- **AI analysis failures exited 0**: an exception during the AI analysis pass (bad provider/API key, model error) printed `error AI analysis failed: ...` but still exited `0`, contradicting the documented exit-code contract. AI failures now exit `3` (tool/runtime error), matching scan failures.
- **HTML report crashed on a null vulnerability title**: Trivy can return `"Title": null` for some findings; the HTML report writer called `len()` on that field unconditionally and crashed generation for the whole report, silently dropping HTML off the report list whenever a scan hit one of these findings. Vulnerability ID, package name, installed version, and title are now null-safe in the HTML report.
- **`--compose --scan-only` printed an unrelated Dockerfile message**: "No image provided for scan-only mode. Running Dockerfile analysis only." fired for any `--scan-only` run without `--image`, including pure `--compose` runs where no Dockerfile is involved. Now scoped to non-compose runs.
- **Compose vulnerability findings could be invisible to the security score**: when every per-service image scan in a compose file failed (e.g. images not pulled locally), the score calculator treated the vulnerabilities axis as unmeasured and excluded it from the weighted average, even though compose static-misconfiguration findings (privileged mode, host network, etc.) were present. A compose file with multiple CRITICAL findings could score "GOOD". The vulnerabilities axis is now always included whenever findings exist, regardless of whether the image-scan sub-check ran.
- **Security score understated hardcoded credential exposure**: a Dockerfile with hardcoded secrets, no `USER` directive, and other severe misconfigurations could still land in the mid-40s ("POOR" but not alarming) because the blended dockerfile/vulnerabilities/configuration average diluted the credential-exposure penalty. The overall score is now capped at 20/100 whenever a hardcoded credential-looking `ENV` variable (password/secret/API key/token) is detected in the Dockerfile.

### Added
- Docker Compose security scanning support (`--compose` flag).
- Detection for compose-level misconfigurations (e.g., privileged mode, host network, missing resource limits).
- Automatic scanning of all services defined in a docker-compose file.
- Integration of compose findings into the existing LLM remediation and scoring pipeline.
- `DOCKSEC_LOG_LEVEL` environment variable to override log verbosity (e.g. `DOCKSEC_LOG_LEVEL=DEBUG`) for troubleshooting.
- **Redesigned terminal output**: a consolidated result summary with a box-drawing severity table, the security score with a color-coded rating, a "Quick take" action block highlighting the most important findings, the list of generated reports, and a suggested next command.
- `--quiet` flag to reduce output to warnings, errors, and the result summary.
- `--no-color` flag (also honors the `NO_COLOR` environment variable) to disable colored output.
- `--severity` flag to choose which severity levels the image vulnerability scan reports (default `CRITICAL,HIGH`; also settable via `DOCKSEC_DEFAULT_SEVERITY`). Invalid values are rejected with a clear error.
- `--fail-on <severity>` flag: exit with code 1 when any finding is at or above the chosen severity (`CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`). The scan severity is auto-widened when needed so the gate can observe those findings.
- CI-friendly exit codes: `0` clean, `1` findings at or above `--fail-on`, `2` usage/argument error, `3` tool or runtime error (scan failed, image not found, missing tools).
- `--format` flag to choose which report formats are written (`json`, `csv`, `pdf`, `html`; default: all). Invalid values are rejected with a clear error.
- `--output-dir` flag to write reports to a specific directory for the run (default: `~/.docksec/results` or `DOCKSEC_RESULTS_DIR`).
- `--json` flag: print scan results as a single JSON object to stdout for scripts and CI pipelines. All human-readable output (banner, sections, info/warn/error, the result summary) moves to stderr in `--json` mode, so stdout carries only the JSON payload. `--json` alone does not write report files; combine with `--format` to also write files.
- `--sarif` flag: write a SARIF 2.1.0 report for GitHub Code Scanning and other SARIF-compatible tools. Independent of `--format`; findings map to one SARIF rule per unique vulnerability ID and one result per finding, with severity mapped to SARIF levels (`CRITICAL`/`HIGH` -> `error`, `MEDIUM` -> `warning`, `LOW`/`UNKNOWN` -> `note`).
- GitHub Action inputs for the new CLI flags: `output_dir`, `severity`, `fail_on`, `format`, `sarif`.
- `--baseline <file>` and `--update-baseline` flags for ratchet-mode adoption: `--update-baseline` snapshots the current scan's findings to the baseline file; subsequent runs with `--baseline` and `--fail-on` only gate on findings not already present in the baseline, so `--fail-on` can be adopted on existing projects without pre-existing findings blocking every build. Findings are matched by vulnerability ID, target, and package name.

### Changed
- **Cleaner terminal output**: internal logs now write to `stderr` instead of `stdout` and stay quiet in CLI mode, so raw location-tagged log lines no longer interleave with the tool's user-facing messages. Set `DOCKSEC_LOG_LEVEL` to restore verbose logging.
- `docker_scanner.py`'s Hadolint/Trivy/Docker Scout error and troubleshooting messages now route through `docksec.output` instead of raw `print()`, so they're consistently styled and honor `--quiet`/`--no-color`/`--json` like the rest of the tool's output.
- The security score is now rendered once, in the result summary, instead of mid-scan.
- Report generation runs silently and the CLI renders a single report summary from the result (removes the misleading progress bars).
- **Honest exit codes**: a failed scan (for example, an image that is not found) now exits non-zero instead of ending with "Analysis complete!".

### Fixed (GitHub Action)
- The Action's `output` input was passed to the CLI as `-o`/`--output`, a flag removed earlier in this release; setting it caused every run to fail with an argument-parsing error. It is now remapped to `--output-dir` (kept as a deprecated alias; the new `output_dir` input is preferred).

### Fixed
- **PDF report encoding**: PDF generation no longer fails on non-latin-1 characters (bullets, smart quotes, em dashes, emoji) in vulnerability titles, scanner output, or AI findings; such characters are sanitized consistently across the whole document.
- Suppressed the noisy `PyFPDF & fpdf2` import warning that printed on every run.
- Fixed report progress output that printed each step twice and out of order (caused by mixing `print()` with a live progress display).

### Removed
- Removed the unused `-o/--output` CLI flag, which was declared but never wired up.
- Removed dead duplicate report-writer methods from `DockerSecurityScanner`; report generation is handled solely by `ReportGenerator`.
- Removed the leftover `compose_scanner_cli.py` placeholder module.

## [2026.5.22.2] - 2026-05-22

### Changed
- **CLI Help**: Updated help text and documentation to reflect modern 2026 model names (e.g., `claude-haiku-4-5`).
- **Documentation**: Clarified default model behavior in Getting Started guide.

## [2026.5.22.1] - 2026-05-22

### Fixed
- **Multi-LLM Compatibility**: Fixed `json_mode` errors when using Anthropic, Google, or Ollama providers.
- **Provider Defaults**: Added smart model defaults when switching providers (e.g., automatically selecting Claude 3.5 Sonnet when `LLM_PROVIDER=anthropic`).
- **Linting**: Resolved unused variable warnings in configuration.

## [2026.5.22] - 2026-05-22

### Added
- **Centralized Reporting**: All scan reports are now neatly organized in `~/.docksec/results/` by default, following industry standards for professional CLI tools.
- **Enhanced `--scan-only` Mode**: Improved the scanner to support Dockerfile-only scans without requiring a Docker image name, enabling high-speed static analysis in any environment.

### Changed
- **Modernized PDF Engine**: Refactored the PDF generation to use the latest `fpdf2` APIs, improving performance and future-proofing the reporting engine.
- **Improved Storage Logic**: Added automatic directory creation and a smart fallback to local storage if the home directory is not writable.
- **CLI Feedback**: The tool now explicitly prints the report storage location at the start of every scan for better visibility.

### Fixed
- **PDF Layout**: Resolved the "Not enough horizontal space" error that occurred during PDF generation for complex scan results.
- **Deprecation Warnings**: Eliminated all font and layout-related deprecation warnings from the `fpdf2` library.
- **Test Suite**: Updated and expanded the unit test suite to cover new reporting logic and dynamic tool requirements, achieving 100% pass rate.

---

## [2026.5.21] - 2026-05-21

### Added
- **OWASP Project Website**: Launched the official project site at `https://owasp.org/DockSec/` with a modern, tabbed interface.
- **GitHub Action for Marketplace**: Created a Docker-based GitHub Action (`action.yml`) with pre-installed security tools (**Trivy** and **Hadolint**) for seamless CI/CD integration.
- **Governance & Community**:
  - Added `MENTORS.md` to support new contributors.
  - Added `SPONSORSHIP.md` to facilitate project funding.
  - Enabled GitHub Sponsors via `.github/FUNDING.yml`.
  - Integrated official Slack channel (`#project-docksec`).
- **Developer Tooling**: Added a root-level `Makefile` to standardize environment setup, linting, testing, and security scanning.

### Changed
- **Branding & UI**:
  - Redesigned `README.md` and `index.md` with a centered "pyramid" badge layout and professional `for-the-badge` styling.
  - Updated project logo rendering using modern `<picture>` tags.
- **Project Infrastructure**:
  - Standardized all repository links and documentation to point to the official `OWASP/DockSec` repository.
  - Standardized project URL to `https://owasp.org/DockSec/`.
- **Documentation**:
  - Moved `CONTRIBUTING.md` to the root directory for better visibility.
  - Added a Mermaid workflow diagram to the contribution guide.

### Fixed
- **Website Navigation**: Standardized tab file naming and titles to resolve Jekyll build errors on the OWASP site.
- **Stats Badges**: Fixed the PyPI downloads badge to show **total overall downloads** using a reliable Shields.io provider.

---

## [2026.5.6] - 2026-05-06

### Changed
- **Major Structural Overhaul**: Restructured the project from a flat layout to a proper Python package structure.
  - Core logic moved to `docksec/` directory.
  - CLI entry point moved to `docksec/cli.py`.
  - Templates moved to `docksec/templates/`.
  - Consolidation of redundant files (`main.py` removed).
- **Packaging Improvements**:
  - Updated `setup.py` and `pyproject.toml` for better distribution.
  - Improved `MANIFEST.in` to include all necessary package data.
- **Documentation**:
  - Updated `README.md` and `CONTRIBUTING.md` to reflect the new structure.
  - Improved project structure visualization in documentation.

### Fixed
- Internal import paths updated to use absolute package imports.
- Metadata artifacts (`*:Zone.Identifier`) removed from the repository.

---

## [2026.2.23] - 2026-02-23

### Added
- Multiple LLM Provider Support
  - OpenAI (GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo)
  - Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Opus)
  - Google Gemini (Gemini 1.5 Pro, Gemini 1.5 Flash)
  - Ollama (Llama 3.1, Mistral, Phi-3, and other local models)
  
- New CLI Options
  - `--provider` flag to select LLM provider (openai, anthropic, google, ollama)
  - `--model` flag to specify model name
  - Environment variables: LLM_PROVIDER, LLM_MODEL, ANTHROPIC_API_KEY, GOOGLE_API_KEY, OLLAMA_BASE_URL

- Enhanced Configuration
  - config_manager.py now supports multiple providers with validation
  - Automatic provider detection from environment variables
  - Configurable Ollama base URL for custom deployments

### Changed
- Core Architecture Updates
  - utils.py get_llm() function completely rewritten to support multiple providers
  - Graceful fallback and improved error messages for missing API keys
  - Better provider validation and configuration handling

- Documentation Improvements
  - README updated with multi-provider setup instructions
  - New troubleshooting section for each provider
  - Updated CLI examples showing provider selection

### Fixed
- API key handling improved with provider-specific validation
- Better error messages indicating which provider and API key is needed

### Migration Guide
For existing users:
- **No Breaking Changes**: OpenAI remains the default provider
- Existing OPENAI_API_KEY environment variable still works as before
- To switch providers, simply set LLM_PROVIDER environment variable or use --provider flag

Example migration to Claude:
```bash
export ANTHROPIC_API_KEY="your-key"
export LLM_PROVIDER="anthropic"
export LLM_MODEL="claude-3-5-sonnet-20241022"
docksec Dockerfile
```

Or use local models with Ollama:
```bash
# No API key needed!
ollama pull llama3.1
export LLM_PROVIDER="ollama"
export LLM_MODEL="llama3.1"
docksec Dockerfile
```

### Deprecations
- None. GPT-4 support continues but GPT-4o is recommended for better performance.

---

## [0.0.20] - 2026-01-09

### Added
- 📚 **Comprehensive Documentation Suite**
  - Complete CHANGELOG.md with full version history from v0.0.3 to present
  - SECURITY.md with vulnerability reporting process and security best practices
  - CONTRIBUTING.md with detailed contribution guidelines and development setup
  - PUBLISHING_GUIDE.md for maintainers

- 📁 **Complete Examples Directory**
  - Secure Python Flask application example (Score: 90+) with best practices
  - Vulnerable Node.js application example (Score: 30-) for educational purposes
  - Multi-stage Golang build example (Score: 95+) with distroless base
  - Detailed README for each example explaining security features
  - Examples overview and learning path guide

- 🎫 **GitHub Templates**
  - Bug report issue template with structured format
  - Feature request issue template with use case analysis
  - Question issue template for community support
  - Pull request template with comprehensive checklist

- 📖 **README Enhancements**
  - Quick Start section with 3-step getting started guide
  - Examples & Screenshots section with sample output
  - Documentation section linking to all major docs
  - Roadmap section showing upcoming features
  - Code quality badges (PyPI version, Python version, CI status, Code style)

### Fixed
- 🔗 **Broken Links and References**
  - Fixed GitHub stars badge URL (docksec/docksec → OWASP/DockSec)
  - Removed placeholder Docker Hub link
  - Fixed CONTRIBUTING.md reference (file now exists)
  - Replaced "Coming Soon" demo video section with actual examples

- 🎨 **Badge Updates**
  - Corrected repository URLs in all badges
  - Added PyPI version badge
  - Added Python version support badge
  - Added CI/CD status badge
  - Added code style (black) badge

### Improved
- 📝 **Documentation Quality**
  - Better README structure and navigation
  - More professional appearance for open source promotion
  - Clear learning paths and getting started guides
  - Comprehensive troubleshooting section
  - Security-first documentation approach

- 🏗️ **Repository Structure**
  - Professional GitHub presence with all templates
  - Clear contribution workflow
  - Security policy for vulnerability reports
  - Examples demonstrating best practices

### Developer Experience
- Complete development environment setup guide
- Code style and testing guidelines
- Commit message conventions
- Local testing procedures before PyPI publication

### Community
- Clear paths for bug reports, feature requests, and questions
- Recognition system for contributors
- Transparent roadmap and feature voting

### Notes
This release focuses on documentation, community building, and making DockSec ready for broader open source promotion. No functional changes to the core scanning engine.

---

## [0.0.19] - 2025-06-26

### Added
- Latest stable release with full feature set
- Enhanced error handling and retry mechanisms
- Improved documentation and examples

## [0.0.18] - 2025-06-26

### Added
- Production-ready reliability features
- Automatic retry logic with exponential backoff
- Rate limiting support for OpenAI API
- Configurable timeouts for all scanning tools
- Comprehensive error recovery mechanisms

### Improved
- Enhanced logging with structured output
- Better progress indicators for long-running operations
- More actionable error messages with troubleshooting steps

## [0.0.17] - 2025-06-26

### Added
- Multi-format report generation (JSON, CSV, PDF, HTML)
- Professional HTML reports with interactive styling
- Security score calculation (0-100 rating)

### Fixed
- Report generation issues with special characters
- PDF formatting improvements
- CSV export compatibility

## [0.0.16] - 2025-06-26

### Added
- Image-only scanning mode
- Support for scanning Docker images without Dockerfile
- Enhanced Docker Scout integration

### Improved
- CLI argument validation
- Better error messages for missing dependencies

## [0.0.15] - 2025-06-25

### Added
- AI-only analysis mode
- Scan-only mode (no AI required)
- Configuration via environment variables
- Support for .env files

### Changed
- Refactored CLI interface for better usability
- Improved help documentation

## [0.0.14] - 2025-06-25

### Added
- Rich terminal formatting with progress bars
- Real-time scan progress indicators
- Color-coded severity levels

### Improved
- Terminal output formatting
- Progress tracking for long operations

## [0.0.13] - 2025-06-24

### Added
- Docker Scout integration for vulnerability scanning
- Support for multiple scanning tools (Trivy, Hadolint, Docker Scout)
- Severity-based filtering (CRITICAL, HIGH, MEDIUM, LOW)

## [0.0.12] - 2025-06-24

### Fixed
- Dependency resolution issues
- Package installation errors
- Import path corrections

## [0.0.11] - 2025-06-24

### Added
- LangChain integration for AI-powered analysis
- OpenAI GPT-4 support for intelligent recommendations
- Context-aware security suggestions

## [0.0.10] - 2025-06-24

### Added
- Automated security scoring system
- CVE detection and analysis
- CVSS score reporting

## [0.0.9] - 2025-06-24

### Added
- Trivy integration for comprehensive vulnerability scanning
- Hadolint integration for Dockerfile best practices

## [0.0.8] - 2025-06-24

### Changed
- Major refactoring of core scanning engine
- Improved code organization and modularity

## [0.0.7] - 2025-06-24

### Added
- Basic report generation capabilities
- JSON output format

## [0.0.6] - 2025-06-24

### Fixed
- Critical bug fixes in scanning logic
- Improved error handling

## [0.0.5] - 2025-06-12

### Added
- Initial CLI interface
- Basic Dockerfile analysis

## [0.0.4] - 2025-06-12

### Changed
- Package structure improvements
- Better dependency management

## [0.0.3] - 2025-06-11

### Added
- Initial public release
- Basic Docker security scanning functionality
- AI-powered recommendations using OpenAI
- Support for Dockerfile analysis

### Features
- Command-line interface for easy usage
- Integration with external security tools
- Automated report generation

---

## Version History Notes

### Breaking Changes
- v0.0.15: CLI argument structure changed - see documentation for migration guide
- v0.0.10: Report format updated - old reports may not be compatible

### Deprecations
- v0.0.15: Legacy Python script execution (`python main.py`) still supported but deprecated in favor of CLI (`docksec`)

### Security Updates
- All versions include security-focused scanning and analysis
- Regular updates to vulnerability databases
- No known security issues in any released versions

---

## Upcoming Features (Roadmap)

### Planned for v0.1.0
- [x] Docker Compose support
- [x] Multi-container analysis
- [ ] Kubernetes manifest scanning
- [ ] Custom rule engine
- [ ] Plugin system for extensibility

### Planned for v0.2.0
- [ ] Web dashboard interface
- [ ] Team collaboration features
- [ ] Historical trend analysis
- [ ] Integration with CI/CD platforms (GitHub Actions, GitLab CI, Jenkins)

### Under Consideration
- [ ] Support for additional LLM providers (Claude, Gemini, local models)
- [ ] Offline mode with cached vulnerability databases
- [ ] Container runtime security monitoring
- [ ] Image signing and verification
- [ ] SBOM (Software Bill of Materials) generation

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Support

For issues, questions, or feature requests, please visit:
- GitHub Issues: https://github.com/OWASP/DockSec/issues
- Documentation: https://github.com/OWASP/DockSec/blob/main/README.md
