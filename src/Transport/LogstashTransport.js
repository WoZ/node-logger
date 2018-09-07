'use strict';

const _             = require('lodash');
const dgram         = require('dgram');
const winston       = require('winston');
const winstonCommon = require('winston/lib/winston/common');
const {lookup}      = require('lookup-dns-cache');

const {LogstashTransportMessageFormatter} = require('./MessageFormatters');

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
        if (this.silent) {
            return callback(null, true);
        }

        const logEntry = this._formatMessage({
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
     * @param {Object} options
     * @param {string} options.level
     * @param {string} options.message
     * @param {*} [options.meta]
     * @param {function} options.timestamp
     * @param {function} options.formatter
     * @returns {string}
     * @private
     */
    _formatMessage(options) {
        const output = winstonCommon.log(options);

        const logstashOutput = {
            '@message': output,
            '@timestamp': this._options.timestamp(),
            '@fields': {
                level: options.level
            }
        };

        return JSON.stringify(logstashOutput, function (key, value) {
            return value instanceof Buffer
                ? value.toString('base64')
                : value;
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
        options.timestamp = () => new Date().toISOString();
        options.formatter = LogstashTransportMessageFormatter.getFormatter();

        return options;
    }
}

module.exports = LogstashTransport;
