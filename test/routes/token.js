"use strict";

const superagent = require('superagent'),
    app = require('../../server'),
    request = require('supertest'),
    should = require('should'),
    config = require('../../main/config'),
    _assert = require('../assert');



describe('Token endpoint', function() {

    describe('When an invalid grant_type is used', function() {
        it('The server should return an unsupported_grant_type error.', function(done) {
            request(app).post('/token')
                .send({'code': '11100000001'})
                .send({grant_type: 'kk' })
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .auth('111', 'test')
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('unsupported_grant_type');
                    }, done);
                });
        });
    });

    describe('When the grant type is authorization_code and no code is set.', function() {
        it('The server should return a invalid_request error.', function(done) {
            request(app).post('/token')
                .send({ grant_type: 'authorization_code'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .auth('111', 'test')
                .end(function(e, res) {

                    if(e) return done(e);

                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_request');
                    }, done);
                });
        });
    });

    describe('When no client credentials are defined.', function() {
        it('The server should repsond with a invalid_client error.', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'authorization_code',
                    code: 'cat',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
                })
                .end(function(e, res) {

                    if (e) return done(e);

                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_client');
                    }, done);
                });
        });
    });
    describe('When the given client is not registered.', function() {
        it('The server should return a invalid_client error.', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'authorization_code',
                    code: '11100000003',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
                }).auth('2', 'test')
                .end(function(e, res) {

                    if (e) return done(e);

                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_client');
                    }, done);
                });
        });
    });
    describe('When the given client_secret is invalid.', function() {
        it('The server should return a invalid_client error.', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'authorization_code',
                    code: '11100000003',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
                }).auth('111', 'fail')
                .end(function(e, res) {
                    if (e) return done(e);

                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_client');
                    }, done);

                });
        });
    });
    describe('When the given authorization code is not registered.', function() {
        it('The server should return a invalid_grant error.', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'authorization_code',
                    code: 'abc',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
                }).auth('111', 'test')
                .end(function(e, res) {
                    if (e) return done(e);

                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_grant');
                    }, done);

                });
        });
    });
    describe('When the given redirect uri doesn\'t match.', function() {
        it('The server should return a invalid_grant error.', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'authorization_code',
                    code: '11100000003',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Ffail'
                }).auth('111', 'test')
                .end(function(e, res) {
                    if(e) return done(e);

                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_grant');
                    }, done);
                });
        });
    });
    describe('When the given client_id doesn\'t match.', function() {
        it('The server should return a invalid_grant error.', function(done) {
            superagent.post(config.baseUrl + '/token')
                .send({
                    grant_type: 'authorization_code',
                    code: '11200000001',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
                }).auth('111', 'test')
                .end(function(e, res) {
                    if (e) return done(e);
                    _assert(function () {
                        res.status.should.eql(400);
                        res.body.error.should.eql('invalid_grant');
                    }, done);
                });
        });
    });
    describe('When the request is valid.', function() {
        it('The token endpoint should return access_token, refresh_token, and id_token.', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'authorization_code',
                    code: '11100000003',
                    redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
                }).auth('111', 'test')
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function() {
                        res.status.should.eql(200);
                        const o = JSON.parse(res.text);
                        o.should.have.property('access_token').which.is.not.empty();
                        o.should.have.property('refresh_token').which.is.not.empty();
                        o.should.have.property('id_token').which.is.not.empty();
                    }, done);
                });
        });
    });

    describe('When the grant type is refresh_token', function() {
        it('The token endpoint should ', function(done) {
            request(app).post('/token')
                .send({
                    grant_type: 'refresh_token',
                    refresh_token: 'WX0X7Kew7f7z7UvGmgQC'
                }).auth('111', 'test')
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function() {
                        res.status.should.eql(200);
                        const o = JSON.parse(res.text);
                        console.log(o);

                    }, done);
                });
        });
    });
});