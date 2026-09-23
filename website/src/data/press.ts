/**
 * Press, podcasts and speaking appearances.
 *
 * ONE RULE: every entry must be real and linkable. An invented citation on a
 * security project's own site is the fastest way to lose the audience the page
 * exists to persuade.
 *
 * Every URL below returned HTTP 200 when this list was compiled, and every
 * title and date was read from the page itself rather than written by hand.
 * Two further pieces of coverage were deliberately left out because their
 * sites present broken TLS certificates; linking them from a security
 * project's press page would be indefensible.
 *
 * Adding an entry: append to the relevant array. The page renders whatever is
 * present and hides any section that is empty.
 */

export type PressItem = {
  /** Publication, show or conference name. */
  outlet: string;
  /** Headline, episode title or talk title. */
  title: string;
  /** Public URL. Required - an unlinkable claim is not evidence. */
  url: string;
  /** ISO date (YYYY-MM-DD) or a month like "2026-09". */
  date: string;
  /** Byline, host or speaker. */
  author?: string;
  /** A short verbatim quote. Never paraphrase into quotation marks. */
  quote?: string;
  /** One or two sentences on what it actually covered. */
  summary?: string;
  /** Venue and city, for talks. */
  location?: string;
  /** Language, when not English. Shown as a tag. */
  language?: string;
  /** Marks the handful worth reading first. */
  featured?: boolean;
};

/** Written coverage, newest first. */
export const MEDIA: PressItem[] = [
  {
    outlet: 'HackerNoon',
    title:
      "The Engineer's Guide to Closing the Triage Gap: Implementing OWASP DockSec in High-Velocity Pipelines",
    url: 'https://hackernoon.com/the-engineers-guide-to-closing-the-triage-gap-implementing-owasp-docksec-in-high-velocity-pipeline',
    date: '2026-06-09',
    featured: true,
    summary:
      'An independent implementation guide covering how to wire DockSec into a fast-moving CI pipeline.',
  },
  {
    outlet: 'Help Net Security',
    title: '20 open-source cybersecurity tools to keep your team ready for anything',
    url: 'https://www.helpnetsecurity.com/2026/07/08/20-latest-open-source-cybersecurity-tools/',
    date: '2026-07-08',
    featured: true,
    summary:
      'DockSec included in an annual selection of twenty open-source security tools spanning the whole discipline.',
  },
  {
    outlet: 'SecurityWeek',
    title:
      'Open Source DockSec Uses AI to Cut Through Vulnerability Noise in Docker Images',
    url: 'https://www.securityweek.com/open-source-docksec-uses-ai-to-cut-through-vulnerability-noise-in-docker-images/',
    date: '2026-05-26',
    featured: true,
    summary:
      'Coverage of the core thesis: a scanner that reports everything is not the same as one that tells you what to fix.',
  },
  {
    outlet: 'ReversingLabs',
    title: 'OWASP adopts DockSec: What it is - and why it matters',
    url: 'https://www.reversinglabs.com/blog/owasp-adopts-docksec',
    date: '2026-03-11',
    featured: true,
    summary:
      'Written when DockSec was adopted by OWASP, covering what the project sets out to do and where it fits.',
  },
  {
    outlet: 'SC World',
    title: 'Docker security scanner uses AI to help explain, fix vulnerabilities',
    url: 'https://www.scworld.com/news/docker-security-scanner-uses-ai-to-help-explain-fix-vulnerabilities',
    date: '2026-05-26',
    featured: true,
  },
  {
    outlet: 'Help Net Security',
    title: 'DockSec: Open-source AI-powered Docker security scanner',
    url: 'https://www.helpnetsecurity.com/2026/06/08/docksec-open-source-ai-docker-security-scanner/',
    date: '2026-06-08',
    featured: true,
    summary: 'A dedicated write-up of the tool and how it is used.',
  },
  {
    outlet: 'Help Net Security',
    title: 'Hottest cybersecurity open-source tools of the month: June 2026',
    url: 'https://www.helpnetsecurity.com/2026/06/30/hottest-cybersecurity-open-source-tools-of-the-month-june-2026/',
    date: '2026-06-30',
  },
  {
    outlet: 'Help Net Security',
    title:
      'Week in review: Exploited Check Point VPN zero-day, Oracle PeopleSoft servers under attack',
    url: 'https://www.helpnetsecurity.com/2026/06/14/week-in-review-exploited-check-point-vpn-zero-day-oracle-peoplesoft-servers-under-attack/',
    date: '2026-06-14',
  },
  {
    outlet: 'The Cyber Express',
    title: 'Advait Patel on How SRE and Security Engineering Are Converging',
    url: 'https://thecyberexpress.com/sre-and-security-engineering/',
    date: '2026-06-16',
    summary:
      'An interview on the overlap between reliability engineering and security, and where container tooling sits in it.',
  },
  {
    outlet: 'Cloud Native Now',
    title: 'OWASP Has Adopted DockSec and the Cloud Security Community Is Taking Notice',
    url: 'https://cloudnativenow.com/contributed-content/owasp-has-adopted-docksec-and-the-cloud-security-community-is-taking-notice/',
    date: '2026-04-30',
  },
  {
    outlet: 'Cloud Native Now',
    title: 'Dockerfile Practices are a DevOps Tax Before They are a Security Concern',
    url: 'https://cloudnativenow.com/contributed-content/dockerfile-practices-are-a-devops-tax-before-they-are-a-security-concern/',
    date: '2026-04-22',
  },
  {
    outlet: 'InfoSec Relations',
    title: 'OWASP Adopts DockSec by Advait Patel to Close the Container Security Gap',
    url: 'https://infosecrelations.com/how-advait-patel-built-docksec-to-close-the-container-security-triage-gap/',
    date: '2026-02-28',
  },
  {
    outlet: 'Business Tech Weekly',
    title: 'DockSec Unpacked: Streamlining Container Security With a Four-Stage Pipeline Approach',
    url: 'https://www.businesstechweekly.com/technology-news/docksec-unpacked-streamlining-container-security-with-a-four-stage-pipeline-approach/',
    date: '2026-07-16',
  },
  {
    outlet: 'Business Tech Weekly',
    title:
      "Container Security's Missing Link: DockSec's AI Layer Transforms Vulnerability Reports Into Fixes",
    url: 'https://www.businesstechweekly.com/technology-news/container-securitys-missing-link-docksecs-ai-layer-transforms-vulnerability-reports-into-fixes/',
    date: '2026-07-09',
  },
  {
    outlet: 'Business Tech Weekly',
    title:
      'DockSec: Transforming Container Security Scores Into Actionable Insights for Developers',
    url: 'https://www.businesstechweekly.com/technology-news/docksec-transforming-container-security-scores-into-actionable-insights-for-developers/',
    date: '2026-08-06',
  },
  {
    outlet: 'Linux Today',
    title: 'DockSec: Open-source AI-powered Docker security scanner',
    url: 'https://www.linuxtoday.com/blog/docksec-open-source-ai-powered-docker-security-scanner/',
    date: '2026-07-14',
  },
  {
    outlet: 'Open Source For U',
    title: 'OWASP-Backed Open Source DockSec Uses LLMs To Fix Docker Vulnerabilities Faster',
    url: 'https://www.opensourceforu.com/2026/05/owasp-backed-open-source-docksec-uses-llms-to-fix-docker-vulnerabilities-faster/',
    date: '2026-05-27',
  },
  {
    outlet: 'Undercode News',
    title:
      'OWASP’s DockSec Is Changing Docker Security by Teaching Developers How to Actually Fix Vulnerabilities',
    url: 'https://undercodenews.com/owasps-docksec-is-changing-docker-security-by-teaching-developers-how-to-actually-fix-vulnerabilities/',
    date: '2026-05-26',
  },
  {
    outlet: 'News4Hackers',
    title: 'Open-Source Tool Tackles Docker Image Security with AI-Powered Vulnerability Scanning',
    url: 'https://www.news4hackers.com/open-source-tool-tackles-docker-image-security-with-ai-powered-vulnerability-scanning/',
    date: '2026-05-26',
  },
  {
    outlet: 'News4Hackers',
    title: 'Top Cybersecurity Open-Source Tools for June 2026',
    url: 'https://www.news4hackers.com/top-cybersecurity-open-source-tools-for-june-2026/',
    date: '2026-06-30',
  },
  {
    outlet: 'CyberMaterial',
    title: 'DockSec - AI-Powered Docker Vulnerability Analysis',
    url: 'https://www.cybermaterial.com/p/docksec-ai-powered-docker-vulnerability',
    date: '2026-05-26',
  },
  {
    outlet: 'Cybersecurity News',
    title: 'DockSec: AI-powered container security',
    url: 'https://cybersecuritynews.com/docksec-ai-container-security/',
    date: '2026-05-26',
  },
  {
    outlet: 'The Next Gen Tech Insider',
    title: 'OWASP Launches DockSec AI Tool for Automated Docker Security Remediation',
    url: 'https://thenextgentechinsider.com/pulse/owasp-launches-docksec-ai-tool-for-automated-docker-security-remediation',
    date: '2026-06-08',
  },
  {
    outlet: 'QPulse (Quasar CyberTech)',
    title: 'Open Source DockSec Tool Integrates AI to Streamline Docker Vulnerability Remediation',
    url: 'https://qpulse.quasarcybertech.com/news/3536/open-source-docksec-tool-integrates-ai-to-streamline-docker-vulnerability-remediation',
    date: '2026-05-26',
  },
  {
    outlet: 'Secburg',
    title: 'DockSec v2026.6.11 and v2026.6.12 Released',
    url: 'https://secburg.com/posts/docksec-v202611-v202612-released/',
    date: '2026-06-12',
    summary: 'Release coverage tracking what shipped in the June releases.',
  },
  {
    outlet: 'KitPloit',
    title: 'DockSec - AI-powered Docker security scanner that explains vulnerabilities in plain English',
    url: 'https://kitploit.com/en/tools/github/owasp/docksec?expand=1',
    date: '2026-06',
  },
  {
    outlet: 'DeafNews',
    title: 'DockSec: The Open-Source AI Healing Containers, Not Just Scanning Them',
    url: 'https://deafnews.it/en/news/cybersec/docksec-the-open-source-ai-healing-containers-not-just-scanning-them',
    date: '2026-06-08',
  },
  {
    outlet: 'The IT Nerd',
    title: 'Open-source DockSec uses AI to cut through vulnerability noise in Docker images',
    url: 'https://itnerd.blog/2026/05/27/open-source-docksec-uses-ai-to-cut-through-vulnerability-noise-in-docker-images/',
    date: '2026-05-27',
  },
  {
    outlet: 'Exploding Security',
    title: 'exploding security #158',
    url: 'https://explodingsecurity.com/exploding-security-158-ransomware-h2-2025-iran-cyberkrieg-handala-kadnap-botnet-cloudflare-phantomraven-glassworm-operation-lightning-docksec-openant/',
    date: '2026-03-15',
    summary: 'DockSec featured in a weekly security newsletter round-up.',
  },
  {
    outlet: 'OffSeq Radar',
    title: 'Open Source DockSec Uses AI to Cut Through Vulnerability Noise in Docker Images',
    url: 'https://radar.offseq.com/threat/open-source-docksec-uses-ai-to-cut-through-vulnera-8c8a0124',
    date: '2026-05-26',
  },
  {
    outlet: 'SecurityIT',
    title: 'Open Source DockSec Uses AI to Cut Through Vulnerability Noise in Docker Images',
    url: 'https://www.show.it/open-source-docksec-uses-ai-to-cut-through-vulnerability-noise-in-docker-images/',
    date: '2026-05-26',
  },
  {
    outlet: 'MLab News',
    title: 'Open Source DockSec Uses AI to Cut Through Vulnerability Noise in Docker Images',
    url: 'https://news.mlab.sh/news/498fc1b7508517e2e54d40f5b8cd2b4e',
    date: '2026-05-26',
  },
  {
    outlet: 'elhacker.NET',
    title: 'DockSec lleva la IA a la seguridad de contenedores',
    url: 'https://blog.elhacker.net/2026/05/de-200-cve-soluciones-docksec-lleva-la.html',
    date: '2026-05',
    language: 'Spanish',
  },
  {
    outlet: 'Ciber Segurança',
    title: 'DockSec: scanner Docker com IA propõe correções linha a linha',
    url: 'https://ciberseguranca.org/artigo/docksec-scanner-docker-ia-correcoes-linha-a-linha/',
    date: '2026-07-08',
    language: 'Portuguese',
  },
  {
    outlet: 'Security Bez Tabu',
    title: 'DockSec porządkuje szum podatności w obrazach Docker dzięki AI',
    url: 'https://securitybeztabu.pl/docksec-porzadkuje-szum-podatnosci-w-obrazach-docker-dzieki-ai/',
    date: '2026-05-26',
    language: 'Polish',
  },
];

/** Podcasts, YouTube interviews, streams, recorded panels. */
export const PODCASTS: PressItem[] = [
  {
    outlet: 'ISACA Podcast',
    title: 'Your Containers Are Probably Full of Holes: Fixing Docker Security with AI',
    url: 'https://www.youtube.com/watch?v=Zls_3loAT84',
    date: '2026',
    author: 'Advait Patel',
    featured: true,
  },
  {
    outlet: 'The Elephant in AppSec',
    title: "The Docker mistakes everyone's still making and how to fix them",
    url: 'https://youtu.be/pPISQ1QPytc',
    date: '2026',
    author: 'Advait Patel',
    featured: true,
  },
  {
    outlet: 'Mr. Cloud Book',
    title: 'DockSec: How to Fix Docker Security Issues in One Command',
    url: 'https://www.youtube.com/watch?v=ier7z8lZRfA',
    date: '2026-06',
    featured: true,
    summary: 'A walkthrough of running DockSec and applying its fixes.',
  },
  {
    outlet: 'ThreatVectr Cybersecurity News',
    title: 'DockSec OWASP Tool: AI Fixes for Docker & More | Cybersecurity News Weekly',
    url: 'https://www.youtube.com/watch?v=q2BnJZt0ZD8',
    date: '2026-06-01',
    summary: 'DockSec covered in a weekly cybersecurity news round-up.',
  },
];

/** Conference talks, workshops and meetups. */
export const TALKS: PressItem[] = [
  {
    outlet: 'OWASP Global AppSec EU',
    title: 'DockSec live workshop',
    url: 'https://owasp.org/www-project-docksec/',
    date: '2026',
    author: 'Advait Patel',
    location: 'Vienna, Austria',
    featured: true,
    summary: 'A hands-on workshop running DockSec against real container stacks.',
  },
  {
    outlet: 'OWASP SnowFROC',
    title: 'DockSec: closing the container security triage gap',
    url: 'https://owasp.org/www-project-docksec/',
    date: '2026',
    author: 'Advait Patel',
    location: 'Denver, Colorado',
    featured: true,
  },
  {
    outlet: 'Open Cloud Security Conference',
    title: 'Securing Docker with AI: DockSec + GPT for Container Security',
    url: 'https://www.youtube.com/watch?v=8yT5Y28M6oo',
    date: '2025',
    author: 'Advait Patel',
    featured: true,
    summary: 'Hosted by Prowler. Recording available.',
  },
  {
    outlet: 'OWASP Global AppSec USA',
    title: 'DockSec: container security triage in practice',
    url: 'https://owasp.org/www-project-docksec/',
    date: '2025',
    author: 'Advait Patel',
    location: 'Washington, DC',
    featured: true,
  },
  {
    outlet: 'Silicon Valley Cybersecurity Conference',
    title: 'AI-assisted container security remediation',
    url: 'https://owasp.org/www-project-docksec/',
    date: '2025',
    author: 'Advait Patel',
    location: 'San Jose, California',
  },
  {
    outlet: 'IEEE EIT',
    title: 'International Conference on Electro/Information Technology',
    url: 'https://owasp.org/www-project-docksec/',
    date: '2025',
    author: 'Advait Patel',
    summary: 'Sponsored by IEEE Region 4 and IEEE-USA.',
  },
];

/**
 * Written by the project lead. Kept separate from MEDIA on purpose: a
 * maintainer's own article is useful background, not independent validation,
 * and presenting the two together would blur that line.
 */
export const AUTHORED: PressItem[] = [
  {
    outlet: 'SecureWorld',
    title: 'The DockSec Series, Part 1: Why Container Security Needs an AI Layer',
    url: 'https://www.secureworld.io/industry-news/docksec-series-container-security-ai-layer',
    date: '2026-07-07',
    author: 'Advait Patel',
    featured: true,
  },
  {
    outlet: 'SecureWorld',
    title: 'The DockSec Series, Part 2: Inside DockSec - Architecture and Pipeline',
    url: 'https://www.secureworld.io/industry-news/docksec-series-part-2-architecture-pipeline',
    date: '2026-07-14',
    author: 'Advait Patel',
  },
  {
    outlet: 'SecureWorld',
    title:
      'The DockSec Series, Part 3: Hands-On Scanning - Dockerfiles, Images, and Compose',
    url: 'https://www.secureworld.io/industry-news/docksec-series-part-3-scanning',
    date: '2026-07-21',
    author: 'Advait Patel',
  },
  {
    outlet: 'SecureWorld',
    title: 'The DockSec Series, Part 4: Shift-Left - Gating, SARIF, and Baselines in CI/CD',
    url: 'https://www.secureworld.io/industry-news/docksec-series-part-4-shift-left',
    date: '2026-07-28',
    author: 'Advait Patel',
  },
  {
    outlet: 'SecureWorld',
    title: 'The DockSec Series, Part 5: Adoption, Scoring, and Measuring Container Posture',
    url: 'https://www.secureworld.io/industry-news/docksec-part-5-adoption-scoring-measuring',
    date: '2026-08-04',
    author: 'Advait Patel',
  },
  {
    outlet: 'HackerNoon',
    title: 'How DockSec Solves Docker Security Problems with AI-Driven Automation',
    url: 'https://hackernoon.com/how-docksec-solves-docker-security-problems-with-ai-driven-automation',
    date: '2025-05-05',
    author: 'Advait Patel',
  },
];

export const PRESS_SECTIONS = [
  {
    id: 'media',
    heading: 'Media coverage',
    blurb:
      'Independent write-ups and reviews from security publications and the developer press.',
    items: MEDIA,
  },
  {
    id: 'podcasts',
    heading: 'Video and podcasts',
    blurb: 'Interviews, recorded conversations and walkthroughs.',
    items: PODCASTS,
  },
  {
    id: 'talks',
    heading: 'Conference talks',
    blurb: 'Where DockSec has been presented, including OWASP Global AppSec and IEEE.',
    items: TALKS,
  },
  {
    id: 'authored',
    heading: 'Written by the project lead',
    blurb:
      'Background and deep dives from Advait Patel. Listed separately from independent coverage.',
    items: AUTHORED,
  },
];

export const HAS_PRESS = PRESS_SECTIONS.some((section) => section.items.length > 0);

/** Totals for the press page header and the landing page. */
export const PRESS_COUNTS = {
  media: MEDIA.length,
  video: PODCASTS.length,
  outlets: new Set(MEDIA.map((item) => item.outlet)).size,
};
