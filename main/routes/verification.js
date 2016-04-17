/**
 * Created by twagner on 6/02/16.
 */

"use strict";
const express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {

    req.check('access_token', 'Invalid access_token').notEmpty();
    if (req.validationErrors()) {
        return res.status(400).json({
            error: 'invalid_request'
        });
    }
    req.verify(req.query.access_token).then(function(valid) {
        return res.status(200).json({
            msg: 'ok'
        });
    }, function(error) {
        return res.status(403).json({
            error: 'invalid_access_token'
        });
    });

});
