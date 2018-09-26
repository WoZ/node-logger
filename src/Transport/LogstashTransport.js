'use strict';

const _             = require('lodash');
const os            = require('os');
const dgram         = require('dgram');
const dns           = require('dns');
const clone         = require('clone');
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
        meta = meta ? clone(meta) : {};

        if (this.silent) {
            return callback(null, true);
        }

        const logEntry = this._formatMessage(level, message, meta);

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
     * @param {string} level
     * @param {string} message
     * @param {*} meta
     * @returns {string}
     * @private
     */
    _formatMessage(level, message, meta) {
        const winstonOptions = {
            message: message,
            level: level,
            meta: meta,
            timestamp: this._options.timestamp,
            formatter: this._options.formatter
        };

        const output = winstonCommon.log(winstonOptions);

        const logstashOutput = {
            level: level,
            hostname: this._options.hostname,
            '@message': output,
            '@timestamp': this._options.timestamp(),
        };

        return JSON.stringify(logstashOutput);
    }

    /**
     * @returns {Object}
     * @private
     */
    _createConnection() {
        const options = {
            type: this._options.udpType,
            lookup: this._lookup
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
        const messageBuffer = Buffer.from(message);
        const offset        = 0;
        const length        = messageBuffer.length;
        const host          = this._options.host;
        const port          = this._options.port;

        this._connection.send(messageBuffer, offset, length, port, host, callback);
    }

    /**
     * Custom lookup function for dgram.Socket
     *
     * @param {string} hostname
     * @param {Object} options
     * @param {Function} callback
     * @throws {Error}
     * @returns {{}|undefined}
     * @private
     */
    _lookup(hostname, options, callback) {
        lookup(hostname, options, (error, result) => {
            // Therefore we use additional DNS::lookup() if the lookup of the hostname in DNS records throws error.
            //
            // This decision is based on a DNS module implementation considerations
            // https://nodejs.org/dist/latest-v8.x/docs/api/dns.html#dns_implementation_considerations.
            // It is caused by an internal implementation of methods dgram.Socket::send() that calls method
            // dgram.Socket::bind() for listening on address '0.0.0.0' if it wasn't called previously.
            // For a different OS configuration, this could be a point of failure.
            if (error && error.code === dns.NOTFOUND) {
                return dns.lookup(hostname, options, callback);
            }

            return callback(error, result);
        });
    }

    /**
     * @param {Object} configOptions
     */
    static getOptions(configOptions) {
        const options = _.cloneDeep(configOptions);

        options.name      = 'logstash';
        options.level     = options.level || 'debug';
        options.hostname  = options.hostname || process.env.HOSTNAME || os.hostname();
        options.host      = options.host || (options.udpType === 'udp6' ? '::1' : '127.0.0.1');
        options.port      = options.port || 5044;
        options.udpType   = options.udpType === 'udp6' ? 'udp6' : 'udp4';
        options.timestamp = () => new Date().toISOString();
        options.formatter = LogstashTransportMessageFormatter.getFormatter();

        return options;
    }
}

module.exports = LogstashTransport;
