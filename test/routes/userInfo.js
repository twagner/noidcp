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
    describe('', function() {
        it('', function(done) {
            request(app).get('/userinfo')
                .set('Bearer', '123456789')
                .end(function(e, res) {
                    if (e) {
                        return done(e);
                    }
                    _assert(function () {
                        //res.status.should.eql(400);
                        //res.body.error.should.eql('unsupported_grant_type');
                        console.log(res.text);
                    }, done);
                });
        });
    });
});