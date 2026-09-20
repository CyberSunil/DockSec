"""Golden-file coverage for the three output surfaces (strategy item 1.5).

The terminal summary, the `--json` payload and the SARIF report are the
product's public interface: CI gates, dashboards and humans all read one of
them. Unit tests assert individual facts about each, which is how a change can
reorder a list, drop a field or alter a label without anything failing.

These tests render each surface from a fixed `results` dict and compare the
whole thing against a stored file. No scanner, no network, no clock: the inputs
are literals, so a diff here means the output changed, not that the world did.

When a diff is intentional, review it and re-record:

    DOCKSEC_UPDATE_GOLDEN=1 pytest tests/test_golden_output.py

Review the resulting diff as carefully as any source change - re-recording
without reading it defeats the point of the test.
"""

import json
import os
import unittest
from pathlib import Path

from docksec import output
from docksec.remediation import build_plan
from docksec.report_generator import ReportGenerator

GOLDEN_DIR = Path(__file__).parent / "golden"


def _compare(name: str, actual: str) -> None:
    """Compare against the stored file, or re-record when asked."""
    path = GOLDEN_DIR / name
    actual = actual.rstrip("\n") + "\n"
    if os.getenv("DOCKSEC_UPDATE_GOLDEN"):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(actual)
        return
    if not path.exists():
        raise AssertionError(
            f"missing golden file {path}. Record it with "
            f"DOCKSEC_UPDATE_GOLDEN=1 pytest {__file__}"
        )
    expected = path.read_text()
    if expected != actual:
        raise AssertionError(
            f"{name} changed.\n\n--- expected\n{expected}\n--- actual\n{actual}\n"
            f"If this change is intended, re-record with "
            f"DOCKSEC_UPDATE_GOLDEN=1 and review the diff."
        )


# A findings set chosen to exercise the parts that drifted in the past: a
# fix_now CVE that must outrank a higher-severity fix_soon one, a finding with
# no EPSS score, a CVE with no CVSS (the SARIF severity fallback), a compose
# rule, and a Dockerfile rule carrying a line number.
FINDINGS = [
    {
        "VulnerabilityID": "CVE-2025-15467", "Target": "db (postgres)",
        "PkgName": "openssl", "InstalledVersion": "3.5.1", "FixedVersion": "3.5.7",
        "Severity": "HIGH", "Title": "openssl: denial of service",
        "Description": "A DoS in OpenSSL.", "Status": "fixed", "CVSS": "7.5",
        "PrimaryURL": "https://example.invalid/CVE-2025-15467",
        "EPSS": 0.48211, "EPSSPercentile": 0.98805, "Priority": "fix_now",
    },
    {
        "VulnerabilityID": "CVE-2026-31789", "Target": "db (postgres)",
        "PkgName": "libperl", "InstalledVersion": "5.40.1", "FixedVersion": "5.40.2",
        "Severity": "CRITICAL", "Title": "perl: memory corruption",
        "Description": "Memory corruption in perl.", "Status": "fixed", "CVSS": "9.8",
        "PrimaryURL": "https://example.invalid/CVE-2026-31789",
        "EPSS": 0.00176, "EPSSPercentile": 0.07405, "Priority": "fix_soon",
    },
    {
        "VulnerabilityID": "CVE-2026-99999", "Target": "db (postgres)",
        "PkgName": "zlib", "InstalledVersion": "1.3", "FixedVersion": None,
        "Severity": "MEDIUM", "Title": "zlib: unfixed issue",
        "Description": "No fix available.", "Status": "affected", "CVSS": None,
        "PrimaryURL": None,
    },
    {
        "VulnerabilityID": "compose-plaintext-secret-env", "Target": "compose.yml:db:12",
        "PkgName": "compose", "InstalledVersion": None, "FixedVersion": None,
        "Severity": "HIGH", "Title": "Plaintext credential in environment",
        "Description": "POSTGRES_PASSWORD is set in the compose file.",
        "Status": "affected", "CVSS": None, "PrimaryURL": None,
        "Remediation": "Move the value to a Docker secret",
    },
    {
        "VulnerabilityID": "DS002", "Target": "Dockerfile", "PkgName": "dockerfile",
        "InstalledVersion": None, "FixedVersion": None, "Severity": "HIGH",
        "Title": "Image runs as root", "Description": "No USER instruction.",
        "Status": "affected", "CVSS": None, "PrimaryURL": None,
        "Remediation": "Add a non-root USER before CMD", "Line": 7, "Source": "trivy",
    },
]


class _Scanner:
    """Stands in for DockerSecurityScanner; only these attributes are read."""

    image_name = "postgres:15.19-alpine"
    analysis_score = 41.5


class TestJsonPayloadGolden(unittest.TestCase):
    """`--json` is what CI and dashboards parse. A renamed or dropped key is a
    breaking change for them and must not pass silently."""

    def test_json_payload(self):
        from docksec import epss as epss_mod
        from docksec.score_calculator import SCORE_VERSION

        payload = {
            "scan_info": {
                "image": _Scanner.image_name,
                "dockerfile": "Dockerfile",
                # Fixed, not the clock: the golden must not change per run.
                "scan_time": "2026-01-01T00:00:00",
                "analysis_score": _Scanner.analysis_score,
                "score_version": SCORE_VERSION,
                "scan_mode": "compose",
            },
            "vulnerabilities": FINDINGS,
            "severity_counts": output.count_by_severity(FINDINGS),
            "priority_counts": epss_mod.counts_by_priority(FINDINGS),
        }
        _compare("scan.json", json.dumps(payload, indent=2, sort_keys=True))


class TestSarifGolden(unittest.TestCase):
    """SARIF is consumed by GitHub Code Scanning. Its rule and result shape,
    the security-severity fallback and the EPSS properties all live here."""

    def test_sarif_report(self):
        rules = []
        results = []
        seen = set()
        for finding in FINDINGS:
            rule_id = finding["VulnerabilityID"]
            if rule_id not in seen:
                seen.add(rule_id)
                rules.append(ReportGenerator._sarif_rule(rule_id, finding))
            results.append(ReportGenerator._sarif_result(rule_id, finding, "compose.yml"))
        doc = {
            "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
            "version": "2.1.0",
            "runs": [{
                "tool": {"driver": {
                    "name": "DockSec",
                    # Pinned: the real report embeds the running version, which
                    # would make this golden fail on every release.
                    "version": "0.0.0-test",
                    "rules": rules,
                }},
                "results": results,
            }],
        }
        _compare("scan.sarif", json.dumps(doc, indent=2, sort_keys=True))


class TestTerminalGolden(unittest.TestCase):
    """The terminal summary is what a human reads. Ordering carries meaning
    here - the fix commands are sorted by priority tier - and a regression in
    that ordering is invisible to a unit test that only checks membership."""

    def _render(self) -> str:
        import io

        from docksec import epss as epss_mod

        buffer = io.StringIO()
        output.configure(quiet=False, no_color=True)
        console = output.get_console()
        original_file = console.file
        # Fixed width: the console otherwise wraps to the terminal running the
        # test, so the golden would differ between a laptop and CI.
        original_width = console.width
        console.file = buffer
        console.width = 100
        try:
            counts = output.count_by_severity(FINDINGS)
            output.section("Results")
            output.severity_table(counts)
            output.score(_Scanner.analysis_score)
            output.priority_summary(epss_mod.counts_by_priority(FINDINGS))
            output.fix_plan(build_plan(FINDINGS, dockerfile_path="Dockerfile"))
            output.coverage([
                "Findings are matched against advisory data; exploitability and "
                "runtime reachability are not proven.",
            ])
        finally:
            console.file = original_file
            console.width = original_width
            output.configure(quiet=False, no_color=False)
        return buffer.getvalue()

    def test_terminal_summary(self):
        _compare("summary.txt", self._render())

    def test_fix_commands_lead_with_the_most_urgent_tier(self):
        """Guards the ordering the golden encodes, with the reason stated.

        A future reader re-recording the golden should see this fail too,
        rather than silently accepting a reordering.
        """
        rendered = self._render()
        self.assertLess(
            rendered.index("openssl"), rendered.index("libperl"),
            "the fix_now openssl finding must be listed before the fix_soon "
            "CRITICAL one; EPSS priority leads the ordering",
        )


if __name__ == "__main__":
    unittest.main()
