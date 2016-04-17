/**
 * Created by twagner on 8/28/15.
 */
"use strict";

const UserConsent = require('./model/userConsent'),
    crypto = require('crypto'),
    Service = require('./service');

module.exports = function(db) {
    const service = new Service(db, UserConsent, 'userConsentId');

    /**
     *
     * @param sub
     * @param clientId
     * @returns {Promise.<T>}
     */
    service.findBySubAndClientId = function(sub, clientId) {
        console.log('UserConsentService#findBySubAndClientId: find by sub: ' + sub + ' and clientId: ' + clientId);

        const uc = new UserConsent({
            sub: sub,
            clientId: clientId
        });
        const key = uc.generateId();
        return this.findById(key);
    };

    /**
     *
     * @param sub
     * @param clientId
     * @param scope
     * @returns {Promise.<UserConsent>}
     */
    service.findBySubAndClientIdAndScope = function(sub, clientId, scope) {
        console.log('UserConsentService#findBySubAndClientIdAndScope: find by sub: ' + sub + ' and clientId: ' + clientId + ' and scope: ' + scope);
        const uc = new UserConsent({
            sub: sub,
            clientId: clientId,
            scope: scope
        });
        return this.findById(uc.generateId());
    };
    return service;
};
