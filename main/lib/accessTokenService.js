/**
 * Created by twagner on 25/10/15.
 */
"use strict";

const codeGenerator = require('./util/codeGenerator'),
    AccessToken = require('./model/accessToken'),
    Service = require('./service');

module.exports = function(db) {

    const service = new Service(db, AccessToken, 'token');

    /**
     *
     * @param data
     * @returns {Promise|Promise.<AccessToken>}
     */
    service.createAccessToken = function(data) {
        console.log('AccessTokenService#createAccessToken with ' + JSON.stringify(data));
        if (!data.token) {
            data.token = this.generateTokenSync();
        }
        const accessToken = new AccessToken(data);
        return this.add(accessToken);
    };

    service.generateTokenSync = function() {
        return codeGenerator.generate(20);
    };

    service.findByAccessToken = function(accessToken) {
        return this.findById(accessToken);
    };

    /**
     * Verifies the given access token.
     *
     * @param accessToken the string representing the access token.
     * @returns {Promise|Promise.<T>} a promise that eventually evaluates to the access token object o an error if invalid.
     */
    service.verify = function(accessToken) {
        return this.findById(accessToken).then(function(at) {
            if (at.isExpiredSync()) {
                throw new Error('Access token expired');
            } else {
                return at;
            }

        }, function(error) {
            throw new Error('Access token not found');
        });
    };

    return service;
};