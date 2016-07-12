"use strict";

const _ = require('underscore'),
    Model = require('./model'),
    moment = require('moment'),
    // inject?
    jwt = require('jsonwebtoken'),
    S = require('string');

/**
 * The IdToken
 *
 * @constructor
 */
function IdToken(data) {
    Model.call(this);

    /** Required. The issuer id (provider id). */
    this.iss = null;
    /** Required. The subject id (user id) */
    this.sub = null;
    /** Required. The audience of the id token. Must contain de client_id. */
    this.aud = null;

    /** Required. Expiration time */
    this.exp = 60;

    /**
     * Time when the End-User authentication occurred.
     * Required if requested as claim, otherwise optional.
     * A JSON number representing the number of seconds from 1970-01-01T0:0:0Z as
     * measured in UTC until the date/time
     */
    this.authTime = null;
    /**
     * String value used to associate a Client session with an ID Token,
     * and to mitigate replay attacks.
     * Required if present in the authentication request.
     */
    this.nonce = null;
    /** Optional. Authentication Context Class Reference. */
    this.acr = null;
    /** Optional. Authentication Methods References. */
    this.amr = null;
    /** Optional. Authorized party, the party to which the ID Token was issued. */
    this.azp = null;


    // TODO: other claims
    this.name = null;
    this.email = null;

    this.jwtToken = null;

    this.init(data);

}

IdToken.prototype = new Model();
IdToken.prototype.constructor = IdToken;

/**
 * Checks is the given algorithm is supported.
 * The shared secret MUST contain at least
 * the minimum of number of octets required for MAC keys for the particular algorithm used.
 */
IdToken.prototype.supportsSymetricAlgorithm = function(algorithm, secret) {
    const octets = Buffer.byteLength(secret, 'utf8');
    let valid;
    switch(algorithm) {
        case 'HS256': valid = octets >= 32; break;
        case 'HS384': valid = octets >= 48; break;
        case 'HS512': valid = octets >= 64; break;
        default: valid = false; // not symetric
    }
    return valid;
};

IdToken.prototype.signSymetric = function(algorithm, secret) {

    // check required length:
    if (!this.supportsSymetricAlgorithm(algorithm, secret)) {
        throw new Error('Unsupported algorithm: ' + algorithm);
    }
    const self = this;

    this.jwtToken = jwt.sign(this._payload(), secret, {
        algorithm: algorithm,
        issuer: self.iss,
        subject: self.sub,
        audience: self.aud,
        expiresInMinutes: self.exp
    });
};



IdToken.prototype.sign = function(algorithm, key) {

    const self = this;

    this.jwtToken = jwt.sign(this._payload(), key, {
        algorithm: algorithm,
        issuer: self.iss,
        subject: self.sub,
        audience: self.aud,
        expiresInMinutes: self.exp
    });
};

IdToken.prototype.getSignature = function() {
    if (!this.jwtToken) {
        throw new Error("The jwt has not been generated!");
    }
    const pos = this.jwtToken.lastIndexOf('.');
    return this.jwtToken.substring(pos + 1);
};

/**
 *
 * @returns {{}}
 * @private
 */
IdToken.prototype._payload = function() {
    const self = this;
    const copy = _.omit(this, function(value, key, object) {

        return (_.isUndefined(value) || _.isNull(value) || key === 'iss' || key === 'sub' || key === 'aud' || key === 'exp' || key === 'jwtToken');
    });

    const payload = {};
    const keys = _.keys(copy);
    _.each(keys, function(key, index, list) {
        payload[S(key).underscore().s] = copy[key];
    });

    return payload;
};

module.exports = IdToken;