/**
 * Created by twagner on 10/29/16.
 */
"use strict";

const express = require('express'),
    router = express.Router(),
    UserConsent = require('../lib/model/userConsent');

/* GET users listing. */
router.get('/', function (req, res, next) {
    let count = 0;
    let limit = req.query.limit || 1000;
    let gte = req.query.gte;

    let options = {limit: Number(limit)};
    if (req.query.gte) {
        options.gte = req.query.gte;
    }
    if (req.query.lte) {
        options.lte = req.query.lte;
    }
    res.setHeader('Content-Type', 'application/json');
    req.userConsentService.createReadStream(options)
        .on('data', function (data) {
            if (count === 0) {
                res.write('[');
            } else if (count > 0) {
                res.write(',');
            }
            count++;
            res.write(JSON.stringify(data.value));
        })
        .on('error', function (err) {
            console.log('Oh my!', err);
            res.status(500).end();
        })
        .on('close', function () {
        })
        .on('end', function () {
            res.end(']');
        });

});

router.delete('/', function(req, res, next) {
    const user = new UserConsent({
        userId : req.body.userId,
        clientId : req.body.clientId,
        scope : scope
    });
    req.userConsentService.remove(user).then(function() {
        console.log("Removed");
        res.end();
    }).fail(function(error) {
        console.log("fail");
        res.status(500).end();
    });

});

module.exports = router;
