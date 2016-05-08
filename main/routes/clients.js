/**
 * Created by twagner on 6/05/16.
 */
"use strict";

const express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    let count = 0;
    req.clientService.createReadStream()
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


module.exports = router;
