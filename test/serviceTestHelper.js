/**
 * Created by twagner on 20/09/15.
 */

const sinon = require('sinon'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path');

"use strict";
module.exports = function() {

    const o = {};

    o.createDb = function() {
        return {
            get: function () {},

            put: function() {}
        };
    };

    o.createStub = function(method, returnObject) {
        const db = this.createDb();
        sinon.stub(db, method).returns(
            Q.fcall(function () {
                return returnObject;
            })
        );
        return db;
    };

    o.createErrorStub = function(method) {
        const db = this.createDb();
        sinon.stub(db, method).returns(
            Q.fcall(function () {
                throw new Error();
            })
        );
        return db;
    };

    o.getPrivateKey = function() {
        return fs.readFileSync(path.resolve(__dirname, '../privkey.pem'));
    };

    o.getPublicKey = function() {
        return fs.readFileSync(path.resolve(__dirname, '../pubkey.pem'));
    };

    return o;

};