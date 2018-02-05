'use strict';

const _        = require('lodash');
const cycle    = require('cycle');
const {assert} = require('chai');
const sinon    = require('sinon');

const {FileTransportMessageFormatter} = require('../../../../../src/Transport/MessageFormatters');

describe('src/Transport/MessageFormatters/FileTransportMessageFormatter::_adjustMeta', () => {
    const error = new Error('test case');

    it('must correct stringify object with error fields', () => {
        const errorObject = {error};

        const expectedCallCount = 1;

        const expectedResult = JSON.stringify({
            error: {
                name:    error.constructor.name,
                message: error.message,
                stack:   error.stack
            }
        });

        const spyOnConvertErrorFieldsToPlainObjects = sinon.spy(
            FileTransportMessageFormatter,
            '_convertErrorFieldsToPlainObjects'
        );
        const spyOnCycleDecycle                     = sinon.spy(cycle, 'decycle');

        const convertedErrorObject = FileTransportMessageFormatter._adjustMeta(errorObject);

        assert.notDeepEqual(errorObject, convertedErrorObject);

        assert.deepEqual(convertedErrorObject, expectedResult);

        assert.strictEqual(spyOnConvertErrorFieldsToPlainObjects.callCount, expectedCallCount);

        assert.isTrue(spyOnCycleDecycle.calledOnce);

        sinon.assert.callOrder(spyOnConvertErrorFieldsToPlainObjects, spyOnCycleDecycle);

        spyOnConvertErrorFieldsToPlainObjects.restore();
        spyOnCycleDecycle.restore();
    });

    it('must correct stringify cycled object with error fields to plain object', () => {
        const errorObject = {a: 'a', error: error};
        errorObject.b     = errorObject;

        const expectedCallCount = 6;
        const expectedResult    = JSON.stringify(
            cycle.decycle(
                FileTransportMessageFormatter._convertErrorFieldsToPlainObjects(
                    _.cloneDeep(errorObject)
                )
            )
        );

        const spyOnConvertErrorFieldsToPlainObjects = sinon.spy(
            FileTransportMessageFormatter,
            '_convertErrorFieldsToPlainObjects'
        );
        const spyOnCycleDecycle                     = sinon.spy(cycle, 'decycle');

        const convertedErrorObject = FileTransportMessageFormatter._adjustMeta(errorObject);

        assert.notDeepEqual(errorObject, convertedErrorObject);

        assert.deepEqual(convertedErrorObject, expectedResult);

        assert.strictEqual(spyOnConvertErrorFieldsToPlainObjects.callCount, expectedCallCount);
        assert.isTrue(spyOnCycleDecycle.calledOnce);

        sinon.assert.callOrder(spyOnConvertErrorFieldsToPlainObjects, spyOnCycleDecycle);

        spyOnConvertErrorFieldsToPlainObjects.restore();
        spyOnCycleDecycle.restore();
    });
});
