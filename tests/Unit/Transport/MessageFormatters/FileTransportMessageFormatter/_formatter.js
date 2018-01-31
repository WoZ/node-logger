'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {ExtendableError}               = require('tests/Helpers/');
const {FileTransportMessageFormatter} = require('src/Transport/MessageFormatters');

describe('src/Transport/MessageFormatters/FileTransportMessageFormatter::_formatter', () => {
    const originalError = new Error('1');

    let spyOnAdjustMeta;

    beforeEach(() => {
        spyOnAdjustMeta = sinon.spy(FileTransportMessageFormatter, '_adjustMeta');
    });

    afterEach(() => {
        spyOnAdjustMeta.restore();
    });

    const _options = {
        level:     'error',
        timestamp: () => 'time'
    };

    const testCases = [
        {
            description:    'must correct format error with no options',
            options:        Object.assign({}, _options),
            expectedRegexp: /^\[time\]\[ERROR\]\s+/
        },
        {
            description:    'must correct format error just with message option',
            options:        Object.assign({message: 'message', meta: undefined}, _options),
            expectedRegexp: /^\[time\]\[ERROR\] message./
        },
        {
            description:    'must correct format error with message and meta (plain object) options',
            options:        Object.assign({message: 'message', meta: {a: 1}}, _options),
            expectedRegexp: /^\[time\]\[ERROR\] message. Meta: \'{"a":1}\'/ // eslint-disable-line
        },
        {
            description:    'must correct format error with message and meta (error object) options',
            options:        Object.assign({message: 'message', meta: {error: new Error(1)}}, _options),
            expectedRegexp: /^\[time\]\[ERROR\] message. Meta: \'{"error":{"name":"Error","message":"1","stack":"Error: 1/ // eslint-disable-line
        },
        {
            description:    'must correct format error with message and meta (nested extendable error object) options',
            options:        Object.assign({
                message: 'message',
                meta:    {error: new ExtendableError('messsage', {error: new Error('original error')})}
            }, _options),
            expectedRegexp: /^\[time\]\[ERROR\] message. Meta: \'{"error":{"name":"ExtendableError","message":"messsage","stack":"ExtendableError: messsage/ // eslint-disable-line
        },
        {
            description:    'must call correct internal method and return string in correct format',
            options:        Object.assign({
                message: 'message',
                meta:    {
                    name:    originalError.name,
                    message: originalError.message,
                    stack:   originalError.stack,
                    extra:   {
                        error: originalError,
                        a:     1
                    }
                }
            }, _options),
            expectedRegexp: /^\[time\]\[ERROR\] message. Meta: \'{"name":"Error","message":"1","extra":{"error":{"name":"Error","message":"1"},"a":1}}\'$/ // eslint-disable-line
        }
    ];

    testCases.forEach(testCase => {
        it(testCase.description, () => {
            const result = FileTransportMessageFormatter._formatter(testCase.options);

            assert.isTrue(spyOnAdjustMeta.calledOnce);
            assert.strictEqual(spyOnAdjustMeta.getCall(0).args.length, 1);
            assert.isObject(spyOnAdjustMeta.getCall(0).args[0]);

            assert.match(result, testCase.expectedRegexp);
        });
    });
});
