/**
 * Created by twagner on 8/21/15.
 */

const Q = require('q');

module.exports = function(db) {
    "use strict";


    var adapter = {};

    const get = Q.nbind(db.get, db);
    const put = Q.nbind(db.put, db);
    const del = Q.nbind(db.del, db);

    adapter.get = function(key, options) {
        return get(key, options);
    };

    adapter.put = function(key, value, options) {
        return put(key, value, options);
    };

    adapter.del = function(key, options) {
        return del(key, options);
    };

    adapter.createReadStream = db.createReadStream;

    adapter.createKeyStream = db.createKeyStream;

    adapter.createValueStream = db.createValueStream;

    adapter.root = db;

    return adapter;


};