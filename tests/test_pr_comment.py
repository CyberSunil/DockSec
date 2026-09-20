"""Tests for the pull-request comment renderer (strategy item 3.7).

The renderer runs in the trusted half of a two-stage workflow: it has a token
that can write comments, and its input comes from a scan of a fork's code.
Every value it renders is therefore attacker-controlled, which is what these
tests are mostly about.
"""

import importlib.util
import unittest
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location(
    "render_pr_comment",
    Path(__file__).parent.parent / ".github" / "scripts" / "render_pr_comment.py",
)
render_pr_comment = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(render_pr_comment)

render = render_pr_comment.render
_md = render_pr_comment._md


def _payload(*findings, path="Dockerfile", score=42.0):
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for f in findings:
        sev = str(f.get("Severity", "")).upper()
        if sev in counts:
            counts[sev] += 1
    return {"files": [{
        "file": path,
        "data": {
            "scan_info": {"analysis_score": score},
            "vulnerabilities": list(findings),
            "severity_counts": counts,
        },
    }]}


def _finding(**kw):
    base = {
        "VulnerabilityID": "CVE-2025-0001", "Severity": "HIGH",
        "Title": "A finding", "FixedVersion": "1.2.3",
    }
    base.update(kw)
    return base


class TestUntrustedInputIsEscaped(unittest.TestCase):
    """A fork controls its own Dockerfile, so it controls finding text."""

    def test_pipe_cannot_break_out_of_a_table_cell(self):
        out = render(_payload(_finding(Title="evil | extra | cells")))
        self.assertNotIn("evil | extra", out)
        self.assertIn(r"evil \| extra", out)

    def test_html_is_escaped(self):
        out = render(_payload(_finding(Title="<img src=x onerror=alert(1)>")))
        self.assertNotIn("<img", out)
        self.assertIn("&lt;img", out)

    def test_markdown_link_syntax_is_neutralised(self):
        out = render(_payload(_finding(Title="[click](https://evil.invalid)")))
        self.assertNotIn("[click](https://evil.invalid)", out)

    def test_newlines_cannot_inject_rows(self):
        out = render(_payload(_finding(Title="a\n| CRITICAL | fake | row |")))
        self.assertNotIn("\n| CRITICAL | fake", out)

    def test_backticks_are_escaped(self):
        out = render(_payload(_finding(Title="`code`")))
        self.assertIn(r"\`code\`", out)

    def test_very_long_text_is_truncated(self):
        out = render(_payload(_finding(Title="A" * 5000)))
        self.assertNotIn("A" * 500, out)

    def test_a_malicious_file_path_is_escaped(self):
        out = render(_payload(_finding(), path="<b>evil</b>"))
        self.assertNotIn("<b>evil</b>", out)

    def test_missing_fields_do_not_crash(self):
        out = render({"files": [{"file": "Dockerfile", "data": {}}]})
        self.assertIn("DockSec", out)


class TestOrdering(unittest.TestCase):
    """The comment must lead with what to fix first, like the CLI does."""

    def test_fix_now_sorts_above_a_higher_severity(self):
        out = render(_payload(
            _finding(VulnerabilityID="CVE-CRIT", Severity="CRITICAL"),
            _finding(VulnerabilityID="CVE-NOW", Severity="HIGH", Priority="fix_now"),
        ))
        self.assertLess(out.index("CVE-NOW"), out.index("CVE-CRIT"))

    def test_fix_now_is_labelled(self):
        out = render(_payload(_finding(Priority="fix_now")))
        self.assertIn("Fix Now", out)


class TestStructure(unittest.TestCase):
    """The marker is how stage two finds its own comment to update."""

    def test_marker_is_first(self):
        self.assertTrue(render(_payload(_finding())).startswith(
            "<!-- docksec-pr-comment -->"))

    def test_no_changed_files_reports_cleanly(self):
        out = render({"files": []})
        self.assertIn("No container files changed", out)

    def test_clean_scan_says_so(self):
        out = render(_payload())
        self.assertIn("No CRITICAL or HIGH findings", out)

    def test_serious_findings_are_counted(self):
        out = render(_payload(_finding(Severity="CRITICAL"), _finding(Severity="HIGH")))
        self.assertIn("2 finding(s) at CRITICAL or HIGH", out)

    def test_repeated_rule_collapses_to_one_row(self):
        """Two secrets in ENV trip DS031 twice; two identical rows read as a bug."""
        out = render(_payload(
            _finding(VulnerabilityID="DS031", PkgName="dockerfile", Title="Secret in ENV"),
            _finding(VulnerabilityID="DS031", PkgName="dockerfile", Title="Secret in ENV"),
        ))
        self.assertEqual(out.count("| DS031 |"), 1)
        self.assertIn("1 more finding(s) not shown", out)

    def test_long_lists_are_capped_and_say_so(self):
        findings = [_finding(VulnerabilityID=f"CVE-{i:04d}") for i in range(40)]
        out = render(_payload(*findings))
        self.assertIn("more finding(s) not shown", out)


if __name__ == "__main__":
    unittest.main()
