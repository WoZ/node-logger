'use strict';

const {assert} = require('chai');

const {ExtendableError}               = require('tests/Helpers/');
const {FileTransportMessageFormatter} = require('src/Transport/MessageFormatters');

describe('src/Transport/MessageFormatters/FileTransportMessageFormatter::_makePlainErrorObject', () => {
    it('must correct create plain object from Error type object', () => {
        const error                    = new Error('error message');
        const expectedErrorPlainObject = {
            name:    error.constructor.name,
            message: error.message,
            stack:   error.stack
        };

        const errorPlainObject = FileTransportMessageFormatter._makePlainErrorObject(error);

        assert.deepEqual(errorPlainObject, expectedErrorPlainObject);
    });

    it('must correct create plain object from ExtendableError and use extra field to process nested errors', () => {
        const baseError = new Error('error message');
        const error     = new ExtendableError('extendable message', {error: baseError, a: 'a'});

        const expectedErrorPlainObject = {
            name:    error.constructor.name,
            message: error.message,
            stack:   error.stack,
            extra:   {
                a:     'a',
                error: {
                    name:    baseError.constructor.name,
                    message: baseError.message,
                    stack:   baseError.stack
                }
            }
        };

        const errorPlainObject = FileTransportMessageFormatter._makePlainErrorObject(error);

        assert.deepEqual(errorPlainObject, expectedErrorPlainObject);
    });
});
