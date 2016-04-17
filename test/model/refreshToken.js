"use strict";

const should = require('should'),
    Client = require('../../main/lib/model/client'),
    User = require('../../main/lib/model/user'),
    RefreshToken = require('../../main/lib/model/refreshToken');

describe("RefreshToken", function() {
    describe("#constructor", function() {
        it("should initialize the token with the given parameters.", function() {
            const client = new Client({
                clientId: 'test'
            });
            const user = new User({
                sub: 'user'
            });
            const refreshToken = new RefreshToken({
                client: client,
                user: user,
                expiresIn: 200
            });
            refreshToken.generate();
            refreshToken.client.clientId.should.eql('test');
            refreshToken.user.sub.should.eql('user');
            refreshToken.expiresIn.should.eql(200);
            refreshToken.token.should.have.length(21);
        });
    });
});