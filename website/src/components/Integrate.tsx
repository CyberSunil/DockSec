import clsx from 'clsx';
import React, {useState} from 'react';
import styles from './Integrate.module.css';

/**
 * Copy-pasteable CI snippets. Adding a platform means adding one entry here -
 * no layout or state changes required.
 */
const SNIPPETS = [
  {
    id: 'actions',
    label: 'GitHub Actions',
    code: `- name: Run DockSec
  uses: OWASP/DockSec@v2026.9.21
  with:
    dockerfile: 'Dockerfile'
    fail_on: 'high'
    sarif: 'true'

# Exit 1 = gated findings.  Exit 3 = incomplete scan.`,
  },
  {
    id: 'gitlab',
    label: 'GitLab CI',
    code: `docksec:
  image: ghcr.io/owasp/docksec:2026.9.21
  script:
    - docksec Dockerfile --scan-only --fail-on high
  artifacts:
    when: always
    paths: [docksec-reports/]`,
  },
  {
    id: 'jenkins',
    label: 'Jenkins',
    code: `stage('Container security') {
  steps {
    sh 'pip install docksec'
    sh 'docksec Dockerfile --scan-only --fail-on high'
  }
}`,
  },
  {
    id: 'precommit',
    label: 'pre-commit',
    code: `repos:
  - repo: https://github.com/OWASP/DockSec
    rev: v2026.9.21
    hooks:
      - id: docksec`,
  },
  {
    id: 'docker',
    label: 'Docker',
    code: `docker run --rm -v "$PWD:/github/workspace" \\
  -e INPUT_DOCKERFILE=Dockerfile \\
  -e INPUT_SCAN_ONLY=true \\
  ghcr.io/owasp/docksec:2026.9.21`,
  },
];

export default function Integrate(): React.ReactElement {
  const [active, setActive] = useState(SNIPPETS[0].id);
  const current = SNIPPETS.find((s) => s.id === active) ?? SNIPPETS[0];

  return (
    <section className="ds-section">
      <div className="ds-container">
        <p className="ds-eyebrow">Adoption</p>
        <h2 className="ds-section-title">Wire it into CI in about a minute</h2>
        <p className="ds-section-lead">
          No API key, no account, no hosted service. <code>--scan-only</code> runs the full
          deterministic pipeline, so these all work with nothing configured.
        </p>

        <div className={styles.tabs} role="tablist" aria-label="CI platform">
          {SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              role="tab"
              id={`tab-${snippet.id}`}
              aria-selected={active === snippet.id}
              aria-controls={`panel-${snippet.id}`}
              className={clsx(styles.tab, active === snippet.id && styles.tabActive)}
              onClick={() => setActive(snippet.id)}>
              {snippet.label}
            </button>
          ))}
        </div>

        <div
          className={styles.panel}
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}>
          <pre className={styles.code}>{current.code}</pre>
        </div>
      </div>
    </section>
  );
}
