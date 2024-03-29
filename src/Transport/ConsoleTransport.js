'use strict';

const _       = require('lodash');
const winston = require('winston');

const {ConsoleTransportMessageFormatter} = require('./MessageFormatters');

class ConsoleTransport extends winston.transports.Console {
    /**
     * @param {Object} configOptions
     */
    static getOptions(configOptions) {
        const options = _.cloneDeep(configOptions);

        options.handleExceptions = options.handleExceptions || false;
        options.debug            = options.level || 'debug';

        return Object.assign({}, options, {
            timestamp: () => new Date().toISOString(),
            formatter: ConsoleTransportMessageFormatter.getFormatter(),
        });
    }
}

module.exports = ConsoleTransport;
