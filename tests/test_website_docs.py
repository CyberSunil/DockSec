"""The website must not drift from the repository it documents.

The site reuses content that also lives in the repo (case studies, examples).
Copies rot: someone fixes a number in one place and the other quietly keeps
claiming the old one. These tests fail when that happens.

They are deliberately cheap and offline - no build, no network - so they run in
the normal suite rather than only in the website workflow.
"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).parent.parent
WEBSITE = ROOT / "website"
WEBSITE_DOCS = WEBSITE / "docs"


@unittest.skipUnless(WEBSITE.exists(), "website/ is not present")
class TestWebsiteStructure(unittest.TestCase):
    def test_every_sidebar_entry_resolves_to_a_file(self):
        """A sidebar id with no file breaks the build; catch it here first."""
        sidebar = (WEBSITE / "sidebars.ts").read_text()
        ids = re.findall(r"'([a-z0-9][a-z0-9/-]*)'", sidebar)
        # Filter out config keys and type names, keeping doc ids.
        candidates = [i for i in ids if not i.startswith(("doc", "category"))]
        missing = [
            doc_id
            for doc_id in candidates
            if not (WEBSITE_DOCS / f"{doc_id}.md").exists()
            and not (WEBSITE_DOCS / f"{doc_id}.mdx").exists()
            and not (WEBSITE_DOCS / doc_id / "index.md").exists()
        ]
        self.assertEqual(missing, [], f"sidebar references missing docs: {missing}")

    def test_every_doc_has_front_matter(self):
        """Without a title, Docusaurus infers one from the filename."""
        for path in WEBSITE_DOCS.rglob("*.md"):
            text = path.read_text()
            self.assertTrue(
                text.startswith("---\n"),
                f"{path.relative_to(ROOT)} is missing front matter",
            )
            self.assertIn(
                "title:", text.split("---")[1],
                f"{path.relative_to(ROOT)} front matter has no title",
            )

    def test_no_relative_links_escape_the_website(self):
        """A '../../examples/x' link works in the repo and 404s on the site."""
        offenders = []
        for path in WEBSITE_DOCS.rglob("*.md"):
            for _, link in re.findall(r"\[([^\]]*)\]\(([^)]+)\)", path.read_text()):
                if link.startswith("../../") or link.startswith("../examples"):
                    offenders.append(f"{path.relative_to(ROOT)}: {link}")
        self.assertEqual(offenders, [], f"links escape the site root: {offenders}")


@unittest.skipUnless(WEBSITE.exists(), "website/ is not present")
class TestCaseStudiesStayInSync(unittest.TestCase):
    """Case studies exist in both docs/ and website/docs/. The headline
    numbers must agree, or one of them is lying to a reader."""

    STUDIES = ("node-18", "python-slim", "nginx-alpine")

    def test_every_repo_case_study_is_published(self):
        for name in self.STUDIES:
            self.assertTrue(
                (WEBSITE_DOCS / "case-studies" / f"{name}.md").exists(),
                f"{name} is in docs/case-studies but not on the site",
            )

    def test_headline_numbers_match(self):
        """Compare the digits in each table, which is where the claims live."""
        for name in self.STUDIES:
            repo = (ROOT / "docs" / "case-studies" / f"{name}.md").read_text()
            site = (WEBSITE_DOCS / "case-studies" / f"{name}.md").read_text()
            repo_numbers = set(re.findall(r"\|\s*([\d,]+(?:\.\d+)?)\s*\|", repo))
            site_numbers = set(re.findall(r"\|\s*([\d,]+(?:\.\d+)?)\s*\|", site))
            self.assertEqual(
                repo_numbers, site_numbers,
                f"{name}: repo and site report different numbers "
                f"(only in repo: {repo_numbers - site_numbers}; "
                f"only on site: {site_numbers - repo_numbers})",
            )


@unittest.skipUnless(WEBSITE.exists(), "website/ is not present")
class TestWebsiteIsolation(unittest.TestCase):
    """The scanner must never gain a frontend dependency."""

    def test_website_deps_are_not_in_the_package(self):
        pyproject = (ROOT / "pyproject.toml").read_text()
        for marker in ("docusaurus", "react", "node_modules"):
            self.assertNotIn(
                marker, pyproject.lower(),
                f"'{marker}' leaked into the Python package metadata",
            )

    def test_website_build_output_is_ignored(self):
        gitignore = (WEBSITE / ".gitignore").read_text()
        for path in ("/build", "/.docusaurus", "/node_modules"):
            self.assertIn(path, gitignore, f"{path} is not gitignored")


if __name__ == "__main__":
    unittest.main()
