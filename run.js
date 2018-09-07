'use strict';

const config = {
    console: {
        level: 'debug'
    },
    file: {
        level: 'debug',
        filename: 'test_log'
    },
    raven: {
        level: 'error',
        sentryDsn: ''
    },
    logstash: {
        port: 5042,
        host: '78.140.186.237'
    }
};
const {
    Logger,
    ErrorFormatterFactory
} = require('./index');

const ExtendableError = require('./tests/Helpers/ExtendableError');

const logger            = new Logger(config);
const loggerWithContext = logger.withContext('context');
const errorFormatter    = new ErrorFormatterFactory().create();

logger.on('error', (err, transport) => {
    console.log('LOGGER ERROR');
    console.log(err);
    console.log(transport);
});

const error = new Error('OLEH - error message', {name: "Oleh"});
const err = new ExtendableError('ExtendableError OLEH', {error, id: 2});

logger.info('OLEH - info', {userId: "\''''#$%^&*()"});
logger.warn('OLEH - warn', error);
logger.warn('OLEH - kek', {error});
logger.error('OLEH - error', err);
logger.error('OLEH - lol');

//loggerWithContext.error(error.message, error);
/*
console.log(
    errorFormatter('some type', error)
);*/