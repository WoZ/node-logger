'use strict';

const util = require('util');

const _     = require('lodash');
const cycle = require('cycle');

class FileTransportMessageFormatter {
    /**
     * @returns {number}
     */
    static get MAX_DEEP_LEVEL_TO_CHECK_ERRORS() {
        return 5;
    }

    /**
     * @returns {Function}
     */
    static getFormatter() {
        return FileTransportMessageFormatter._formatter;
    }

    /**
     * Adjusts meta object to plain object with not "Error.stack" fields.
     * After that returns formatted string for the logger file transport.
     *
     * @param {Object} options
     * @returns {string}
     * @private
     */
    static _formatter(options) {
        const meta         = _.cloneDeep(options.meta) || {};
        const adjustedMeta = FileTransportMessageFormatter._adjustMeta(meta);

        const message = options.message ? (' ' + options.message + '. ') : ' ';

        const stringifiedMeta = Object.keys(adjustedMeta).length > 0 ?
            ('Meta: ' + util.inspect(adjustedMeta, {depth: 4, breakLength: Infinity})) : '';

        return `[${options.timestamp()}][${options.level.toUpperCase()}]${message}${stringifiedMeta}`;
    }

    /**
     * Converts all error object within logObject to plain objects
     * and recursively removes "Error.stack" fields from all of them.
     * If an "extra" field contains "error" field it would be process recursively.
     * After that remove all possible cycles within object and stringify it.
     *
     * @param {Object} logObject
     * @returns {string}
     * @private
     */
    static _adjustMeta(logObject) {
        const convertedLogObject =
                  FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(_.cloneDeep(logObject));

        const convertedLogObjectWithoutStacktraces =
                  FileTransportMessageFormatter._removeStackTraceFromError(_.cloneDeep(convertedLogObject));

        return JSON.stringify(cycle.decycle(convertedLogObjectWithoutStacktraces));
    }

    /**
     * Changes each Error object within logObject to plain object with particular fields (name, message, stack, etc)
     * because "cycle.decycle" and "JSON.stringify" methods make Error objects empty ones.
     *
     * @param {Object} logObject
     * @param {number} [deep=0]
     * @param {Array} [errorPlainObjectsCache=[]] - already converted errors, reduce recursive method calls
     * @returns {Object} - returns the same logObject param
     * @private
     */
    static _convertErrorFieldsToPlainObjects(logObject, deep = 0, errorPlainObjectsCache = []) {
        if (deep >= FileTransportMessageFormatter.MAX_DEEP_LEVEL_TO_CHECK_ERRORS) {
            return logObject;
        }

        Object.keys(logObject).forEach(key => {
            if (_.isError(logObject[key])) {
                const errorPlainObject = FileTransportMessageFormatter._makePlainErrorObject(logObject[key]);

                logObject[key] = errorPlainObject;

                errorPlainObjectsCache.push(errorPlainObject);
            } else if (_.isObject(logObject[key]) && !errorPlainObjectsCache.includes(logObject[key])) {
                FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(
                    logObject[key],
                    deep + 1,
                    errorPlainObjectsCache
                );
            }
        });

        return logObject;
    }

    /**
     * @param {Error} error
     * @returns {Object}
     * @private
     */
    static _makePlainErrorObject(error) {
        const errorPlainObject = {
            name:    error.constructor.name,
            message: error.message,
            stack:   error.stack
        };

        if (error.extra) {
            errorPlainObject.extra = FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(error.extra);
        }

        return errorPlainObject;
    }

    /**
     * @param {Object} error - plain object (with fields: name, message, stack), not Error
     * @returns {Object} - returns the same error param
     * @private
     */
    static _removeStackTraceFromError(error) {
        delete error.stack;

        if (error.extra && error.extra.error) {
            FileTransportMessageFormatter._removeStackTraceFromError(error.extra.error);
        }

        return error;
    }
}

module.exports = FileTransportMessageFormatter;
