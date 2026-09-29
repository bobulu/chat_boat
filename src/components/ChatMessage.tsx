import React, { useState } from 'react';
import { Bot, User, Copy, Check, RotateCcw, Volume2, VolumeX, Edit3 } from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEditPrompt?: (content: string) => void;
  showWordCount?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onEditPrompt,
  showWordCount = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Strip markdown syntax for natural speech
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~#]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const wordCount = message.content.trim() ? message.content.trim().split(/\s+/).length : 0;
  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group w-full py-5 px-4 sm:px-6 transition-colors ${
        isAssistant
          ? 'bg-zinc-50/60 dark:bg-zinc-900/40 border-y border-zinc-200/50 dark:border-zinc-800/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 sm:gap-5 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-700 text-zinc-100 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content & Actions */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header line */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 select-none">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {isAssistant ? 'Nova AI' : 'You'}
            </span>
            <span className="text-[11px]">{timeStr}</span>
          </div>

          {/* Body */}
          <div className="text-zinc-800 dark:text-zinc-100 font-normal">
            {isAssistant ? (
              <div>
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
                )}
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-900 dark:text-zinc-100">
                {message.content}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                title="Copy text"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {isAssistant && !isStreaming && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {isAssistant && 'speechSynthesis' in window && (
                <button
                  onClick={handleToggleSpeak}
                  className={`p-1.5 rounded-md transition-colors ${
                    isSpeaking
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {!isAssistant && onEditPrompt && (
                <button
                  onClick={() => onEditPrompt(message.content)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showWordCount && isAssistant && (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
                {wordCount} words
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
