import clsx from 'clsx';
import React from 'react';
import styles from './Terminal.module.css';

/**
 * A styled, non-interactive terminal transcript.
 *
 * Lines are data rather than markup so a transcript can be re-captured from a
 * real run and pasted in without touching the component. Everything shown on
 * this site is genuine output - a security tool that mocks up its own results
 * is not one to trust.
 */

export type TerminalLine = {
  text: string;
  /** Visual role. Defaults to plain terminal foreground. */
  tone?: 'command' | 'dim' | 'heading' | 'critical' | 'high' | 'fixnow' | 'good';
};

type TerminalProps = {
  title?: string;
  lines: TerminalLine[];
  caption?: string;
};

const TONE_CLASS: Record<NonNullable<TerminalLine['tone']>, string> = {
  command: styles.command,
  dim: styles.dim,
  heading: styles.heading,
  critical: styles.critical,
  high: styles.high,
  fixnow: styles.fixnow,
  good: styles.good,
};

export default function Terminal({
  title = 'docksec',
  lines,
  caption,
}: TerminalProps): React.ReactElement {
  return (
    <figure style={{margin: 0}}>
      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.dots} aria-hidden="true">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
          <span className={styles.titleText}>{title}</span>
        </div>
        {/* Read as one block by assistive tech rather than line by line. */}
        <div className={styles.body} role="img" aria-label={`Terminal output: ${title}`}>
          {lines.map((line, index) => (
            <div
              // Transcripts are static and may repeat a line, so the index is
              // the only stable identity available here.
              key={index}
              className={clsx(styles.line, line.tone && TONE_CLASS[line.tone])}>
              {line.tone === 'command' ? (
                <>
                  <span className={styles.prompt}>$ </span>
                  {line.text}
                </>
              ) : (
                line.text || ' '
              )}
            </div>
          ))}
        </div>
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
