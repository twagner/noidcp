/**
 * Created by twagner on 5/01/16.
 */
"use strict";

const should = require('should'),
    Service = require('../main/lib/service'),
    User = require('../main/lib/model/user'),
    sinon = require('sinon'),
    Q = require('q'),
    _assert = require('./assert');



describe('test', function() {
    let service;
    let db;

    before(function() {
        db = {
            put: sinon.stub().returns(Q.resolve()),
            get: sinon.stub().returns(Q.resolve()),
            del: sinon.stub().returns(Q.resolve())
        };
        service = new Service(db, User, 'sub');
    });

    describe('#findById', function() {
        it('should call the db get', function (done) {
            const data = {
                sub: '1',
                givenName: 'client'
            };
            service.findById('1').then(function(o) {
                _assert(function() {
                    should(db.get.calledOnce).be.ok();
                    should(db.get.calledWith('1')).be.ok();
                }, done);
            });
        });
    });
    describe('#add', function () {
        it('should call the db put', function (done) {
            const data = {
                sub: 'sub',
                givenName: 'client'
            };
            service.add(data).then(function(o) {
                _assert(function() {
                    should(db.put.calledOnce).be.ok();
                    should(db.put.calledWith('sub', data)).be.ok();
                }, done);
            });
        });
    });
    describe('#remove', function () {
        it('should call the db del', function (done) {
            const data = {
                sub: 'sub',
                givenName: 'client'
            };
            service.remove(data).then(function(o) {
                _assert(function() {
                    should(db.del.calledOnce).be.ok();
                    should(db.del.calledWith('sub')).be.ok();
                }, done);
            });
        });
    });
});