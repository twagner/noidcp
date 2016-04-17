/**
 * Created by twagner on 8/20/15.
 */
"use strict";

const sublevel = require('level-sublevel'),
    dbPromiseAdapter = require('./dbPromise');

module.exports = function(db, name) {
    return dbPromiseAdapter(sublevel(db).sublevel(name));
};