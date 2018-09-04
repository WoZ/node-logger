'use strict';

const winston = require('winston');

const {
    RavenTransport,
    ConsoleTransport,
    FileTransport,
    LogstashTransport
} = require('../Transport');
const LoggerWithContext = require('./LoggerWithContext');

class Logger extends winston.Logger {
    /**
     * @return {winston.Logger}
     */
    constructor(config) {
        const loggerConfig = {
            exitOnError: false,
            emitErrs: true
        };

        super(loggerConfig);

        const factories = new Map([
            ['console', ConsoleTransport],
            ['file', FileTransport],
            ['raven', RavenTransport],
            ['logstash', LogstashTransport]
        ]);

        Object.keys(config).forEach(transportName => {
            // noinspection JSCheckFunctionSignatures
            const factory = factories.get(transportName);

            if (factory) {
                // The "on error" listener is properly attached to instance only when transport added with "add()" call.
                // See "Logger.prototype.add" and "created" argument usage for details.
                // Must be refactored when moved to winston 3.*.
                this.add(factory, factory.getOptions(config[transportName]));
            } else {
                throw new Error(`Unknown "${transportName}" transport found.`);
            }
        });
    }

    /**
     * @param {string} context
     */
    withContext(context) {
        return new LoggerWithContext(context, this);
    }
}

module.exports = Logger;

/**
 * For IDE code completion.
 * Must be refactored when moved to winston 3.* and ES6.
 */

/**
 * @name Logger#error
 * @function
 * @param {string} message
 * @param {{}} [args]
 */

/**
 * @name Logger#warn
 * @function
 * @param {string} message
 * @param {{}} [args]
 */

/**
 * @name Logger#info
 * @function
 * @param {string} message
 * @param {{}} [args]
 */

/**
 * @name Logger#verbose
 * @function
 * @param {string} message
 * @param {{}} [args]
 */

/**
 * @name Logger#debug
 * @function
 * @param {string} message
 * @param {{}} [args]
 */

/**
 * @name Logger#silly
 * @function
 * @param {string} message
 * @param {{}} [args]
 */
