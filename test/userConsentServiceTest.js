/**
 * Created by twagner on 9/13/15.
 */
"use strict";
const should = require('should'),
    Q = require('q'),
    sinon = require('sinon'),
    UserConsent = require('../main/lib/model/userConsent'),
    userConsentService = require('../main/lib/userConsentService'),
    _assert = require('./assert');

describe('UserConsentService', function () {
    describe('#findBySubAndClientId', function () {
        it('should return a promise that eventually resolves to UserConsent', function (done) {
            const data = {
                sub: '123',
                clientId: 'test'
            };
            const db = {
                get: sinon.stub().returns(Q.fcall(function() {
                    return data;
                }))
            };
            const service = userConsentService(db);
            const uc = new UserConsent(data);
            const key = uc.generateId();
            service.findBySubAndClientId('123', 'test')
                .then(function (userConsent) {
                    _assert(function () {
                        should(db.get.calledOnce).be.ok();
                        should(db.get.calledWith(key)).be.ok();
                    }, done);
                }, function(error) {
                    done(error);
                });
        });
    });

    describe('#findBySubAndClientIdAndScope', function () {
        it('should return a promise that eventually resolves to UserConsent', function (done) {
            const data = {
                sub: '123',
                clientId: 'test',
                scope: 'openid test'
            };
            const db = {
                get: sinon.stub().returns(Q.fcall(function() {
                    return data;
                }))
            };
            const service = userConsentService(db);
            const uc = new UserConsent(data);
            const key = uc.generateId();

            service.findBySubAndClientIdAndScope('123', 'test', 'openid test')
                .then(function (userConsent) {
                    _assert(function() {
                        should(db.get.calledOnce).be.ok();
                        should(db.get.calledWith(key)).be.ok();
                    }, done);
                }, function(error) {
                    done(error);
                });
        });
    });
});