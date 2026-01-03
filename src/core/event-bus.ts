/**
 * Event bus for plugin communication
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import type { AnalyzerEvents } from '../types.js';

/**
 * Event listener type
 * @internal
 */
type Listener<T> = (data: T) => void | Promise<void>;

/**
 * Event bus for handling plugin events
 */
export class EventBus<TEvents extends Record<string, unknown> = AnalyzerEvents> {
  /** Registered event listeners */
  private listeners = new Map<keyof TEvents, Set<Listener<unknown>>>();

  /** Once-only listeners */
  private onceListeners = new Map<keyof TEvents, Set<Listener<unknown>>>();

  /**
   * Add event listener
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on<TEvent extends keyof TEvents>(
    event: TEvent,
    handler: Listener<TEvents[TEvent]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as Listener<unknown>);

    // Return unsubscribe function
    return () => {
      this.off(event, handler as Listener<unknown>);
    };
  }

  /**
   * Add one-time event listener
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  once<TEvent extends keyof TEvents>(
    event: TEvent,
    handler: Listener<TEvents[TEvent]>
  ): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    this.onceListeners.get(event)!.add(handler as Listener<unknown>);

    // Return unsubscribe function
    return () => {
      this.onceListeners.get(event)?.delete(handler as Listener<unknown>);
    };
  }

  /**
   * Emit event to all listeners
   * @param event - Event name
   * @param data - Event data
   */
  async emit<TEvent extends keyof TEvents>(
    event: TEvent,
    data: TEvents[TEvent]
  ): Promise<void> {
    const promises: Array<Promise<unknown>> = [];

    // Handle regular listeners
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        const result = (handler as Listener<TEvents[TEvent]>)(data);
        if (result instanceof Promise) {
          promises.push(result);
        }
      }
    }

    // Handle once-only listeners
    const onceHandlers = this.onceListeners.get(event);
    if (onceHandlers) {
      for (const handler of onceHandlers) {
        const result = (handler as Listener<TEvents[TEvent]>)(data);
        if (result instanceof Promise) {
          promises.push(result);
        }
      }
      // Clear once listeners after emission
      onceHandlers.clear();
    }

    // Wait for all async handlers
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Remove event listener(s)
   * @param event - Event name (undefined = remove all)
   * @param handler - Specific handler to remove (undefined = remove all for event)
   */
  off<TEvent extends keyof TEvents>(
    event?: TEvent,
    handler?: Listener<TEvents[TEvent]>
  ): void {
    if (event === undefined) {
      // Remove all listeners
      this.listeners.clear();
      this.onceListeners.clear();
      return;
    }

    if (handler === undefined) {
      // Remove all listeners for event
      this.listeners.delete(event);
      this.onceListeners.delete(event);
      return;
    }

    // Remove specific handler
    this.listeners.get(event)?.delete(handler as Listener<unknown>);
    this.onceListeners.get(event)?.delete(handler as Listener<unknown>);
  }

  /**
   * Get count of listeners for an event
   * @param event - Event name
   */
  listenerCount<TEvent extends keyof TEvents>(event: TEvent): number {
    const regular = this.listeners.get(event)?.size ?? 0;
    const once = this.onceListeners.get(event)?.size ?? 0;
    return regular + once;
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  /**
   * Get all event names with listeners
   */
  eventNames(): Array<keyof TEvents> {
    const names = new Set<keyof TEvents>();

    for (const event of this.listeners.keys()) {
      names.add(event);
    }

    for (const event of this.onceListeners.keys()) {
      names.add(event);
    }

    return Array.from(names);
  }
}
