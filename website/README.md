# DockSec website

The public documentation site for OWASP DockSec, built with
[Docusaurus](https://docusaurus.io/).

Website dependencies live here and nowhere else, so they never become runtime
dependencies of the scanner. A supply-chain security tool should not ship a
frontend toolchain to the people who install it.

## Local development

```bash
cd website
npm install
npm start          # http://localhost:3000/DockSec/
```

## Build

```bash
npm run build      # output in website/build/ (gitignored)
npm run serve      # preview the production build
npm run typecheck  # types only, no build
```

## Deployment

`.github/workflows/website.yml` builds on every pull request touching
`website/**` and deploys to GitHub Pages on push to `main`.

The site is served from `https://owasp.github.io/DockSec/`. A vanity redirect
at `owasp.org/DockSec/` can be requested from OWASP infrastructure later - that
needs no rebuild, because the canonical URL does not change. This is how
`owasp.org/cve-lite-cli/` works today.

**Repository setting required:** Pages source must be "GitHub Actions". Until
it is, the build job runs and guards against regressions, but nothing deploys.

## Layout

```
website/
├── docusaurus.config.ts   site config, navbar, footer, SEO
├── sidebars.ts            docs navigation
├── docs/                  content (Markdown)
├── src/
│   ├── pages/index.tsx    landing page - composes the sections below
│   ├── components/        one component + CSS module per section
│   └── css/custom.css     design tokens; all colours live here
└── static/img/            logo, favicon, social card
```

## Conventions

**Design tokens.** Colours, spacing and radii are custom properties in
`src/css/custom.css`. A hard-coded colour in a component is a bug - change the
token instead, and both themes stay correct.

**Terminal transcripts are real.** The output in `src/components/transcripts.ts`
was captured from actual runs, and each export names the command in a comment.
When output changes, re-run the command and paste the result. A security tool
that mocks up its own results is not one to trust.

**Broken links fail the build.** `onBrokenLinks` is set to `throw`. If a build
fails on a link, fix the link rather than relaxing the setting.

**Adding a page.** Drop a Markdown file in `docs/` with front matter, then add
its id to `sidebars.ts`. No component changes needed.

**Adding a landing-page section.** Add a component and its CSS module under
`src/components/`, then render it in `src/pages/index.tsx`. Sections are
self-contained so they can be reordered or removed in one line.
