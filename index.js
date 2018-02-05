'use strict';

const LoggerFactory            = require('./src/Factory/LoggerFactory');
const LoggerWithContextFactory = require('./src/Factory/LoggerWithContextFactory');
const ErrorFormatterFactory    = require('./src/Factory/ErrorFormatterFactory');

module.exports = {
    LoggerFactory,
    LoggerWithContextFactory,
    ErrorFormatterFactory
};
