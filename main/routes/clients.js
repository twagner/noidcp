/**
 * Created by twagner on 6/05/16.
 */
"use strict";

const express = require('express'),
    router = express.Router(),
    Client = require('../lib/model/client');

router.get('/', function(req, res, next) {
    let count = 0;
    let limit = req.query.limit || 1000;
    let gte = req.query.gte;

    let options = { limit : Number(limit)};
    if (req.query.gte) {
        options.gte = req.query.gte;
    }
    if (req.query.lte) {
        options.lte = req.query.lte;
    }
    console.log(JSON.stringify(options));
    res.setHeader('Content-Type', 'application/json');
    req.clientService.createReadStream(options)
        .on('data', function (data) {
            console.log(data.key, '=', data.value);
            if (count === 0) {
                res.write('[');
            } else if (count > 0) {
                res.write(',');
            }
            count++;
            res.write(JSON.stringify(data.value));
        })
        .on('error', function (err) {
            console.log('Oh my!', err)
        })
        .on('close', function () {
            console.log('Stream closed')
        })
        .on('end', function () {
            console.log('Stream closed')
            res.end(']');
        });

});

router.post('/', function(req, res, next) {
    const client = new Client(req.body);
    console.log("Client API: add " + JSON.stringify(client));
    req.clientService.add(client).then(function(client) {
        res.end();
    }).fail(function(error) {
        res.status(500).end();
    });



});

router.put('/:clientId', function(req, res, next) {
    console.log("ClientId: " + req.params.clientId);
    const client = new Client(req.body);
    console.log(JSON.stringify(client));

    res.end();

});

router.delete('/:clientId', function(req, res, next) {
    const client = new Client({clientId : req.params.clientId});
    req.clientService.remove(client).then(function() {
        console.log("Removed");
        res.end();
    }).fail(function(error) {
        console.log("fail");
        res.status(500).end();
    });

});


module.exports = router;
