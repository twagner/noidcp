/**
 * Created by twagner on 6/02/16.
 *
 * The UserInfo Endpoint MUST support the use of the HTTP GET and HTTP POST methods
 *
 * The UserInfo Endpoint MUST accept Access Tokens as OAuth 2.0 Bearer Token Usage
 *
 *
 */
"use strict";

const express = require('express'),
    router = express.Router();

const _authenticate = function(req, res, next) {

    /*
    const bearer = req.get('Bearer');
    if (!bearer) {
        res.set('WWW-Authenticate', 'error="invalid_request"');
        res.status(400).end();
    } else {
        req.uiq.verifyAccessToken(bearer).then(function(accessToken) {
            req.accessToken = accessToken;
            return next();
        }, function(error) {
            res.set('WWW-Authenticate', 'error="invalid_token"');
            return res.status(400).end();
        });
    }
    */
    next();
};

const _error = function(req, res, next) {

};


router.get('/', _authenticate, function(req, res, next) {
    console.log('UserInfoEndpoint: get default user info');

    return req.uiq.getDefaultUserInfo(req.accessToken.sub).then(function(o) {
        res.end(JSON.stringify(o));
    }, function(error) {
        return _error(req, res, next);
    });

});

router.post('', function(req, res, next) {

});

module.exports = router;

