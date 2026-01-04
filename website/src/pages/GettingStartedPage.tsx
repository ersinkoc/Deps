import React from 'react';
import { CodeBlock } from '../components/code/CodeBlock';

export const GettingStartedPage: React.FC = () => {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Getting Started
        </h1>

        {/* Installation */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Installation
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Install @oxog/deps using npm, yarn, or pnpm:
          </p>
          <CodeBlock
            code={`# npm
npm install @oxog/deps

# yarn
yarn add @oxog/deps

# pnpm
pnpm add @oxog/deps`}
            language="bash"
            filename="terminal"
          />
        </section>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Quick Start
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Analyze your project dependencies in just a few lines:
          </p>
          <CodeBlock
            code={`import { deps } from '@oxog/deps';

// Basic analysis
const result = await deps.analyze('./package.json');

// View results
console.log(result.tree);       // Dependency tree
console.log(result.circular);  // Circular dependencies

// Convert to different formats
console.log(result.toJSON());     // JSON string
console.log(result.toTree());     // ASCII tree
console.log(result.toMarkdown()); // Markdown
console.log(result.toHTML());     // HTML`}
            filename="quick-start.ts"
          />
        </section>

        {/* Full Analysis */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Full Analysis
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Enable all plugins including unused, duplicates, size, updates, and security:
          </p>
          <CodeBlock
            code={`import { deps } from '@oxog/deps';

// Full analysis with all plugins
const result = await deps.analyze('./package.json', {
  full: true
});

// Access all results
console.log(result.unused);      // Unused dependencies
console.log(result.missing);     // Missing dependencies
console.log(result.duplicates); // Duplicate versions
console.log(result.size);        // Size analysis
console.log(result.updates);     // Update suggestions
console.log(result.security);    // Security audit`}
            filename="full-analysis.ts"
          />
        </section>

        {/* Advanced Usage */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Advanced Usage
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Use the advanced API for fine-grained control:
          </p>
          <CodeBlock
            code={`import { createAnalyzer } from '@oxog/deps';
import { unusedPlugin, duplicatesPlugin } from '@oxog/deps/plugins';

// Create analyzer instance
const analyzer = createAnalyzer({
  cwd: './my-project',
  cache: true,
  cacheTTL: 3600000,  // 1 hour
  ignore: ['**/node_modules/**', '**/dist/**']
});

// Register optional plugins
analyzer.use(unusedPlugin);
analyzer.use(duplicatesPlugin);

// Listen to events
analyzer.on('progress', ({ plugin, percent, message }) => {
  console.log(\`[\${plugin}] \${percent}% - \${message}\`);
});

analyzer.on('finding', ({ type, severity, message }) => {
  console.log(\`[\${severity}] \${type}: \${message}\`);
});

// Run analysis
const result = await analyzer.run();
console.log(result.toReport('html'));`}
            filename="advanced.ts"
          />
        </section>

        {/* CLI Usage */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            CLI Usage
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Use @oxog/deps directly from your terminal:
          </p>
          <CodeBlock
            code={`# Display dependency tree
npx @oxog/deps tree

# Show circular dependencies
npx @oxog/deps circular

# Find unused dependencies
npx @oxog/deps unused

# Generate full report (HTML)
npx @oxog/deps report --format=html > report.html

# Generate full report (Markdown)
npx @oxog/deps report --format=md > DEPENDENCIES.md

# Generate full report (JSON)
npx @oxog/deps report --format=json > deps.json

# With depth limit
npx @oxog/deps tree --depth=3

# With custom directory
npx @oxog/deps report --cwd=/path/to/project`}
            language="bash"
            filename="terminal"
          />
        </section>

        {/* CI/CD Integration */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            CI/CD Integration
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Use in CI/CD pipelines with automated failure conditions:
          </p>
          <CodeBlock
            code={`# .github/workflows/deps-check.yml
name: Dependency Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check circular dependencies
        run: npx @oxog/deps circular --fail-on-circular

      - name: Check bundle size
        run: npx @oxog/deps size --limit=500kb

      - name: Security audit
        run: npx @oxog/deps security --fail-on-high

      - name: Generate report
        run: npx @oxog/deps report --format=md > deps.md`}
            filename=".github/workflows/deps-check.yml"
          />
        </section>
      </div>
    </div>
  );
};
