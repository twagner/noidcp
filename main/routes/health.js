/**
 * Created by twagner on 17/04/16.
 */
"use strict";

const express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    res.writeHead(200);
    res.end();
});


module.exports = router;
