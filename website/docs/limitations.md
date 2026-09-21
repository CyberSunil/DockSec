---
title: What it does not do
sidebar_position: 4
---

# What DockSec does not do

Stated plainly, because this is what you need before letting a tool gate your
builds. Every item here is a real limit, not a roadmap tease.

## Reachability is not proven

A finding means the vulnerable version is present in the image. It does not
mean the vulnerable code path is reachable, or that your application calls it.
DockSec says so in its coverage notes on every run.

EPSS narrows the list to what is being exploited *somewhere*. It does not tell
you whether it is exploitable *in your image*.

## Chains cover Compose only

Exploit chain detection reasons over a Docker Compose topology. It does not
cover Kubernetes manifests, Helm charts, or chains spanning a Dockerfile and a
Compose file. A single-service Compose file has no cross-service chain to find.

## Offline mode has a precondition

`--offline` uses the Trivy database already on disk and skips the update. There
is no bundled advisory database, so an air-gapped machine needs a Trivy DB
copied to it first. "Air-gapped" is supported with that condition, not
unconditionally.

## The AI pass is verified against one provider

The correlation pass has been tested against Claude. OpenAI, Gemini and Ollama
are wired up but their output quality is unverified. The deterministic core -
everything under `--scan-only` - does not use a model at all and is unaffected.

There is also no live-model test in CI. That path is covered by a stubbed
client, which by construction cannot catch a malformed real response.

## Severity mapping for Hadolint is a mapping

Hadolint reports `error` / `warning` / `info` / `style`. DockSec maps those to
HIGH / MEDIUM / LOW / LOW. That is a deliberate, conservative convention, not a
measurement, and reasonable people would map it differently.

## SBOM is CycloneDX only

SPDX is not emitted.

## The score is exposure, not a grade

The score is deterministic and severity-weighted. It does not discount a
finding for being unfixable, because "you cannot fix it" and "it does not
matter" are different statements. A well-maintained image with no available
patches can still score poorly - see the
[python:3.12-slim case study](./case-studies/python-slim).

## A clean result is not a guarantee

Zero findings means no *known, published* advisory matches a package in that
image *today*. Tomorrow's advisory applies to the same bytes. Re-scan on a
schedule and use `--baseline` so CI tells you when a previously clean image
stops being clean.
