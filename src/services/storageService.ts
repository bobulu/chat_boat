import { Session, AppSettings, DEFAULT_SETTINGS } from '../types/chat';

const SESSIONS_STORAGE_KEY = 'novachat_sessions_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'novachat_active_session_v1';
const SETTINGS_STORAGE_KEY = 'novachat_settings_v1';

export const storageService = {
  // Load all sessions
  getSessions(): Session[] {
    try {
      const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
      return [];
    }
  },

  // Save all sessions
  saveSessions(sessions: Session[]): void {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage', e);
    }
  },

  // Get active session ID
  getActiveSessionId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  // Set active session ID
  setActiveSessionId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to set active session ID', e);
    }
  },

  // Save a single session (insert or update)
  saveSession(session: Session): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: Date.now() };
    } else {
      sessions.unshift({ ...session, updatedAt: Date.now() });
    }
    this.saveSessions(sessions);
  },

  // Delete a session
  deleteSession(id: string): void {
    const sessions = this.getSessions().filter((s) => s.id !== id);
    this.saveSessions(sessions);
    if (this.getActiveSessionId() === id) {
      this.setActiveSessionId(sessions.length > 0 ? sessions[0].id : null);
    }
  },

  // Toggle pin
  togglePin(id: string): void {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === id);
    if (session) {
      session.pinned = !session.pinned;
      this.saveSessions(sessions);
    }
  },

  // Clear all sessions and data
  clearAllData(): void {
    try {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },

  // Load settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  // Save settings
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // Calculate localStorage usage
  getStorageUsage(): { usedBytes: number; formatted: string; percentage: number } {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('novachat_')) {
          const val = localStorage.getItem(key) || '';
          total += (key.length + val.length) * 2; // UTF-16 approximate bytes
        }
      }
      const maxEstimated = 5 * 1024 * 1024; // Standard 5MB limit
      const percentage = Math.min(100, Math.round((total / maxEstimated) * 100));

      let formatted = `${(total / 1024).toFixed(1)} KB`;
      if (total > 1024 * 1024) {
        formatted = `${(total / (1024 * 1024)).toFixed(2)} MB`;
      }
      return { usedBytes: total, formatted, percentage };
    } catch {
      return { usedBytes: 0, formatted: '0 KB', percentage: 0 };
    }
  },

  // Export all sessions as JSON string
  exportDataJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sessions: this.getSessions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import sessions from JSON string
  importDataJSON(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.sessions)) {
        return { success: false, error: 'Invalid backup format. Missing sessions array.' };
      }

      const existingSessions = this.getSessions();
      const existingIds = new Set(existingSessions.map((s) => s.id));

      let importedCount = 0;
      for (const session of parsed.sessions) {
        if (session && session.id && session.title && Array.isArray(session.messages)) {
          if (!existingIds.has(session.id)) {
            existingSessions.push(session);
            existingIds.add(session.id);
            importedCount++;
          }
        }
      }

      // Sort by updatedAt descending
      existingSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      this.saveSessions(existingSessions);

      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings({ ...this.getSettings(), ...parsed.settings });
      }

      return { success: true, count: importedCount };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file.' };
    }
  },

  // Export single conversation as Markdown
  exportSessionMarkdown(session: Session): string {
    let md = `# ${session.title}\n\n`;
    md += `*Exported on ${new Date().toLocaleString()} from NovaChat (Privacy-Focused Local AI)*\n\n---\n\n`;

    for (const msg of session.messages) {
      const sender = msg.role === 'user' ? '🧑 **User**' : '✨ **Nova Assistant**';
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      md += `### ${sender} *(${time})*\n\n${msg.content}\n\n---\n\n`;
    }

    return md;
  },
};
