---
title: Reading the output
sidebar_position: 1
---

# Reading the output

A scan prints blocks in a deliberate order: what is here, what to do first,
what to run, and what could not be checked.

## Results

The severity table and the score.

```text
Results
  Critical 226   High 1974   Total 2200

Security Score  28.6 / 100   POOR
```

The score is deterministic and versioned (`score_version` in `--json`). The
same inputs always produce the same number, because a score that drifts between
identical runs cannot be defended in a CI gate or a compliance review.

Read it as **exposure**, not as a grade on your work.

## Priority

The EPSS tiers. This is the block that answers "what do I do first".

```text
Priority
  Fix Now       9
  Fix Soon   2161
```

| Tier | Meaning |
| --- | --- |
| `Fix Now` | High impact **and** top-decile exploitation likelihood |
| `Fix Soon` | High impact, but not currently being exploited widely |
| `Monitor` | Lower impact, but exploitation is common |
| `Low Priority` | Lower impact, exploitation uncommon |

A finding with no EPSS data is left untiered rather than assigned an optimistic
one - missing data is not evidence of low risk.

## Exploit chains

Cross-service attack paths, when scanning Compose. See
[exploit chains](./exploit-chains).

## Fix commands

Ordered by priority tier, not severity, and labelled with the tier that put
them there.

```text
Fix commands
  > apt-get install --only-upgrade -y openssl=3.5.7-1~deb13u2
      Fix Now  CRITICAL - 3.5.1 -> 3.5.7  (CVE-2025-15467, +6)
```

The block ends with an explicit completion claim:

```text
  Applying all of the above resolves 1712 of 2200 finding(s);
  488 have no mechanical fix yet.
```

You need to know when you are done, and what is left over.

## Coverage

What the scan could **not** determine, split into detection gaps (a scanner
failed, so findings may be missing) and remediation gaps (findings are
complete, the fix data is not).

```text
Coverage
  ! 2 of 2 compose service(s) could not be scanned (web, db)
  . Exploitability and runtime reachability are not proven.
  . Findings depend on scanner versions: hadolint 2.15.1, trivy 0.74.0
```

A scan with a detection gap exits `3`, not `0`. Use `--incomplete-policy fail`
to make CI treat any gap as fatal.

## Machine-readable output

| Flag | Output |
| --- | --- |
| `--json` | Full payload on stdout; human output goes to stderr |
| `--sarif` | SARIF 2.1.0, including EPSS and priority per result |
| `--sbom` | CycloneDX SBOM of the scanned image |
