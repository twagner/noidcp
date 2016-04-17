/**
 * Created by twagner on 25/10/15.
 */
"use strict";

const should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    AccessToken = require('../main/lib/model/accessToken'),
    accessTokenService = require('../main/lib/accessTokenService'),
    _assert = require('./assert');


describe('Access Token Service', function () {

    let db, service;

    beforeEach(function() {
        db = {
            put: sinon.stub().returns(Q.resolve())
        };
        service = accessTokenService(db);
    });

    describe('#createAccessToken', function () {
        it('creates and saves an access token', function (done) {
            const data = {
                sub: 'sub',
                clientId: 'client',
                token: '123456789'
            };
            service.createAccessToken(data).then(function(o) {
                _assert(function () {
                    should(db.put.calledOnce).be.ok();
                }, done);
            }, function(error) {
                done(error);
            });
        });
        it('generates a token if not passed in as parameter', function (done) {
            const data = {
                sub: 'sub',
                clientId: 'client'
            };
            service.createAccessToken(data).then(function(o) {
                _assert(function () {
                    should(db.put.calledOnce).be.ok();
                    o.should.have.property('token');
                    o.token.should.not.be.empty();
                }, done);
            }, function(error) {
                done(error);
            });
        });
        it('the service propagates the error from the db', function (done) {
            const service = accessTokenService({
                put: sinon.stub().returns(Q.reject(new Error("fail")))
            });
            const data = {
                sub: 'sub',
                clientId: 'client',
                token: '123456789'
            };
            service.createAccessToken(data).then(null, function(error) {
                _assert(function () {
                    error.should.be.ok();
                }, done);
            });
        })
    });

    describe('#generateTokenSync', function () {
        it('generate a 20 digit token', function () {
            const token = service.generateTokenSync();
            token.should.be.type('string');
            token.should.have.lengthOf(20);
        })
    });

    describe('#verify', function() {
        it('verifies the access token', function() {
            const data = {
                sub: 'sub',
                clientId: 'client',
                token: '123456789'
            };
            const service = accessTokenService({
                get: sinon.stub().returns(Q.resolve(new AccessToken(data)))
            });

            service.verify(data.token).then(function(at) {
                _assert(function() {
                    at.should.have.property('token');
                }, done);
            }, function(error) {
                done(error);
            });
        });
    });
});
