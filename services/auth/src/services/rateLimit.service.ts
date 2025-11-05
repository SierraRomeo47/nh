export interface RateLimiter {
  tryRemoveToken(key: string, points: number, windowMs: number): Promise<boolean>;
}

export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, { tokens: number; resetAt: number }>();

  async tryRemoveToken(key: string, points: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { tokens: Math.max(0, points - 1), resetAt: now + windowMs });
      return true;
    }
    if (bucket.tokens <= 0) return false;
    bucket.tokens -= 1;
    return true;
  }
}

export interface LockoutState {
  isLocked: boolean;
  unlockAt?: number;
}

export class LoginLockout {
  private failures = new Map<string, { count: number; lockUntil?: number }>();

  constructor(private threshold = 5, private lockMs = 15 * 60 * 1000) {}

  recordFailure(id: string) {
    const entry = this.failures.get(id) || { count: 0 };
    entry.count += 1;
    if (entry.count >= this.threshold) {
      entry.lockUntil = Date.now() + this.lockMs;
    }
    this.failures.set(id, entry);
  }

  reset(id: string) {
    this.failures.delete(id);
  }

  getState(id: string): LockoutState {
    const entry = this.failures.get(id);
    if (!entry) return { isLocked: false };
    if (entry.lockUntil && entry.lockUntil > Date.now()) {
      return { isLocked: true, unlockAt: entry.lockUntil };
    }
    return { isLocked: false };
  }
}
