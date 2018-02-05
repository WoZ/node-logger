'use strict';

require('app-module-path').addPath(__dirname);

const LoggerFactory            = require('src/Factory/LoggerFactory');
const LoggerWithContextFactory = require('src/Factory/LoggerWithContextFactory');
const ErrorFormatterFactory    = require('src/Factory/ErrorFormatterFactory');

module.exports = {
    LoggerFactory,
    LoggerWithContextFactory,
    ErrorFormatterFactory
};
