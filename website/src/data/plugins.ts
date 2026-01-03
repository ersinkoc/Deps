import type { Plugin } from '../types';

export const plugins: Plugin[] = [
  {
    name: 'tree',
    type: 'core',
    description: 'Dependency tree visualization with configurable depth',
  },
  {
    name: 'circular',
    type: 'core',
    description: 'Circular dependency detection using Tarjan\'s algorithm',
  },
  {
    name: 'unused',
    type: 'optional',
    description: 'Detect dependencies not imported in codebase',
  },
  {
    name: 'missing',
    type: 'optional',
    description: 'Detect imports without package.json entry',
  },
  {
    name: 'duplicates',
    type: 'optional',
    description: 'Find packages with multiple installed versions',
  },
  {
    name: 'size',
    type: 'optional',
    description: 'Analyze size impact of each dependency',
  },
  {
    name: 'updates',
    type: 'optional',
    description: 'Check for available dependency updates',
  },
  {
    name: 'security',
    type: 'optional',
    description: 'npm audit wrapper for vulnerability detection',
  },
  {
    name: 'monorepo',
    type: 'optional',
    description: 'Support for pnpm/npm/yarn/lerna/turbo/nx workspaces',
  },
];

export const corePlugins = plugins.filter(p => p.type === 'core');
export const optionalPlugins = plugins.filter(p => p.type === 'optional');
