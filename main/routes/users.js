/**
 * Created by twagner on 10/29/16.
 */
"use strict";

const express = require('express'),
    router = express.Router(),
    User = require('../lib/model/user');

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
    req.userService.createReadStream(options)
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

router.post('/', function(req, res, next) {
    const user = new User(req.body);
    console.log("User API: add " + JSON.stringify(user));
    req.clientService.add(user).then(function(user) {
        res.end();
    }).fail(function(error) {
        res.status(500).end();
    });
});

router.delete('/:userId', function(req, res, next) {
    const user = new User({userId : req.params.userId});
    req.userService.remove(user).then(function() {
        console.log("Removed");
        res.end();
    }).fail(function(error) {
        console.log("fail");
        res.status(500).end();
    });

});

module.exports = router;
