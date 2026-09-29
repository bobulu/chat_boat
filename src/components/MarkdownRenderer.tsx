import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const rawContent = String(children).replace(/\n$/, '');
            const isMultiLine = rawContent.includes('\n');

            if (match || isMultiLine) {
              return (
                <CodeBlock
                  language={match ? match[1] : undefined}
                  value={rawContent}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono bg-zinc-200/70 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 border border-zinc-300/60 dark:border-zinc-700/60"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 border-b border-zinc-200/80 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-emerald-500/80 pl-4 py-1.5 my-3 italic text-zinc-600 dark:text-zinc-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-2.5 space-y-1.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 my-2.5 space-y-1.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return (
              <h1 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg sm:text-xl font-bold mt-5 mb-2.5 text-zinc-900 dark:text-zinc-100">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base sm:text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-200">
                {children}
              </h3>
            );
          },
          p({ children }) {
            return <p className="my-2.5 leading-relaxed">{children}</p>;
          },
          hr() {
            return <hr className="my-5 border-zinc-200 dark:border-zinc-800" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
