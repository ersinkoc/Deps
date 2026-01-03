import React from 'react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, filename = 'example.ts' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');
  const maxLineNumber = lines.length;
  const lineNumberWidth = maxLineNumber.toString().length;

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">{filename}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="flex overflow-x-auto">
        {/* Line numbers */}
        <div className="flex-shrink-0 py-4 px-3 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
          {lines.map((_, i) => (
            <div
              key={i}
              className="text-sm text-gray-400 dark:text-gray-600 font-mono text-right"
              style={{ minWidth: `${lineNumberWidth + 1}ch` }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code */}
        <pre className="flex-1 py-4 px-4 overflow-x-auto">
          <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};
