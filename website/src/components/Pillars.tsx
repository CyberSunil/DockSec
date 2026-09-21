import React from 'react';
import styles from './Pillars.module.css';

/**
 * The three defensible claims, each with a concrete proof point rather than
 * an adjective. "Fast and powerful" persuades nobody who evaluates tools for
 * a living; a number they can reproduce does.
 */
const PILLARS = [
  {
    icon: '◎',
    title: 'Triage, not detection',
    body:
      'DockSec does not compete with Trivy on finding CVEs - it uses Trivy to find them. ' +
      'It ranks what it finds by EPSS exploitation likelihood, so the list you act on is ' +
      'the short one.',
    proof: 'node:18 → 2,200 findings → 9 to fix today',
  },
  {
    icon: '⛓',
    title: 'Stack-level reasoning',
    body:
      'Per-file scanners see one Dockerfile. DockSec sees the whole Compose topology and ' +
      'reports exploit chains: a socket mount plus a published port is one path to host ' +
      'compromise, not two unrelated findings.',
    proof: 'No open-source competitor does this',
  },
  {
    icon: '⬚',
    title: 'Provable data locality',
    body:
      'Fully local scanning, Ollama support, working secret redaction, an offline mode, and ' +
      'no telemetry of any kind. For regulated and air-gapped environments this is the ' +
      'qualifying criterion.',
    proof: 'Secrets are masked before any AI call',
  },
];

export default function Pillars(): React.ReactElement {
  return (
    <section className="ds-section ds-section--alt">
      <div className="ds-container">
        <p className="ds-eyebrow">Why it is different</p>
        <h2 className="ds-section-title">Three things a scanner alone cannot tell you</h2>
        <p className="ds-section-lead">
          Every container scanner produces a list. The useful question is which entries on
          that list can actually hurt you, and what to do about them.
        </p>

        <div className={styles.grid}>
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                {pillar.icon}
              </span>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardBody}>{pillar.body}</p>
              <span className={styles.proof}>{pillar.proof}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
