import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import React from 'react';

import Hero from '../components/Hero';
import Integrate from '../components/Integrate';
import Pillars from '../components/Pillars';
import PressStrip from '../components/PressStrip';
import Showcase from '../components/Showcase';
import {
  CHAIN_TRANSCRIPT,
  FIX_TRANSCRIPT,
  TRIAGE_TRANSCRIPT,
} from '../components/transcripts';

/**
 * The landing page is composed of section components, each self-contained in
 * src/components. Adding, removing or reordering a section should be an edit
 * here and nowhere else.
 */
export default function Home(): React.ReactElement {
  return (
    <Layout
      title="Container security that tells you what to fix first"
      description="OWASP DockSec ranks Docker and Compose findings by exploitation likelihood, detects cross-service exploit chains, and emits copy-and-run fixes. No API key required.">
      <Hero />

      <PressStrip />

      <Showcase
        eyebrow="The problem"
        title="A severity list is not a plan"
        lines={TRIAGE_TRANSCRIPT}
        caption="Real output. node:18, scanned 2026-09-20."
        terminalTitle="docksec -i node:18"
        stats={[
          {value: '2,200', label: 'findings reported'},
          {value: '9', label: 'worth fixing today'},
          {value: '0.999', label: 'top EPSS score'},
        ]}
        link={{to: '/docs/case-studies/node-18', label: 'Read the case study'}}>
        <p>
          CVE-2026-31431 sits at the 100th EPSS percentile - near-certain exploitation. It is
          rated <strong>HIGH</strong>, so a severity-sorted list puts it below 226 CRITICAL
          findings that nobody is exploiting.
        </p>
        <p>
          That inversion is the whole argument for this tool. DockSec puts it first, labels
          it <code>Fix Now</code>, and prints the command that resolves it.
        </p>
      </Showcase>

      <Pillars />

      <Showcase
        eyebrow="Exploit chains"
        title="Three low findings can be one critical path"
        reverse
        lines={CHAIN_TRANSCRIPT}
        caption="Real output from the bundled insecure Compose example."
        terminalTitle="docksec --compose"
        link={{to: '/docs/exploit-chains', label: 'How chains are detected'}}>
        <p>
          A per-file scanner sees a socket mount in one service and a published port in
          another, and reports two findings. DockSec sees the topology: the service is
          reachable from outside the host <em>and</em> can escape to it.
        </p>
        <p>
          Chains are detected deterministically from the Compose graph, so they work with{' '}
          <code>--scan-only</code> and offline. Each one ends with the single change that
          breaks it.
        </p>
      </Showcase>

      <Showcase
        eyebrow="Remediation"
        title="Fixes you can apply, not advice you must interpret"
        alt
        lines={FIX_TRANSCRIPT}
        caption="docksec --fix, with --dry-run showing the diff first."
        terminalTitle="docksec --fix --dry-run"
        link={{to: '/docs/fix-mode', label: 'How --fix works'}}>
        <p>
          <code>--fix</code> applies only the mechanical subset: pinning a base image,
          inserting a non-root <code>USER</code>, converting <code>ADD</code> to{' '}
          <code>COPY</code>. It keeps a <code>.bak</code>, refuses to run on a dirty working
          tree, and shows a diff first.
        </p>
        <p>
          Anything needing judgement - moving a secret, choosing a base image version - is
          listed under <strong>Needs review</strong> rather than applied. An auto-fix that
          breaks a build gets switched off.
        </p>
      </Showcase>

      <Integrate />

      <section className="ds-section ds-section--alt">
        <div className="ds-container" style={{textAlign: 'center'}}>
          <h2 className="ds-section-title">Evaluate it in fifteen minutes</h2>
          <p className="ds-section-lead" style={{margin: '0 auto var(--ds-space-lg)'}}>
            The evaluation guide includes what DockSec does <em>not</em> do, because that is
            what you actually need to know before adopting a security tool.
          </p>
          <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              Get started
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/limitations">
              What it does not do
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
