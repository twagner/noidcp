/**
 * Created by twagner on 8/20/15.
 */
"use strict";

const levelup = require('levelup'),
    sublevel = require('level-sublevel'),
    memdown = require('memdown'),
    dbPromiseAdapter = require('./dbPromise');

module.exports = function(location, name) {
    if (location === 'mem') {
        return dbPromiseAdapter(sublevel(levelup({ db: memdown, valueEncoding: 'json' })).sublevel(name));
    } else {
        return dbPromiseAdapter(sublevel(levelup(location, { valueEncoding: 'json' })).sublevel(name));
    }
};