import React from 'react';
import { X, Moon, Sun, Monitor, Sliders, Type, CornerDownLeft, Sparkles } from 'lucide-react';
import { AppSettings, ThemeMode } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'Default Assistant',
      prompt:
        'You are NovaChat, an intelligent, helpful, and privacy-respecting AI assistant. You write clean, well-formatted markdown, explain concepts clearly, and provide concise yet comprehensive answers.',
    },
    {
      name: 'Software Engineer',
      prompt:
        'You are an expert senior software engineer. When writing code, provide clean, idiomatic, fully-typed code with minimal boilerplate and clear explanations of edge cases.',
    },
    {
      name: 'Concise & Direct',
      prompt:
        'Provide ultra-concise, direct answers without unnecessary preamble, pleasantries, or fluff. Get straight to the answer with bullet points and code where applicable.',
    },
    {
      name: 'Academic Tutor',
      prompt:
        'You are a patient, encouraging academic tutor. Explain complex concepts using step-by-step reasoning, intuitive analogies, and interactive follow-up questions.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
              Settings & Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Appearance / Theme */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Monitor },
              ].map((themeOpt) => {
                const Icon = themeOpt.icon;
                const isSelected = settings.theme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    onClick={() =>
                      onUpdateSettings({ ...settings, theme: themeOpt.id as ThemeMode })
                    }
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{themeOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Instructions / Persona */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                System Instructions & Persona
              </label>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Custom persona</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() =>
                    onUpdateSettings({ ...settings, systemInstruction: p.prompt })
                  }
                  className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={settings.systemInstruction}
              onChange={(e) =>
                onUpdateSettings({ ...settings, systemInstruction: e.target.value })
              }
              placeholder="Instructions provided to the AI at the start of each chat..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Creativity (Temperature: {settings.temperature})
              </label>
              <span className="text-xs text-zinc-400">
                {settings.temperature < 0.4
                  ? 'Precise'
                  : settings.temperature > 0.8
                  ? 'Creative'
                  : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
              <span>0.0 Focused & Deterministic</span>
              <span>1.5 Expressive & Creative</span>
            </div>
          </div>

          {/* Chat Behavior Toggles */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CornerDownLeft className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  Send on Enter (Shift+Enter for newline)
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.sendOnEnter}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, sendOnEnter: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  Show word counts on responses
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showWordCount}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showWordCount: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
