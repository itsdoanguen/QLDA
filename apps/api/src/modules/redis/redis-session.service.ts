import { Injectable } from '@nestjs/common';

interface ExpiringValue<T> {
  expiresAt: number;
  value: T;
}

@Injectable()
export class RedisSessionService {
  private readonly sessions = new Map<string, ExpiringValue<string>>();
  private readonly tokenBlacklist = new Map<string, ExpiringValue<true>>();

  setSession(sessionId: string, payload: string, ttlSeconds: number): void {
    this.sessions.set(sessionId, {
      value: payload,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  getSession(sessionId: string): string | null {
    this.cleanupExpired(this.sessions, sessionId);
    return this.sessions.get(sessionId)?.value ?? null;
  }

  blacklistToken(token: string, ttlSeconds: number): void {
    this.tokenBlacklist.set(token, {
      value: true,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  isTokenBlacklisted(token: string): boolean {
    this.cleanupExpired(this.tokenBlacklist, token);
    return this.tokenBlacklist.has(token);
  }

  private cleanupExpired<T>(store: Map<string, ExpiringValue<T>>, key: string): void {
    const entry = store.get(key);
    if (!entry) {
      return;
    }

    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
    }
  }
}
