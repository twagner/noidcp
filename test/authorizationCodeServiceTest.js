/**
 * Created by twagner on 8/28/15.
 */
"use strict";

const should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    authorizationCodeService = require('../main/lib/authorizationCodeService'),
    _assert = require('./assert');


describe('Authorization Service', function () {
    let db, service;

    beforeEach(function() {
        db = {
            put: sinon.stub().returns(Q.resolve()),
            get: sinon.stub().returns(Q.resolve())
        };
        service = authorizationCodeService(db);
    });

    describe('#add', function () {
        it('should return a promise', function (done) {
            service.add({ code: 'test' });
            _assert(function () {
                should(db.put.calledOnce).be.ok();
                should(db.put.calledWith('test', {code: 'test'})).be.ok();
            }, done);
        });
    });
    describe('#findByCode', function () {
        it('should return a promise', function (done) {
            service.findByCode('test');
            _assert(function () {
                should(db.get.calledOnce).be.ok();
                should(db.get.calledWith('test')).be.ok();
            }, done);
        });
    });
});