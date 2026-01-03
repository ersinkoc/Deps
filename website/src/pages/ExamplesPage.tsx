import React from 'react';
import { examples } from '../data/examples';
import { CodeBlock } from '../components/CodeBlock';
import { Folder } from 'lucide-react';

export const ExamplesPage: React.FC = () => {
  const categories = Array.from(new Set(examples.map((e) => e.category)));

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Examples
        </h1>

        {categories.map((category) => {
          const categoryExamples = examples.filter((e) => e.category === category);

          return (
            <section key={category} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <Folder className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h2>
              </div>

              <div className="space-y-6">
                {categoryExamples.map((example) => (
                  <div
                    key={example.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {example.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {example.description}
                    </p>
                    <CodeBlock
                      code={example.code}
                      filename={example.title.replace(/\s+/g, '-').toLowerCase() + '.ts'}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
