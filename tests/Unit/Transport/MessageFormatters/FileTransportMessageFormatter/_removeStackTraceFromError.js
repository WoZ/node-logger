'use strict';

const _        = require('lodash');
const {assert} = require('chai');

const {FileTransportMessageFormatter} = require('../../../../../src/Transport/MessageFormatters');

describe('src/Transport/MessageFormatters/FileTransportMessageFormatter::_removeStackTraceFromError', () => {
    const originalError = new Error('some error message text');

    it('must not corrupt object, no stack field in there', () => {
        const error = {
            name:    originalError.name,
            message: originalError.message,
        };

        const expectedResult = _.cloneDeep(error);

        const result = FileTransportMessageFormatter._removeStackTraceFromError(_.cloneDeep(error));

        assert.deepEqual(result, expectedResult);
    });

    it('must recursively remove all stack fields from objects', () => {
        const error = {
            name:    originalError.name,
            message: originalError.message,
            stack:   originalError.stack,
            extra:   {}
        };

        error.extra.error             = _.cloneDeep(error);
        error.extra.error.extra.error = _.cloneDeep(error);

        const expectedResult = {
            name:    originalError.name,
            message: originalError.message,
            extra:   {}
        };

        expectedResult.extra.error             = _.cloneDeep(expectedResult);
        expectedResult.extra.error.extra.error = _.cloneDeep(expectedResult);

        const result = FileTransportMessageFormatter._removeStackTraceFromError(_.cloneDeep(error));

        assert.deepEqual(result, expectedResult);
    });
});
