/**
 * Created by twagner on 7/27/15.
 */
"use strict";
const IdToken = require('./model/idToken'),
    Q = require('q'),
    _ = require('underscore');


module.exports = function(iss, privkey, pubkey) {

    const service = {};

    /**
     *
     * @param data
     * @returns {*} the jwt token
     */
    service.createIdToken = function(data) {
        return Q.fcall(function() {
            data.iss = iss;
            const idToken = new IdToken(data);

            // TODO: include other claims from scope

            idToken.sign('RS256', privkey);

            return idToken.jwtToken;
        });
    };

    return service;

};