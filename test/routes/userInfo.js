/**
 * Created by twagner on 5/03/16.
 */
"use strict";


const config = require('../../main/config'),
    app = require('../../server'),
    request = require('supertest'),
    should = require('should'),
    UserConsent = require('../../main/lib/model/userConsent'),
    _assert = require('../assert');

let agent = request.agent(app);

describe('User Info Endpoint', function() {

    describe('Bearer token authorization', function() {
        it('The bearer token send as header field is valid', function(done) {
            request(app).get('/userinfo')
                .set('Authorization', 'Bearer 123456789')
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function () {
                        res.status.should.eql(200);
                        console.log(res.text);
                    }, done);
                });
        });
        it('The bearer token send as form-encoded body parameter is valid', function(done) {
            request(app).post('/userinfo')
                .send({ 'access_token' : '123456789' })
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function () {
                        res.status.should.eql(200);
                        console.log(res.text);
                    }, done);
                });
        });
        it('The bearer token send as query parameter is valid', function(done) {
            request(app).get('/userinfo')
                .query({ 'access_token' : '123456789' })
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function () {
                        res.status.should.eql(200);
                        console.log(res.text);
                    }, done);
                });
        });
        it('The bearer token in the header field is invalid', function(done) {
            request(app).get('/userinfo')
                .set('Authorization', 'Bearer abc')
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function () {
                        res.status.should.eql(400);
                        should.exist(res.get('WWW-Authenticate'));
                    }, done);
                });
        });
    });
});