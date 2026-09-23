import clsx from 'clsx';
import React from 'react';
import {PRESS_SECTIONS, type PressItem} from '../data/press';
import styles from './PressList.module.css';

function formatDate(value: string): string {
  // Accepts "2026-09-20" or "2026-09"; anything else is shown verbatim.
  const parts = value.split('-');
  if (parts.length < 2) {
    return value;
  }
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2] ?? 1));
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    ...(parts.length > 2 ? {day: 'numeric'} : {}),
  });
}

function Entry({item}: {item: PressItem}): React.ReactElement {
  return (
    <li className={clsx(styles.item, item.featured && styles.featured)}>
      <div className={styles.meta}>
        <span className={styles.outlet}>{item.outlet}</span>
        <span>{formatDate(item.date)}</span>
        {item.author ? <span>· {item.author}</span> : null}
        {item.location ? <span>· {item.location}</span> : null}
        {item.language ? <span className={styles.tag}>{item.language}</span> : null}
      </div>

      <h3 className={styles.title}>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>

      {item.quote ? <blockquote className={styles.quote}>{item.quote}</blockquote> : null}
      {item.summary ? <p className={styles.summary}>{item.summary}</p> : null}
    </li>
  );
}

export default function PressList(): React.ReactElement {
  return (
    <>
      {PRESS_SECTIONS.map((section) => (
        <section key={section.id} className={styles.section}>
          <h2 id={section.id}>{section.heading}</h2>
          <p className={styles.blurb}>{section.blurb}</p>

          {section.items.length > 0 ? (
            <ul className={styles.list}>
              {section.items.map((item) => (
                <Entry key={item.url} item={item} />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              Nothing published here yet. Covered DockSec?{' '}
              <a href="https://github.com/OWASP/DockSec/issues/new">Tell us</a> and we will
              add it.
            </p>
          )}
        </section>
      ))}
    </>
  );
}
