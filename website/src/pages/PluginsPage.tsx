import React from 'react';
import { corePlugins, optionalPlugins } from '../data/plugins';
import { CodeBlock } from '../components/CodeBlock';
import { CheckCircle } from 'lucide-react';

export const PluginsPage: React.FC = () => {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Plugins
        </h1>

        {/* Core Plugins */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Core Plugins
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            These plugins are always enabled by default
          </p>

          <div className="space-y-4">
            {corePlugins.map((plugin) => (
              <div
                key={plugin.name}
                className="rounded-lg border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950/30 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex-shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                        {plugin.name}
                      </h3>
                      <span className="rounded-full bg-primary-100 dark:bg-primary-900 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
                        Core
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {plugin.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Optional Plugins */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Optional Plugins
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            These plugins need to be explicitly enabled
          </p>

          <div className="space-y-4">
            {optionalPlugins.map((plugin) => (
              <div
                key={plugin.name}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                    {plugin.name}
                  </h3>
                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Optional
                  </span>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {plugin.description}
                </p>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                  <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Enable plugin:
                  </p>
                  <CodeBlock
                    code={`import { ${plugin.name}Plugin } from '@oxog/deps/plugins';

analyzer.use(${plugin.name}Plugin);`}
                    filename="enable.ts"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Plugins */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Custom Plugins
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your own plugins by implementing the AnalyzerPlugin interface
          </p>

          <CodeBlock
            code={`import type { AnalyzerPlugin, AnalyzerKernel } from '@oxog/deps';

interface CustomContext {
  customConfig?: Record<string, unknown>;
}

const customPlugin: AnalyzerPlugin<CustomContext> = {
  name: 'my-custom-plugin',
  version: '1.0.0',

  install(kernel: AnalyzerKernel<CustomContext>) {
    // Register event handlers
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('my-custom-plugin', 0, 'Starting analysis');

      // Your custom logic here
      const findings = await analyzeSomething(context);

      // Report findings
      for (const finding of findings) {
        kernel.reportFinding(
          'custom',
          'info',
          finding.message,
          finding.package
        );
      }

      // Store result
      (kernel as any).setResult('my-custom-plugin', findings);

      kernel.reportProgress('my-custom-plugin', 100, 'Analysis complete');
    });
  }
};

// Use the plugin
import { createAnalyzer } from '@oxog/deps';

const analyzer = createAnalyzer();
analyzer.use(customPlugin);
await analyzer.run();`}
            filename="custom-plugin.ts"
          />
        </section>

        {/* Plugin Interface */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Plugin Interface
          </h2>

          <CodeBlock
            code={`interface AnalyzerPlugin<TContext = AnalyzerContext> {
  // Unique plugin identifier (kebab-case)
  name: string;

  // Semantic version
  version: string;

  // Other plugins this plugin depends on
  dependencies?: string[];

  // Called when plugin is registered
  install: (kernel: AnalyzerKernel<TContext>) => void;

  // Called after all plugins are installed (optional)
  onInit?: (context: TContext) => void | Promise<void>;

  // Called when plugin is unregistered (optional)
  onDestroy?: () => void | Promise<void>;

  // Called on error in this plugin (optional)
  onError?: (error: Error) => void;
}`}
            filename="types.ts"
          />
        </section>
      </div>
    </div>
  );
};
