/**
 * Typed sessionStorage helpers.
 * Data persists across refreshes and tab-switches within the same session.
 * Cleared automatically when the browser session ends.
 */

export const sessionStore = {
  get<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded — silently skip
    }
  },

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

// ── Session storage keys ──────────────────────────────────────────
export const SESSION_KEYS = {
  // Live Situation Room
  LIVE_EVENTS:       'project-mayhem:live:events',
  LIVE_FILTERS:      'project-mayhem:live:filters',
  LIVE_SELECTED_ID:  'project-mayhem:live:selectedId',

  // New Advisory
  NEW_FORM:          'project-mayhem:new:form',
  NEW_IS_STRETCH:    'project-mayhem:new:isStretch',
  NEW_ADVISORY:      'project-mayhem:new:advisory',

  // Outcomes Log
  OUTCOMES_LOG:      'project-mayhem:outcomes:log',
} as const;
