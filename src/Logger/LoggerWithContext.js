'use strict';

class LoggerWithContext {
    /**
     * @param {String} context
     * @param {Logger} logger
     */
    constructor(context, logger) {
        this._logger  = logger;
        this._context = context;
    }

    /**
     * @param {string} level
     * @param {string} message
     * @param {{}} args
     */
    log(level, message, ...args) {
        const msg = this._context + ': ' + message;

        this._logger.log(level, msg, ...args);
    }

    /**
     * @param {string} message
     * @param {{}} args
     */
    error(message, ...args) {
        this.log('error', message, ...args);
    }

    /**
     * @param {string} message
     * @param {{}} args
     */
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    /**
     * @param {string} message
     * @param {{}} args
     */
    info(message, ...args) {
        this.log('info', message, ...args);
    }

    /**
     * @param {string} message
     * @param {{}} args
     */
    verbose(message, ...args) {
        this.log('verbose', message, ...args);
    }

    /**
     * @param {string} message
     * @param {{}} args
     */
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    /**
     * @param {string} message
     * @param {{}} args
     */
    silly(message, ...args) {
        this.log('silly', message, ...args);
    }
}

module.exports = LoggerWithContext;
