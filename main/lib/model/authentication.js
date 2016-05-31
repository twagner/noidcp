"use strict";

const Q = require('q'),
    S = require('string'),
    validator = require('validator'),
    UserConsent = require('./userConsent'),
    AuthorizationCode = require('./authorizationCode'),
    AuthenticationResponse = require('./authenticationResponse'),
    AuthenticationError = require('./authenticationError');

/**
 *
 * @param {*} parameters the request parameters, parsed from either query parameters or form-parameters.
 * @param {*} dependencies
 * @constructor
 */
function AuthenticationRequest(parameters, dependencies) {

    if (!parameters) {
        throw new Error("Invalid argument!");
    }

    if (!dependencies || !dependencies.clientService || !dependencies.userService || !dependencies.authorizationCodeService || !dependencies.userConsentService || !dependencies.idTokenService || !dependencies.accessTokenService) {

        throw new Error("Unsatisfied dependency!");
    }
    // TODO: parameters validation
    this.clientId = null;
    this.redirectUri = null;
    this.scope = '';
    this.responseType = null;
    this.state = null;
    this.responseMode = null;
    this.nonce = null;
    this.display = 'page';
    this.prompt = '';
    this.maxAge = null;
    this.uiLocales = null;
    this.idTokenHint = null;
    this.loginHint = null;
    this.acrValues = null;

    // Support for the claims parameters is OPTIONAL. Should an OP not support this parameters and an RP uses it,
    // the OP SHOULD return a set of Claims to the RP that it believes would be useful to the RP and the End-User
    // using whatever heuristics it believes are appropriate.
    this.claims = null;

    // other parameters used internally
    this.sub = null;
    // TODO: change for sub
    this.username = this.sub;
    this.password = null;
    // the authenticated user
    this.user = null;
    this.authTime = null;
    // read from request.
    this.client = null;

    // initialize with the parameters.
    for (let param in parameters) {
        if (this.hasOwnProperty(S(param).camelize().s)) {
            this[S(param).camelize().s] = parameters[param];
        }
    }

    if (this.user) {
        this.sub = this.user.sub;
        this.username = this.user.sub;
    }
    // user decision
    this.granted = (parameters.granted && parameters.granted === 'true') || false;

    this.clientService = dependencies.clientService;
    this.userService = dependencies.userService;
    this.authorizationCodeService = dependencies.authorizationCodeService;
    this.userConsentService = dependencies.userConsentService;
    this.idTokenService = dependencies.idTokenService;
    this.accessTokenService = dependencies.accessTokenService;

}

/**
 * TODO: make private?
 *
 * From RFC 6749:
 * If the request fails due to a missing, invalid, or mismatching
 * redirection URI, or if the client identifier is missing or invalid,
 * the authorization server SHOULD inform the resource owner of the
 * error and MUST NOT automatically redirect the user-agent to the
 * invalid redirection URI.
 *
 * @returns Promise.<Client> that eventually evaluates to a Client or an AuthenticationError.
 */
AuthenticationRequest.prototype.validateClient = function () {

    const self = this;
    return Q.fcall(function () {
        // check client_id
        if (!self.clientId) {
            throw new AuthenticationError('invalid_client_id', {});
        }
        if (!self.redirectUri) {
            throw new AuthenticationError('invalid_redirect_uri', {});
        }

        return self.clientId;

    }).then(function (clientId) {

        console.log('AuthenticationRequest#validateClient: ' + self.clientId);
        return self.clientService
            .findByClientId(clientId)
            .then(function (client) {
                if (!client.matchRedirectUri(self.redirectUri)) {
                    throw new AuthenticationError('invalid_redirect_uri', {});
                }
                self.client = client;
                return client;
            }, function() {
                throw new AuthenticationError('client_not_found', {});
            });
    });
};

AuthenticationRequest.prototype.validateScope = function() {
    console.log('AuthenticationRequest#validateScope: ' + this.scope);
    // TODO: implement
    const self = this;
    return Q.fcall(function() {
        /*
        if (!self.scope) {
            console.log('AuthenticationRequest#validateScope: invalid scope!');
            throw new AuthenticationError('invalid_scope', {});
        }
        */
        return true;
    });
};

AuthenticationRequest.prototype.validateParameter = function() {
    const allowedParameters = ['state', 'response_mode', 'nonce', 'display', 'prompt', 'max_age', 'ui_locales', 'id_token_hint', 'login_hint', 'acr_values'];
    const requiredParameters = ['scope', 'response_type', 'client_id', 'redirect_uri'];
    const self = this;
    return Q.fcall(function() {
        if (validator.isLength(self.scope, 1)) {

        }
    });

};

/**
 * This method authenticates the end user.
 *
 *  @returns {Promise<User>} a promise that evaluates to the user or an error.
 */
AuthenticationRequest.prototype.authenticateUser = function () {
    const self = this;
    return Q.fcall(function () {

        if (!validator.isLength(self.sub, 1) || !validator.isLength(self.password, 1)) {
            console.log("AuthenticationRequest#authenticateUser: validation error");
            throw new AuthenticationError('invalid_user_credentials', {});
        }
        return self.sub;

    }).then(function(username) {

        return self.userService.findBySub(username).then(function(user) {
            console.log('AuthenticationRequest#authenticateUser: user ' + user.sub);
            return user;
        }, function() {
            throw new AuthenticationError('user_not_found', {});
        });

    }).then(function (user) {

        // match password
        return user.comparePassword(self.password).then(function (match) {
            console.log('AuthenticationRequest#authenticateUser: match password ' + match);
            if (!match) {
                throw new AuthenticationError('invalid_user_credentials', {});
            }
            self.user = user;
            return user;
        });
    });
};

/**
 *
 * @returns {boolean}
 */
AuthenticationRequest.prototype.isCodeGrantSync = function () {
    return this.responseType === 'code';
};

/**
 *
 * @returns {boolean}
 */
AuthenticationRequest.prototype.isImplicitGrantSync = function () {
    if (this.isOpenIDRequestSync()) {
        return this.responseType === 'id_token token' || this.responseType === 'id_token';
    }
    return this.responseType === 'token';
};

/**
 * Checks if this is a openid connect authentication request.
 * @returns {boolean} true if this is a OpenId Connect Authentication Request, false otherwise.
 */
AuthenticationRequest.prototype.isOpenIDRequestSync = function () {
    return this.scope && this.scope.indexOf('openid') > -1;
};

/**
 * Authorize the request. The result is a promise that eventually
 * evaluates to an AuthenticationResponse object if fulfilled, or to an
 * AuthenticationError if rejected.
 *
 * @returns {Promise}
 *
 */
AuthenticationRequest.prototype.authorize = function () {
    console.log('Authorization: authorize');
    if (this.isCodeGrantSync()) {
        return this.authorizeWithCodeGrant();
    } else if (this.isImplicitGrantSync()) {
        return this.authorizeWithImplicitGrant();
    } else {
        // TODO: hybrid flow
        console.log('Authorization: unsupported response type');
        const deferred = Q.defer();
        deferred.reject(new AuthenticationError('unsupported_response_type', {}));
        return deferred.promise;
    }
};

/**
 *
 * @returns {Promise.<AuthenticationResponse>}
 */
AuthenticationRequest.prototype.authorizeWithCodeGrant = function () {

    const self = this;

    return this.validateScope().then(function() {

        return self.validateClient().then(function (client) {

            console.log('AuthenticationRequest#authorizeWithCodeGrant: validated client: ' + client.clientId);

            // assert that user has granted access.
            self._assertGrantedSync();

            // the response type must be code
            self._assertResponseTypeSync(/code/);

            const ac = new AuthorizationCode({
                clientId: self.clientId,
                redirectUri: self.redirectUri,
                scope: self.scope,
                sub: self.user.sub,
                nonce: self.nonce
            });
            ac.generate();

            // saving authorization code.
            return self.authorizationCodeService.add(ac);

        }).then(function(ac) {

            console.log('AuthenticationRequest#authorizeWithCodeGrant: generated authorization code ' + ac.code);
            return self._authenticationResponse({
                code: ac.code
            });

        });
    }).fail(function(error) {
        console.log('AuthenticationRequest#authorizeWithCodeGrant: Error: ' + error);
        self._catch(error);
    });
};

AuthenticationRequest.prototype.authorizeWithImplicitGrant = function () {
    const self = this;
    return this.validateScope().then(function() {

        return self.validateClient();
    }).then(function (client) {
        console.log('AuthenticationRequest#authorizeWithImplicitGrant: validated client ' + client.clientId);

        // assert that user has granted access.
        self._assertGrantedSync();

        // nonce is required for implicit code grant
        self._assertNonceSync();

        // authentication response only contains the IdToken
        if (self.responseType === 'id_token' && self.isOpenIDRequestSync()) {

            console.log('AuthenticationRequest#authorizeWithImplicitGrant: create id token');

            return self._idToken().then(function(idToken) {

                return self._authenticationResponse({
                    idToken: idToken
                });

            }).catch(function(error) {
                self._catch(error);
            });

        } else if (self.responseType == 'id_token token' && self.isOpenIDRequestSync()) {
            console.log('AuthenticationRequest#authorizeWithImplicitGrant: create id and access token');
            /**
             * returns:
             * access_token
             * token_type === bearer
             * id_token
             * state
             * expires_in
             *
             */
            return self._accessToken().then(function(accessToken) {
                console.log('AuthenticationRequest#authorizeWithImplicitGrant: access token created!');

                return self._idToken().then(function(idToken) {

                    console.log('AuthenticationRequest#authorizeWithImplicitGrant: id token created!');

                    return self._authenticationResponse({
                        idToken: idToken,
                        accessToken: accessToken.token
                    });
                });
            }).catch(function(error) {
                self._catch(error);
            });

        } else if (self.responseType == 'token' && !self.isOpenIDRequestSync()) {
            // outh2 token
            return self._accessToken().then(function(accessToken) {

                return self._authenticationResponse({
                    accessToken: accessToken.token
                });

            }).catch(function(error) {
                self._catch(error);
            });
        } else {
            throw new AuthenticationError('invalid_request', {});
        }
    });
};

AuthenticationRequest.prototype.shouldPromptForLoginSync = function() {
    console.log('AuthenticationRequest#shouldPromptForLoginSync:');
    if (this._isPromptLoginSync() || !this._isPromptNoneSync() && !this._isUserDefinedSync()) {
        return true;
    } else if (this._isPromptNoneSync() && !this._isUserDefinedSync()) {
        console.log('AuthenticationRequest#shouldPromptForLoginSync: login required');
        throw new AuthenticationError('login_required', {});
    } else {
        return false;
    }
};

AuthenticationRequest.prototype.shouldPromptForAccountSync = function() {
    // TODO: implement
    return false;
};

/**
 * Check if user consent is required.
 *
 * @returns {*}
 */
AuthenticationRequest.prototype.shouldPromptForConsent = function () {
    const self = this;
    return Q.fcall(function() {

        if (self.prompt.indexOf('consent') > -1) {
            return true;
        }
        console.log('AuthenticationRequest#shouldPromptForConsent: ' + self.clientId);
        return self.userConsentService
            .findBySubAndClientIdAndScope(self.sub, self.clientId, self.scope)
            .then(function (userConsent) {

                self.granted = userConsent.granted;
                console.log('AuthenticationRequest#shouldPromptForConsent: user consent found.');
                if (self._isPromptNoneSync() && !userConsent.granted) {
                    throw new AuthenticationError('consent_required', {});
                }
                return !userConsent.granted;
            }, function() {
                console.log('AuthenticationRequest#shouldPromptForConsent: error from user consent service.');
                // thrown
                if (self._isPromptNoneSync()) {
                    throw new AuthenticationError('consent_required', {});
                }
                return true;
            });
    });
};

AuthenticationRequest.prototype.userConsent = function() {

    console.log('AuthenticationRequest#userConsent: granted=' + this.granted);
    const self = this;
    return Q.fcall(function() {
        if (!self.granted) {
            throw new AuthenticationError(
                'access_denied',
                {redirectUri: self.redirectUri, state: self.state});
        }
        return self.userConsentService.add(new UserConsent({
            sub: self.sub,
            clientId: self.clientId,
            scope: self.scope,
            granted: self.granted
        }));
    });
};

/**
 *
 * @private
 */
AuthenticationRequest.prototype._assertGrantedSync = function () {
    console.log('AuthenticationRequest#_assertGrantedSync: granted ' + this.granted);
    console.log('AuthenticationRequest#_assertGrantedSync: user ' + this.user);
    if (!this.granted || !this.user) {
        throw new AuthenticationError(
            'access_denied',
            {redirectUri: this.redirectUri, state: this.state});
    }
};

/**
 *
 * @param regex
 * @private
 */
AuthenticationRequest.prototype._assertResponseTypeSync = function (regex) {
    console.log('AuthenticationRequest#_assertResponseTypeSync assert response type: ' + this.responseType);
    if (!this.responseType || !this.responseType.match(regex)) {
        throw new AuthenticationError(
            'unsupported_response_type',
            {redirectUri: this.redirectUri, state: this.state});
    }
};

AuthenticationRequest.prototype._assertNonceSync = function() {
    if (!this.nonce) {
        throw new AuthenticationError(
            'invalid_request',
            {});
    }
};

AuthenticationRequest.prototype._idToken = function () {
    const authTime = this.authTime ? this.authTime/1000 : null;
    return this.idTokenService.createIdToken({
        sub: this.user.sub,
        authTime: authTime,
        clientId: this.clientId,
        scope: this.scope,
        nonce: this.nonce
    });
};

AuthenticationRequest.prototype._accessToken = function() {
    return this.accessTokenService.createAccessToken({
        sub: this.user.sub,
        clientId: this.clientId,
        scope: this.scope
    });
};

AuthenticationRequest.prototype._catch = function(error) {
    if (error.name === 'AuthenticationError') {
        throw error;
    }
    throw new AuthenticationError('internal_server_error', {});
};

AuthenticationRequest.prototype._authenticationResponse = function(o) {

    return new AuthenticationResponse({
        state: this.state,
        scope: this.scope,
        redirectUri: this.redirectUri,
        responseType: this.responseType,
        code: o.code ? o.code : null,
        accessToken: o.accessToken ? o.accessToken : null,
        idToken: o.idToken ? o.idToken : null
    });
};

AuthenticationRequest.prototype._isPromptNoneSync = function() {
    const check = this.prompt.indexOf('none') > -1;
    console.log('AuthenticationRequest#_isPromptNoneSync: ' + check);
    return check;
};

AuthenticationRequest.prototype._isPromptLoginSync = function() {
    const check = this.prompt.indexOf('login') > -1;
    console.log('AuthenticationRequest#_isPromptLoginSync: ' + check);
    return check;
};

AuthenticationRequest.prototype._isUserDefinedSync = function() {
    const check = this.user !== undefined && this.user !== null;
    console.log('AuthenticationRequest#_isUserDefinedSync: ' + check);
    return check;
};

module.exports = AuthenticationRequest;