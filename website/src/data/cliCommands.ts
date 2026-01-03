import type { CLICommand } from '../types';

export const cliCommands: CLICommand[] = [
  {
    command: 'tree',
    description: 'Display dependency tree',
    options: ['--depth=N', '--format=json|md|html'],
  },
  {
    command: 'circular',
    description: 'Detect circular dependencies',
    options: ['--fail-on-circular'],
  },
  {
    command: 'unused',
    description: 'Find unused dependencies',
    options: ['--ignore=pattern'],
  },
  {
    command: 'missing',
    description: 'Find missing dependencies',
    options: [],
  },
  {
    command: 'duplicates',
    description: 'Find duplicate versions',
    options: ['--json'],
  },
  {
    command: 'size',
    description: 'Analyze dependency sizes',
    options: ['--limit=500kb', '--sort=size|name'],
  },
  {
    command: 'updates',
    description: 'Check for updates',
    options: ['--major', '--minor', '--patch'],
  },
  {
    command: 'security',
    description: 'Run security audit',
    options: ['--fail-on-high', '--fail-on-critical'],
  },
  {
    command: 'report',
    description: 'Generate full report',
    options: ['--format=json|md|html', '--monorepo'],
  },
  {
    command: 'watch',
    description: 'Watch for changes',
    options: [],
  },
];

export const globalOptions = [
  { flag: '--cwd=/path/to/project', description: 'Set working directory' },
  { flag: '--no-cache', description: 'Disable caching' },
  { flag: '--verbose', description: 'Show detailed output' },
  { flag: '--help', description: 'Show help information' },
];
