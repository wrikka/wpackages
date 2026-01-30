import { Event } from '../types/analytics.js';

export interface SessionConfig {
  sessionTimeout: number;
  enableSessionTracking: boolean;
}

export class SessionManager {
  private config: SessionConfig;
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private lastActivityTime: number | null = null;
  private activityTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: SessionConfig) {
    this.config = config;
    this.loadSession();
    this.startActivityTracking();
  }

  private loadSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = sessionStorage.getItem('analytics_session');
      if (stored) {
        const session = JSON.parse(stored);
        this.sessionId = session.sessionId;
        this.sessionStartTime = session.startTime;
        this.lastActivityTime = session.lastActivityTime;

        const now = Date.now();
        if (this.lastActivityTime && now - this.lastActivityTime > this.config.sessionTimeout) {
          this.startNewSession();
        }
      }
    } catch {
      this.startNewSession();
    }

    if (!this.sessionId) {
      this.startNewSession();
    }
  }

  private saveSession(): void {
    if (typeof window === 'undefined' || !this.sessionId) return;

    try {
      sessionStorage.setItem('analytics_session', JSON.stringify({
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        lastActivityTime: this.lastActivityTime,
      }));
    } catch {
    }
  }

  private startNewSession(): void {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.saveSession();
  }

  private startActivityTracking(): void {
    if (typeof window === 'undefined') return;

    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.saveSession();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('click', updateActivity);

    this.activityTimer = setInterval(() => {
      const now = Date.now();
      if (this.lastActivityTime && now - this.lastActivityTime > this.config.sessionTimeout) {
        this.startNewSession();
      }
    }, 60000);
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime;
  }

  getSessionInfo(): { sessionId: string | null; duration: number; startTime: number | null } {
    return {
      sessionId: this.sessionId,
      duration: this.getSessionDuration(),
      startTime: this.sessionStartTime,
    };
  }

  enrichEvent(event: Event): Event {
    const enrichedEvent: Event = {
      ...event,
      properties: {
        ...event.properties,
        sessionDuration: this.getSessionDuration(),
      },
    };
    
    if (this.sessionId) {
      enrichedEvent.sessionId = this.sessionId;
    }
    
    return enrichedEvent;
  }

  destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }
}

export const createSessionManager = (config: SessionConfig): SessionManager => {
  return new SessionManager(config);
};
