---
title: Why DockSec
sidebar_position: 2
---

# Why DockSec

DockSec does not compete with Trivy on finding CVEs. It uses Trivy to find
them. It competes on the layer above: deciding which of them matter, spotting
the ones that combine, and saying what to run.

## The problem with a severity list

Scan `node:18` with any conventional scanner and you get 2,200 findings, 226 of
them CRITICAL. That output cannot be acted on. A team either ignores it or
spends a sprint on it, and both are the wrong call.

The reason is that severity measures *impact if exploited*, not *likelihood of
being exploited*. Those are different questions, and only one of them helps you
decide what to do on a Tuesday.

## What DockSec adds

**EPSS-based priority.** EPSS is the modelled probability that a CVE is
exploited in the wild within 30 days. On that same `node:18` image, nine CVEs
land in `Fix Now`. The top one, CVE-2026-31431, sits at the 100th percentile -
and is rated HIGH, so a severity-sorted list buries it under 226 CRITICALs
nobody is exploiting.

That inversion is the clearest argument for the tool. See the
[case study](./case-studies/node-18).

**Cross-service exploit chains.** A Compose stack where one service mounts the
Docker socket and publishes a port is not two findings. It is one path from the
internet to the host. DockSec reasons over the topology and reports the chain,
along with the single change that breaks it. No open-source competitor does
this - see [exploit chains](./exploit-chains).

**Copy-and-run fixes.** `upgrade openssl` is not a fix. `apt-get install
--only-upgrade -y openssl=3.5.7-1~deb13u2` is. Output ends with a completion
claim - *"applying all of the above resolves 1,712 of 2,200"* - so you know
when you are done and what is left.

**Honest coverage.** Every run states what it could not determine. A scan whose
images failed to pull reports that and exits 3, rather than printing a
confident score over an empty result. A security tool that hides its own blind
spots cannot be trusted as a merge gate.

## What it deliberately does not do

DockSec does not re-expose Trivy's Kubernetes, Helm or registry scanning.
Those are Trivy's, they are good, and claiming them would invite the fair
question "why not just run Trivy?"

It also collects no telemetry of any kind. That is not a roadmap item; it
contradicts the point of the tool.

The full list of limits is in [what it does not do](./limitations), which is
worth reading before you adopt anything that gates your builds.

## Where it fits

| Layer | Tool |
| --- | --- |
| Find CVEs in packages | Trivy (used internally) |
| Lint Dockerfile instructions | Hadolint (used internally) |
| **Rank by exploitation likelihood** | **DockSec** |
| **Detect cross-service chains** | **DockSec** |
| **Emit runnable fixes** | **DockSec** |
| Consume results | SARIF → GitHub Code Scanning; CycloneDX → Dependency-Track |
