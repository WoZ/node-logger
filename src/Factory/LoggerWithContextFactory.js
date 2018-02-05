'use strict';

const LoggerWithContext = require('src/Logger/LoggerWithContext');

class LoggerWithContextFactory {

    /**
     * @params {String} context
     * @params {winston.Logger} logger
     * @return {LoggerWithContext}
     */
    create(context, logger) {
        return new LoggerWithContext(context, logger);
    }
}

module.exports = LoggerWithContextFactory;
