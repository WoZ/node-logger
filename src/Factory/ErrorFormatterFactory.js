'use strict';

const util = require('util');

class ErrorFormatterFactory {
    /**
     * @return {Function}
     */
    create() {
        /**
         * This function create object that used for write logs outside Logger instances.
         *
         * @param {string} type
         * @param {Error} error
         * @return {{message: string, formattedMessage: string, formattedException: string}}
         */
        return (type, error) => {
            const date             = new Date().toISOString();
            const message          = error.message || error;
            const formattedMessage = `[${date}] ${type}: ${message}`;

            return {
                message:            message,
                formattedMessage:   formattedMessage,
                formattedException: util.inspect(error, {depth: 2})
            };
        };
    }
}

module.exports = ErrorFormatterFactory;
