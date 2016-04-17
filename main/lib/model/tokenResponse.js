"use strict";

const Model = require('./model');

function TokenResponse(data) {
    Model.call(this);
    this.tokenType = 'Bearer';
    this.accessToken = null;
    this.refreshToken = null;
    this.idToken = null;
    this.expiresIn = null;
    this.scope = null;
    this.init(data);
}

TokenResponse.prototype = new Model();
TokenResponse.prototype.constructor = TokenResponse;

/**
 * @return {String} the token response as json.
 */
TokenResponse.prototype.toJsonSync = function() {
    const o = {
        access_token: this.accessToken,
        token_type: this.tokenType
    };

    if (this.refreshToken) {
        o.refresh_token = this.refreshToken;
    }
    if (this.idToken) {
        o.id_token = this.idToken;
    }
    if (this.expiresIn) {
        o.expires_in = this.expiresIn;
    }
    if (this.scope) {
        o.scope = this.scope;
    }
    return JSON.stringify(o);
};

module.exports = TokenResponse;