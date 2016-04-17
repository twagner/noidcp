/**
 * Created by twagner on 17/04/16.
 */
"use strict";

const express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    let url = req.url;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo[url.slice(6)]()));
});


module.exports = router;