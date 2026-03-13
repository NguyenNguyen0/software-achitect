const logger = require('./logger');

/**
 * Cache adapter — uses in-memory Map as fallback.
 * Swap out for ioredis when Redis is available.
 */
class Cache {
  constructor() {
    this._store = new Map();
    this._timers = new Map();
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttlSeconds = 300) {
    if (this._timers.has(key)) clearTimeout(this._timers.get(key));
    this._store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    if (ttlSeconds) {
      const timer = setTimeout(() => this._store.delete(key), ttlSeconds * 1000);
      this._timers.set(key, timer);
    }
  }

  async del(key) {
    if (this._timers.has(key)) clearTimeout(this._timers.get(key));
    this._store.delete(key);
  }

  async flush() {
    this._timers.forEach((t) => clearTimeout(t));
    this._store.clear();
    this._timers.clear();
  }

  // Invalidate by prefix pattern
  async invalidatePrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) await this.del(key);
    }
  }

  stats() {
    return { size: this._store.size };
  }
}

module.exports = new Cache();
