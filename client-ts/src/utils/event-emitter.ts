/**
 * Advanced Event Emitter
 * Type-safe event system with priority queuing and async support
 */

import type { AppEvent, EventListener, EventEmitterOptions } from '@/types';
import { logger } from './logger';
import { generateUUID } from './helpers';

interface ListenerInfo<T = unknown> {
  id: string;
  listener: EventListener<T>;
  options: EventEmitterOptions;
  addedAt: number;
}

export class EventEmitter {
  private listeners: Map<string, ListenerInfo[]> = new Map();
  private maxListeners = 50;
  private isDestroyed = false;

  /**
   * Add event listener
   */
  on<T = unknown>(
    eventType: string,
    listener: EventListener<T>,
    options: EventEmitterOptions = {}
  ): string {
    if (this.isDestroyed) {
      logger.warn('Cannot add listener to destroyed event emitter', { eventType });
      return '';
    }

    const listenerId = options.id || generateUUID();
    const listenerInfo: ListenerInfo<T> = {
      id: listenerId,
      listener,
      options,
      addedAt: Date.now()
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const eventListeners = this.listeners.get(eventType)!;

    // Check max listeners limit
    if (eventListeners.length >= this.maxListeners) {
      logger.warn('Max listeners exceeded for event type', { eventType, maxListeners: this.maxListeners });
      return '';
    }

    // Insert listener based on priority (higher priority first)
    const priority = options.priority || 0;
    let insertIndex = eventListeners.length;

    for (let i = 0; i < eventListeners.length; i++) {
      const existingPriority = eventListeners[i].options.priority || 0;
      if (priority > existingPriority) {
        insertIndex = i;
        break;
      }
    }

    eventListeners.splice(insertIndex, 0, listenerInfo);

    logger.debug('Event listener added', { 
      eventType, 
      listenerId, 
      priority, 
      totalListeners: eventListeners.length 
    });

    return listenerId;
  }

  /**
   * Add one-time event listener
   */
  once<T = unknown>(
    eventType: string,
    listener: EventListener<T>,
    options: EventEmitterOptions = {}
  ): string {
    return this.on(eventType, listener, { ...options, once: true });
  }

  /**
   * Remove specific event listener
   */
  off(eventType: string, listenerId: string): boolean {
    if (this.isDestroyed) {
      return false;
    }

    const eventListeners = this.listeners.get(eventType);
    if (!eventListeners) {
      return false;
    }

    const index = eventListeners.findIndex(info => info.id === listenerId);
    if (index === -1) {
      return false;
    }

    eventListeners.splice(index, 1);

    // Clean up empty listener arrays
    if (eventListeners.length === 0) {
      this.listeners.delete(eventType);
    }

    logger.debug('Event listener removed', { eventType, listenerId });
    return true;
  }

  /**
   * Remove all listeners for an event type
   */
  removeAllListeners(eventType?: string): void {
    if (this.isDestroyed) {
      return;
    }

    if (eventType) {
      const count = this.listeners.get(eventType)?.length || 0;
      this.listeners.delete(eventType);
      logger.debug('All listeners removed for event type', { eventType, count });
    } else {
      const totalCount = Array.from(this.listeners.values())
        .reduce((sum, listeners) => sum + listeners.length, 0);
      this.listeners.clear();
      logger.debug('All listeners removed', { totalCount });
    }
  }

  /**
   * Emit event to all listeners
   */
  async emit<T = unknown>(eventType: string, data: T, target?: unknown): Promise<void> {
    if (this.isDestroyed) {
      logger.warn('Cannot emit event from destroyed event emitter', { eventType });
      return;
    }

    const eventListeners = this.listeners.get(eventType);
    if (!eventListeners || eventListeners.length === 0) {
      logger.debug('No listeners for event type', { eventType });
      return;
    }

    const event: AppEvent<T> = {
      type: eventType,
      data,
      timestamp: Date.now(),
      target: target || this,
      preventDefault: false,
      stopPropagation: false
    };

    const listenersToRemove: string[] = [];

    // Execute listeners in priority order
    for (const listenerInfo of [...eventListeners]) {
      if (event.stopPropagation) {
        logger.debug('Event propagation stopped', { eventType });
        break;
      }

      try {
        const startTime = performance.now();
        
        // Execute listener with context binding
        const result = listenerInfo.options.context
          ? listenerInfo.listener.call(listenerInfo.options.context, event)
          : listenerInfo.listener(event);

        // Handle async listeners
        if (result && typeof result.then === 'function') {
          await result;
        }

        const duration = performance.now() - startTime;
        
        logger.debug('Event listener executed', {
          eventType,
          listenerId: listenerInfo.id,
          duration: `${duration.toFixed(2)}ms`
        });

        // Remove one-time listeners
        if (listenerInfo.options.once) {
          listenersToRemove.push(listenerInfo.id);
        }

      } catch (error) {
        logger.error('Error in event listener', {
          eventType,
          listenerId: listenerInfo.id,
          error
        });

        // Optionally remove listeners that throw errors
        if (process.env.NODE_ENV === 'development') {
          listenersToRemove.push(listenerInfo.id);
        }
      }
    }

    // Remove one-time and errored listeners
    listenersToRemove.forEach(listenerId => {
      this.off(eventType, listenerId);
    });

    logger.debug('Event emitted', {
      eventType,
      listenerCount: eventListeners.length,
      dataSize: JSON.stringify(data).length
    });
  }

  /**
   * Emit event synchronously (non-blocking)
   */
  emitSync<T = unknown>(eventType: string, data: T, target?: unknown): void {
    // Use setTimeout to make it non-blocking
    setTimeout(() => {
      this.emit(eventType, data, target).catch(error => {
        logger.error('Error in async event emission', { eventType, error });
      });
    }, 0);
  }

  /**
   * Get listener count for event type
   */
  listenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.length || 0;
  }

  /**
   * Get all event types with listeners
   */
  eventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener info for debugging
   */
  getListenerInfo(eventType: string): Array<{ id: string; priority: number; addedAt: number }> {
    const eventListeners = this.listeners.get(eventType);
    if (!eventListeners) {
      return [];
    }

    return eventListeners.map(info => ({
      id: info.id,
      priority: info.options.priority || 0,
      addedAt: info.addedAt
    }));
  }

  /**
   * Set maximum number of listeners per event type
   */
  setMaxListeners(max: number): void {
    this.maxListeners = Math.max(1, max);
    logger.debug('Max listeners updated', { maxListeners: this.maxListeners });
  }

  /**
   * Check if event emitter has listeners for event type
   */
  hasListeners(eventType: string): boolean {
    return this.listenerCount(eventType) > 0;
  }

  /**
   * Wait for specific event to be emitted
   */
  waitFor<T = unknown>(
    eventType: string,
    timeout = 5000,
    filter?: (data: T) => boolean
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
      let listenerId: string;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (listenerId) this.off(eventType, listenerId);
      };

      // Set timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeout);

      // Add listener
      listenerId = this.once(eventType, (event: AppEvent<T>) => {
        if (!filter || filter(event.data)) {
          cleanup();
          resolve(event.data);
        }
      });
    });
  }

  /**
   * Create a filtered event stream
   */
  filter<T = unknown>(
    eventType: string,
    filterFn: (data: T) => boolean
  ): EventEmitter {
    const filteredEmitter = new EventEmitter();

    this.on(eventType, (event: AppEvent<T>) => {
      if (filterFn(event.data)) {
        filteredEmitter.emitSync(eventType, event.data, event.target);
      }
    });

    return filteredEmitter;
  }

  /**
   * Map event data through a transformation function
   */
  map<T = unknown, U = unknown>(
    eventType: string,
    mapFn: (data: T) => U
  ): EventEmitter {
    const mappedEmitter = new EventEmitter();

    this.on(eventType, async (event: AppEvent<T>) => {
      try {
        const mappedData = await mapFn(event.data);
        mappedEmitter.emitSync(eventType, mappedData, event.target);
      } catch (error) {
        logger.error('Error mapping event data', { eventType, error });
      }
    });

    return mappedEmitter;
  }

  /**
   * Throttle events to limit emission rate
   */
  throttle(eventType: string, limit: number): EventEmitter {
    const throttledEmitter = new EventEmitter();
    let lastEmitted = 0;

    this.on(eventType, (event: AppEvent) => {
      const now = Date.now();
      if (now - lastEmitted >= limit) {
        lastEmitted = now;
        throttledEmitter.emitSync(eventType, event.data, event.target);
      }
    });

    return throttledEmitter;
  }

  /**
   * Debounce events to delay emission
   */
  debounce(eventType: string, delay: number): EventEmitter {
    const debouncedEmitter = new EventEmitter();
    let timeoutId: NodeJS.Timeout;

    this.on(eventType, (event: AppEvent) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        debouncedEmitter.emitSync(eventType, event.data, event.target);
      }, delay);
    });

    return debouncedEmitter;
  }

  /**
   * Get statistics about the event emitter
   */
  getStats(): {
    totalListeners: number;
    eventTypes: number;
    maxListeners: number;
    listenersByType: Record<string, number>;
  } {
    const listenersByType: Record<string, number> = {};
    let totalListeners = 0;

    this.listeners.forEach((listeners, eventType) => {
      listenersByType[eventType] = listeners.length;
      totalListeners += listeners.length;
    });

    return {
      totalListeners,
      eventTypes: this.listeners.size,
      maxListeners: this.maxListeners,
      listenersByType
    };
  }

  /**
   * Destroy event emitter and cleanup all listeners
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    const stats = this.getStats();
    this.removeAllListeners();
    this.isDestroyed = true;

    logger.info('Event emitter destroyed', stats);
  }
}

// Create and export default event emitter instance
export const eventBus = new EventEmitter();

// Export commonly used event types
export const EVENT_TYPES = {
  // Data events
  DATA_LOADED: 'data:loaded',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',
  DATA_ERROR: 'data:error',

  // UI events
  UI_LOADING: 'ui:loading',
  UI_ERROR: 'ui:error',
  UI_SUCCESS: 'ui:success',
  UI_MODAL_OPEN: 'ui:modal:open',
  UI_MODAL_CLOSE: 'ui:modal:close',
  UI_NOTIFICATION: 'ui:notification',

  // Form events
  FORM_SUBMIT: 'form:submit',
  FORM_VALIDATION: 'form:validation',
  FORM_RESET: 'form:reset',
  FORM_FIELD_CHANGE: 'form:field:change',

  // Cache events
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  CACHE_CLEAR: 'cache:clear',

  // API events
  API_REQUEST: 'api:request',
  API_RESPONSE: 'api:response',
  API_ERROR: 'api:error',

  // Authentication events
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_REFRESH: 'auth:token:refresh',

  // Navigation events
  NAVIGATION_CHANGE: 'navigation:change',

  // Application lifecycle
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_DESTROY: 'app:destroy'
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

/**
 * Event emitter decorator for classes
 */
export const withEventEmitter = <T extends { new(...args: any[]): {} }>(constructor: T) => {
  return class extends constructor {
    public eventEmitter = new EventEmitter();

    emit<U = unknown>(eventType: string, data: U): void {
      this.eventEmitter.emitSync(eventType, data, this);
    }

    on<U = unknown>(eventType: string, listener: EventListener<U>, options?: EventEmitterOptions): string {
      return this.eventEmitter.on(eventType, listener, options);
    }

    off(eventType: string, listenerId: string): boolean {
      return this.eventEmitter.off(eventType, listenerId);
    }

    once<U = unknown>(eventType: string, listener: EventListener<U>, options?: EventEmitterOptions): string {
      return this.eventEmitter.once(eventType, listener, options);
    }
  };
};

export default EventEmitter;