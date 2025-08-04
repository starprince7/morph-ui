import 'server-only';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export interface SessionData {
  sessionId: string;
  apiEndpoints: Map<string, string>; // endpoint -> cacheKey mapping
  createdAt: Date;
  lastAccessedAt: Date;
}

class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_COOKIE_NAME = 'ai-ui-session';
  private readonly SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Get session ID from cookies (read-only for Server Components)
   */
  public async getSessionId(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get(this.SESSION_COOKIE_NAME)?.value;
      
      if (sessionId && this.isValidSession(sessionId)) {
        return sessionId;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to read session cookie:', error);
      return null;
    }
  }

  /**
   * Generate a session ID without setting cookies (for Server Components)
   */
  public generateSessionId(): string {
    const sessionId = randomUUID();
    this.sessions.set(sessionId, {
      sessionId,
      apiEndpoints: new Map(),
      createdAt: new Date(),
      lastAccessedAt: new Date()
    });
    return sessionId;
  }

  /**
   * Store API endpoint for a session
   */
  public storeApiEndpointForSession(sessionId: string, apiEndpoint: string, cacheKey: string): void {
    const session = this.getOrCreateSessionData(sessionId);
    session.apiEndpoints.set(apiEndpoint, cacheKey);
    session.lastAccessedAt = new Date();
  }

  /**
   * Get cache key for an API endpoint in a session
   */
  public getCacheKeyForEndpoint(sessionId: string, apiEndpoint: string): string | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    session.lastAccessedAt = new Date();
    return session.apiEndpoints.get(apiEndpoint);
  }

  /**
   * Get all API endpoints for a session
   */
  public getSessionEndpoints(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session.apiEndpoints.keys()) : [];
  }

  /**
   * Clear session data
   */
  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Create a new session
   */
  private createNewSession(): string {
    const sessionId = randomUUID();
    this.sessions.set(sessionId, {
      sessionId,
      apiEndpoints: new Map(),
      createdAt: new Date(),
      lastAccessedAt: new Date()
    });
    return sessionId;
  }

  /**
   * Get or create session data
   */
  private getOrCreateSessionData(sessionId: string): SessionData {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        apiEndpoints: new Map(),
        createdAt: new Date(),
        lastAccessedAt: new Date()
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  /**
   * Check if session is valid and not expired
   */
  private isValidSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    const timeDiff = now.getTime() - session.lastAccessedAt.getTime();
    return timeDiff < this.SESSION_EXPIRY_MS;
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      const timeDiff = now.getTime() - session.lastAccessedAt.getTime();
      if (timeDiff >= this.SESSION_EXPIRY_MS) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session statistics (for debugging)
   */
  public getSessionStats(): { totalSessions: number; totalEndpoints: number } {
    let totalEndpoints = 0;
    for (const session of this.sessions.values()) {
      totalEndpoints += session.apiEndpoints.size;
    }
    return {
      totalSessions: this.sessions.size,
      totalEndpoints
    };
  }
}

export default SessionManager;
