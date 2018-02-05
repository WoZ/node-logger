'use strict';

const _     = require('lodash');
const Raven = require('raven');

Raven.disableConsoleAlerts();

class RavenFactory {
    /**
     * @param {string|undefined} sentryDsn
     * @return {Client}
     */
    create(sentryDsn) {
        if (_.isString(sentryDsn) && !_.isEmpty(sentryDsn)) {
            return new Raven.Client(sentryDsn);
        } else {
            return new Raven.Client();
        }
    }
}

module.exports = RavenFactory;
