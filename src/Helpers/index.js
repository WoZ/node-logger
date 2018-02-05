'use strict';

/**
 * @return {Function}
 */
exports.timestampFormatter = () => () => new Date().toISOString();
