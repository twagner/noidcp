/**
 * Created by twagner on 2/11/15.
 */
"use strict";

const should = require('should'),
    AuthenticationResponse = require('../../main/lib/model/authenticationResponse');

describe('AuthenticationResponse', function() {

    const redirectUri = 'http://localhost/client';

    describe('#toUri', function() {
        it('should return code for code grant', function() {

            const ar = new AuthenticationResponse({
                redirectUri: redirectUri,
                code: 'foo',
                state: 'a bar',
                responseType: 'code'
            });
            const uri = ar.toUri();
            uri.should.be.equal('http://localhost/client?code=foo&state=a%20bar');
            console.log(uri);
        });

        it('should return access token and id token', function() {
            const ar = new AuthenticationResponse({
                redirectUri: redirectUri,
                code: 'foo',
                state: 'a bar',
                accessToken: '1234567890',
                idToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...',
                responseType: 'id_token token'
            });
            const uri = ar.toUri();
            uri.should.be.equal('http://localhost/client?token_type=bearer&access_token=1234567890&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...&state=a%20bar');
        });

        it('should return id token', function() {
            const ar = new AuthenticationResponse({
                redirectUri: redirectUri,
                code: 'foo',
                state: 'a bar',
                accessToken: '1234567890',
                idToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...',
                responseType: 'id_token'
            });
            const uri = ar.toUri();
            uri.should.be.equal('http://localhost/client?token_type=bearer&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...&state=a%20bar');
        });

        it('should return access token', function() {
            const ar = new AuthenticationResponse({
                redirectUri: redirectUri,
                code: 'foo',
                state: 'a bar',
                accessToken: '1234567890',
                responseType: 'token'
            });
            const uri = ar.toUri();
            uri.should.be.equal('http://localhost/client?token_type=bearer&access_token=1234567890&state=a%20bar');
        });

        it('should fail because of missing responseType', function() {
            (function(){
                const ar = new AuthenticationResponse({
                    redirectUri: redirectUri,
                    code: 'foo',
                    state: 'a bar',
                    accessToken: '1234567890'
                });
            }).should.throw();
        });

        it('should fail because of missing redirectUri', function() {
            (function(){
                const ar = new AuthenticationResponse({
                    responseType: 'token',
                    code: 'foo',
                    state: 'a bar',
                    accessToken: '1234567890'
                });
            }).should.throw();
        });

        it('should fail because of missing access token', function() {
            const ar = new AuthenticationResponse({
                redirectUri: redirectUri,
                code: 'foo',
                state: 'a bar',
                responseType: 'token'
            });
            (function() { ar.toUri(); }).should.throw();
        });

        it('should fail because of missing id token', function() {
            const ar = new AuthenticationResponse({
                redirectUri: redirectUri,
                code: 'foo',
                state: 'a bar',
                responseType: 'id_token'
            });
            (function() { ar.toUri(); }).should.throw();
        });
    });
});
