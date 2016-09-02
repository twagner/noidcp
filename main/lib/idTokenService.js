/**
 * Created by twagner on 7/27/15.
 */
"use strict";
const IdToken = require('./model/idToken'),
    Q = require('q'),
    _ = require('underscore');


module.exports = function(iss, privkey, pubkey, userService) {

    const service = {};

    /**
     *
     * @param data
     * @returns {*} the jwt token
     */
    service.createIdToken = function(data) {
        console.log('IdTokenService#createIdToken: create with data: ' + JSON.stringify(data));
        return userService.findBySub(data.sub).then(function(user) {
            data.iss = iss;
            const idToken = new IdToken(data);
            const scope = data.scope || '';
            // TODO: include other claims from scope
            if (scope.indexOf('name') > -1) {
                console.log('IdTokenService: add name claim to token.');
                idToken.name = user.name();
            }
            if (scope.indexOf('email') > -1) {
                console.log('IdTokenService: add email claim to token.');
                idToken.email = user.email;
            }

            idToken.sign('RS256', privkey);

            return idToken.jwtToken;
        });
    };

    return service;

};