"use strict";

const should = require('should'),
    moment = require('moment'),
    AuthorizationCode = require('../../main/lib/model/authorizationCode');

describe("AuthorizationCode", function() {
    describe("#generate", function() {
        it("should return a random string", function() {

            const ac = new AuthorizationCode();
            ac.codeLength = 10;
            ac.generate();
            console.log(ac.code);
            ac.code.should.have.length(10);
        });
    });

    describe("#constructor", function() {
        it("should have a expiration time of 10 minutes", function() {

            const ac = new AuthorizationCode();
            console.log("Expires " + ac.expiration);
            const inTenMin = moment().add(10, 'm').toDate().getTime();
            const diff = inTenMin - ac.expiration.getTime();
            diff.should.be.within(0, 2);
        });
    });

    describe("#isValidSync", function() {
        it("should check if the authorization code is valid.", function() {
            const ac = new AuthorizationCode();
            ac.generate();
            ac.isValidSync().should.eql(true);
        });
    });

    describe("#isValidSync with expired code", function() {
        it("should return false.", function() {
            const ac = new AuthorizationCode();
            ac.generate();
            ac.expiration = moment().add(-5, 'm').toDate();
            ac.isValidSync().should.eql(false);
        });
    });  

    describe("#isOpenIDSync", function() {
        it("should return true if the scope is 'openid'.", function() {
            const ac = new AuthorizationCode({
                scope: 'openid'
            });
            ac.generate();
            ac.isOpenIDSync().should.eql(true);
        });
    });

    describe("#isOpenID with no scope", function() {
        it("should return false'.", function() {
            const ac = new AuthorizationCode();
            ac.generate();
            ac.isOpenIDSync().should.eql(false);
        });
    });            

});