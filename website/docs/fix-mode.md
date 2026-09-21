---
title: Fix mode
sidebar_position: 3
---

# `docksec --fix`

Applies the mechanical subset of the suggested Dockerfile changes, re-scans,
and reports the delta.

```bash
docksec Dockerfile --scan-only --fix --dry-run   # preview
docksec Dockerfile --scan-only --fix             # apply
```

## What it will change

| Change | Rule |
| --- | --- |
| Insert a non-root `USER` before `CMD`/`ENTRYPOINT` | DS002, DL3002 |
| Convert `ADD` to `COPY` for local paths | DS005, DL3020 |
| Add `--no-install-recommends` to `apt-get install` | DS029 |
| Insert a placeholder `HEALTHCHECK` | DS026 |
| Pin a `:latest` base image | DS001 |

## What it will not change

Anything requiring a judgement call is listed under **Needs review** instead of
applied:

- Moving a secret out of `ENV` - where it goes depends on your deployment
- Choosing a base image version - a version bump can break a build
- Converting an `ADD` that fetches a URL or unpacks an archive
- Editing a Compose file

This restraint is what makes the feature safe enough to run. An auto-fix that
breaks a build gets switched off, and then it fixes nothing at all.

## Safety

- The original is kept as `.bak`
- `--dry-run` prints a unified diff and writes nothing
- A file with uncommitted changes is refused unless `--force` is passed, so
  git can always undo the result
- The re-scan reports before and after counts, so the change is measurable

```text
Applied 4 change(s)
Original saved to Dockerfile.bak
Dockerfile findings: 9 -> 4 (5 resolved)
Review the diff and run your build before committing.
```

## Known limits

`--fix` has been exercised mainly on hand-written Dockerfiles. Heredocs,
many-stage builds and unusual BuildKit syntax may hit edit paths that have less
coverage. Always review the diff, and always run your build before committing -
which is why `--dry-run` exists and why the `.bak` is kept.
