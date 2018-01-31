'use strict';

require('app-module-path').addPath(__dirname);

const LoggerFactory            = require('src/Factories/LoggerFactory');
const LoggerWithContextFactory = require('src/Factories/LoggerWithContextFactory');

module.exports = {
    LoggerFactory,
    LoggerWithContextFactory
};
