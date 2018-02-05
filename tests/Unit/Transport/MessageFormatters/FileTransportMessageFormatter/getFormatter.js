'use strict';

const {assert} = require('chai');

const {FileTransportMessageFormatter} = require('../../../../../src/Transport/MessageFormatters');

describe('src/Transport/MessageFormatters/FileTransportMessageFormatter::getFormatter', () => {
    it('must return correct method to format log', () => {
        const result = FileTransportMessageFormatter.getFormatter();

        assert.equal(result, FileTransportMessageFormatter._formatter);
    });
});
