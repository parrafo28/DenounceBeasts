/**
 * Advanced Logging Utility
 * Provides structured logging with different levels and contexts
 */

class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.currentLevel = this.levels[AppConfig.development.logLevel] || this.levels.info;
        this.enableLogging = AppConfig.development.enableLogging;
    }

    _log(level, message, data = null) {
        if (!this.enableLogging || this.levels[level] < this.currentLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            context: this.context,
            message,
            data
        };

        const styles = {
            debug: 'color: #6c757d',
            info: 'color: #17a2b8',
            warn: 'color: #ffc107; font-weight: bold',
            error: 'color: #dc3545; font-weight: bold'
        };

        const prefix = `%c[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
        
        if (data) {
            console[level](prefix, styles[level], message, data);
        } else {
            console[level](prefix, styles[level], message);
        }

        // Store in session storage for debugging
        this._storeLog(logEntry);
    }

    _storeLog(logEntry) {
        try {
            const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            sessionStorage.setItem('app_logs', JSON.stringify(logs));
        } catch (error) {
            // Ignore storage errors
        }
    }

    debug(message, data) {
        this._log('debug', message, data);
    }

    info(message, data) {
        this._log('info', message, data);
    }

    warn(message, data) {
        this._log('warn', message, data);
    }

    error(message, data) {
        this._log('error', message, data);
    }

    // Create a child logger with extended context
    child(additionalContext) {
        return new Logger(`${this.context}:${additionalContext}`);
    }

    // Get all stored logs
    getLogs() {
        try {
            return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
        } catch {
            return [];
        }
    }

    // Clear all logs
    clearLogs() {
        sessionStorage.removeItem('app_logs');
    }

    // Export logs as downloadable file
    exportLogs() {
        const logs = this.getLogs();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Create default logger instance
const logger = new Logger('DenounceBeasts');

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Logger, logger };
} else {
    window.Logger = Logger;
    window.logger = logger;
}