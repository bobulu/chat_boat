import React, { useState, useRef } from 'react';
import { X, ShieldCheck, Download, Upload, Trash2, FileText, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session } from '../types/chat';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSession: Session | null;
  onDataImported: () => void;
  onDataCleared: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  activeSession,
  onDataImported,
  onDataCleared,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const usage = storageService.getStorageUsage();

  const handleExportJSON = () => {
    const data = storageService.exportDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novachat_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Backup downloaded successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportMarkdown = () => {
    if (!activeSession) return;
    const md = storageService.exportSessionMarkdown(activeSession);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = activeSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
    a.download = `${safeTitle || 'conversation'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Markdown conversation exported!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storageService.importDataJSON(content);
        if (res.success) {
          setFeedback(`Successfully imported ${res.count || 0} conversation(s)!`);
          onDataImported();
        } else {
          setFeedback(`Import failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    storageService.clearAllData();
    setConfirmClear(false);
    onDataCleared();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
              Privacy & Local Storage
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Feedback banner */}
          {feedback && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Privacy Architecture Banner */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5 text-sm">
              <span>Your Data Stays on Your Device</span>
            </div>
            <p>
              • <strong>Zero Database:</strong> We do not operate a database or server accounts.
            </p>
            <p>
              • <strong>100% Local Storage:</strong> All chat sessions, messages, and settings are saved directly in your browser's <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">localStorage</code>.
            </p>
            <p>
              • <strong>Zero Tracking:</strong> No tracking cookies, advertising beacons, or background telemetry.
            </p>
          </div>

          {/* Local Storage Meter */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local Storage Used</span>
              </span>
              <span className="font-mono text-zinc-600 dark:text-zinc-300">
                {usage.formatted} (~{usage.percentage}% of browser quota)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.max(usage.percentage, 2)}%` }}
              />
            </div>
          </div>

          {/* Data Portability (Export & Import) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Data Backup & Portability
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-medium text-xs text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Export All (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-medium text-xs text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Import Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {activeSession && activeSession.messages.length > 0 && (
              <button
                onClick={handleExportMarkdown}
                className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-medium text-xs text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Export Current Chat as Markdown (.md)</span>
              </button>
            )}
          </div>

          {/* Wipe Data Danger Zone */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mb-2">
              Danger Zone
            </label>

            {confirmClear ? (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
                <div className="flex items-start space-x-2 text-xs text-red-600 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Are you sure? This will permanently delete all conversations from your browser storage.
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center space-x-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear all conversations and browser storage</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs sm:text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
