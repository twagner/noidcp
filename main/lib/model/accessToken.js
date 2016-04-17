"use strict";

const codeGenerator = require('../util/codeGenerator'),
    Model = require('./model'),
    RefreshToken = require('./refreshToken'),
    moment = require('moment');

/**
 * The Access Token
 * @constructor
 */
function AccessToken (data) {
    Model.call(this);

    this.sub = null;

    this.clientId = null;

    /* The lifetime in seconds of the access token */
    this.expiresIn = 3600;

    this.creationDate = new Date();

    /* The valid scopes */
    this.scope = '';
    
    this.type = 'Bearer';

    this.refreshToken = null;

    /* the token identifying this access token object */
    this.token = null;

    this.idToken = null;

    this.init(data);
}

AccessToken.prototype = new Model();
AccessToken.prototype.constructor = AccessToken;

AccessToken.prototype.generateSync = function() {
    this.token = codeGenerator.generate(20);
    return this;
};

AccessToken.prototype.isExpiredSync = function() {
    const creationDate = moment(this.creationDate);

    creationDate.add(this.expiresIn, 'seconds');
    console.log('AccessToken: Expires ' + creationDate.format());
    return creationDate.isBefore(moment());
};

module.exports = AccessToken;