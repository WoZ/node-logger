'use strict';

const _             = require('lodash');
const dgram         = require('dgram');
const cycle         = require('cycle');
const clone         = require('clone');
const winston       = require('winston');
const winstonCommon = require('winston/lib/winston/common');
const {lookup}      = require('lookup-dns-cache');

const {LogstashTransportMessageFormatter} = require('./MessageFormatters');
const {timestampFormatter}                = require('../Helpers');

class LogstashTransport extends winston.Transport {
    /**
     * @param {Object} options
     */
    constructor(options) {
        super(options);

        this._options    = options;
        this._connection = this._createConnection();
    }

    /**
     * @param {string} level
     * @param {string} message
     * @param {object} meta
     * @param {function} callback
     */
    log(level, message, meta, callback = () => {}) {
        meta = meta ? cycle.decycle(clone(meta)) : {};

        if (this.silent) {
            return callback(null, true);
        }

        const logEntry = winstonCommon.log({
            level: level,
            message: message,
            meta: meta,
            timestamp: this._options.timestamp,
            formatter: this._options.formatter
        });

        this._sendLog(logEntry, error => {
            if (error) {
                process.nextTick(() => this.emit('error', error));

                return callback(error);
            }

            this.emit('logged');

            callback(null, true);
        });
    }

    /**
     * @returns {Object}
     * @private
     */
    _createConnection() {
        const options = {
            type: this._options.udpType,
            lookup
        };

        return dgram
            .createSocket(options)
            .unref()
            .on('error', error => process.nextTick(() => this.emit('error', error)));
    }

    /**
     * @param {string}   message
     * @param {function} callback
     * @private
     */
    _sendLog(message, callback) {
        const messageBuffer = new Buffer(message);
        const offset        = 0;
        const length        = messageBuffer.length;
        const host          = this._options.host;
        const port          = this._options.port;

        this._connection.send(messageBuffer, offset, length, port, host, callback);
    }

    /**
     * @param {Object} configOptions
     */
    static getOptions(configOptions) {
        const options = _.cloneDeep(configOptions);

        options.name      = 'logstash';
        options.level     = options.level || 'debug';
        options.host      = options.host || (options.udpType === 'udp6' ? '::1' : '127.0.0.1');
        options.port      = options.port || 5044;
        options.udpType   = options.udpType === 'udp6' ? 'udp6' : 'udp4';
        options.timestamp = timestampFormatter();
        options.formatter = LogstashTransportMessageFormatter.getFormatter();

        return options;
    }
}

module.exports = LogstashTransport;
