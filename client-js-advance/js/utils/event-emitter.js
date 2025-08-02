/**
 * Advanced Event System
 * Custom event emitter for application-wide communication
 */

class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
        this.logger = logger.child('Events');
    }

    /**
     * Add event listener
     */
    on(eventName, listener, options = {}) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listeners = this.events.get(eventName);
        
        // Check max listeners limit
        if (listeners.length >= this.maxListeners && !options.ignoreLimit) {
            this.logger.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${eventName}`);
        }

        const listenerInfo = {
            listener,
            once: options.once || false,
            priority: options.priority || 0,
            context: options.context || null,
            id: options.id || Utils.generateId('listener')
        };

        listeners.push(listenerInfo);

        // Sort by priority (higher priority first)
        listeners.sort((a, b) => b.priority - a.priority);

        this.logger.debug(`Listener added for event: ${eventName}`, { 
            listenerId: listenerInfo.id,
            totalListeners: listeners.length 
        });

        return listenerInfo.id;
    }

    /**
     * Add one-time event listener
     */
    once(eventName, listener, options = {}) {
        return this.on(eventName, listener, { ...options, once: true });
    }

    /**
     * Remove event listener
     */
    off(eventName, listenerOrId) {
        if (!this.events.has(eventName)) {
            return false;
        }

        const listeners = this.events.get(eventName);
        let removedCount = 0;

        if (typeof listenerOrId === 'string') {
            // Remove by ID
            const index = listeners.findIndex(l => l.id === listenerOrId);
            if (index !== -1) {
                listeners.splice(index, 1);
                removedCount = 1;
            }
        } else if (typeof listenerOrId === 'function') {
            // Remove by function reference
            for (let i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].listener === listenerOrId) {
                    listeners.splice(i, 1);
                    removedCount++;
                }
            }
        }

        // Clean up empty event arrays
        if (listeners.length === 0) {
            this.events.delete(eventName);
        }

        if (removedCount > 0) {
            this.logger.debug(`Removed ${removedCount} listener(s) for event: ${eventName}`);
        }

        return removedCount > 0;
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(eventName) {
        if (eventName) {
            const had = this.events.has(eventName);
            this.events.delete(eventName);
            
            if (had) {
                this.logger.debug(`All listeners removed for event: ${eventName}`);
            }
            
            return had;
        } else {
            const eventCount = this.events.size;
            this.events.clear();
            
            if (eventCount > 0) {
                this.logger.debug(`All listeners removed for all events (${eventCount} events)`);
            }
            
            return eventCount > 0;
        }
    }

    /**
     * Emit event
     */
    async emit(eventName, data = null, options = {}) {
        const startTime = performance.now();
        
        if (!this.events.has(eventName)) {
            this.logger.debug(`No listeners for event: ${eventName}`);
            return { listenerCount: 0, errors: [] };
        }

        const listeners = this.events.get(eventName);
        const errors = [];
        let successCount = 0;

        const eventData = {
            type: eventName,
            data,
            timestamp: Date.now(),
            target: this,
            preventDefault: false,
            stopPropagation: false
        };

        this.logger.debug(`Emitting event: ${eventName}`, { 
            listenerCount: listeners.length,
            data 
        });

        // Execute listeners
        for (let i = 0; i < listeners.length; i++) {
            const listenerInfo = listeners[i];
            
            try {
                // Check if propagation was stopped
                if (eventData.stopPropagation && !options.ignoreStopPropagation) {
                    break;
                }

                const context = listenerInfo.context || this;
                
                // Execute listener
                const result = listenerInfo.listener.call(context, eventData);
                
                // Handle async listeners
                if (result instanceof Promise) {
                    if (options.async !== false) {
                        await result;
                    }
                }

                successCount++;

                // Remove one-time listeners
                if (listenerInfo.once) {
                    listeners.splice(i, 1);
                    i--; // Adjust index after removal
                }

            } catch (error) {
                errors.push({
                    listenerId: listenerInfo.id,
                    error: error.message,
                    stack: error.stack
                });

                this.logger.error(`Listener error for event: ${eventName}`, {
                    listenerId: listenerInfo.id,
                    error: error.message
                });

                // Continue with other listeners unless specified otherwise
                if (options.stopOnError) {
                    break;
                }
            }
        }

        // Clean up empty event arrays
        if (listeners.length === 0) {
            this.events.delete(eventName);
        }

        const duration = performance.now() - startTime;
        
        this.logger.debug(`Event completed: ${eventName}`, {
            duration: `${duration.toFixed(2)}ms`,
            successCount,
            errorCount: errors.length
        });

        return {
            listenerCount: listeners.length + successCount, // Include removed once listeners
            successCount,
            errorCount: errors.length,
            errors,
            duration
        };
    }

    /**
     * Get event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Get listener count for event
     */
    listenerCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).length : 0;
    }

    /**
     * Get all listeners for event
     */
    listeners(eventName) {
        if (!this.events.has(eventName)) {
            return [];
        }
        
        return this.events.get(eventName).map(l => ({
            id: l.id,
            once: l.once,
            priority: l.priority,
            context: l.context
        }));
    }

    /**
     * Set max listeners limit
     */
    setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0) {
            throw new TypeError('Max listeners must be a non-negative number');
        }
        this.maxListeners = n;
        this.logger.debug(`Max listeners set to: ${n}`);
    }

    /**
     * Create namespaced emitter
     */
    namespace(prefix) {
        return new NamespacedEmitter(this, prefix);
    }

    /**
     * Add middleware for event processing
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new TypeError('Middleware must be a function');
        }

        // Store original emit
        const originalEmit = this.emit.bind(this);

        // Wrap emit with middleware
        this.emit = async function(eventName, data, options) {
            try {
                // Execute middleware
                const result = await middleware(eventName, data, options);
                
                // If middleware returns false, stop emission
                if (result === false) {
                    return { listenerCount: 0, errors: [], middleware: 'stopped' };
                }

                // If middleware returns modified data, use it
                const modifiedData = result && typeof result === 'object' ? result : data;
                
                return await originalEmit(eventName, modifiedData, options);
            } catch (error) {
                this.logger.error('Middleware error', error);
                throw error;
            }
        }.bind(this);
    }

    /**
     * Get statistics
     */
    getStats() {
        const stats = {
            totalEvents: this.events.size,
            totalListeners: 0,
            events: {}
        };

        for (const [eventName, listeners] of this.events.entries()) {
            stats.totalListeners += listeners.length;
            stats.events[eventName] = {
                listenerCount: listeners.length,
                listeners: listeners.map(l => ({
                    id: l.id,
                    once: l.once,
                    priority: l.priority
                }))
            };
        }

        return stats;
    }
}

/**
 * Namespaced Event Emitter
 */
class NamespacedEmitter {
    constructor(parentEmitter, namespace) {
        this.parent = parentEmitter;
        this.namespace = namespace;
    }

    _namespacedEvent(eventName) {
        return `${this.namespace}:${eventName}`;
    }

    on(eventName, listener, options) {
        return this.parent.on(this._namespacedEvent(eventName), listener, options);
    }

    once(eventName, listener, options) {
        return this.parent.once(this._namespacedEvent(eventName), listener, options);
    }

    off(eventName, listenerOrId) {
        return this.parent.off(this._namespacedEvent(eventName), listenerOrId);
    }

    emit(eventName, data, options) {
        return this.parent.emit(this._namespacedEvent(eventName), data, options);
    }

    removeAllListeners(eventName) {
        if (eventName) {
            return this.parent.removeAllListeners(this._namespacedEvent(eventName));
        } else {
            // Remove all listeners for this namespace
            const events = this.parent.eventNames()
                .filter(name => name.startsWith(`${this.namespace}:`));
            
            let removed = 0;
            events.forEach(event => {
                if (this.parent.removeAllListeners(event)) {
                    removed++;
                }
            });
            
            return removed > 0;
        }
    }
}

// Create global event emitter
const eventBus = new EventEmitter();

// Application-specific events
const AppEvents = {
    // Data events
    DATA_LOADED: 'data:loaded',
    DATA_LOADING: 'data:loading',
    DATA_ERROR: 'data:error',
    DATA_UPDATED: 'data:updated',
    DATA_DELETED: 'data:deleted',
    DATA_CREATED: 'data:created',

    // UI events
    UI_MODAL_OPENED: 'ui:modal:opened',
    UI_MODAL_CLOSED: 'ui:modal:closed',
    UI_NOTIFICATION_SHOW: 'ui:notification:show',
    UI_PAGE_CHANGED: 'ui:page:changed',
    UI_FILTER_CHANGED: 'ui:filter:changed',

    // Form events
    FORM_SUBMITTED: 'form:submitted',
    FORM_VALIDATED: 'form:validated',
    FORM_ERROR: 'form:error',

    // Network events
    NETWORK_ONLINE: 'network:online',
    NETWORK_OFFLINE: 'network:offline',

    // Cache events
    CACHE_CLEARED: 'cache:cleared',
    CACHE_INVALIDATED: 'cache:invalidated'
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventEmitter, NamespacedEmitter, eventBus, AppEvents };
} else {
    window.EventEmitter = EventEmitter;
    window.NamespacedEmitter = NamespacedEmitter;
    window.eventBus = eventBus;
    window.AppEvents = AppEvents;
}