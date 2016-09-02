"use strict";

const express = require('express'),
    router = express.Router();

/**
 * The client MUST use the HTTP "POST" method when making access token
 * requests.
 *
 *
 *
 */
router.post('/', function(req, res, next) {
    console.log('Token endpoint');

    // endpoint content type is json
    res.setHeader('Content-Type', 'application/json');

    if (req.error) {
        console.log('Token endpoint: invalid request ' + req.error);
        return res.status(400).json({
            error: req.error.error
        });
    } else if (req.tq.isAccessTokenRequestSync()) {

        return req.tq.token().then(function(tokenResponse) {
            res.end(tokenResponse.toJsonSync());
        }).catch(function(error) {
            return res.status(400).json({
                error: error.error
            });            
        });

    } else if (req.tq.isRefreshTokenRequestSync()) {
        return req.tq.refresh().then(function(tokenResponse) {
            res.end(tokenResponse.toJsonSync());
        }).catch(function(error) {
            console.log('TokenEnpoint: error refreshing token ' + error);
            return res.status(400).json({
                error: error.error
            });
        });
        return res.end();

    } else {
        return res.status(400).json({
            error: 'unsupported_grant_type'
        });
    }

});

//router.post('/', function(req, res, next) {});


module.exports = router;