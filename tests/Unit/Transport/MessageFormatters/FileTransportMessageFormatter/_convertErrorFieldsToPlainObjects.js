'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {ExtendableError}               = require('tests/Helpers/');
const {FileTransportMessageFormatter} = require('src/Transport/MessageFormatters');

describe('src/Transport/MessageFormatters/FileTransportMessageFormatter::_convertErrorFieldsToPlainObjects', () => {
    const error = new Error('test case');

    let spyOnConvertErrorFieldsToPlainObjects;

    beforeEach(() => {
        spyOnConvertErrorFieldsToPlainObjects = sinon.spy(
            FileTransportMessageFormatter,
            '_convertErrorFieldsToPlainObjects'
        );
    });

    afterEach(() => {
        spyOnConvertErrorFieldsToPlainObjects.restore();
    });

    it('must correct convert error fields to plain objects with particular fields', () => {
        const errorObject = {error};

        const expectedNumberOfCalls = 1;
        const expectedResult        = {
            error: {
                name:    error.constructor.name,
                message: error.message,
                stack:   error.stack
            }
        };

        const convertedErrorObject = FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(errorObject);

        assert.strictEqual(errorObject, convertedErrorObject);

        assert.deepEqual(convertedErrorObject, expectedResult);

        assert.strictEqual(spyOnConvertErrorFieldsToPlainObjects.callCount, expectedNumberOfCalls);
    });

    it('must correct convert cycled object with error fields to plain object', () => {
        const errorObject = {a: 'a', error: error};
        errorObject.b     = errorObject;

        const expectedNumberOfCalls = FileTransportMessageFormatter.MAX_DEEP_LEVEL_TO_CHECK_ERRORS + 1;
        const expectedResult        = {
            a:     'a',
            error: {
                name:    error.constructor.name,
                message: error.message,
                stack:   error.stack
            }
        };
        expectedResult.b            = errorObject;

        const convertedErrorObject = FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(errorObject);

        assert.strictEqual(errorObject, convertedErrorObject);

        assert.deepEqual(convertedErrorObject, expectedResult);

        assert.strictEqual(spyOnConvertErrorFieldsToPlainObjects.callCount, expectedNumberOfCalls);
    });

    it('must correct convert cycled object with error fields to plain object, deep example', () => {
        class Error0 extends ExtendableError {}
        class Error1 extends ExtendableError {}
        class Error2 extends ExtendableError {}

        const errorObject = {a: 'a', error: error};
        errorObject.b     = errorObject;

        const plainErrorObject = {
            a:     'a',
            error: {
                name:    error.constructor.name,
                message: error.message,
                stack:   error.stack
            },
            b:     errorObject
        };

        const origError = new Error('ERR ORIG ' + new Date());
        const error0    = new Error0('ERR 0', {error: origError, errorObject: errorObject});
        const error1    = new Error1('ERR 1', {error: error0, errorObject: errorObject});
        const error2    = new Error2('ERR 2', {error: error1, errorObject: errorObject});

        const finalError = {error2};

        const expectedResult = {
            error2: {
                name:    error2.constructor.name,
                message: error2.message,
                stack:   error2.stack,
                extra:   {
                    error:       { // Error 1
                        name:    error1.constructor.name,
                        message: error1.message,
                        stack:   error1.stack,
                        extra:   {
                            error:       { // Error0
                                name:    error0.constructor.name,
                                message: error0.message,
                                stack:   error0.stack,
                                extra:   {
                                    error:       {
                                        name:    origError.constructor.name,
                                        message: origError.message,
                                        stack:   origError.stack,
                                    },
                                    errorObject: plainErrorObject
                                },
                            },
                            errorObject: plainErrorObject
                        }
                    },
                    errorObject: plainErrorObject
                }
            }
        };

        const convertedErrorObject = FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(finalError);

        assert.strictEqual(finalError, convertedErrorObject);

        assert.deepEqual(convertedErrorObject, expectedResult);
    });

    it('must correct convert cycle object with too deep nesting to plain object', () => {
        const errorObject = {a: 'a', error: error};
        errorObject.b     = {c: {d: {e: {f: {errorObject, error}}}}};

        const expectedNumberOfCalls = FileTransportMessageFormatter.MAX_DEEP_LEVEL_TO_CHECK_ERRORS + 1;
        const expectedResult        = {
            a:     'a',
            error: {
                name:    error.constructor.name,
                stack:   error.stack,
                message: error.message
            },
            b:     {c: {d: {e: {f: {errorObject, error}}}}}
        };

        const convertedErrorObject = FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(errorObject);

        assert.strictEqual(errorObject, convertedErrorObject);

        assert.deepEqual(convertedErrorObject, expectedResult);

        assert.strictEqual(spyOnConvertErrorFieldsToPlainObjects.callCount, expectedNumberOfCalls);
    });
});
