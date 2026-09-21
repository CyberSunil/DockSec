import Link from '@docusaurus/Link';
import clsx from 'clsx';
import React from 'react';
import styles from './Showcase.module.css';
import Terminal, {type TerminalLine} from './Terminal';

type ShowcaseProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  lines: TerminalLine[];
  caption?: string;
  terminalTitle?: string;
  stats?: {value: string; label: string}[];
  link?: {to: string; label: string};
  /** Put the terminal on the left, to break up a long page. */
  reverse?: boolean;
  alt?: boolean;
};

export default function Showcase({
  eyebrow,
  title,
  children,
  lines,
  caption,
  terminalTitle,
  stats,
  link,
  reverse = false,
  alt = false,
}: ShowcaseProps): React.ReactElement {
  return (
    <section className={clsx('ds-section', alt && 'ds-section--alt')}>
      <div className="ds-container">
        <div className={clsx(styles.split, reverse && styles.splitReverse)}>
          <div className={styles.copy}>
            <p className="ds-eyebrow">{eyebrow}</p>
            <h2 className="ds-section-title">{title}</h2>
            {children}

            {stats ? (
              <div className={styles.stat}>
                {stats.map((item) => (
                  <div key={item.label} className={styles.statItem}>
                    <span className={styles.statValue}>{item.value}</span>
                    <span className={styles.statLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {link ? (
              <Link className="button button--secondary" to={link.to}>
                {link.label}
              </Link>
            ) : null}
          </div>

          <Terminal title={terminalTitle} lines={lines} caption={caption} />
        </div>
      </div>
    </section>
  );
}
