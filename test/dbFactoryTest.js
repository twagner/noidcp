/**
 * Created by twagner on 8/21/15.
 */

"use strict";
const should = require('should'),
    dbFactory = require('../main/lib/dbFactory'),
    dbPromiseAdapter = require('../main/lib/dbPromise');


describe('Memory db', function () {

    describe('When put is called', function () {
        it('should return a promise', function () {

            const clientDb = dbFactory('mem', 'client');

            return clientDb.put('client1', {name: 'test'});
        });
    });

});