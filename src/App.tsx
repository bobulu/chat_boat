import React, { useState, useEffect, useRef } from 'react';
import {
  PanelLeft,
  Plus,
  Shield,
  Download,
  Share2,
  Trash2,
  Edit3,
  Check,
  X,
  Sliders,
  Sparkles,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { Message, Session, AppSettings } from './types/chat';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyModal } from './components/PrivacyModal';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(() => storageService.getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const savedId = storageService.getActiveSessionId();
    const all = storageService.getSessions();
    if (savedId && all.some((s) => s.id === savedId)) {
      return savedId;
    }
    return all.length > 0 ? all[0].id : null;
  });

  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Initialize with a fresh session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      const newSess: Session = {
        id: crypto.randomUUID(),
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setSessions([newSess]);
      setActiveSessionId(newSess.id);
      storageService.saveSessions([newSess]);
      storageService.setActiveSessionId(newSess.id);
    }
  }, [sessions.length]);

  // Sync activeSessionId with storage
  useEffect(() => {
    storageService.setActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Apply Theme Mode (dark / light / system)
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (theme: 'dark' | 'light') => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(settings.theme);
    }
  }, [settings.theme]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current && isStreaming) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, isStreaming]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K for new chat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessions]);

  // Create new chat
  const handleNewChat = () => {
    if (isStreaming) {
      handleStopGeneration();
    }

    // Check if the current session is already empty
    if (activeSession && activeSession.messages.length === 0) {
      setIsSidebarOpen(false);
      return;
    }

    const newSess: Session = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    const updated = [newSess, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSess.id);
    storageService.saveSessions(updated);
    setIsSidebarOpen(false);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    storageService.deleteSession(id);

    if (activeSessionId === id) {
      const nextId = filtered.length > 0 ? filtered[0].id : null;
      setActiveSessionId(nextId);
    }
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    setSessions(updated);
    storageService.saveSessions(updated);
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, pinned: !s.pinned } : s
    );
    setSessions(updated);
    storageService.saveSessions(updated);
  };

  // Save Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend || isStreaming) return;

    setInput('');

    // Ensure we have an active session
    let currentSession = activeSession;
    let currentSessions = [...sessions];

    if (!currentSession) {
      currentSession = {
        id: crypto.randomUUID(),
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      currentSessions = [currentSession, ...currentSessions];
      setActiveSessionId(currentSession.id);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
    };

    const assistantMessageId = crypto.randomUUID();
    const placeholderAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const newMessages = [...currentSession.messages, userMessage, placeholderAssistantMessage];
    const isFirstUserMessage = currentSession.messages.filter((m) => m.role === 'user').length === 0;

    // Update session state
    const updatedSession: Session = {
      ...currentSession,
      messages: newMessages,
      updatedAt: Date.now(),
    };

    const updatedSessionsList = currentSessions.map((s) =>
      s.id === updatedSession.id ? updatedSession : s
    );

    setSessions(updatedSessionsList);
    storageService.saveSessions(updatedSessionsList);

    // Prepare API call
    const messagesForApi = newMessages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForApi,
          systemInstruction: settings.systemInstruction,
          temperature: settings.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedContent += parsed.text;
                // Live update the assistant message
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== updatedSession.id) return s;
                    const msgs = s.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
                    );
                    return { ...s, messages: msgs, updatedAt: Date.now() };
                  })
                );
              } else if (parsed.error) {
                accumulatedContent += `\n\n*(Error: ${parsed.error})*`;
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== updatedSession.id) return s;
                    const msgs = s.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
                    );
                    return { ...s, messages: msgs, updatedAt: Date.now() };
                  })
                );
              }
            } catch (err) {
              console.error('Failed to parse SSE line', dataStr, err);
            }
          }
        }
      }

      // Persist finished state to local storage
      const finalSessions = storageService.getSessions().map((s) => {
        if (s.id !== updatedSession.id) return s;
        const msgs = s.messages.map((m) =>
          m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
        );
        return { ...s, messages: msgs, updatedAt: Date.now() };
      });
      storageService.saveSessions(finalSessions);

      // Auto generate conversation title if this is the first message
      if (isFirstUserMessage && (updatedSession.title === 'New Conversation' || !updatedSession.title)) {
        fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: promptToSend }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.title) {
              handleRenameSession(updatedSession.id, data.title);
            }
          })
          .catch((err) => console.error('Failed to auto-generate title', err));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('User stopped generation');
      } else {
        console.error('Chat error:', err);
        const errorNotice = `\n\n*⚠️ Could not complete request: ${err.message || 'Network error'}.*`;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== updatedSession.id) return s;
            const msgs = s.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: (accumulatedContent || '') + errorNotice }
                : m
            );
            return { ...s, messages: msgs, updatedAt: Date.now() };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeSession || isStreaming) return;
    const msgs = activeSession.messages;
    if (msgs.length < 2) return;

    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant') return;

    // Find the prompt before it
    const lastUserMsg = msgs[msgs.length - 2];
    if (lastUserMsg.role !== 'user') return;

    // Remove the last assistant message
    const trimmed = msgs.slice(0, -1);
    const updated = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, messages: trimmed, updatedAt: Date.now() } : s
    );
    setSessions(updated);
    storageService.saveSessions(updated);

    // Re-send with that prompt
    handleSendMessage(lastUserMsg.content);
  };

  // Clear current active conversation messages
  const handleClearCurrentChat = () => {
    if (!activeSession) return;
    const updated = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, messages: [], updatedAt: Date.now() } : s
    );
    setSessions(updated);
    storageService.saveSessions(updated);
  };

  // Toggle quick theme
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePin={handleTogglePin}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        currentTheme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header Bar */}
        <header className="h-14 flex items-center justify-between px-3 sm:px-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {/* Conversation Title & Inline Rename */}
            {isEditingTitle && activeSession ? (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameSession(activeSession.id, editedTitle.trim() || 'Conversation');
                      setIsEditingTitle(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                  className="px-2 py-0.5 text-sm bg-zinc-100 dark:bg-zinc-800 border border-emerald-500 rounded-lg outline-none font-semibold text-zinc-900 dark:text-zinc-100"
                />
                <button
                  onClick={() => {
                    handleRenameSession(activeSession.id, editedTitle.trim() || 'Conversation');
                    setIsEditingTitle(false);
                  }}
                  className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (activeSession) {
                    setEditedTitle(activeSession.title);
                    setIsEditingTitle(true);
                  }
                }}
                className="group flex items-center space-x-1.5 cursor-pointer max-w-[220px] sm:max-w-md truncate"
                title="Click to rename"
              >
                <span className="font-semibold text-sm sm:text-base text-zinc-800 dark:text-zinc-200 truncate">
                  {activeSession?.title || 'New Conversation'}
                </span>
                <Edit3 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            )}

            {/* AI Model Badge */}
            <div className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 select-none">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Privacy indicator pill */}
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              title="100% Client-Side Local Storage"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">Local Storage</span>
            </button>

            {/* Clear messages in this chat */}
            {activeSession && activeSession.messages.length > 0 && (
              <button
                onClick={handleClearCurrentChat}
                className="p-2 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Clear current messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Export chat Markdown */}
            {activeSession && activeSession.messages.length > 0 && (
              <button
                onClick={() => {
                  const md = storageService.exportSessionMarkdown(activeSession);
                  const blob = new Blob([md], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  const safeTitle = activeSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
                  a.download = `${safeTitle || 'chat'}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Export chat as Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* New chat icon */}
            <button
              onClick={handleNewChat}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="New Chat (⌘K)"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!activeSession || activeSession.messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="flex-1 flex flex-col py-4">
              {activeSession.messages.map((message, idx) => {
                const isLast = idx === activeSession.messages.length - 1;
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && isLast && message.role === 'assistant'}
                    onRegenerate={isLast && message.role === 'assistant' ? handleRegenerate : undefined}
                    onEditPrompt={(content) => {
                      setInput(content);
                    }}
                    showWordCount={settings.showWordCount}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Bottom Input Box */}
        <div className="flex-shrink-0">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={() => handleSendMessage()}
            isStreaming={isStreaming}
            onStop={handleStopGeneration}
            sendOnEnter={settings.sendOnEnter}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Privacy & Storage Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        activeSession={activeSession}
        onDataImported={() => {
          const reloaded = storageService.getSessions();
          setSessions(reloaded);
          if (reloaded.length > 0) {
            setActiveSessionId(reloaded[0].id);
          }
        }}
        onDataCleared={() => {
          setSessions([]);
          setActiveSessionId(null);
        }}
      />
    </div>
  );
}
