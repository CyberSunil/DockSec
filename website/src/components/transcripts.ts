import type {TerminalLine} from './Terminal';

/**
 * Real output, captured from actual runs. When DockSec's output changes,
 * re-run the command in the comment and paste the result here.
 *
 * Keep these honest. The value of showing a scan is that a reader can run the
 * same command and see the same shape of answer.
 */

/** docksec -i node:18 --image-only --scan-only */
export const TRIAGE_TRANSCRIPT: TerminalLine[] = [
  {text: 'docksec -i node:18 --image-only --scan-only', tone: 'command'},
  {text: ''},
  {text: 'Results', tone: 'heading'},
  {text: '  Critical 226   High 1974   Total 2200'},
  {text: ''},
  {text: 'Priority', tone: 'heading'},
  {text: '  Fix Now       9', tone: 'fixnow'},
  {text: '  Fix Soon   2161', tone: 'dim'},
  {text: ''},
  {text: 'Fix commands', tone: 'heading'},
  {text: '  > apt-get install --only-upgrade -y linux-libc-dev'},
  {
    text: '      Fix Now  HIGH  EPSS 0.999 (100th pct)  CVE-2026-31431',
    tone: 'fixnow',
  },
  {text: '  > apt-get install --only-upgrade -y libsqlite3-0'},
  {
    text: '      Fix Now  HIGH  EPSS 0.725 (99.4th pct)  CVE-2025-6965',
    tone: 'fixnow',
  },
  {text: '  > apt-get install --only-upgrade -y openssl'},
  {
    text: '      Fix Now  HIGH  EPSS 0.482 (98.8th pct)  CVE-2025-15467',
    tone: 'fixnow',
  },
  {text: ''},
  {text: '  Applying all of the above resolves 1712 of 2200 finding(s).', tone: 'dim'},
  {text: ''},
  {text: 'Coverage', tone: 'heading'},
  {
    text: '  . Exploitability and runtime reachability are not proven.',
    tone: 'dim',
  },
];

/** docksec --compose docker-compose.yml --scan-only */
export const CHAIN_TRANSCRIPT: TerminalLine[] = [
  {text: 'docksec --compose docker-compose.yml --scan-only', tone: 'command'},
  {text: ''},
  {text: 'Exploit chains', tone: 'heading'},
  {
    text: "  [CRITICAL] 'web' publishes a port and mounts the Docker socket",
    tone: 'critical',
  },
  {text: '      services: web', tone: 'dim'},
  {
    text: '      combines: compose-docker-socket-mount,',
    tone: 'dim',
  },
  {text: '                compose-port-bound-all-interfaces', tone: 'dim'},
  {text: ''},
  {
    text: "      'web' is reachable from outside the host and mounts the",
  },
  {
    text: '      Docker socket. Any remote code execution in this service',
  },
  {
    text: '      is a host compromise rather than a container one.',
  },
  {text: ''},
  {
    text: '      break it: Remove the socket mount first - it is what turns',
    tone: 'good',
  },
  {
    text: '                a service compromise into a host compromise.',
    tone: 'good',
  },
  {text: ''},
  {
    text: "  [HIGH] 'db' is internet-facing and can reach 'web' with a",
    tone: 'high',
  },
  {text: '         committed credential', tone: 'high'},
  {text: '      services: db, web', tone: 'dim'},
  {text: ''},
  {
    text: '      Neither service looks critical on its own.',
  },
];

/** docksec Dockerfile --scan-only --fix --dry-run */
export const FIX_TRANSCRIPT: TerminalLine[] = [
  {text: 'docksec Dockerfile --scan-only --fix --dry-run', tone: 'command'},
  {text: ''},
  {text: '--- a/Dockerfile', tone: 'dim'},
  {text: '+++ b/Dockerfile', tone: 'dim'},
  {text: '-ADD package.json /app/package.json', tone: 'critical'},
  {text: '+COPY package.json /app/package.json', tone: 'good'},
  {text: '-RUN apt-get update && apt-get install -y curl', tone: 'critical'},
  {
    text: '+RUN apt-get update && apt-get install --no-install-recommends -y curl',
    tone: 'good',
  },
  {text: '+USER appuser', tone: 'good'},
  {text: '+HEALTHCHECK --interval=30s CMD [ -d /proc/1 ] || exit 1', tone: 'good'},
  {text: ''},
  {text: 'Would apply 4 change(s)', tone: 'heading'},
  {text: ''},
  {text: 'Needs review (3)', tone: 'heading'},
  {
    text: '  - Move the secret out of ENV; inject it at runtime',
    tone: 'dim',
  },
  {text: '      no mechanical edit is defined', tone: 'dim'},
  {text: ''},
  {
    text: 'Dry run: no files were changed.',
    tone: 'dim',
  },
];
