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

const _userInfo = function(req, res, next) {
    const sub = req.accessToken.sub;
    const scope = req.accessToken.scope;

    return req.uiq.getUserInfoByScope(sub, scope).then(function(o) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(o));
    }, function(error) {
        console.log('UserInfoEndpoint: Error ' + error);
        return res.end(404);
    });
};

router.get('/', function(req, res, next) {
    return _userInfo(req, res, next);

});

router.post('/', function(req, res, next) {
    return _userInfo(req, res, next);
});

module.exports = router;

