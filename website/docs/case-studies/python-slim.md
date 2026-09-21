---
title: "python:3.12-slim - 44 findings, none fixable"
sidebar_position: 2
---

**44 findings. Not one of them has a fix.**

```bash
docksec -i python:3.12-slim --image-only --scan-only
```

## Result

| | |
| --- | --- |
| Total findings | 44 |
| CRITICAL | 0 |
| HIGH | 44 |
| **With a fix available** | **0** |
| `Fix Now` | 0 |
| Security score | 28.9 / 100 |

## The interesting part

This is a well-maintained image. There are no CRITICAL findings and nothing is
being actively exploited - every finding lands in `Fix Soon`, none in
`Fix Now`. The 44 HIGH findings concentrate in a handful of `util-linux`
packages (`libblkid1`, `libmount1`, `libuuid1`, `bsdutils` and friends) that
Debian has not yet patched in the `slim` base.

**Zero of the 44 have a fixed version upstream.** There is no `apt-get` command
that resolves them, and `docksec --fix` correctly offers nothing. DockSec says
so directly rather than printing advice that cannot be followed:

```
Coverage
  ! 44 finding(s) have no fixed version available upstream; no upgrade will
    resolve them yet.
```

## What to actually do

There are exactly three honest options, and a scanner that pretends otherwise
is lying to you:

1. **Accept and record the risk.** Waive them with a reason and an expiry in
   `.docksec-ignore.yml`, so the decision is visible and gets revisited rather
   than quietly forgotten.
2. **Change the base.** `python:3.12-alpine` uses musl and a different package
   set, so it does not inherit these. That is a real migration with its own
   trade-offs (wheels, glibc assumptions), not a free win.
3. **Wait.** Debian will patch these. Re-scan on a schedule and let the
   baseline tell you when the number moves.

## A note on the score

28.9 looks alarming for an image with nothing exploitable and nothing
fixable. The score is severity-weighted and deterministic; it does not
discount a finding for being unfixable, because "you cannot fix it" and "it
does not matter" are different statements.

Read the score as *exposure*, not as a grade on your work. If that exposure is
unacceptable, option 2 is the answer - and the score is doing its job by
making that uncomfortable.
