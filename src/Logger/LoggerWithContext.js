'use strict';

class LoggerWithContext {
    /**
     * @param {String} ctx
     * @param {winston.Logger} logger
     */
    constructor(ctx, logger) {
        this._logger = logger;
        this._ctx = ctx;
    }

    log(level, message, ...args) {
        const msg = this._ctx + ': ' + message;
        this._logger.log(level, msg, ...args);
    }

    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

module.exports = LoggerWithContext;
