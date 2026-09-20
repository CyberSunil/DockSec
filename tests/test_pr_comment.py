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


class TestCommentFitsGithubsLimit(unittest.TestCase):
    """GitHub rejects a comment body over 65536 characters.

    The per-file row cap does not bound the total: a pull request touching
    many compose services produced a 156KB body, which the API refuses - so
    the job failed and nothing was posted at all.
    """

    def _many_files(self, count=50, per_file=2000):
        files = []
        for i in range(count):
            findings = [
                _finding(VulnerabilityID=f"CVE-2026-{j:05d}", Title="X" * 400)
                for j in range(per_file)
            ]
            files.append({
                "file": f"svc{i}/Dockerfile",
                "data": {
                    "scan_info": {"analysis_score": 10},
                    "vulnerabilities": findings,
                    "severity_counts": {
                        "CRITICAL": 0, "HIGH": per_file, "MEDIUM": 0, "LOW": 0,
                    },
                },
            })
        return {"files": files}

    def test_large_result_stays_under_the_limit(self):
        out = render(self._many_files())
        self.assertLess(len(out), 65536)

    def test_truncation_is_declared(self):
        out = render(self._many_files())
        self.assertIn("more file(s) not shown", out)

    def test_truncated_body_is_still_well_formed(self):
        """Cutting mid-table would leave broken Markdown in the comment."""
        out = render(self._many_files())
        self.assertEqual(out.count("<details>"), out.count("</details>"))
        self.assertTrue(out.rstrip().endswith("</sub>"))

    def test_a_normal_result_is_not_truncated(self):
        out = render(self._many_files(count=2, per_file=3))
        self.assertNotIn("more file(s) not shown", out)


class TestEscapeHelper(unittest.TestCase):
    """`_md` is the single choke point every untrusted value passes through,
    so it is worth testing directly rather than only through rendered output."""

    def test_empty_becomes_a_placeholder(self):
        self.assertEqual(_md(""), "-")
        self.assertEqual(_md(None), "-")

    def test_whitespace_is_collapsed(self):
        self.assertEqual(_md("a\n\n   b\tc"), "a b c")

    def test_table_metacharacters_are_escaped(self):
        for char in ("|", "`", "*", "_", "[", "]"):
            self.assertIn("\\" + char, _md(f"x{char}y"))

    def test_angle_brackets_become_entities(self):
        self.assertNotIn("<", _md("<script>").replace("\\<", ""))

    def test_truncation_respects_the_limit(self):
        self.assertLessEqual(len(_md("A" * 999, limit=50)), 60)


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
