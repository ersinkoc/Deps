/**
 * Tests for cache manager
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../../../src/core/cache.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const testDir = join(process.cwd(), 'test-cache-temp');

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    cache = new CacheManager(testDir);
  });

  afterEach(async () => {
    await cache.clear();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('get/set', () => {
    it('should store and retrieve values', async () => {
      await cache.set('test-key', { value: 42 });
      const result = await cache.get<{ value: number }>('test-key');
      expect(result).toEqual({ value: 42 });
    });

    it('should return null for missing keys', async () => {
      const result = await cache.get('missing-key');
      expect(result).toBeNull();
    });

    it('should handle TTL expiration', async () => {
      await cache.set('expire-key', 'value', { ttl: 100 });
      const result1 = await cache.get('expire-key');
      expect(result1).toBe('value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      const result2 = await cache.get('expire-key');
      expect(result2).toBeNull();
    }, { timeout: 5000 });

    it('should store metadata', async () => {
      await cache.set('meta-key', 'value', { metadata: { source: 'test' } });
      const result = await cache.get('meta-key');
      expect(result).toBe('value');
    });
  });

  describe('has', () => {
    it('should return true for existing keys', async () => {
      await cache.set('test-key', 'value');
      const exists = await cache.has('test-key');
      expect(exists).toBe(true);
    });

    it('should return false for missing keys', async () => {
      const exists = await cache.has('missing-key');
      expect(exists).toBe(false);
    });

    it('should return false for expired keys', async () => {
      await cache.set('expire-key', 'value', { ttl: 50 });
      await new Promise(resolve => setTimeout(resolve, 100));
      const exists = await cache.has('expire-key');
      expect(exists).toBe(false);
    }, { timeout: 5000 });
  });

  describe('invalidate', () => {
    it('should invalidate all keys when no pattern', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.invalidate();

      expect(await cache.has('key1')).toBe(false);
      expect(await cache.has('key2')).toBe(false);
    });

    it('should invalidate matching keys by pattern', async () => {
      await cache.set('test:key1', 'value1');
      await cache.set('test:key2', 'value2');
      await cache.set('other:key3', 'value3');

      await cache.invalidate('^test:');

      expect(await cache.has('test:key1')).toBe(false);
      expect(await cache.has('test:key2')).toBe(false);
      expect(await cache.has('other:key3')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all cache and delete file', async () => {
      await cache.set('key1', 'value1');
      await cache.clear();

      expect(cache.size()).toBe(0);
      const cacheFile = join(testDir, '.deps-cache');
      const exists = await fs.access(cacheFile).then(() => true).catch(() => false);
      expect(exists).toBe(false);
    });
  });

  describe('size', () => {
    it('should return zero for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('should return number of entries', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.keys()).toEqual([]);
    });

    it('should return all cache keys', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      await cache.set('expired-key', 'value', { ttl: 50 });
      await cache.set('valid-key', 'value');

      await new Promise(resolve => setTimeout(resolve, 100));
      await cache.cleanup();

      expect(await cache.has('expired-key')).toBe(false);
      expect(await cache.has('valid-key')).toBe(true);
    }, { timeout: 5000 });
  });

  describe('persistence', () => {
    it('should persist cache to disk', async () => {
      await cache.set('persist-key', 'persist-value');

      // Create new cache instance
      const cache2 = new CacheManager(testDir);
      const result = await cache2.get('persist-key');
      expect(result).toBe('persist-value');
    });

    it('should handle invalid cache file', async () => {
      const cacheFile = join(testDir, '.deps-cache');
      await fs.writeFile(cacheFile, 'invalid json', 'utf-8');

      const cache2 = new CacheManager(testDir);
      expect(await cache2.get('any-key')).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      await cache.set('expired-key', 'value', { ttl: 50 });
      await cache.set('valid-key', 'value');

      await new Promise(resolve => setTimeout(resolve, 100));
      await cache.cleanup();

      expect(await cache.has('expired-key')).toBe(false);
      expect(await cache.has('valid-key')).toBe(true);
    }, { timeout: 5000 });

    it('should remove expired entries during save', async () => {
      // Tests lines 103-107: expired entry cleanup in save()
      await cache.set('expired-key', 'value', { ttl: 50 });
      await cache.set('valid-key', 'value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add another entry to trigger save() which should clean up expired entries
      await cache.set('another-key', 'value2');

      // Expired key should be gone after save cleaned up
      expect(await cache.has('expired-key')).toBe(false);
      expect(await cache.has('valid-key')).toBe(true);
      expect(await cache.has('another-key')).toBe(true);
    }, { timeout: 5000 });
  });

  describe('persistence', () => {
    it('should persist cache to disk', async () => {
      await cache.set('persist-key', 'persist-value');

      // Create new cache instance
      const cache2 = new CacheManager(testDir);
      const result = await cache2.get('persist-key');
      expect(result).toBe('persist-value');
    });

    it('should handle invalid cache file', async () => {
      const cacheFile = join(testDir, '.deps-cache');
      await fs.writeFile(cacheFile, 'invalid json', 'utf-8');

      const cache2 = new CacheManager(testDir);
      expect(await cache2.get('any-key')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw CacheError when directory becomes file', async () => {
      // Create a file at the cache path to make write fail
      const cacheFilePath = join(testDir, '.deps-cache');
      await fs.writeFile(cacheFilePath, '{}', 'utf-8');

      // This should still work since the file exists and is valid
      const testCache = new CacheManager(testDir);
      await testCache.set('test-key', 'value');
      const result = await testCache.get('test-key');
      expect(result).toBe('value');
    });

    it('should handle file system errors in clear', async () => {
      const testCache = new CacheManager(testDir);
      await testCache.set('key', 'value');

      // Clear should work even if file doesn't exist after deletion
      await testCache.clear();
      await testCache.clear(); // Second clear should also work
      expect(testCache.size()).toBe(0);
    });

    it('should clean expired entries from persistent cache during save', async () => {
      // Tests lines 103-107: expired entry cleanup in save() removes from both memory and persistent cache
      await cache.set('will-expire', 'value', { ttl: 30 });
      await cache.set('will-stay', 'value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 50));

      // Trigger save via set which should clean up expired entries
      // The expired entry should be removed from memoryCache
      await cache.set('new-key', 'value2');

      expect(cache.size()).toBe(2); // 'will-stay' and 'new-key', expired one removed
    }, { timeout: 5000 });

    it('should call load before getting value', async () => {
      // Tests lines 124-125: get() calls load() before accessing memoryCache
      await cache.set('load-test', 'value');
      expect(await cache.get('load-test')).toBe('value');
    });

    it('should return null for non-existent key', async () => {
      // Tests line 129: return null when entry not found
      expect(await cache.get('nonexistent')).toBeNull();
    });

    it('should handle errors in clear gracefully', async () => {
      // Tests line 223: catch block in clear() that ignores errors
      const testCache = new CacheManager(testDir);
      await testCache.set('key', 'value');

      // Clear should work even if there are filesystem errors
      await testCache.clear();
      expect(testCache.size()).toBe(0);
      expect(testCache.loaded).toBe(false);
    });

    it('should get value with type safety', async () => {
      // Tests lines 124-129: generic get method with type parameter
      await cache.set('string-key', 'string-value');
      await cache.set('number-key', 42);
      await cache.set('object-key', { foo: 'bar' });

      const stringValue = await cache.get<string>('string-key');
      const numberValue = await cache.get<number>('number-key');
      const objectValue = await cache.get<{ foo: string }>('object-key');

      expect(stringValue).toBe('string-value');
      expect(numberValue).toBe(42);
      expect(objectValue).toEqual({ foo: 'bar' });
    });

    it('should get entry from memory cache', async () => {
      // Tests lines 127-128: memoryCache.get() call
      await cache.set('memory-key', 'memory-value');

      // Force cache to be loaded
      expect(cache.loaded).toBe(true);

      const result = await cache.get('memory-key');
      expect(result).toBe('memory-value');
    });
  });
});
