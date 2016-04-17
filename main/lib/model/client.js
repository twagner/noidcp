"use strict";

const Model = require('./model'),
    Q = require('q'),
    bcrypt = require('bcryptjs');

function Client(data) {
    Model.call(this);

    this.clientId = null;

    /*
     * This authorization server uses symetric keys to sign the id token.
     * So we have minimum requirements to the client secret:
     * For the HS256 the secret must be at least 32 octets.
     *
     * This is the client password.
     */
    this.clientSecret = null;
    this.clientName = "";

    /*
     * Authentication method: client_secret_basic, client_secret_post,
     * client_secret_jwt, private_key_jwt or none.
     */
    this.authenticationMethod = "client_secret_basic";

    /*
     * Simplification: only one redirectUri / client is allowed at this moment.
     * The redirectUri is required on client registration.
     */
    this.redirectUri = "";
    /*
     * Application type: confidential (web app), public (user-agent or native app).
     */
    this.type = "web";

    /*
     * The MAC key used is the octets of the UTF-8 representation of the client_secret value.
     * The shared secret used to sign the id tokens.
     * TODO: Generated when the client registers.
     * TODO: clientSecret == sharedSecret
     */
    this.sharedSecret = 'isitsecretisitsafe';

    this.init(data);
}

Client.prototype = new Model();
Client.prototype.constructor = Client;

/*
 * Matches the client redirect uri with the encoded uri parameter.
 *
 */
Client.prototype.matchRedirectUri = function(encodedUri) {
    return decodeUri_(this.redirectUri) === decodeUri_(encodedUri);
};

/*
 * Get the redirect uri 'application/x-www-form-urlencoded' encoded.
 */
Client.prototype.getEncodedRedirectUri = function() {
    return encodeUri_(this.redirectUri);
};

Client.prototype.hash = function(plaintext) {
    return Q.nfcall(this.hashPwd_, plaintext);
};

Client.prototype.comparePassword = function(plaintext) {
    return Q.nfcall(bcrypt.compare, plaintext, this.clientSecret);
};

Client.prototype.hashPwd_ = function(plaintext, cb) {
    const self = this;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(plaintext, salt, function(err, hash) {
            cb(err, hash);
        });
    });
};

/*
 * @private
 */
var encodeUri_ = function(uri) {
    return encodeURIComponent(uri).replace(/%20/, '+');
};

/*
 * @private
 */
var decodeUri_ = function(uri) {
    return decodeURIComponent(uri).replace(/\+/, '%20');
};


module.exports = Client;