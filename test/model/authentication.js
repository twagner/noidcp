"use strict";

const should = require('should'),
    moment = require('moment'),
    Client = require('../../main/lib/model/client'),
    User = require('../../main/lib/model/user'),
    UserConsent = require('../../main/lib/model/userConsent'),
    AuthenticationRequest = require('../../main/lib/model/authentication'),
    AuthenticationResponse = require('../../main/lib/model/authenticationResponse'),
    AuthenticationError = require('../../main/lib/model/authenticationError'),
    config = require('../../main/config'),
    _assert = require('../assert');

describe('AuthenticationRequest', function() {
    const check = function(req) {
        const aq = new AuthenticationRequest({}, {});
        aq.clientId.should.eql('client');
        aq.redirectUri.should.eql('https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb');
        aq.scope.should.eql('openid');
        aq.responseType.should.eql('code');
        aq.state.should.eql('xyz');
        aq.responseMode.should.eql('mode');
        aq.nonce.should.eql('123456789');
        aq.display.should.eql('page');
        aq.prompt.should.eql('login');
        aq.maxAge.should.eql('10');
        aq.uiLocales.should.eql('es_ES');
        aq.idTokenHint.should.eql('a hint');
        aq.loginHint.should.eql('login hint');
        aq.acrValues.should.eql('acr');            
    };

    describe('#constructor(empty)', function() {
        it('should throw an exception', function() {
            var req = {
            };
            try {
                const aq = new AuthenticationRequest(req, {});
            } catch (error) {
                (error !== null).should.eql(true);
            }
        });
    });  

    describe('#validateClient', function() {
        it('should return a promise that eventually resolves to the client. ', function(done) {
            const data = {
                client_id: '112',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient2'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.validateClient();
            p.then(function(client) {
                _assert(function() {
                    (client !== null).should.eql(true);
                    client.clientId.should.eql('112');
                }, done);

            }, function(error) {
                done(error);
            });
        });
        it('should throw an error if the client_id is missing.', function(done) {
            const data = {
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.validateClient();
            p.then(null, function(error) {
                _assert(function() {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.equal('invalid_client_id');
                }, done);

            });
        });
        it('should throw an error if the redirect_uri is missing', function(done) {
            const data = {
                client_id: '112',
                response_type: 'code'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.validateClient();
            p.then(null, function(error) {
                _assert(function() {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.be.equal('invalid_redirect_uri');
                }, done);
            });
        }); 
        it('should throw an error if the client is not registered.', function(done) {
            const data = {
                client_id: 'q',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.validateClient();
            p.then(null, function(error) {
                _assert(function() {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.equal('client_not_found');
                }, done);
            });
        }); 
        it('should throw an error if there is a redirect_uri mismatch.', function(done) {
            const data = {
                client_id: '112',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient__'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.validateClient();
            p.then(null, function(error) {
                _assert(function() {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.equal('invalid_redirect_uri');
                }, done);
            });
        });                                
    });  

    describe('#authenticateUser', function() {
        it('should throw an error when sub (username) and password are missing.', function(done) {
            const req = {
                dummy: ''
            };
            const ac = new AuthenticationRequest(req, config);
            const p = ac.authenticateUser();
            p.then(null, function(error) {
                _assert(function () {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.eql("invalid_user_credentials");
                }, done);
            });
        });
        it('should throw an error when the user is not registered.', function(done) {
            const req = {
                sub: 'unknown',
                password: 'test'
            };
            const ac = new AuthenticationRequest(req, config);
            const p = ac.authenticateUser();
            p.then(null, function(error) {
                _assert(function () {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.eql("user_not_found");
                }, done);
            });
        });
        it('should throw an error when the passwords don\'t match.', function(done) {
            const req = {
                sub: 'user1',
                password: 'mismatch'
            };
            const ac = new AuthenticationRequest(req, config);
            const p = ac.authenticateUser();
            p.then(null, function(error) {
                _assert(function () {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.eql("invalid_user_credentials");
                }, done);
            });
        });
        it('should authenticate the user.', function(done) {
            const req = {
                sub: 'user1',
                password: 'test'
            };
            const ac = new AuthenticationRequest(req, config);
            var p = ac.authenticateUser();
            p.then(function(user) {
                _assert(function () {
                    (user !== null).should.eql(true);
                    user.sub.should.eql('user1');
                }, done);
            }, function(error) {
                done(error);
            });
        });
    }); 

    describe('#isOpenIDRequestSync', function() {
        it('should return true if openid is in scope.', function() {
            var req = {
                client_id: '111',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                scope: 'openid anotherscope'
            };
            const ac = new AuthenticationRequest(req, config);
            ac.isOpenIDRequestSync().should.eql(true);
        });
    });

    describe('#isCodeGrantSync', function() {
        it('should return true if response_type is code.', function() {
            var req = {
                client_id: '111',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                scope: 'openid'
            };
            const ac = new AuthenticationRequest(req, config);
            ac.isCodeGrantSync().should.eql(true);
        });
    }); 

    describe('#isImplicitGrantSync', function() {
        it('should return true if response_type is \'id_token token\'.', function() {
            var req = {
                client_id: '111',
                response_type: 'id_token token',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                scope: 'openid'
            };
            const ac = new AuthenticationRequest(req, config);
            ac.isImplicitGrantSync().should.eql(true);
        });
        it('should return true if response_type is \'id_token\'.', function() {
            var req = {
                client_id: '111',
                response_type: 'id_token',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                scope: 'openid'
            };
            const ac = new AuthenticationRequest(req, config);
            ac.isImplicitGrantSync().should.eql(true);
        });  
        it('should return true if response_type is \'token\'.', function() {
            var req = {
                client_id: '111',
                response_type: 'token',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                scope: ''
            };
            const ac = new AuthenticationRequest(req, config);
            ac.isImplicitGrantSync().should.eql(true);
        });               
    });      
    
    describe('#authorizeWithCodeGrant', function() {
        it('should return an authorization code.', function(done) {
            const user = {
                sub: 'user1'
            };
            const req = {
                client_id: '111',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                granted: 'true',
                user: user,
                state: 'a state',
                scope: 'test'
            };
            const aq = new AuthenticationRequest(req, config);
            aq.authorizeWithCodeGrant().then(function(authRes) {
                _assert(function () {
                    (authRes !== null).should.eql(true);
                    authRes.should.be.instanceof(AuthenticationResponse);
                    authRes.should.have.property('state', 'a state');
                }, done);
            }, function(error) {
                done(error);
            });
        });
        it('should throw an access denied error.', function(done) {
            const data = {
                client_id: '111',
                response_type: 'code',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                granted: 'false',
                scope: 'test'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.authorizeWithCodeGrant();
            p.then(null, function(error) {
                _assert(function () {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.eql("access_denied");
                }, done);
            });
        });
        it('should throw an unsupported response type error.', function(done) {
            const user = {
                sub: 'user1'
            };
            const aq = new AuthenticationRequest({
                client_id: '111',
                response_type: 'xyz',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                granted: 'true',
                user: user,
                scope: 'test'
            }, config);
            aq.authorizeWithCodeGrant().then(null, function(error) {
                _assert(function () {
                    error.should.be.instanceof(AuthenticationError);
                    error.error.should.eql("unsupported_response_type");
                }, done);
            });
        });
    });

    describe('#shouldPromptForConsent', function() {
        before(function(done) {
            config.userConsentService.add(new UserConsent({
                sub: 'test',
                clientId: 'allowed',
                granted: true
            }));
            config.userConsentService.add(new UserConsent({
                sub: 'test',
                clientId: 'notallowed',
                granted: false
            }));
            done();
        });
        it('should not prompt because user consent is already granted.', function(done) {
            const aq = new AuthenticationRequest({
                client_id: 'allowed',
                sub: 'test',
                prompt: 'none'
            }, config);

            aq.shouldPromptForConsent().then(function(prompt) {
                _assert(function() {
                    prompt.should.eql(false);
                }, done);
            }, function(error) {
                done(error);
            });
        });
        it('should prompt for user consent', function(done) {
            const aq = new AuthenticationRequest({
                client_id: 'notfound',
                sub: 'test',
                prompt: 'login consent'
            }, config);
            aq.shouldPromptForConsent().then(function(prompt) {
                _assert(function() {
                    prompt.should.eql(true);
                }, done);
            }, function(error) {
                done(error);
            });
        });
        it('should throw AuthenticationError because user consent doesn\'t exist and prompt == none', function(done) {
            const aq = new AuthenticationRequest({
                client_id: 'notfound',
                sub: 'test',
                prompt: 'none'
            }, config);
            aq.shouldPromptForConsent().fail(function(error) {
                _assert(function() {
                    error.should.be.instanceOf(AuthenticationError);
                    error.should.have.property('error', 'consent_required');
                }, done);
            });
        });

        it('should throw AuthenticationError because access is denied and prompt == none', function(done) {
            const data = {
                client_id: 'notallowed',
                sub: 'test',
                prompt: 'none'
            };
            const ac = new AuthenticationRequest(data, config);
            const p = ac.shouldPromptForConsent();
            p.catch(function(error) {
                _assert(function () {
                    error.should.be.instanceOf(AuthenticationError);
                }, done);
            });
        });
    });

    describe('#shouldPromptForLoginSync', function() {
        it('should return true if prompt login', function() {
            const data = {
                prompt: 'login'
            };

            const ac = new AuthenticationRequest(data, config);
            ac.shouldPromptForLoginSync().should.eql(true);
        });

        it('should return true if user is not authenticated', function() {
            const data = {
            };

            const ac = new AuthenticationRequest(data, config);
            ac.shouldPromptForLoginSync().should.eql(true);
        });

        it('should return false if user is already authenticated and prompt is not none', function() {
            const data = {
                user: new User({})
            };
            const ac = new AuthenticationRequest(data, config);
            ac.shouldPromptForLoginSync().should.eql(false);
        });

        it('should throw an AuthenticationError if user is not authenticated and prompt set to none', function() {
            const data = {
                prompt: 'none'
            };
            const ac = new AuthenticationRequest(data, config);
            (function(){ ac.shouldPromptForLoginSync(); }).should.throw('Login required');

        });
    });

    describe('#authorizeWithImplicitGrant', function() {
        let aq;
        beforeEach(function() {
            const user = {
                sub: 'user1'
            };
            const req = {
                client_id: '111',
                response_type: 'id_token',
                redirect_uri: 'http%3A%2F%2Flocalhost%2Fclient',
                granted: 'true',
                user: user,
                state: 'a state',
                scope: 'openid',
                nonce: '1238383873484'
            };
            aq = new AuthenticationRequest(req, config);
        });

        it('should return an id token.', function(done) {
            aq.authorizeWithImplicitGrant().then(function(authRes) {
                (authRes !== null).should.eql(true);
                authRes.should.be.instanceof(AuthenticationResponse);
                authRes.should.have.property('idToken');
                done();
            }, function(error) {
                console.log('Test failed with error: ' + error);
                done(error);
            });
        });
        it('should return an id and access token.', function(done) {
            aq.responseType = 'id_token token';
            aq.authorizeWithImplicitGrant().then(function(authRes) {
                (authRes !== null).should.eql(true);
                authRes.should.be.instanceof(AuthenticationResponse);
                authRes.should.have.property('idToken');
                authRes.should.have.property('accessToken');
                authRes.accessToken.should.be.not.empty();
                console.log(authRes.idToken);
                done();
            }, function(error) {
                console.log('Test failed with error: ' + error);
                done(error);
            });
        });
        it('should return an access token.', function(done) {
            aq.responseType = 'token';
            aq.scope = '';
            aq.authorizeWithImplicitGrant().then(function(authRes) {
                (authRes !== null).should.eql(true);
                authRes.should.be.instanceof(AuthenticationResponse);
                authRes.should.have.property('accessToken');
                authRes.accessToken.should.be.not.empty();
                done();
            }, function(error) {
                console.log('Test failed with error: ' + error);
                done(error);
            });
        });
    });

});