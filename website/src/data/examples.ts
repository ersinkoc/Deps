import type { Example } from '../types';

export const examples: Example[] = [
  // 01 - Basic
  {
    id: 'quick-analysis',
    title: 'Quick Analysis',
    category: '01-basic',
    description: 'Analyze dependencies with a single function call',
    code: `import { deps } from '@oxog/deps';

const result = await deps.analyze('./package.json');
console.log(result.tree);
console.log(result.circular);`,
  },
  {
    id: 'tree-visualization',
    title: 'Tree Visualization',
    category: '01-basic',
    description: 'Display the dependency tree in ASCII format',
    code: `const result = await deps.analyze('./package.json');
console.log(result.toTree());

// Output:
// @oxog/deps@1.0.0
// ├── lodash@4.17.21
// └── axios@1.6.0
//     └── follow-redirects@1.15.0`,
  },
  {
    id: 'circular-detection',
    title: 'Circular Detection',
    category: '01-basic',
    description: 'Detect and report circular dependencies',
    code: `const result = await deps.analyze('./package.json');
if (result.circular.length > 0) {
  console.error('Circular dependencies found:');
  for (const chain of result.circular) {
    console.error(chain.join(' → '));
  }
}`,
  },

  // 02 - Plugins
  {
    id: 'using-core-plugins',
    title: 'Using Core Plugins',
    category: '02-plugins',
    description: 'Core plugins (tree, circular) are enabled by default',
    code: `import { createAnalyzer } from '@oxog/deps';

const analyzer = createAnalyzer({
  plugins: ['tree', 'circular']
});

const result = await analyzer.run();`,
  },
  {
    id: 'using-optional-plugins',
    title: 'Using Optional Plugins',
    category: '02-plugins',
    description: 'Enable optional plugins for additional analysis',
    code: `import { createAnalyzer } from '@oxog/deps';
import { unusedPlugin, duplicatesPlugin } from '@oxog/deps/plugins';

const analyzer = createAnalyzer();
analyzer.use(unusedPlugin);
analyzer.use(duplicatesPlugin);

const result = await analyzer.run();
console.log(result.unused);
console.log(result.duplicates);`,
  },
  {
    id: 'custom-plugin',
    title: 'Custom Plugin',
    category: '02-plugins',
    description: 'Create and register your own analysis plugin',
    code: `const customPlugin = {
  name: 'custom',
  version: '1.0.0',
  install: (kernel) => {
    kernel.on('analyze', (context) => {
      // Your custom analysis logic
      kernel.reportFinding(
        'custom',
        'info',
        'Custom analysis complete'
      );
    });
  }
};

analyzer.use(customPlugin);`,
  },

  // 03 - Error Handling
  {
    id: 'graceful-errors',
    title: 'Graceful Error Handling',
    category: '03-error-handling',
    description: 'Handle common errors gracefully',
    code: `import { deps } from '@oxog/deps';
import {
  PackageNotFoundError,
  InvalidPackageJsonError
} from '@oxog/deps';

try {
  const result = await deps.analyze('./package.json');
} catch (error) {
  if (error instanceof PackageNotFoundError) {
    console.error('package.json not found');
  } else if (error instanceof InvalidPackageJsonError) {
    console.error('Invalid package.json:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}`,
  },
  {
    id: 'error-recovery',
    title: 'Error Recovery',
    category: '03-error-handling',
    description: 'Listen to error events for continuous analysis',
    code: `const analyzer = createAnalyzer();

analyzer.on('error', (error) => {
  console.error('Analysis error:', error.message);
  // Continue despite errors
  await analyzer.run();
});`,
  },

  // 04 - TypeScript
  {
    id: 'typed-results',
    title: 'Typed Results',
    category: '04-typescript',
    description: 'Full TypeScript support with proper types',
    code: `import type { AnalysisResult, DependencyTree } from '@oxog/deps';

const result: AnalysisResult = await deps.analyze('./package.json');
const tree: DependencyTree = result.tree;

// Type-safe access to properties
const packageName: string = tree.root.name;
const version: string = tree.root.version;`,
  },
  {
    id: 'generic-plugins',
    title: 'Generic Plugins',
    category: '04-typescript',
    description: 'Create type-safe plugins with generics',
    code: `interface CustomContext {
  config: { threshold: number };
}

const plugin: AnalyzerPlugin<CustomContext> = {
  name: 'typed-plugin',
  version: '1.0.0',
  install: (kernel: AnalyzerKernel<CustomContext>) => {
    kernel.on('analyze', (context: CustomContext) => {
      // Type-safe context access
      const threshold = context.config.threshold;
    });
  }
};`,
  },

  // 05 - Integrations
  {
    id: 'ci-pipeline',
    title: 'CI Pipeline Integration',
    category: '05-integrations',
    description: 'Use in CI/CD pipelines with exit codes',
    code: `// .github/workflows/deps-check.yml
- name: Check dependencies
  run: npx @oxog/deps circular --fail-on-circular

- name: Check bundle size
  run: npx @oxog/deps size --limit=500kb

- name: Security audit
  run: npx @oxog/deps security --fail-on-high`,
  },
  {
    id: 'github-action',
    title: 'GitHub Action',
    category: '05-integrations',
    description: 'Create a custom GitHub Action',
    code: `name: 'Dependency Analysis'
runs:
  using: 'node20'
  main: 'index.js'
  steps:
    - uses: actions/checkout@v4
    - run: npx @oxog/deps report --format=json > deps.json`,
  },
  {
    id: 'pre-commit-hook',
    title: 'Pre-commit Hook',
    category: '05-integrations',
    description: 'Run analysis before each commit',
    code: `// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx @oxog/deps circular --fail-on-circular
npx @oxog/deps unused`,
  },

  // 06 - Real World
  {
    id: 'monorepo-analysis',
    title: 'Monorepo Analysis',
    category: '06-real-world',
    description: 'Analyze all packages in a monorepo',
    code: `const analyzer = createAnalyzer({
  monorepo: true  // Auto-detects workspace type
});

const result = await analyzer.run();
// Analyzes all packages in the workspace`,
  },
  {
    id: 'security-workflow',
    title: 'Security Workflow',
    category: '06-real-world',
    description: 'Automated security vulnerability scanning',
    code: `const analyzer = createAnalyzer({
  failOn: {
    securityHigh: true,
    securityCritical: true
  }
});

try {
  const result = await analyzer.run();
  if (result.security) {
    const { vulnerabilities } = result.security;
    // Handle vulnerabilities
  }
} catch (error) {
  process.exit(1); // Fail CI on critical issues
}`,
  },
  {
    id: 'size-budget-check',
    title: 'Size Budget Check',
    category: '06-real-world',
    description: 'Enforce bundle size limits in CI',
    code: `const analyzer = createAnalyzer({
  failOn: {
    sizeLimit: '500kb'  // Fail if total size exceeds 500KB
  }
});

const result = await analyzer.run();
if (result.size) {
  console.log('Total size:', result.size.totalFormatted);
  // Check per-package sizes
  for (const pkg of result.size.packages) {
    console.log(pkg.name, pkg.sizeFormatted);
  }
}`,
  },
  {
    id: 'dependency-report',
    title: 'Dependency Report',
    category: '06-real-world',
    description: 'Generate comprehensive HTML report',
    code: `const result = await deps.analyze('./package.json', {
  full: true  // Enable all plugins
});

// Generate HTML report
const htmlReport = result.toReport('html');

// Save to file
import { writeFileSync } from 'node:fs';
writeFileSync('./dependency-report.html', htmlReport);

console.log('Report saved to dependency-report.html');`,
  },
  {
    id: 'watch-development',
    title: 'Watch Development Mode',
    category: '06-real-world',
    description: 'Continuously analyze during development',
    code: `const analyzer = createAnalyzer({
  watch: true
});

analyzer.on('change', (result) => {
  console.clear();
  console.log('Dependencies changed!');
  console.log('Circular:', result.circular);
  console.log('Unused:', result.unused);
});

await analyzer.start();`,
  },
];
