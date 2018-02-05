'use strict';

const _       = require('lodash');
const winston = require('winston');

const {FileTransportMessageFormatter} = require('./MessageFormatters');
const {timestampFormatter}            = require('../Helpers');

require('winston-daily-rotate-file');

class FileTransport extends winston.transports.DailyRotateFile {
    /**
     * @param {Object} configOptions
     */
    static getOptions(configOptions) {
        const options = _.cloneDeep(configOptions);

        if (!options.filename) {
            throw new Error('File name is required for FileTransport');
        }

        options.prepend          = options.prepend || true;
        options.json             = options.json || false;
        options.datePattern      = options.datePattern || 'yyyy-MM-dd.';
        options.handleExceptions = options.handleExceptions || false;
        options.level            = options.level || 'debug';

        return Object.assign({}, options, {
            timestamp: timestampFormatter(),
            formatter: FileTransportMessageFormatter.getFormatter()
        });
    }
}

module.exports = FileTransport;
