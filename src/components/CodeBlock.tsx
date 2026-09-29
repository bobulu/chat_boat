import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const displayLanguage = language ? language.replace(/language-/, '') : 'code';

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="uppercase font-semibold tracking-wider text-zinc-300">
            {displayLanguage}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto font-mono text-[13.5px] leading-relaxed text-zinc-200 select-text">
        <pre className="m-0 p-0 font-mono">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
