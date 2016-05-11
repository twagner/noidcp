/**
 * Created by twagner on 10/10/15.
 */
"use strict";
const AuthenticationRequest = require('./model/authentication'),
    TokenRequest = require('../lib/model/tokenRequest'),
    UserInfoRequest = require('../lib/model/userInfoRequest'),
    TokenError = require('../lib/model/tokenError'),
    auth = require('basic-auth'),
    validator = require('validator');

/**
 *
 * @param config
 * @returns {Function}
 */
const openIDConnect = function(config) {

    if (!config.privkey || !config.pubkey || !config.iss) {
        throw new Error("Invalid configuration for OpenIdConnect middleware!");
    }

    const iss = config.iss;
    const privkey = config.privkey;
    const pubkey = config.pubkey;



    const o = {};

    o.authorizationEndpoint = function(req, res, next) {
        console.log('OpenIDConnect: request method ' + req.method);
        console.log('OpenIDConnect: request path ' + req.path);

        const allowedMethod = req.method === 'GET' || req.method === 'POST';

        if (!allowedMethod) {
            console.log('OpenIDConnect: Unsupported request method!');
            return next();
        }

        // TODO: Passing Request Parameters as JWTs
        console.log('OpenIDConnect: request method data');
        let data;
        if (req.method === 'GET') {
            data = req.query;
        } else if (req.method === 'POST') {

            // our jwt original request:
            if (req.body.originalRequest) {
                // verify token
                data = req.body.originalRequest;
            }
            data = req.body;
        }

        if (req.session && req.session.user) {
            data.user = req.session.user;
        }

        if (req.session && req.session.authTime) {
            data.authTime = req.session.authTime;
        }

        console.log('OpenIDConnect: create authentication request with data: ' + JSON.stringify(data));
        req.aq = new AuthenticationRequest(data, config);

        req.isAuthenticated = function() {
            return req.session && req.session.user;
        };
        next();
    };

    o.tokenEnpoint = function(req, res, next) {
        console.log('OpenIDConnect: Token endpoint');
        const allowedMethod = req.method === 'POST';
        if (!allowedMethod) {
            console.log('OpenIDConnect: Unsupported request method!');
            return next();
        }

        console.log('OpenIDConnect: Client authentication');
        console.log('OpenIDConnect: Headers: ' + JSON.stringify(req.headers));
        const credentials = auth(req);
        const data = req.body;
        let clientId;
        let clientSecret;
        if (credentials) {
            console.log('OpenIDConnect: Client authentication with basic authentication.');
            console.log('OpenIDConnect: Client credentials: ' + JSON.stringify(credentials));
            if (!validator.isLength(credentials.name, 1) || !validator.isLength(credentials.pass, 1)) {
                console.log('OpenIDConnect: Client basic authentication: invalid credentials.');
                req.error = new TokenError('invalid_client');
                return next();

            }
            clientId = credentials.name;
            clientSecret = credentials.pass;
        } else {
            console.log('OpenIDConnect: Client authentication with form authentication.');
            req.check('client_id', 'Client id is missing!').notEmpty();
            req.check('client_secret', 'Client secret is missing!').notEmpty();
            if (req.validationErrors()) {

                req.error = new TokenError('invalid_client');
                return next();

            }
            clientId = data.client_id;
            clientSecret = data.client_secret;

        }
        req.check('grant_type', 'Invalid grant_type').notEmpty();
        req.check('code', 'Invalid code').notEmpty().isAlphanumeric();
        req.check('redirect_uri', 'Invalid redirect_uri').notEmpty();

        if (req.validationErrors()) {
            req.error = new TokenError('invalid_request');
            return next();
        }
        //data.client_secret = credentials.pass;
        data.clientId = clientId;
        data.clientSecret = clientSecret;
        req.tq = new TokenRequest(data, config);
        console.log('TokenEndpoint:' + JSON.stringify(req.tq));
        next();
    };

    o.verificationEndpoint = function(req, res, next) {

        req.verifyAccessToken = config.accessTokenService.verify;

        next();
    };

    o.bearerTokenFilter = function(req, res, next) {

        const bearer = req.get('Bearer');
        console.log('OpenIDConnect: check bearer token ' + bearer);
        if (!bearer) {
            res.set('WWW-Authenticate', 'error="invalid_request"');
            res.status(400).end();
        } else {
            config.accessTokenService.verify(bearer).then(function(accessToken) {
                console.log('OpenIDConnect: bearer token verified!');
                req.accessToken = accessToken;
                return next();
            }, function(error) {
                res.set('WWW-Authenticate', 'error="invalid_token"');
                return res.status(400).end();
            });
        }
    };

    o.userInfoEndpoint = function(req, res, next) {

        //req.verifyAccessToken = config.accessTokenService.verify;
        req.uiq = new UserInfoRequest(config);
        console.log('OpenIDConnect: forward to user info endpoint');
        next();
    };


    return o;

    /**
    return function(req, res, next) {
        console.log('OpenIDConnect: request method ' + req.method);
        console.log('OpenIDConnect: request path ' + req.path);

        const allowedMethod = req.method === 'GET' || req.method === 'POST';

        if (!allowedMethod) {
            console.log('OpenIDConnect: Unsupported request method!');
            return next();
        }

        // TODO: Passing Request Parameters as JWTs
        console.log('OpenIDConnect: request method data');
        let data;
        if (req.method === 'GET') {
            data = req.query;
        } else if (req.method === 'POST') {

            // our jwt original request:
            if (req.body.originalRequest) {
                // verify token
                data = req.body.originalRequest;
            }
            data = req.body;
        }

        if (req.session && req.session.user) {
            data.user = req.session.user;
        }

        if (req.session && req.session.authTime) {
            data.authTime = req.session.authTime;
        }

        console.log('OpenIDConnect: create authentication request with data: ' + JSON.stringify(data));
        req.aq = new AuthenticationRequest(data, config);

        req.isAuthenticated = function() {
            return req.session && req.session.user;
        };




        next();

    };
     */

};

module.exports = openIDConnect;