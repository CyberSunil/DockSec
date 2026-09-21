import Link from '@docusaurus/Link';
import React from 'react';
import {MEDIA, PRESS_COUNTS} from '../data/press';
import styles from './PressStrip.module.css';

/**
 * Social proof on the landing page. Names are pulled from the same verified
 * data as the press page, so this cannot drift from what is actually listed.
 */
export default function PressStrip(): React.ReactElement | null {
  const featured = MEDIA.filter((item) => item.featured);
  if (featured.length === 0) {
    return null;
  }

  // One row per outlet, even where an outlet covered DockSec several times.
  const seen = new Set<string>();
  const outlets = featured.filter((item) => {
    if (seen.has(item.outlet)) {
      return false;
    }
    seen.add(item.outlet);
    return true;
  });

  return (
    <section className={styles.strip}>
      <div className="ds-container">
        <p className={styles.label}>As covered by</p>
        <ul className={styles.outlets}>
          {outlets.map((item) => (
            <li key={item.outlet} className={styles.outlet}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.outlet}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.more}>
          <Link to="/docs/press">
            {PRESS_COUNTS.media + PRESS_COUNTS.video} pieces of coverage across{' '}
            {PRESS_COUNTS.outlets} outlets →
          </Link>
        </p>
      </div>
    </section>
  );
}
