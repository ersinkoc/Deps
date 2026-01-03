import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Shield, Zap } from 'lucide-react';
import { features } from '../data/features';
import { CodeBlock } from '../components/CodeBlock';

export const HomePage: React.FC = () => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-950 px-4 py-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400">
            Zero-Dependency NPM Package
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Dependency Analysis
            <span className="block text-primary-600">Made Simple</span>
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Zero-dependency analyzer for Node.js projects with circular dependency detection,
            unused package identification, duplicate version finding, security auditing, and
            complete monorepo support.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/getting-started"
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <a
              href="https://github.com/ersinkoc/deps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <GithubIcon />
              GitHub
            </a>
          </div>

          {/* Quick Install */}
          <div className="mt-12">
            <div className="mx-auto max-w-2xl">
              <CodeBlock
                code="npm install @oxog/deps"
                language="bash"
                filename="terminal"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Comprehensive dependency analysis toolkit in a single package
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(0, 6).map((feature) => (
              <div
                key={feature.title}
                className="relative rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <FeatureIcon name={feature.icon} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Quick Start
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Get up and running in seconds
            </p>
          </div>

          <CodeBlock
            code={`import { deps } from '@oxog/deps';

const result = await deps.analyze('./package.json');
console.log(result.tree);
console.log(result.circular);`}
            filename="quick-start.ts"
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex-shrink-0">
                <Zap size={14} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Zero Dependencies</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lightweight and fast</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Shield size={14} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">TypeScript Native</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full type safety</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex-shrink-0">
                <Download size={14} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Plugin System</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Extensible architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLI Preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              CLI Ready
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Use directly from your terminal or in CI/CD pipelines
            </p>
          </div>

          <CodeBlock
            code={`# Generate full report
npx @oxog/deps report --format=html

# Check for circular dependencies
npx @oxog/deps circular --fail-on-circular

# Analyze bundle size
npx @oxog/deps size --limit=500kb

# Security audit
npx @oxog/deps security --fail-on-high`}
            filename="terminal"
          />
        </div>
      </section>
    </div>
  );
};

// Helper component for feature icons
const FeatureIcon: React.FC<{ name: string }> = ({ name }) => {
  // Simple icon mapping - in production use lucide-react icons directly
  const icons: Record<string, React.ReactNode> = {
    GitBranch: '🌳',
    RefreshCw: '🔄',
    Trash2: '🗑️',
    Search: '🔍',
    Copy: '📋',
    Package: '📦',
    Download: '⬇️',
    Shield: '🛡️',
    Layers: '📚',
    Eye: '👁️',
    Database: '💾',
    FileCode: '📄',
  };

  return <span className="text-xl">{icons[name] || '•'}</span>;
};

const GithubIcon: React.FC = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02-.505 2.183-.77 3.301-.77 1.369 0 2.604.467 3.301 1.237.964-.266 1.994-.815 2.415-1.387.845.263 1.06 1.236 1.06 1.237-.352 2.124-1.416 2.91-2.665-.093-.261-.195-.601-.343-1.023-.105-.27-.195-.566-.343-.877-.149-.315-.349-.566-.601-.767-.252-.2-.546-.305-.877-.305-.331 0-.625.102-.877.305-.252.201-.453.452-.601.767-.149.316-.251.642-.343.877-.094.234-.195.473-.343.715-.148.241-.316.462-.5.04.665-.187.202-.398.348-.634.435-.236.087-.485.135-.748.135-.262 0-.512-.048-.748-.135-.236-.087-.454-.224-.653-.412-.199-.188-.362-.414-.489-.676-.127-.262-.226-.55-.295-.863-.07-.314-.103-.644-.103-.99 0-.728.259-1.352.777-1.872.517-.52 1.134-.777 1.848-.777.713 0 1.331.257 1.848.777.518.519.777 1.144.777 1.872 0 .346-.034.676-.103.99-.069.313-.168.601-.295.863-.127.262-.29.488-.489.676-.198.188-.417.325-.653.412-.236.087-.486.135-.748.135-.263 0-.512-.048-.748-.135-.237-.087-.454-.224-.654-.412-.199-.188-.361-.414-.488-.676-.127-.262-.226-.55-.295-.863-.069-.314-.103-.644-.103-.99z" />
  </svg>
);
