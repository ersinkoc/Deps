import { useState } from 'react';
import { CodeBlock as CodeshinBlock } from '@oxog/codeshine/react';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: (number | string)[];
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  highlightLines,
  showLineNumbers = true,
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  // Sync codeshine theme with app theme
  const codeTheme = resolvedTheme === 'dark' ? 'github-dark' : 'github-light';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("cs-block-wrapper", className)}>
      {/* macOS-style header */}
      <div className="cs-macos-header">
        <div className="cs-traffic-lights">
          <span className="cs-traffic-light cs-traffic-light--red" />
          <span className="cs-traffic-light cs-traffic-light--yellow" />
          <span className="cs-traffic-light cs-traffic-light--green" />
        </div>
        <div className="cs-header-content">
          {filename && <span className="cs-filename-custom">{filename}</span>}
          <span className="cs-language-badge-custom">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="cs-copy-button-custom"
          type="button"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <CodeshinBlock
        code={code.trim()}
        language={language}
        theme={codeTheme}
        lineNumbers={showLineNumbers}
        highlightLines={highlightLines}
        copyButton={false}
        className="cs-codeblock-custom"
      />
    </div>
  );
}
