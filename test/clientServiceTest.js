/**
 * Created by twagner on 8/28/15.
 */
"use strict";

const should = require('should'),
    sinon = require('sinon'),
    Q = require('q'),
    Client = require('../main/lib/model/client'),
    clientService = require('../main/lib/clientService'),
    _assert = require('./assert');


describe('ClientService', function () {
    let db;
    let service;
    beforeEach(function() {
        db = {
            put: sinon.stub().returns(Q.resolve()),
            get: sinon.stub().returns(Q.fcall(function() {
                return {
                    clientId: 'test',
                    clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu'
                };
            }))
        };
        service = clientService(db);
    });
    describe('#findByClientId', function () {
        it('should return a promise', function (done) {
            service.findByClientId('test').then(function (client) {
                _assert(function () {
                    client.should.be.an.instanceOf(Client);
                    should(db.get.calledOnce).be.ok();
                    should(db.get.calledWith('test')).be.ok();
                }, done);
            });
        });
    });
    describe('#authenticate', function() {
        it('authentication successful', function(done) {
            service.authenticate('test', 'test').then(function (client) {
                _assert(function () {
                    client.should.be.an.instanceOf(Client);
                    client.should.have.property('clientId', 'test');
                    should(db.get.calledOnce).be.ok();
                    should(db.get.calledWith('test')).be.ok();
                }, done);
            }, function(error) {
                done(error);
            });
        });
        it('authentication error', function(done) {
            service.authenticate('test', 'failed').then(null, function(error) {
                _assert(function () {
                    should(db.get.calledOnce).be.ok();
                    should(db.get.calledWith('test')).be.ok();
                    error.should.be.an.instanceOf(Error);
                }, done);
            });
        });
    });
});