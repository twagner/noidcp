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

    if (req.error) {
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

    } else {
        return res.status(400).json({
            error: 'unsupported_grant_type'
        });
    }

});

//router.post('/', function(req, res, next) {});


module.exports = router;