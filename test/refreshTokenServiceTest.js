/**
 * Created by twagner on 6/01/16.
 */
"use strict";

const should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    RefreshToken = require('../main/lib/model/refreshToken'),
    refreshTokenService = require('../main/lib/refreshTokenService'),
    _assert = require('./assert');

describe('RefreshTokenService', function() {
    let db, service;
    beforeEach(function() {
        db = {
            put: sinon.stub().returns(Q.resolve()),
            get: sinon.stub().returns(Q.fcall(function() {
                return {
                    token: '1234567890',
                    expiration: new Date()
                };
            }))
        };
        service = refreshTokenService(db);
    });

    describe('#createRefreshToken', function() {

        it('should use the given token as id.', function(done) {
            const data = {
                token: '1234567890',
                expiration: new Date()
            };
            service.createRefreshToken(data).then(function(refreshToken) {
                _assert(function () {
                    should(db.put.calledOnce).be.ok();
                    should(db.put.calledWith('1234567890', new RefreshToken(data))).be.ok();
                }, done);
            }, function(error) {
                done(error);
            });
        });

        it('should generate a random token.', function(done) {
            const data = {
                expiration: new Date()
            };
            service.createRefreshToken(data).then(function(refreshToken) {
                _assert(function () {
                    console.log('Generated token: ' + refreshToken.token);
                    should(db.put.calledOnce).be.ok();
                    refreshToken.should.have.property('token').of.String();
                }, done);
            }, function(error) {
                done(error);
            });
        })
    });

    describe('#findByRefreshToken', function() {
        it('should return a promise that resolves to a refresh token', function(done) {
            service.findByRefreshToken('1234567890').then(function(refreshToken) {
                _assert(function () {
                    should(db.get.calledOnce).be.ok();
                    should(refreshToken).be.an.instanceOf(RefreshToken);
                }, done);
            }, function(error) {
                done(error);
            });
        });
    });
});
