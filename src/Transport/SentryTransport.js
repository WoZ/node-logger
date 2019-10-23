'use strict';

const _       = require('lodash');
const clone   = require('clone');
const winston = require('winston');
const Sentry  = require('@sentry/node');

class SentryTransport extends winston.Transport {
    /**
     * @param {Object} options
     * @param {Sentry} options.sentry
     */
    constructor(options) {
        super(options);

        this._sentry = options.sentry;
        this._levels = new Map([
            ['silly', 'debug'],
            ['verbose', 'debug'],
            ['info', 'info'],
            ['debug', 'debug'],
            ['warn', 'warning'],
            ['error', 'error']
        ]);
    }

    /**
     * @param {string} level
     * @param {string} message
     * @param {object} meta
     * @param {function} callback
     */
    log(level, message, meta = {}, callback) {
        if (!(meta instanceof Error)) {
            return;
        }

        try {
            const metaError = clone(meta);

            this._sentry.withScope(scope => {
                scope.setLevel(level);
                scope.setExtras(metaError.extra || {});

                this._sentry.captureException(metaError);
            });

            this.emit('logged');

            if (callback) {
                callback(null, true);
            }
        } catch (error) {
            process.nextTick(() => this.emit('error', error));

            return callback ? callback(error) : undefined;
        }
    }

    /**
     * @param {Object} configOptions
     */
    static getOptions(configOptions) {
        const options = _.cloneDeep(configOptions);

        options.name             = 'sentry';
        options.handleExceptions = options.handleExceptions || false;

        options.sentry = Sentry;
        options.sentry.init({ dsn: options.sentryDsn || undefined });

        return options;
    }
}

module.exports = SentryTransport;
