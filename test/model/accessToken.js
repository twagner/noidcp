"use strict";

const should = require('should'),
    AccessToken = require('../../main/lib/model/accessToken'),
    moment = require('moment');


describe('AccessToken', function() {
    describe('#isExpiredSync', function() {

        it('should not be expired', function() {
            const at = new AccessToken({
                sub: 'a user',
                clientId : 'a client',
                token : 'abc'
            });

            should(at.isExpiredSync()).be.false();
        });

        it('should be expired', function() {
            const at = new AccessToken({
                sub: 'a user',
                clientId : 'a client',
                token : 'abc',
                creationDate : moment().subtract(3700, 'seconds')
            });

            should(at.isExpiredSync()).be.true();
        });
    });
});