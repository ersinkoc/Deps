import type { Feature } from '../types';

export const features: Feature[] = [
  {
    icon: 'GitBranch',
    title: 'Dependency Tree Visualization',
    description: 'Build and display the complete dependency tree of your project with configurable depth and multiple output formats.',
  },
  {
    icon: 'RefreshCw',
    title: 'Circular Dependency Detection',
    description: 'Detect circular dependencies that can cause runtime issues using Tarjan\'s algorithm for strongly connected components.',
  },
  {
    icon: 'Trash2',
    title: 'Unused Dependency Detection',
    description: 'Find dependencies listed in package.json but not actually imported anywhere in your codebase.',
  },
  {
    icon: 'Search',
    title: 'Missing Dependency Detection',
    description: 'Find imports that reference packages not listed in package.json, preventing potential runtime errors.',
  },
  {
    icon: 'Copy',
    title: 'Duplicate Version Detection',
    description: 'Find packages installed with multiple versions, causing bundle bloat and potential version conflicts.',
  },
  {
    icon: 'Package',
    title: 'Size Impact Analysis',
    description: 'Analyze the size impact of each dependency on your final bundle with detailed breakdown and percentage calculations.',
  },
  {
    icon: 'Download',
    title: 'Update Suggestions',
    description: 'Check for available updates for all dependencies with intelligent categorization by major, minor, and patch versions.',
  },
  {
    icon: 'Shield',
    title: 'Security Audit Integration',
    description: 'Wrapper around npm audit for vulnerability detection with severity levels and automated CI failure conditions.',
  },
  {
    icon: 'Layers',
    title: 'Monorepo Support',
    description: 'Full support for pnpm/npm/yarn workspaces, Lerna, Turborepo, and Nx with automatic detection.',
  },
  {
    icon: 'Eye',
    title: 'Watch Mode',
    description: 'Automatically re-analyze when package.json or dependencies change with intelligent file watching.',
  },
  {
    icon: 'Database',
    title: 'Smart Caching',
    description: 'Cache analysis results for faster subsequent runs with automatic cache invalidation on dependency changes.',
  },
  {
    icon: 'FileCode',
    title: 'Multiple Output Formats',
    description: 'Export results in JSON, ASCII tree, Markdown, or HTML formats for flexible integration with your workflow.',
  },
];
