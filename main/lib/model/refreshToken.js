"use strict";

const Model = require('./model'),
    moment = require('moment');

/**
 * The Refresh Token
 * @constructor
 */
function RefreshToken (data) {
    Model.call(this);

    this.sub = null;
    
    this.clientId = null;

    /* The valid scopes */
    this.scope = null;
    
    this.token = null;

    this.expiration = moment().add(7, 'd').toDate();

    this.revoked = false;

    /* needed for id token */
    this.authTime = null;

    this.init(data);

}

RefreshToken.prototype = new Model();
RefreshToken.prototype.constructor = RefreshToken;

RefreshToken.prototype.isValidSync = function() {
    return this.token && !this.revoked && moment().isBefore(this.expiration);
};

RefreshToken.prototype.isOpenIDSync = function() {
    return this.scope.indexOf('openid') > -1;
};


module.exports = RefreshToken;