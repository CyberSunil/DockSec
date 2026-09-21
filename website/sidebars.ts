import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Ordered by what a new reader needs, not by how the code is organised:
 * get it running, understand why it is different, then reference material.
 */
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Start here',
      collapsed: false,
      items: ['getting-started', 'why-docksec', 'evaluation-guide'],
    },
    {
      type: 'category',
      label: 'Understand the output',
      collapsed: false,
      items: ['reading-output', 'exploit-chains', 'fix-mode', 'limitations'],
    },
    {
      type: 'category',
      label: 'Case studies',
      link: {type: 'doc', id: 'case-studies/index'},
      items: [
        'case-studies/node-18',
        'case-studies/python-slim',
        'case-studies/nginx-alpine',
      ],
    },
    {
      type: 'category',
      label: 'Compare',
      link: {type: 'doc', id: 'comparison/index'},
      items: [
        'comparison/trivy',
        'comparison/snyk',
        'comparison/docker-scout',
        'comparison/grype',
        'comparison/dependabot',
        'comparison/hadolint',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['cli-reference', 'ci', 'examples'],
    },
    'press',
    'about',
  ],
};

export default sidebars;
