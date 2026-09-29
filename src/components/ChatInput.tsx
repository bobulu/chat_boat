import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Sparkles, ShieldCheck } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isStreaming: boolean;
  onStop: () => void;
  sendOnEnter?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isStreaming,
  onStop,
  sendOnEnter = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent pt-4 pb-4 sm:pb-6 px-4">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isStreaming) {
              onSubmit();
            }
          }}
          className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-300 dark:border-zinc-700/80 shadow-lg dark:shadow-2xl focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all"
        >
          {/* Main textarea */}
          <div className="flex items-end px-3.5 py-2.5 sm:px-4 sm:py-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... (Markdown & code supported)"
              className="w-full resize-none bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm sm:text-base leading-relaxed max-h-[180px] py-1"
            />

            {/* Action buttons inside input box */}
            <div className="flex items-center ml-2 space-x-1.5 flex-shrink-0 mb-0.5">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-sm"
                  title="Stop generating"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-2 rounded-full transition-all shadow-sm ${
                    input.trim()
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-400 cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Privacy & Guarantee note */}
        <div className="mt-2.5 flex items-center justify-center space-x-2 text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/90" />
          <span>Local Storage Only • No database logging • Private to this browser</span>
        </div>
      </div>
    </div>
  );
};
