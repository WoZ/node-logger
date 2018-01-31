'use strict';

const util = require('util');

const _ = require('lodash');

class ConsoleTransportMessageFormatter {
    /**
     * @return {Function}
     */
    static getFormatter() {
        return ConsoleTransportMessageFormatter._formatter;
    }

    /**
     * Add "Error.stack" instances to "Meta" section, using "options.meta.stack" property.
     *
     * The only exception if logger called with Error and meta: "logger(new Error(), {foo: 'bar'})".
     * In this case, "options.message" is stringified Error, and "options.meta" property is {foo: 'bar'}.
     *
     * @param {Object} options
     * @returns {string}
     * @private
     */
    static _formatter(options) {
        const meta     = _.cloneDeep(options.meta) || {};
        let stackTrace = '';

        if (meta.stack) {
            stackTrace = '.\nStack: ' + meta.stack;
            delete meta.stack;
        }

        const message         = options.message ? (' ' + options.message + '. ') : ' ';
        const stringifiedMeta = Object.keys(meta).length > 0 ?
            ('Meta: ' + util.inspect(meta, {depth: 4, breakLength: Infinity}) + stackTrace) :
            '';

        return `[${options.timestamp()}][${options.level.toUpperCase()}]${message}${stringifiedMeta}`;
    }
}

module.exports = ConsoleTransportMessageFormatter;
