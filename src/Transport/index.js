'use strict';

const ConsoleTransport  = require('./ConsoleTransport');
const FileTransport     = require('./FileTransport');
const SentryTransport   = require('./SentryTransport');
const LogstashTransport = require('./LogstashTransport');

module.exports = {
    ConsoleTransport,
    FileTransport,
    SentryTransport,
    LogstashTransport
};
