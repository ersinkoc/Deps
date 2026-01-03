/**
 * Cache manager for analysis results
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { join } from 'node:path';
import { readFile, writeFile, fileExists } from '../utils/fs.js';
import { CacheError } from '../errors.js';
import type { CacheOptions } from '../types.js';

/**
 * Cache entry structure
 * @internal
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Cache storage structure
 * @internal
 */
interface CacheStore {
  version: string;
  entries: Record<string, CacheEntry<unknown>>;
}

/**
 * Cache manager for persisting analysis results
 */
export class CacheManager {
  /** Cache file path */
  private readonly cachePath: string;
  /** In-memory cache */
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  /** Persisted cache data */
  private persistentCache: CacheStore | null = null;
  /** Cache version */
  private readonly version = '1.0.0';
  /** Is persistent cache loaded? */
  private loaded = false;

  /**
   * Create cache manager
   * @param cwd - Working directory (cache file stored here as .deps-cache)
   */
  constructor(cwd: string) {
    this.cachePath = join(cwd, '.deps-cache');
  }

  /**
   * Load persistent cache from disk
   */
  private async load(): Promise<void> {
    if (this.loaded) return;

    if (await fileExists(this.cachePath)) {
      try {
        const content = await readFile(this.cachePath);
        const data = JSON.parse(content) as CacheStore;

        // Validate cache version
        if (data.version === this.version) {
          this.persistentCache = data;

          // Load entries into memory
          for (const [key, entry] of Object.entries(data.entries)) {
            this.memoryCache.set(key, entry);
          }
        }
      } catch {
        // Invalid cache, ignore
        this.persistentCache = null;
      }
    } else {
      this.persistentCache = { version: this.version, entries: {} };
    }

    this.loaded = true;
  }

  /**
   * Save persistent cache to disk
   */
  private async save(): Promise<void> {
    if (!this.persistentCache) {
      this.persistentCache = { version: this.version, entries: {} };
    }

    // Update entries from memory
    for (const [key, entry] of this.memoryCache.entries()) {
      this.persistentCache.entries[key] = entry;
    }

    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of Object.entries(this.persistentCache.entries)) {
      if (entry.ttl && entry.timestamp + entry.ttl < now) {
        delete this.persistentCache.entries[key];
        this.memoryCache.delete(key);
      }
    }

    try {
      await writeFile(this.cachePath, JSON.stringify(this.persistentCache, null, 2));
    } catch (error) {
      throw new CacheError('Failed to save cache', {
        path: this.cachePath,
        error
      });
    }
  }

  /**
   * Get cached value
   * @param key - Cache key
   */
  async get<T>(key: string): Promise<T | null> {
    await this.load();

    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL
    if (entry.ttl) {
      const now = Date.now();
      if (entry.timestamp + entry.ttl < now) {
        // Expired
        this.memoryCache.delete(key);
        return null;
      }
    }

    return entry.value as T;
  }

  /**
   * Set cached value
   * @param key - Cache key
   * @param value - Value to cache
   * @param options - Cache options
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    await this.load();

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: options?.ttl,
      metadata: options?.metadata
    };

    this.memoryCache.set(key, entry as CacheEntry<unknown>);

    // Persist to disk
    await this.save();
  }

  /**
   * Check if key exists and is valid
   * @param key - Cache key
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Invalidate cache entries
   * @param pattern - Key pattern to invalidate (undefined = all)
   */
  async invalidate(pattern?: string): Promise<void> {
    await this.load();

    if (pattern === undefined) {
      // Invalidate all
      this.memoryCache.clear();
      if (this.persistentCache) {
        this.persistentCache.entries = {};
      }
    } else {
      // Invalidate matching keys
      const regex = new RegExp(pattern);

      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
          if (this.persistentCache) {
            delete this.persistentCache.entries[key];
          }
        }
      }
    }

    await this.save();
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.persistentCache = null;
    this.loaded = false;

    // Delete cache file
    const fs = await import('node:fs');
    try {
      await fs.promises.unlink(this.cachePath).catch(() => {
        // Ignore if file doesn't exist
      });
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get cache size (number of entries)
   */
  size(): number {
    return this.memoryCache.size;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    await this.load();

    const now = Date.now();
    const expired: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.ttl && entry.timestamp + entry.ttl < now) {
        expired.push(key);
      }
    }

    for (const key of expired) {
      this.memoryCache.delete(key);
      if (this.persistentCache) {
        delete this.persistentCache.entries[key];
      }
    }

    if (expired.length > 0) {
      await this.save();
    }
  }
}
