import React from 'react';
import { Bot, Code2, Shield, Sparkles, Feather, HelpCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      icon: <Code2 className="w-5 h-5 text-emerald-500" />,
      title: 'Code & Types',
      prompt: 'Write a TypeScript debounce utility function with generics and unit tests.',
      category: 'Development',
    },
    {
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      title: 'Local-First Architecture',
      prompt: 'Explain the benefits of local storage and client-side encryption for user privacy.',
      category: 'Privacy',
    },
    {
      icon: <Feather className="w-5 h-5 text-purple-500" />,
      title: 'Draft & Polish',
      prompt: 'Draft a clear, professional email announcing a privacy update to our users.',
      category: 'Writing',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: 'Learn & Explore',
      prompt: 'Explain how neural networks learn with a simple visual metaphor.',
      category: 'Concept',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center">
      {/* Brand Icon & Welcome */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 ring-4 ring-emerald-500/10">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          NovaChat
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">
          Private, fast, and intelligent conversational AI. Your conversation history is saved strictly to this browser.
        </p>
      </div>

      {/* Privacy Guarantee Pill */}
      <div className="mb-8 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>No logins • No remote database • 100% local persistence</span>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {item.category}
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {item.title}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
              "{item.prompt}"
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
