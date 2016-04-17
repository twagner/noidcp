/**
 * Created by twagner on 8/21/15.
 */

"use strict";
const should = require('should'),
    dbFactory = require('../main/lib/dbFactory'),
    levelup = require('levelup'),
    memdown = require('memdown'),
    dbPromiseAdapter = require('../main/lib/dbPromise');


describe('Memory db', function () {

    describe('When put is called', function () {
        it('should return a promise', function () {

            const clientDb = dbFactory(levelup({ db: memdown, valueEncoding: 'json' }), 'client');

            return clientDb.put('client1', {name: 'test'});
        });
    });

});