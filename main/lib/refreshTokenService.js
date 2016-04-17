/**
 * Created by twagner on 28/12/15.
 */

"use strict";

const codeGenerator = require('./util/codeGenerator'),
    RefreshToken = require('./model/refreshToken'),
    Service = require('./service');

module.exports = function(db) {

    const service = new Service(db, RefreshToken, 'token');

    /**
     *
     * @param data
     */
    service.createRefreshToken = function(data) {
        console.log('RefreshTokenService#createRefreshToken with ' + JSON.stringify(data));
        if (!data.token) {
            data.token = this.generateTokenSync();
        }
        const refreshToken = new RefreshToken(data);
        return this.add(refreshToken);
    };

    service.generateTokenSync = function() {
        return codeGenerator.generate(20);
    };

    service.findByRefreshToken = function(refreshToken) {
        console.log('RefreshTokenService#findByRefreshToken ' + refreshToken);
        return this.findById(refreshToken);
        /*
        return db.get(refreshToken).then(function(data) {
            return new RefreshToken(data);
        });
        */
    };

    return service;

};