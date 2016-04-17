"use strict";

const path = '../../main/lib/',
    config = require('../../main/config'),
    should = require('should'),
    TokenRequest = require(path + 'model/tokenRequest'),
    AccessToken = require(path + 'model/accessToken'),
    TokenError = require(path + 'model/tokenError'),
    Client = require(path + 'model/client'),
    User = require(path + 'model/user'),
    AuthorizationCode = require(path + 'model/authorizationCode'),
    RefreshToken = require(path + 'model/refreshToken'),
    codeGenerator = require(path + 'util/codeGenerator'),
    _assert = require('../assert');

describe("TokenRequest", function() {
    describe("#token", function() {

        it('should throw an error if the client is not defined.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: 'notfound',
                client_secret: 'test',
                code: '123',
                redirect_uri: 'https%3A%2F%2Flocalhost%2Eclient',
                grant_type: 'authorization_code'
            }, config);
            const p = tokenReq.token();
            p.then(null, function(error) {
                _assert(function() {
                    error.should.have.property('name', 'TokenError');
                    error.should.have.property('error', 'invalid_client');
                }, done);

            });

        });

        it('should throw an error if the authorization code is not found.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                code: '123',
                redirect_uri: 'http://localhost/client',
                grant_type: 'authorization_code'
            }, config);
            const p = tokenReq.token();
            p.then(null, function(error) {
                _assert(function() {
                    error.should.have.property('name', 'TokenError');
                    error.should.have.property('error', 'invalid_grant');
                }, done);

            });
        });

        it('should throw an error if the client id doesn\'t match', function(done) {

            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                code: '11200000001',
                redirect_uri: 'http://localhost/client',
                grant_type: 'authorization_code'
            }, config);
            const p = tokenReq.token();
            p.fail(function(error) {
                _assert(function() {
                    error.should.have.property('name', 'TokenError');
                    error.should.have.property('error', 'invalid_grant');
                }, done);
            });
        });

        it('should throw an error if the request uri doesn\'t match', function(done) {

            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                code: '11100000001',
                redirect_uri: 'http://localhost/nomatch',
                grant_type: 'authorization_code'
            }, config);

            const p = tokenReq.token();
            p.fail(function(error) {

                _assert(function() {
                    error.should.have.property('error', 'invalid_grant');
                }, done);
            });
        });

        it('should return the access and refresh token', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                code: '11100000002',
                redirect_uri: 'http://localhost/client',
                grant_type: 'authorization_code'
            }, config);

            tokenReq.token().then(function(ac) {
                _assert(function() {
                    ac.should.have.property('accessToken').which.is.a.String();
                    ac.should.have.property('refreshToken').which.is.a.String();
                    ac.should.have.property('idToken', null);
                }, done);


            }, function(error) {
                console.log(error);
                done(error);
            });
        });

        it('should return the access, refresh and id token', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                code: '11100000003',
                redirect_uri: 'http://localhost/client',
                grant_type: 'authorization_code'
            }, config);

            tokenReq.token().then(function(ac) {
                console.log(ac);
                _assert(function() {
                    ac.should.have.property('accessToken').which.is.a.String();
                    ac.should.have.property('refreshToken').which.is.a.String();
                    ac.should.have.property('idToken').which.is.a.String();
                }, done);


            }, function(error) {
                console.log(error);
                done(error);
            });
        }); 

    });

    describe("#refresh", function() {

        const client = new Client({
            clientId: 1
        });

        it('should throw an error if the client is not defined.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: 'kdkdkdkkd',
                client_secret: 'dddd',
                refresh_token: '6WZpI0klIWuj15fDWuGY',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.fail(function(error) {
                _assert(function() {
                    error.should.have.property('error', 'invalid_client');
                }, done);
            });

        });
        it('should throw an error if the refresh token is not found.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                refresh_token: 'notfound',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.fail(function(error) {
                _assert(function() {
                    error.should.have.property('error', 'invalid_grant');
                }, done);
            });
        });

        it('should throw an error if the refresh token is revoked.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                refresh_token: 'BKfaW6wjLL0yAp9XdQaO',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.fail(function(error) {
                _assert(function() {
                    error.should.have.property('error', 'invalid_grant');
                }, done);
            });
        });

        it('should throw an error if the refresh token is expired.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                refresh_token: '5PbaQQJtns36mFs1AAZs',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.fail(function(error) {
                _assert(function() {
                    error.should.have.property('error', 'invalid_grant');
                }, done);
            });
        });

        it('should throw an error if the client ids are not the same.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                refresh_token: 'mZzOhOuFj6yIMXYc7M57',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.fail(function(error) {
                _assert(function() {
                    error.should.have.property('error', 'invalid_client');
                }, done);
            });
        });

        it('should return a new access token with the same refresh token.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                refresh_token: 'WX0X7Kew7f7z7UvGmgQC',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.then(function(tr) {
                _assert(function() {
                    tr.should.have.property('accessToken').which.is.a.String();
                    tr.should.have.property('refreshToken', 'WX0X7Kew7f7z7UvGmgQC');
                    tr.should.have.property('idToken', null);
                }, done);
            }, function(error) {
                done(error);
            });
        });

        it('should return a new access token and id token with the same refresh token.', function(done) {
            const tokenReq = new TokenRequest({
                client_id: '111',
                client_secret: 'test',
                refresh_token: 'axBtCHW1FaD0rQLROhv4',
                grant_type: 'refresh_token'
            }, config);
            const p = tokenReq.refresh();
            p.then(function(tr) {
                _assert(function() {
                    tr.should.have.property('accessToken').which.is.a.String();
                    tr.should.have.property('refreshToken', 'axBtCHW1FaD0rQLROhv4');
                    tr.should.have.property('idToken').which.is.a.String();
                }, done);
            }, function(error) {
                done(error);
            });
        });

    });
});    