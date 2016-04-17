"use strict";

const config = require('../../config'),
    AccessToken = require('./accessToken'),
    RefreshToken = require('./refreshToken'),
    TokenResponse = require('./tokenResponse'),
    IdToken = require('./idToken'),
    TokenError = require('./tokenError'),
    Q = require('q'),
    S = require('string'),
    validator = require('validator');

function TokenRequest(parameters, config) {
    this.grantType = null;
    this.code = null;
    this.redirectUri = null;
    this.client = null;
    this.clientId = null;
    this.clientSecret = null;
    this.refreshToken = null;

    // initialize with the parameters.
    for (let param in parameters) {
        if (this.hasOwnProperty(S(param).camelize().s)) {
            this[S(param).camelize().s] = parameters[param];
        }
    }

    if (!config.clientService || !config.authorizationCodeService || !config.accessTokenService || !config.refreshTokenService || !config.idTokenService) {
        console.log('TokenRequest: unsatisfied dependency!');
        throw new Error('TokenRequest: unsatisfied dependency!');
    }

    this.clientService = config.clientService;
    this.authorizationCodeService = config.authorizationCodeService;
    this.accessTokenService = config.accessTokenService;
    this.refreshTokenService = config.refreshTokenService;
    this.idTokenService = config.idTokenService;

}

TokenRequest.prototype.authenticateClient = function() {
    console.log('TokenRequest#authenticateClient');
    const self = this;
    return this.clientService.authenticate(this.clientId, this.clientSecret).then(function(client) {
        self.client = client;
    }, function(error) {
        console.log('TokenRequest#authenticateClient: error ' + error);
        throw new TokenError('invalid_client');
    });
};

TokenRequest.prototype.token = function() {
    console.log('TokenRequest#token');

    const self = this;
    return this.validateAccessTokenRequest().then(function() {

        return self.authenticateClient().then(function(client) {
            console.log('TokenRequest#token: Client authenticated!');

            return self.authorizationCodeService.findByCode(self.code).then(function(ac) {
                return ac;
            }, function(error) {
                console.log('TokenRequest#token: find authorization code: ' + error);
                throw new TokenError('invalid_grant');
            });
        });

    }).then(function(authorizationCode) {
        console.log('TokenRequest#token: validating authorization code');

        // Verify that the Authorization Code is valid. 
        if (!authorizationCode || !authorizationCode.isValidSync()) {
            console.log('TokenRequest#token: The authorization code is invalid!');
            throw new TokenError('invalid_grant', 'Invalid authorization code');
        }

        // Ensure the Authorization Code was issued to the authenticated Client.
        if (authorizationCode.clientId !== self.clientId) {
            console.log('TokenRequest#token: Client id doesn\'t match!');
            throw new TokenError('invalid_grant', 'Client id doesn\'t match!');
        }

        // Ensure that the redirect_uri parameter value is identical to the redirect_uri 
        // parameter value that was included in the initial Authorization Request. 
        if (!self.compareRedirectUri_(authorizationCode.redirectUri)) {
            console.log('TokenRequest#token: Redirect uri doesn\'t match!');
            throw new TokenError('invalid_grant');
        }

        // If possible, verify that the Authorization Code has not been previously used. 
        // TODO            

        return self._refreshToken(authorizationCode).then(function(refreshToken) {

            return self._accessToken(authorizationCode, refreshToken).then(function(accessToken) {

                if (authorizationCode.isOpenIDSync()) {

                    return self._idToken(authorizationCode).then(function(idToken) {

                        return new TokenResponse({
                            accessToken: accessToken.token,
                            refreshToken: refreshToken.token,
                            idToken: idToken,
                            expiresIn: accessToken.expiresIn
                        });
                    });
                } else {
                    return new TokenResponse({
                        accessToken: accessToken.token,
                        refreshToken: refreshToken.token,
                        expiresIn: accessToken.expiresIn
                    });
                }
            });
        }).catch(function(error) {
            throw new TokenError('invalid_request');
        });
    });
};

TokenRequest.prototype.refresh = function() {
    const self = this;
    return this.validateRefreshTokenRequest().then(function() {

        return self.authenticateClient().then(function(client) {

            return self.refreshTokenService.findByRefreshToken(self.refreshToken).then(function(refreshToken) {
                return refreshToken;
            }, function(error) {
                throw new TokenError('invalid_grant', 'Refresh Token not found!');
            });

        }).then(function(refreshToken) {

            // Verify that the refresh token is valid.

            if (!refreshToken || !refreshToken.isValidSync()) {
                console.log('TokenRequest#refresh: The refresh token is invalid!');
                throw new TokenError('invalid_grant', 'The refresh token is invalid!');
            }

            // Ensure the refresh token was issued to the authenticated Client.
            if (refreshToken.clientId !== self.clientId) {
                console.log('TokenRequest#refresh: Client id doesn\'t match!');
                throw new TokenError('invalid_client');
            }

            return self._accessToken(refreshToken, refreshToken.token).then(function(accessToken) {

                if (refreshToken.isOpenIDSync()) {

                    return self._idToken(refreshToken).then(function(idToken) {

                        return new TokenResponse({
                            accessToken: accessToken.token,
                            expiresIn: accessToken.expiresIn,
                            refreshToken: refreshToken.token,
                            idToken: idToken
                        });
                    });
                } else {
                    return new TokenResponse({
                        accessToken: accessToken.token,
                        expiresIn: accessToken.expiresIn,
                        refreshToken: refreshToken.token
                    });
                }

            }).catch(function(error) {
                throw new TokenError('invalid_request');
            });

        });
    });


};

TokenRequest.prototype.isAccessTokenRequestSync = function() {
    return this.grantType === 'authorization_code';
};

TokenRequest.prototype.isRefreshTokenRequestSync = function() {
    return this.grantType === 'refresh_token';
};

TokenRequest.prototype.error_ = function(status, msg) {
    const e = new Error(msg);
    e.status = status;
    return e;
};

TokenRequest.prototype.compareRedirectUri_ = function(uri) {
    return decodeURIComponent(this.redirectUri) === decodeURIComponent(uri);
};

TokenRequest.prototype.validateAccessTokenRequest = function() {
    const self = this;
    return Q.fcall(function() {
        let validRequest = validator.equals(self.grantType, 'authorization_code') && validator.isLength(self.code, 1) && validator.isLength(self.redirectUri, 1) && validator.isLength(self.clientId, 1);
        validRequest = validRequest && validator.isURL(decodeURIComponent(self.redirectUri));
        console.log('TokenRequest#validateAccessTokenRequest: request valid ' + validRequest);
        if (!validRequest) {
            throw new TokenError('invalid_request');
        }
        return true;
    });
};

TokenRequest.prototype.validateRefreshTokenRequest = function() {
    const self = this;
    return Q.fcall(function() {
        let validRequest = validator.equals(self.grantType, 'refresh_token') && validator.isLength(self.refreshToken, 1);
        if (!validRequest) {
            throw new TokenError('invalid_request');
        }
        return true;
    });
};

TokenRequest.prototype._accessToken = function(data, refreshToken) {
    return this.accessTokenService.createAccessToken({
        sub: data.sub,
        clientId: data.clientId,
        refreshToken: refreshToken,
        scope: data.scope
    });
};

TokenRequest.prototype._refreshToken = function(data) {
    return this.refreshTokenService.createRefreshToken({
        sub: data.sub,
        clientId: data.clientId,
        scope: data.scope
    });
};

TokenRequest.prototype._idToken = function(data) {
    return this.idTokenService.createIdToken({
        sub: data.sub,
        authTime: data.authTime,
        clientId: data.clientId,
        scope: data.scope,
        nonce: data.nonce
    });
};

module.exports = TokenRequest;