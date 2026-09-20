"""Regressions for defects found by end-to-end testing of 2026.9.20.

Each test here corresponds to something that shipped working-by-inspection and
was only caught by running the released artifact. The entrypoint cases matter
most: nothing in the suite referenced `entrypoint.sh` at all, and the CI smoke
test reaches DockSec either through `--entrypoint sh` or the INPUT_* variables,
so a shell script that dropped every command-line argument passed green.
"""

import json
import os
import shutil
import subprocess
import unittest

from docksec.completeness import coverage_notes
from docksec.remediation import build_plan
from docksec.report_generator import ReportGenerator

ENTRYPOINT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "entrypoint.sh")


def _vuln(pkg, fixed, severity="HIGH", vuln_id="CVE-0000-0001", priority=None, **extra):
    finding = {
        "VulnerabilityID": vuln_id, "PkgName": pkg, "InstalledVersion": "1.0",
        "FixedVersion": fixed, "Severity": severity, "Target": "debian",
    }
    if priority:
        finding["Priority"] = priority
    finding.update(extra)
    return finding


@unittest.skipUnless(shutil.which("bash"), "bash is required")
class TestEntrypointForwardsArguments(unittest.TestCase):
    """The image must behave like the CLI it wraps.

    `docker run <image> --version` and `--help` are the first two commands
    anyone runs against an unfamiliar image; both failed with "Dockerfile path
    is required" because only INPUT_* was honoured.
    """

    def _run(self, args, env=None):
        environ = dict(os.environ)
        environ.pop("INPUT_DOCKERFILE", None)
        # Stand in for the real binary so the test asserts on argument passing
        # rather than on a scan.
        environ["PATH"] = self.bindir + os.pathsep + environ["PATH"]
        environ.update(env or {})
        return subprocess.run(
            ["bash", ENTRYPOINT, *args],
            capture_output=True, text=True, timeout=60, env=environ,
        )

    def setUp(self):
        import tempfile
        self.tmp = tempfile.mkdtemp()
        self.bindir = self.tmp
        stub = os.path.join(self.bindir, "docksec")
        with open(stub, "w") as fh:
            fh.write('#!/bin/sh\nprintf "ARGS:"\nfor a in "$@"; do printf " %s" "$a"; done\nprintf "\\n"\n')
        os.chmod(stub, 0o755)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_version_flag_reaches_the_cli(self):
        result = self._run(["--version"])
        self.assertIn("ARGS: --version", result.stdout)

    def test_help_flag_reaches_the_cli(self):
        result = self._run(["--help"])
        self.assertIn("ARGS: --help", result.stdout)

    def test_positional_and_flags_are_forwarded_in_order(self):
        result = self._run(["Dockerfile", "--scan-only"])
        self.assertIn("ARGS: Dockerfile --scan-only", result.stdout)

    def test_arguments_with_spaces_survive(self):
        result = self._run(["my Dockerfile"])
        self.assertIn("ARGS: my Dockerfile", result.stdout)

    def test_action_inputs_still_work(self):
        """The GitHub Action path must not regress."""
        result = self._run([], env={"INPUT_DOCKERFILE": "Dockerfile", "INPUT_SCAN_ONLY": "true"})
        self.assertIn("ARGS: Dockerfile --scan-only", result.stdout)

    def test_action_inputs_and_cli_arguments_combine(self):
        result = self._run(["--no-color"], env={"INPUT_DOCKERFILE": "Dockerfile"})
        self.assertIn("ARGS: Dockerfile --no-color", result.stdout)

    def test_no_arguments_logs_a_bare_command(self):
        """`printf '%q'` emits its format once even for an empty array, which
        reported a bare run as `docksec ''`."""
        result = self._run([])
        self.assertIn("Running: docksec", result.stdout)
        self.assertNotIn("docksec ''", result.stdout)


class TestFixCommandsFollowPriority(unittest.TestCase):
    """The tool printed `Fix Now 3` and then ordered the commands by severity
    and package name, so the exploited finding sat unmarked among hundreds."""

    def test_fix_now_sorts_above_a_higher_severity_without_epss(self):
        plan = build_plan([
            _vuln("acritical", "2.0", severity="CRITICAL", vuln_id="CVE-1", priority="fix_soon"),
            _vuln("zhigh", "2.0", severity="HIGH", vuln_id="CVE-2", priority="fix_now"),
        ])
        self.assertEqual([e["package"] for e in plan.package_upgrades], ["zhigh", "acritical"])

    def test_severity_still_breaks_ties_inside_a_tier(self):
        plan = build_plan([
            _vuln("alow", "2.0", severity="MEDIUM", vuln_id="CVE-1", priority="fix_soon"),
            _vuln("zhigh", "2.0", severity="CRITICAL", vuln_id="CVE-2", priority="fix_soon"),
        ])
        self.assertEqual([e["package"] for e in plan.package_upgrades], ["zhigh", "alow"])

    def test_entry_carries_the_most_urgent_tier_of_its_findings(self):
        plan = build_plan([
            _vuln("openssl", "2.0", vuln_id="CVE-1", priority="fix_soon"),
            _vuln("openssl", "2.0", vuln_id="CVE-2", priority="fix_now"),
        ])
        self.assertEqual(plan.package_upgrades[0]["priority"], "fix_now")

    def test_the_cve_driving_the_priority_is_not_dropped_from_display(self):
        """Displayed IDs cap at three; the urgent one must not be the casualty."""
        findings = [
            _vuln("openssl", "2.0", vuln_id=f"CVE-000{i}", priority="fix_soon")
            for i in range(3)
        ]
        findings.append(_vuln("openssl", "2.0", vuln_id="CVE-URGENT", priority="fix_now"))
        plan = build_plan(findings)
        self.assertIn("CVE-URGENT", plan.package_upgrades[0]["ids"])

    def test_unscored_findings_sort_last_but_are_kept(self):
        plan = build_plan([
            _vuln("unscored", "2.0", severity="CRITICAL", vuln_id="CVE-1"),
            _vuln("scored", "2.0", severity="LOW", vuln_id="CVE-2", priority="fix_now"),
        ])
        self.assertEqual([e["package"] for e in plan.package_upgrades], ["scored", "unscored"])


class TestSarifSeverityAndEpss(unittest.TestCase):
    """GitHub ranks by `security-severity`; an empty string means it ignores
    the severity DockSec assigned. 14 of 25 rules emitted one."""

    def test_missing_cvss_falls_back_to_severity(self):
        rule = ReportGenerator._sarif_rule("DL3008", {"Severity": "HIGH"})
        self.assertEqual(rule["properties"]["security-severity"], "7.0")

    def test_real_cvss_is_preferred_over_the_fallback(self):
        rule = ReportGenerator._sarif_rule("CVE-1", {"Severity": "HIGH", "CVSS": "9.8"})
        self.assertEqual(rule["properties"]["security-severity"], "9.8")

    def test_every_severity_maps_to_a_number(self):
        for severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
            rule = ReportGenerator._sarif_rule("R", {"Severity": severity})
            self.assertNotEqual(rule["properties"]["security-severity"], "")

    def test_unknown_severity_stays_empty_rather_than_inventing_a_score(self):
        rule = ReportGenerator._sarif_rule("R", {"Severity": "UNKNOWN"})
        self.assertEqual(rule["properties"]["security-severity"], "")

    def test_epss_reaches_sarif_results(self):
        result = ReportGenerator._sarif_result(
            "CVE-1",
            {"Severity": "HIGH", "EPSS": 0.48, "EPSSPercentile": 0.988, "Priority": "fix_now"},
            "Dockerfile",
        )
        self.assertEqual(result["properties"]["epss"], 0.48)
        self.assertEqual(result["properties"]["epssPercentile"], 0.988)
        self.assertEqual(result["properties"]["priority"], "fix_now")

    def test_findings_without_epss_carry_no_properties_bag(self):
        result = ReportGenerator._sarif_result("CVE-1", {"Severity": "HIGH"}, "Dockerfile")
        self.assertNotIn("properties", result)


class TestCoverageReportsScannerVersions(unittest.TestCase):
    """A local run and a CI run differ when their scanners differ; the output
    should say so rather than leave it looking like a bug."""

    def test_versions_are_reported_when_known(self):
        notes = coverage_notes({"tool_versions": {"trivy": "0.74.0", "hadolint": "2.15.1"}})
        self.assertTrue(any("trivy 0.74.0" in n and "hadolint 2.15.1" in n for n in notes))

    def test_no_version_note_when_nothing_is_detected(self):
        notes = coverage_notes({"tool_versions": {}})
        self.assertFalse(any("scanner versions" in n for n in notes))


if __name__ == "__main__":
    unittest.main()
