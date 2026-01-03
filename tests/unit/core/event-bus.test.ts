/**
 * Tests for event bus
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../../src/core/event-bus.js';

interface TestEvents {
  test: { value: number };
  async: { data: string };
  error: Error;
}

describe('EventBus', () => {
  let bus: EventBus<TestEvents>;

  beforeEach(() => {
    bus = new EventBus<TestEvents>();
  });

  describe('on', () => {
    it('should register event listener', () => {
      let called = false;
      bus.on('test', () => { called = true; });
      bus.emit('test', { value: 42 });
      expect(called).toBe(true);
    });

    it('should return unsubscribe function', () => {
      let called = false;
      const unsubscribe = bus.on('test', () => { called = true; });
      unsubscribe();
      bus.emit('test', { value: 42 });
      expect(called).toBe(false);
    });

    it('should support multiple listeners', () => {
      let count = 0;
      bus.on('test', () => { count += 1; });
      bus.on('test', () => { count += 1; });
      bus.emit('test', { value: 42 });
      expect(count).toBe(2);
    });
  });

  describe('once', () => {
    it('should call listener only once', () => {
      let count = 0;
      bus.once('test', () => { count += 1; });
      bus.emit('test', { value: 42 });
      bus.emit('test', { value: 43 });
      expect(count).toBe(1);
    });

    it('should return unsubscribe function', () => {
      let called = false;
      const unsubscribe = bus.once('test', () => { called = true; });
      unsubscribe();
      bus.emit('test', { value: 42 });
      expect(called).toBe(false);
    });
  });

  describe('emit', () => {
    it('should pass data to listeners', () => {
      let received: { value: number } | null = null;
      bus.on('test', (data) => { received = data; });
      bus.emit('test', { value: 42 });
      expect(received).toEqual({ value: 42 });
    });

    it('should handle async handlers', async () => {
      let called = false;
      bus.on('async', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        called = true;
      });
      await bus.emit('async', { data: 'test' });
      expect(called).toBe(true);
    }, { timeout: 5000 });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      let count = 0;
      const handler = () => { count += 1; };
      bus.on('test', handler);
      bus.off('test', handler);
      bus.emit('test', { value: 42 });
      expect(count).toBe(0);
    });

    it('should remove specific once listener', () => {
      let count = 0;
      const handler = () => { count += 1; };
      bus.once('test', handler);
      bus.off('test', handler);
      bus.emit('test', { value: 42 });
      expect(count).toBe(0);
    });

    it('should remove all listeners for event', () => {
      let count = 0;
      bus.on('test', () => { count += 1; });
      bus.on('test', () => { count += 1; });
      bus.off('test');
      bus.emit('test', { value: 42 });
      expect(count).toBe(0);
    });

    it('should remove all listeners when no event specified', () => {
      let count = 0;
      bus.on('test', () => { count += 1; });
      bus.on('async', () => { count += 1; });
      bus.off();
      bus.emit('test', { value: 42 });
      bus.emit('async', { data: 'test' });
      expect(count).toBe(0);
    });
  });

  describe('listenerCount', () => {
    it('should return zero for no listeners', () => {
      expect(bus.listenerCount('test')).toBe(0);
    });

    it('should count regular listeners', () => {
      bus.on('test', () => {});
      bus.on('test', () => {});
      expect(bus.listenerCount('test')).toBe(2);
    });

    it('should count once listeners', () => {
      bus.once('test', () => {});
      bus.once('test', () => {});
      expect(bus.listenerCount('test')).toBe(2);
    });

    it('should count both regular and once listeners', () => {
      bus.on('test', () => {});
      bus.once('test', () => {});
      expect(bus.listenerCount('test')).toBe(2);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners', () => {
      bus.on('test', () => {});
      bus.on('async', () => {});
      bus.removeAllListeners();
      expect(bus.listenerCount('test')).toBe(0);
      expect(bus.listenerCount('async')).toBe(0);
    });
  });

  describe('eventNames', () => {
    it('should return empty array for no listeners', () => {
      expect(bus.eventNames()).toEqual([]);
    });

    it('should return event names with listeners', () => {
      bus.on('test', () => {});
      bus.on('async', () => {});
      const names = bus.eventNames();
      expect(names).toContain('test');
      expect(names).toContain('async');
      expect(names.length).toBe(2);
    });

    it('should include events with once listeners', () => {
      bus.once('test', () => {});
      const names = bus.eventNames();
      expect(names).toContain('test');
    });

    it('should await async once handlers', async () => {
      // Tests lines 99-100: pushing promises from once handlers
      let result = '';
      const promise = new Promise<void>((resolve) => {
        bus.once('async', async () => {
          await new Promise(r => setTimeout(r, 10));
          result = 'async-done';
          resolve();
        });
      });

      await bus.emit('async');
      await promise; // Wait for the async handler to complete

      expect(result).toBe('async-done');
    });
  });
});
