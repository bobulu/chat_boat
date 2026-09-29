import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Pin,
  PinOff,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Session, ThemeMode } from '../types/chat';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePin,
  isOpen,
  onToggleOpen,
  onOpenSettings,
  onOpenPrivacy,
  currentTheme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Start inline editing
  const handleStartRename = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = s.title.toLowerCase().includes(q);
    const matchesMessage = s.messages.some((m) => m.content.toLowerCase().includes(q));
    return matchesTitle || matchesMessage;
  });

  // Grouping logic (Pinned, Today, Yesterday, Previous 7 Days, Older)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const pinnedList = filteredSessions.filter((s) => s.pinned);
  const unpinned = filteredSessions.filter((s) => !s.pinned);

  const todayList = unpinned.filter((s) => (s.updatedAt || s.createdAt) >= startOfToday);
  const yesterdayList = unpinned.filter(
    (s) => (s.updatedAt || s.createdAt) >= startOfYesterday && (s.updatedAt || s.createdAt) < startOfToday
  );
  const last7DaysList = unpinned.filter(
    (s) => (s.updatedAt || s.createdAt) >= startOf7Days && (s.updatedAt || s.createdAt) < startOfYesterday
  );
  const olderList = unpinned.filter((s) => (s.updatedAt || s.createdAt) < startOf7Days);

  const groups = [
    { name: 'Pinned', list: pinnedList },
    { name: 'Today', list: todayList },
    { name: 'Yesterday', list: yesterdayList },
    { name: 'Previous 7 Days', list: last7DaysList },
    { name: 'Older', list: olderList },
  ].filter((g) => g.list.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-3 space-y-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 font-medium text-sm transition-all shadow-xs"
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Chat</span>
              </div>
              <span className="text-[10px] font-mono opacity-70 bg-zinc-800 dark:bg-zinc-200 px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </button>

            {/* Mobile close toggle */}
            <button
              onClick={onToggleOpen}
              className="md:hidden ml-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          {sessions.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-zinc-400 dark:text-zinc-500">
              {searchQuery ? 'No matching conversations' : 'No previous conversations'}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.name} className="space-y-1">
                <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                  {group.name}
                </div>

                {group.list.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = session.id === editingId;

                  return (
                    <div
                      key={session.id}
                      onClick={() => !isEditing && onSelectSession(session.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(session.id, e)}
                          className="flex items-center space-x-1 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            className="flex-1 px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-emerald-500 rounded outline-none text-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            type="submit"
                            className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="p-1 text-zinc-400 hover:text-zinc-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                            <span className="truncate pr-1">{session.title}</span>
                          </div>

                          {/* Quick action buttons on hover or active */}
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Pin / Unpin */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(session.id);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/60"
                              title={session.pinned ? 'Unpin' : 'Pin to top'}
                            >
                              {session.pinned ? (
                                <PinOff className="w-3 h-3 text-amber-500" />
                              ) : (
                                <Pin className="w-3 h-3" />
                              )}
                            </button>

                            {/* Rename */}
                            <button
                              onClick={(e) => handleStartRename(session, e)}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/60"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/60"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom Sidebar Tools */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
          {/* Privacy & Storage trigger */}
          <button
            onClick={onOpenPrivacy}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privacy & Storage</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Local Only
            </span>
          </button>

          {/* Settings trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>Settings</span>
            </div>
          </button>

          {/* Quick Theme Toggle */}
          <div className="pt-1 flex items-center justify-between px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Theme</span>
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              title={`Toggle theme (Current: ${currentTheme})`}
            >
              {currentTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
