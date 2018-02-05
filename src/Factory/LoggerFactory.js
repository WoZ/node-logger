'use strict';

const winston = require('winston');

const {
    RavenTransport,
    ConsoleTransport,
    FileTransport
} = require('../Transport');

class LoggerFactory {
    /**
     * @return {winston.Logger}
     */
    create(config) {
        const logger = new winston.Logger({
            exitOnError: false,
            emitErrs:    true
        });

        Object.keys(config).forEach(transport => {
            const configOptions = config[transport];

            switch(transport) {
                case 'console':
                    logger.add(ConsoleTransport, ConsoleTransport.getOptions(configOptions));
                    break;
                case 'file':
                    logger.add(FileTransport, FileTransport.getOptions(configOptions));
                    break;
                case 'raven':
                    logger.add(RavenTransport, RavenTransport.getOptions(configOptions));
                    break;
                default:
                    throw new Error(`Unknown "${transport}" transport found.`);
            }
        });

        return logger;
    }
}

module.exports = LoggerFactory;
