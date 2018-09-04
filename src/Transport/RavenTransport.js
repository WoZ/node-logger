'use strict';

const _       = require('lodash');
const clone   = require('clone');
const winston = require('winston');
const Raven   = require('raven');

Raven.disableConsoleAlerts();

class RavenTransport extends winston.Transport {
    /**
     * @param {Object} options
     * @param {Raven.Client} options.raven
     */
    constructor(options) {
        super(options);

        this._raven  = options.raven;
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

        let metaError;

        try {
            metaError = clone(meta);
        } catch (error) {
            process.nextTick(() => this.emit('error', error));

            return callback ? callback(error) : undefined;
        }

        const ravenMeta = {
            level: this._levels.get(level)
        };

        if (metaError.extra) {
            ravenMeta.extra = metaError.extra;
            delete metaError.extra;
        }

        this._raven.captureException(metaError, ravenMeta, (err) => {
            if (err) {
                process.nextTick(() => this.emit('error', err));

                return callback ? callback(err) : undefined;
            }

            this.emit('logged');

            if (callback) {
                callback(null, true);
            }
        });
    }

    /**
     * @param {Object} configOptions
     */
    static getOptions(configOptions) {
        const options = _.cloneDeep(configOptions);

        options.name             = 'raven';
        options.handleExceptions = options.handleExceptions || false;

        const raven = new Raven.Client(options.sentryDsn || undefined);

        raven.install();

        options.raven = raven;

        return options;
    }
}

module.exports = RavenTransport;
