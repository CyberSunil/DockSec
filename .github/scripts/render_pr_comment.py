"""Render DockSec pull-request scan results as a Markdown comment.

Runs in stage two of the two-stage PR workflow, in the base repository's
trusted context. Its input is the JSON artifact produced by the untrusted
scan job, so **everything it reads is attacker-controlled**: a fork can put
any string in a Dockerfile and therefore in a finding's title.

Nothing from that input is ever interpolated raw. `_md` escapes the
characters that would otherwise let a finding title close a table cell, start
an HTML tag, or smuggle a Markdown link into the rendered comment.
"""

import argparse
import html
import json
import re
import sys
from pathlib import Path

MAX_ROWS = 15
# GitHub rejects an issue comment body over 65536 characters. A pull request
# touching many compose services can exceed that, and a rejected comment means
# the whole job fails with nothing posted - so the body is budgeted and
# truncated rather than sent hopefully.
MAX_BODY = 60000
SEVERITY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "UNKNOWN": 4}
MARKER = "<!-- docksec-pr-comment -->"


def _md(value, limit: int = 160) -> str:
    """Make untrusted text safe to place inside a Markdown table cell."""
    text = str(value if value is not None else "")
    text = text.replace("\r", " ").replace("\n", " ")
    # Collapse whitespace so a long run cannot stretch the table.
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[: limit - 1].rstrip() + "…"
    # Escape HTML first: a raw '<' would otherwise open a tag in the comment.
    text = html.escape(text, quote=False)
    # Then neutralise the Markdown metacharacters that matter in a table.
    for char in ("\\", "|", "`", "*", "_", "[", "]", "<", ">"):
        text = text.replace(char, "\\" + char)
    return text or "-"


def _rank(finding) -> tuple:
    severity = str(finding.get("Severity", "UNKNOWN")).upper()
    # fix_now first, then severity, so the comment leads with what to do.
    priority = 0 if finding.get("Priority") == "fix_now" else 1
    return (priority, SEVERITY_ORDER.get(severity, 99), str(finding.get("VulnerabilityID", "")))


def render(payload: dict) -> str:
    files = payload.get("files") or []
    if not files:
        return f"{MARKER}\n## DockSec\n\nNo container files changed in this pull request."

    total = 0
    serious = 0
    blocks = []

    for entry in files:
        path = entry.get("file", "?")
        data = entry.get("data") or {}
        findings = data.get("vulnerabilities") or []
        counts = data.get("severity_counts") or {}
        score = (data.get("scan_info") or {}).get("analysis_score")
        total += len(findings)
        serious += counts.get("CRITICAL", 0) + counts.get("HIGH", 0)

        header = (
            f"<details>\n<summary><strong>{_md(path)}</strong> - "
            f"{counts.get('CRITICAL', 0)} critical, {counts.get('HIGH', 0)} high"
            + (f", score {score}" if score is not None else "")
            + "</summary>\n"
        )

        if not findings:
            blocks.append(header + "\nNo findings.\n</details>")
            continue

        rows = ["", "| Severity | ID | Finding | Fix |", "| --- | --- | --- | --- |"]
        # One row per rule, not per occurrence: a Dockerfile with two secrets
        # in ENV trips DS031 twice, and two identical rows read as a bug.
        deduped = {}
        for finding in findings:
            key = (finding.get("VulnerabilityID"), finding.get("PkgName"))
            existing = deduped.get(key)
            if existing is None or _rank(finding) < _rank(existing):
                deduped[key] = finding
        ordered = sorted(deduped.values(), key=_rank)
        hidden = len(findings) - len(ordered)
        for finding in ordered[:MAX_ROWS]:
            tier = " (Fix Now)" if finding.get("Priority") == "fix_now" else ""
            fix = finding.get("FixedVersion") or finding.get("Remediation") or "-"
            rows.append(
                f"| {_md(finding.get('Severity'))}{tier} "
                f"| {_md(finding.get('VulnerabilityID'), 40)} "
                f"| {_md(finding.get('Title'))} "
                f"| {_md(fix, 80)} |"
            )
        remaining = max(0, len(ordered) - MAX_ROWS) + hidden
        if remaining:
            rows.append(f"\n_{remaining} more finding(s) not shown._")
        blocks.append(header + "\n".join(rows) + "\n</details>")

    verdict = (
        f"**{serious} finding(s) at CRITICAL or HIGH** across {len(files)} file(s)."
        if serious
        else f"No CRITICAL or HIGH findings across {len(files)} file(s)."
    )

    head = [
        MARKER,
        "## DockSec",
        "",
        verdict,
        f"\n{total} finding(s) in total. Ordered by exploitation likelihood (EPSS), "
        "so the top rows are what to fix first.",
        "",
    ]
    foot = ["", "<sub>Run locally: `docksec <file> --scan-only`</sub>"]

    # Keep whole per-file blocks while they fit, then say how many were
    # dropped. Truncating mid-table would produce broken Markdown.
    budget = MAX_BODY - len("\n".join(head + foot))
    kept = []
    for index, block in enumerate(blocks):
        if budget - (len(block) + 1) < 0:
            remaining = len(blocks) - index
            kept.append(
                f"\n_{remaining} more file(s) not shown - the full result "
                f"exceeds GitHub's comment size limit._"
            )
            break
        budget -= len(block) + 1
        kept.append(block)

    return "\n".join(head + kept + foot)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("results", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    try:
        payload = json.loads(args.results.read_text())
    except (OSError, ValueError) as exc:
        print(f"could not read scan results: {exc}", file=sys.stderr)
        return 1

    args.out.write_text(render(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
