/**
 * Created by twagner on 31/10/15.
 */
"use strict";

const fs = require('fs'),
    path = require('path'),
    should = require('should'),
    jwt = require('jsonwebtoken'),
    idTokenService = require('../main/lib/idTokenService'),
    config = require('../main/config'),
    _assert = require('./assert');

describe('IdTokenService', function() {
    describe('#createIdToken', function() {
       it('return a jwt token', function(done) {
           const service = idTokenService(config.iss, config.privkey, config.pubkey);
           service.createIdToken({
               sub: 'test',
               aud: 'client',
               nonce: '123w342w3423423'
           }).then(function(jwtToken) {

               console.log(jwtToken);
               _assert(function() {
                   const decoded = jwt.verify(jwtToken, config.pubkey);
                   decoded.should.have.property('sub', 'test');
                   decoded.should.have.property('aud', 'client');
                   decoded.should.have.property('nonce', '123w342w3423423');
               }, done);

           }, function(error) {
               done(error);
           });
       });
    });

});