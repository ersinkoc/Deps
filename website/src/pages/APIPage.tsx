import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export const APIPage: React.FC = () => {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          API Reference
        </h1>

        {/* Main Export */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Main Export
          </h2>

          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="mb-2 font-mono text-lg text-primary-600 dark:text-primary-400">
              deps.analyze(path, options?)
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Analyze dependencies of a Node.js project
            </p>

            <div className="mb-4">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Parameters</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-primary-600 dark:text-primary-400">path</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    - Path to package.json or directory containing it (string)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-primary-600 dark:text-primary-400">options</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    - Analysis options (optional)
                  </span>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Returns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Promise&lt;<span className="font-mono text-primary-600 dark:text-primary-400">AnalysisResult</span>&gt;
              </p>
            </div>

            <CodeBlock
              code={`import { deps } from '@oxog/deps';

// Basic usage
const result = await deps.analyze('./package.json');
console.log(result.tree);
console.log(result.circular);

// Full analysis
const fullResult = await deps.analyze('./package.json', {
  full: true
});
console.log(fullResult.unused);
console.log(fullResult.duplicates);

// With options
const result = await deps.analyze('./', {
  plugins: ['tree', 'circular', 'size'],
  cache: true
});`}
              filename="example.ts"
            />
          </div>
        </section>

        {/* Advanced API */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Advanced API
          </h2>

          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="mb-2 font-mono text-lg text-primary-600 dark:text-primary-400">
              createAnalyzer(options?)
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Create an analyzer instance with fine-grained control
            </p>

            <CodeBlock
              code={`import { createAnalyzer } from '@oxog/deps';

const analyzer = createAnalyzer({
  cwd: './my-project',
  plugins: ['tree', 'circular', 'unused', 'size'],
  cache: true,
  cacheTTL: 3600000,
  ignore: ['**/node_modules/**', '**/dist/**'],
  monorepo: false,
  watch: false
});

// Register custom plugin
analyzer.use(customPlugin);

// Event listeners
analyzer.on('progress', ({ plugin, percent, message }) => {
  console.log(\`[\${plugin}] \${percent}% - \${message}\`);
});

analyzer.on('finding', ({ type, severity, message }) => {
  console.log(\`[\${severity}] \${type}: \${message}\`);
});

analyzer.on('error', (error) => {
  console.error('Analysis error:', error);
});

// Run analysis
const result = await analyzer.run();`}
              filename="advanced.ts"
            />
          </div>
        </section>

        {/* Analyzer Options */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Analyzer Options
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Option</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Type</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Default</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400">cwd</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">string</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">process.cwd()</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Working directory</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400">plugins</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">PluginName[]</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">['tree', 'circular']</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Plugins to enable</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400">cache</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">boolean</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">false</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Enable caching</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400">cacheTTL</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">number</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">3600000</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Cache TTL in ms</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400">ignore</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">string[]</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">[]</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Glob patterns to ignore</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400">monorepo</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">boolean</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">auto-detect</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Enable monorepo mode</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Analysis Result */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Analysis Result
          </h2>

          <CodeBlock
            code={`interface AnalysisResult {
  // Core results (always available)
  tree: DependencyTree;
  circular: CircularChain[];
  exitCode: number;

  // Optional results (when plugins enabled)
  unused?: string[];
  missing?: string[];
  duplicates?: Record<string, string[]>;
  size?: SizeAnalysis;
  updates?: UpdateSuggestion[];
  security?: SecurityAudit;

  // Convert methods
  toJSON(): string;
  toTree(): string;
  toMarkdown(): string;
  toHTML(): string;
  toReport(format: 'json' | 'md' | 'html'): string;
}`}
            filename="types.ts"
          />
        </section>

        {/* Result Methods */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Result Methods
          </h2>

          <div className="space-y-4">
            {[
              { name: 'toJSON()', description: 'Convert result to JSON string' },
              { name: 'toTree()', description: 'Convert result to ASCII tree format' },
              { name: 'toMarkdown()', description: 'Convert result to Markdown format' },
              { name: 'toHTML()', description: 'Convert result to HTML format' },
              { name: 'toReport(format)', description: 'Generate full report in specified format' },
            ].map((method) => (
              <div key={method.name} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-mono text-lg text-primary-600 dark:text-primary-400">
                  {method.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
