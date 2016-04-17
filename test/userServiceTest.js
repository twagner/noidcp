/**
 * Created by twagner on 8/28/15.
 */
"use strict";

const should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    User = require('../main/lib/model/user'),
    userService = require('../main/lib/userService'),
    _assert = require('./assert');

describe('User Service', function () {


    describe('#findBySub', function () {
        it('should return a promise that eventually resolves to a User', function (done) {
            const data = {
                sub: 'test'
            };
            const db = {
                get: sinon.stub().returns(Q.fcall(function () {
                    return data;
                }))
            };
            const service = userService(db);
            service.findBySub('test').then(function (user) {
                _assert(function () {
                    should(db.get.calledOnce).be.ok();
                }, done);
            }, function (error) {
                done(error);
            });
        });

        it('should throw an error if the user is not found', function (done) {
            const db = {
                get: sinon.stub().returns(Q.reject(new Error("user not found")))
            };
            const service = userService(db);
            service.findBySub('test').then(null, function (error) {
                _assert(function() {
                    should(db.get.calledOnce).be.ok();
                    error.should.be.an.instanceOf(Error);
                }, done);
            });
        });
    });
});