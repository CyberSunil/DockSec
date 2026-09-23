import Link from '@docusaurus/Link';
import React, {useCallback, useState} from 'react';
import styles from './Hero.module.css';

const INSTALL_COMMAND = 'pip install docksec';

/** Facts, not adjectives. Each one is checkable. */
const TRUST_SIGNALS = [
  'OWASP Lab Project',
  'MIT licensed',
  'No API key required',
  'No telemetry, ever',
];

export default function Hero(): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const copyInstall = useCallback(() => {
    // Clipboard access can be refused (insecure origin, permissions policy).
    // Copying is a convenience here, so a failure must not break the page.
    navigator.clipboard
      ?.writeText(INSTALL_COMMAND)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* The command is visible and selectable; nothing more to do. */
      });
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <span className={styles.badge}>An OWASP Foundation Project</span>

        <h1 className={styles.title}>
          2,200 findings.
          <br />
          <span className={styles.accent}>Nine that matter today.</span>
        </h1>

        <p className={styles.subtitle}>
          DockSec ranks container findings by how likely they are to be
          exploited, detects exploit chains that span services, and tells you
          the command to run. Entirely on your own infrastructure.
        </p>

        <div className={styles.actions}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Get started
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/why-docksec">
            Why DockSec
          </Link>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.install}
            onClick={copyInstall}
            aria-label={`Copy install command: ${INSTALL_COMMAND}`}>
            <span className={styles.installPrompt} aria-hidden="true">
              $
            </span>
            <code>{INSTALL_COMMAND}</code>
            <span className={styles.copyHint} aria-live="polite">
              {copied ? 'Copied' : 'Click to copy'}
            </span>
          </button>
        </div>

        <ul className={styles.trustRow}>
          {TRUST_SIGNALS.map((signal) => (
            <li key={signal} className={styles.trustItem}>
              <span aria-hidden="true">✓</span>
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
