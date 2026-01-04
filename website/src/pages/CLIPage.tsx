import React from 'react';
import { cliCommands, globalOptions } from '../data/cliCommands';
import { CodeBlock } from '../components/code/CodeBlock';
import { Terminal } from 'lucide-react';

export const CLIPage: React.FC = () => {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          CLI Reference
        </h1>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Overview
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            @oxog/deps provides a command-line interface for analyzing dependencies directly from your terminal.
          </p>

          <CodeBlock
            code={`# Basic syntax
npx @oxog/deps <command> [options]

# Example
npx @oxog/deps tree --depth=3 --format=html`}
            language="bash"
            filename="terminal"
          />
        </section>

        {/* Commands */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Commands
          </h2>

          <div className="space-y-6">
            {cliCommands.map((cmd) => (
              <div
                key={cmd.command}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex-shrink-0">
                    <Terminal size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      npx @oxog/deps {cmd.command}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{cmd.description}</p>
                    {cmd.options && cmd.options.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {cmd.options.map((option) => (
                            <code
                              key={option}
                              className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
                            >
                              {option}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Options */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Global Options
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Option</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody>
                {globalOptions.map((option) => (
                  <tr key={option.flag} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <code className="text-primary-600 dark:text-primary-400">{option.flag}</code>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {option.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Exit Codes */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Exit Codes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Code</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <code className="text-green-600 dark:text-green-400">0</code>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Success (no issues found)</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <code className="text-red-600 dark:text-red-400">1</code>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Failure (issues found or error occurred)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            CLI Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Generate HTML Report</h3>
              <CodeBlock
                code={`npx @oxog/deps report --format=html > report.html`}
                language="bash"
                filename="terminal"
              />
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Check for Circular Dependencies in CI</h3>
              <CodeBlock
                code={`npx @oxog/deps circular --fail-on-circular

# Exit code will be 1 if circular dependencies are found`}
                language="bash"
                filename="terminal"
              />
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Analyze Specific Directory</h3>
              <CodeBlock
                code={`npx @oxog/deps report --cwd=/path/to/project`}
                language="bash"
                filename="terminal"
              />
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Limit Tree Depth</h3>
              <CodeBlock
                code={`npx @oxog/deps tree --depth=2

# Shows only first 2 levels of dependencies`}
                language="bash"
                filename="terminal"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
