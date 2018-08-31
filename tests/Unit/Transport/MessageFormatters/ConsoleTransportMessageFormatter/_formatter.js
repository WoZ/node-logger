'use strict';

const {assert} = require('chai');

const {ExtendableError}                  = require('../../../../Helpers');
const {ConsoleTransportMessageFormatter} = require('../../../../../src/Transport/MessageFormatters');

describe('src/Transport/ConsoleTransportMessageFormatter::_formatter', () => {
    const _options = {
        level:     'error',
        timestamp: () => 'time'
    };

    const testCases = [
        {
            description:    'must correct format error with no options',
            options:        Object.assign({}, _options),
            expectedRegexp: /\[time\]\[ERROR\]\s+/
        },
        {
            description:    'must correct format error just with message option',
            options:        Object.assign({message: 'message'}, _options),
            expectedRegexp: /\[time\]\[ERROR\] message./
        },
        {
            description:    'must correct format error with message and meta (plain object) options',
            options:        Object.assign({message: 'message', meta: {a: 1}}, _options),
            expectedRegexp: /\[time\]\[ERROR\] message. Meta: { a: 1 }/
        },
        {
            description:    'must correct format error with message and meta (error object) options',
            options:        Object.assign({message: 'message', meta: {error: new Error(1)}}, _options),
            expectedRegexp: /\[time\]\[ERROR\] message\. Meta: { error:\s*Error: 1/
        },
        {
            description:    'must correct format error with message and meta (nested extendable error object) options',
            options:        Object.assign({
                message: 'message',
                meta:    {error: new ExtendableError('messsage', {error: new Error('original error')})}
            }, _options),
            expectedRegexp: /\[time\]\[ERROR\] message. Meta: { error:\s*{ ExtendableError: messsage/
        },
        {
            description:    'must correct format error with message, meta and stack options',
            options:        Object.assign({
                message: 'message',
                meta:    {foo: 'bar', stack: ['item1', 'item2']}
            }, _options),
            expectedRegexp: /\[time\]\[ERROR\] message. Meta: { foo: 'bar' }.\nStack: item1,item2/
        },
    ];

    testCases.forEach(testCase => {
        it(testCase.description, () => {
            const result = ConsoleTransportMessageFormatter._formatter(testCase.options);

            assert.match(result, testCase.expectedRegexp);
        });
    });
});
