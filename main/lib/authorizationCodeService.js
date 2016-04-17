"use strict";

const AuthorizationCode = require('./model/authorizationCode'),
    Service = require('./service');

/**
 * Created by twagner on 8/28/15.
 */
module.exports = function(db) {

    const service = new Service(db, AuthorizationCode, 'code');

    service.findByCode = function(code) {
        console.log('AuthorizationCodeService#findByCode: ' + code);
        return this.findById(code);
    };

    return service;

};
