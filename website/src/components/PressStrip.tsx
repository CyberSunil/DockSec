import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import {AUTHORED, MEDIA, PODCASTS, TALKS} from '../data/press';
import styles from './PressStrip.module.css';

/**
 * Social proof on the landing page, built from the same verified data as the
 * press page so the two cannot drift.
 *
 * Outlets render as typographic plates rather than logo images: publications
 * rarely license their marks for third-party use, and the favicons they do
 * expose are 16px, which looks worse scaled up than clean type does. Supply
 * `logo` on an entry and that image is used instead.
 */

type Outlet = {name: string; kicker: string; href: string; logo?: string};

/** Curated, in the order they should read. */
const OUTLETS: Outlet[] = [
  {
    name: 'Help Net Security',
    kicker: '4 features',
    href: 'https://www.helpnetsecurity.com/2026/06/08/docksec-open-source-ai-docker-security-scanner/',
  },
  {
    name: 'SecurityWeek',
    kicker: 'Coverage',
    href: 'https://www.securityweek.com/open-source-docksec-uses-ai-to-cut-through-vulnerability-noise-in-docker-images/',
  },
  {
    name: 'SC World',
    kicker: 'Coverage',
    href: 'https://www.scworld.com/news/docker-security-scanner-uses-ai-to-help-explain-fix-vulnerabilities',
  },
  {
    name: 'ReversingLabs',
    kicker: 'Analysis',
    href: 'https://www.reversinglabs.com/blog/owasp-adopts-docksec',
  },
  {
    name: 'ISACA',
    kicker: 'Podcast',
    href: 'https://www.youtube.com/watch?v=Zls_3loAT84',
  },
  {
    name: 'OWASP Global AppSec',
    kicker: 'Talk + workshop',
    href: 'https://owasp.org/www-project-docksec/',
  },
];

function OutletPlate({outlet}: {outlet: Outlet}): React.ReactElement {
  const logoUrl = useBaseUrl(outlet.logo ?? '');
  return (
    <li className={styles.outlet}>
      <a
        className={styles.plate}
        href={outlet.href}
        target="_blank"
        rel="noopener noreferrer">
        {outlet.logo ? (
          <img className={styles.logo} src={logoUrl} alt={outlet.name} loading="lazy" />
        ) : (
          <>
            <span className={styles.name}>{outlet.name}</span>
            <span className={styles.kicker}>{outlet.kicker}</span>
          </>
        )}
      </a>
    </li>
  );
}

export default function PressStrip(): React.ReactElement | null {
  const total = MEDIA.length + PODCASTS.length + TALKS.length + AUTHORED.length;
  if (total === 0) {
    return null;
  }

  return (
    <section className={styles.strip}>
      <div className="ds-container">
        <p className={styles.label}>Covered by</p>
        <ul className={styles.outlets}>
          {OUTLETS.map((outlet) => (
            <OutletPlate key={outlet.name} outlet={outlet} />
          ))}
        </ul>
        <p className={styles.more}>
          <Link to="/docs/press">
            {total} articles, talks and podcasts across {new Set(MEDIA.map((m) => m.outlet)).size}+
            outlets →
          </Link>
        </p>
      </div>
    </section>
  );
}
