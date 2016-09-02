"use strict";

const config = require('../../main/config'),
    app = require('../../server'),
    request = require('supertest'),
    should = require('should'),
    UserConsent = require('../../main/lib/model/userConsent'),
    _assert = require('../assert');

let agent = request.agent(app);

function login(done) {
    agent.post('/authorization/justlogin')
        .send({sub: 'user1'})
        .send({password: 'test'})
        .end(function(e, res) {
            done();
        });
}

function testPromptForDisplay(done, responseType) {
    agent.get('/authorization')
        .query({scope: 'openid'})
        .query({response_type: 'code'})
        .query({client_id: '111'})
        .query({redirect_uri: encodeURIComponent('http://localhost/client')})
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            _assert(function () {
                should(res.text.indexOf('<title>Decision</title>') > -1).be.ok();
            }, done);
        });

}

describe('Authorization code grant', function() {

    describe('Missing request parameters', function() {
        it('the server should respond with an error page.', function(done) {
            request(app).get('/authorization')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);

                    _assert(function () {
                        should(res.text.indexOf('Invalid request') > -1).be.ok();
                    }, done);
                });
        });
    });

    describe('Authorization Server Authenticates End-User', function() {
        it('the server should respond with status 200 and the login page', function(done) {
            request(app).get('/authorization')
                .query({scope: 'openid'})
                .query({response_type: 'code'})
                .query({client_id: '111'})
                .query({redirect_uri: encodeURIComponent('http://localhost/client')})
                .expect(200)
                .end(function(err, res) {

                    if (err) return done(err);
                    should(res.text.indexOf('<title>Login</title>') > -1).be.ok();
                    done();
              });
        });
    });

    describe('Authorization Server Obtains End-User Consent/Authorization', function() {

        /**
         * login
         */
        before(function(done) {
            agent = request.agent(app);
            login(done);
        });

        it('the server should display the decision page for code grant', function(done) {
            testPromptForDisplay(done, 'code');
        });
    });

    describe('Successful Authentication Response', function() {
        /**
         * login
         */
        before(function(done) {
            agent = request.agent(app);
            login(done);
        });

        it('the server should redirect with the authorization code.', function(done) {
            agent.post('/authorization/decision')
                .send({scope: 'openid test'})
                .send({response_type: 'code'})
                .send({client_id: '111'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .send({granted: 'true'})
                .expect(302)
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('code=') > -1).should.be.eql(true);
                        (res.header.location.indexOf('scope=openid%20test') > -1).should.be.eql(true);
                    }, done);
                });
        });
    });

    describe('Authentication Error Response', function() {
        /**
         * login
         */
        beforeEach(function(done) {
            agent = request.agent(app);
            login(done);
        });

        it('the server should redirect with an access_denied error.', function(done) {

            agent.post('/authorization/decision')
                .send({scope: 'openid test'})
                .send({response_type: 'code'})
                .send({client_id: '111'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('error=access_denied') > -1).should.be.eql(true);
                    }, done);
                });
        });

        it('the server should redirect with a consent_required error.', function(done) {

            agent.get('/authorization')
                .query({scope: 'openid'})
                .query({response_type: 'code'})
                .query({client_id: '111'})
                .query({redirect_uri: encodeURIComponent('http://localhost/client')})
                .query({prompt: 'none'})
                .expect(302)
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.header.location.indexOf('error=consent_required') > -1).should.be.eql(true);
                    }, done);
                });
        });

        it('the server should redirect with an unsupported_response_type error.', function(done) {

            agent.post('/authorization/decision')
                .send({scope: 'openid test'})
                .send({response_type: 'llll'})
                .send({client_id: '111'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .send({granted: 'true'})
                .expect(302)
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.header.location.indexOf('error=unsupported_response_type') > -1).should.be.eql(true);
                    }, done);
                });
        });

    });

    describe('Authentication Error Response: login required', function() {

        it('the server should redirect with a login required error.', function(done) {

            request(app).get('/authorization')
                .query({scope: 'openid test'})
                .query({response_type: 'code'})
                .query({client_id: '111'})
                .query({redirect_uri: encodeURIComponent('http://localhost/client')})
                .query({prompt: 'none'})
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('error=login_required') > -1).should.be.eql(true);
                    }, done);
                });
        });
    });

    describe('Request for already granted scope', function() {
        /**
         * login
         */
        before(function(done) {
            agent = request.agent(app);
            config.userConsentService.add(new UserConsent({
                sub: 'user1',
                clientId: '111',
                scope: 'openid test',
                granted: true
            })).then(function() {
                login(done);
            }, function(error) {
                done(error);
            });

        });

        it('the server should redirect with the authorization code.', function(done) {

            agent.get('/authorization')
                .query({scope: 'openid test'})
                .query({response_type: 'code'})
                .query({client_id: '111'})
                .query({redirect_uri: encodeURIComponent('http://localhost/client')})
                //.query({granted: 'true'})
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('code=') > -1).should.be.eql(true);
                        (res.header.location.indexOf('scope=openid%20test') > -1).should.be.eql(true);
                    }, done);
                });
        });

        it('the same with post.', function(done) {

            agent.post('/authorization')
                .send({scope: 'openid test'})
                .send({response_type: 'code'})
                .send({client_id: '111'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                //.query({granted: 'true'})
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('code=') > -1).should.be.eql(true);
                        (res.header.location.indexOf('scope=openid%20test') > -1).should.be.eql(true);
                    }, done);
                });
        });
    });
});

describe('Authentication using the Implicit Flow', function() {
    describe('Authorization Server Obtains End-User Consent/Authorization', function() {

        /**
         * login
         */
        beforeEach(function (done) {
            agent = request.agent(app);
            login(done);
        });

        describe('Authorization Server Obtains End-User Consent/Authorization', function () {
            it('the server should display the decision page for reponse type "id_token"', function (done) {
                testPromptForDisplay(done, 'id_token');
            });

            it('the server should display the decision page for reponse type "id_token token"', function (done) {
                testPromptForDisplay(done, 'id_token token');
            });
        });
    });

    describe('Successful Authentication Response', function() {
        agent = request.agent(app);

        /**
         * login
         */
        before(function(done) {
            login(done);
        });

        it('the server should redirect with the id token.', function(done) {
            agent.post('/authorization/decision')
                .send({scope: 'openid test'})
                .send({response_type: 'id_token'})
                .send({client_id: '111'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .send({granted: 'true'})
                .send({nonce: '1234567890'})
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('token_type=bearer') > -1).should.be.eql(true);
                        (res.header.location.indexOf('id_token=') > -1).should.be.eql(true);
                        (res.header.location.indexOf('scope=openid%20test') > -1).should.be.eql(true);
                    }, done);
                });
        });
        it('the server should redirect with the id token and access token.', function(done) {
            agent.post('/authorization/decision')
                .send({scope: 'openid test'})
                .send({response_type: 'id_token token'})
                .send({client_id: '111'})
                .send({redirect_uri: encodeURIComponent('http://localhost/client')})
                .send({granted: 'true'})
                .send({nonce: '1234567890'})
                .end(function(err, res) {

                    if (err) return done(err);

                    _assert(function () {
                        (res.status).should.be.eql(302);
                        (res.header.location.indexOf('access_token=') > -1).should.be.eql(true);
                        (res.header.location.indexOf('token_type=bearer') > -1).should.be.eql(true);
                        (res.header.location.indexOf('id_token=') > -1).should.be.eql(true);
                        (res.header.location.indexOf('scope=openid%20test') > -1).should.be.eql(true);
                    }, done);
                });
        });
    });
});



