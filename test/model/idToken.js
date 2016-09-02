"use strict";

const should = require('should'),
    IdToken = require('../../main/lib/model/idToken'),
    codeGenerator = require('../../main/lib/util/codeGenerator'),
    jwt = require('jsonwebtoken'),
    config = require('../../main/config');

describe("IdToken", function() {

    const algorithm = 'HS256';


    describe("#supportsSymetricAlgorithm with HS256", function() {
        it("should return true if the algorithm is supported.", function() {
            const idToken = new IdToken({});
            const secret = codeGenerator.generate(32);
            idToken.supportsSymetricAlgorithm('HS256', secret).should.eql(true);

        });
    });
    describe("#supportsSymetricAlgorithm with HS256 and insufficient key length", function() {
        it("should return false.", function() {
            const idToken = new IdToken({});
            const secret = codeGenerator.generate(20);
            idToken.supportsSymetricAlgorithm('HS256', secret).should.eql(false);

        });
    }); 
    describe("#supportsSymetricAlgorithm with HS384", function() {
        it("should return true if the algorithm is supported.", function() {
            const idToken = new IdToken({});
            const secret = codeGenerator.generate(48);
            idToken.supportsSymetricAlgorithm('HS384', secret).should.eql(true);

        });
    }); 
    describe("#supportsSymetricAlgorithm with HS384 and insufficient key length", function() {
        it("should return false.", function() {
            const idToken = new IdToken({});
            const secret = codeGenerator.generate(47);
            idToken.supportsSymetricAlgorithm('HS384', secret).should.eql(false);

        });
    }); 
    describe("#supportsSymetricAlgorithm with HS512", function() {
        it("should return true if the algorithm is supported.", function() {
            const idToken = new IdToken({});
            const secret = codeGenerator.generate(64);
            idToken.supportsSymetricAlgorithm('HS512', secret).should.eql(true);

        });
    }); 
    describe("#supportsSymetricAlgorithm with HS512 and insufficient key length", function() {
        it("should return false.", function() {
            const idToken = new IdToken({});
            const secret = codeGenerator.generate(63);
            idToken.supportsSymetricAlgorithm('HS512', secret).should.eql(false);

        });
    });   

    describe("#signSymetric", function() {

        it("should contain all required claims", function() {
            const idToken = new IdToken({
                iss: 'test',
                sub: 'the subject',
                aud: 'client id'
            });
            const secret = codeGenerator.generate(32);
            idToken.signSymetric('HS256', secret);

            const verified = jwt.verify(idToken.jwtToken, secret);
            verified.should.have.property('iss');
            verified.should.have.property('sub');
            verified.should.have.property('aud');
            verified.should.have.property('exp');
            verified.should.have.property('iat');
        });

        it("should also contain nonce if specified", function() {
            const idToken = new IdToken({
                iss: 'test',
                sub: 'the subject',
                aud: 'client id',
                nonce: 'dsfas'
            });
            const secret = codeGenerator.generate(32);
            idToken.signSymetric('HS256', secret);
            const verified = jwt.verify(idToken.jwtToken, secret);
            verified.should.have.property('nonce');
        });

        it("should also contain authTime if specified", function() {
            const idToken = new IdToken({
                iss: 'test',
                sub: 'the subject',
                aud: 'client id',
                authTime: 123
            });
            const secret = codeGenerator.generate(32);
            idToken.signSymetric('HS256', secret);
            const verified = jwt.verify(idToken.jwtToken, secret);
            verified.should.have.property('auth_time');
        });

        it("should contain additional claims", function() {
            const idToken = new IdToken({
                iss: 'test',
                sub: 'the subject',
                aud: 'client id',
                name: 'maus',
                email: 'maus@home.xy'
            });
            const secret = codeGenerator.generate(32);
            idToken.signSymetric('HS256', secret);
            const verified = jwt.verify(idToken.jwtToken, secret);

            verified.should.have.property('name');
            verified.should.have.property('email');
        });
    });

    describe("#sign", function() {
        it("should contain all required and additional claims", function() {
            const nonce = codeGenerator.generate(32);
            const idToken = new IdToken({
                iss: config.iss,
                sub: 'the subject',
                aud: 'client id',
                name: 'maus',
                email: 'maus@home.xy',
                nonce: nonce
            });
            idToken.sign('RS256', config.privkey);
            const verified = jwt.verify(idToken.jwtToken, config.pubkey);
            verified.should.have.property('iss', config.iss);
            verified.should.have.property('sub');
            verified.should.have.property('aud');
            verified.should.have.property('exp');
            verified.should.have.property('iat');
            verified.should.have.property('nonce', nonce);
            verified.should.have.property('name', 'maus');
            verified.should.have.property('email', 'maus@home.xy');
        });
    });


});
