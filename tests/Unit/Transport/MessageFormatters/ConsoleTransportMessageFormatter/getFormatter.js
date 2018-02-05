'use strict';

const {assert} = require('chai');

const {ConsoleTransportMessageFormatter} = require('../../../../../src/Transport/MessageFormatters');

describe('src/Transport/ConsoleTransportMessageFormatter::getFormatter', () => {
    it('must return correct method to format log', () => {
        const result = ConsoleTransportMessageFormatter.getFormatter();

        assert.equal(result, ConsoleTransportMessageFormatter._formatter);
    });
});
