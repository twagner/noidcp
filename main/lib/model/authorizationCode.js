"use strict";

const Model = require('./model'),
    moment = require('moment'),
    codeGenerator = require('../util/codeGenerator');

/**
 * Represents an authorization code.
 *
 * @constructor
 */
function AuthorizationCode(data) {
    Model.call(this);

    this.code = null;

    /* The authorization code is bound to the client identifier 
     * and redirection URI.
     */
    this.clientId = null;

    this.redirectUri = null;

    /*
     * Retain scope.
     */
    this.scope = '';

    /*
     * The End-User
     * TODO: Refactor to sub (the user id in OpenID speech)
     */
    this.sub = null;

    /*
     * Time when the End-User authentication occurred.
     */
    this.authTime = null;

    this.nonce = null;

    this.codeLength = 20;

    /*
     * A maximum authorization code lifetime of 10 minutes is RECOMMENDED.
     */
    this.expiration = moment().add(10, 'm').toDate();

    this.init(data);
}

AuthorizationCode.prototype = new Model();
AuthorizationCode.prototype.constructor = AuthorizationCode;

/**
 * Function that generate a random string code.
 *
 * https://github.com/spring-projects/spring-security-oauth/blob/master/spring-security-oauth2/src/main/java/org/springframework/security/oauth2/common/util/RandomValueStringGenerator.java
 *
 */
AuthorizationCode.prototype.generate = function() {
    this.code = codeGenerator.generate(this.codeLength);
    /*
    let bytes = crypto.randomBytes(this.codeLength);
    let code = new Array(this.codeLength);
    for (let i = 0; i < this.codeLength; i++) {
        // mod with charset length so that the index always stays within range. 
        code[i] = this.charSet[bytes[i] % this.charSet.length];
    }
    this.code = code.join('');
    */

};

AuthorizationCode.prototype.isValidSync = function() {
    return this.code && moment().isBefore(this.expiration);
};

AuthorizationCode.prototype.isOpenIDSync = function() {
    return this.scope.indexOf('openid') > -1;
};

module.exports = AuthorizationCode;