"use strict";

const should = require('should'),
    User = require('../../main/lib/model/user');

describe("User", function() {
    describe("#name", function() {
        it("should return the concatenation of names", function() {
                
            const u = new User();
            u.givenName = "Karl";
            u.middleName = "Friedrich";
            u.familyName = "Blumenkohl";
            const name = u.name();
            name.should.equal('Karl Friedrich Blumenkohl');
        });
    });

    describe("#hash", function() {
        it("should encrypt the given passord.", function(done) {
                
            const u = new User();
            const p = u.hash("test");
            p.then(function(value) { 
                console.log(value);
                (value !== null).should.eql(true);
                u.password = value;
                // test is done
                done();
            }).done();
            
        });
    });

    describe("#comparePassword", function() {
        it("should compare the given passord with the stored one.", function(done) {
                
            const u = new User();
            u.password = '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu';
            const p = u.comparePassword("test");
            p.then(function(value) { 

                value.should.eql(true);

                done();
            }).done();
            
        });
    });

    describe("#userInfoSync", function() {
        it("return user info filtered by scope", function() {
            const u = new User({
                sub : '123',
                givenName : 'Foo',
                familyName : 'Bar',
                nickname : 'foobar',
                email : 'foobar@mail.xy'
            });
            const userInfo = u.userInfoSync('sub name');
            userInfo.should.have.property('sub');
            userInfo.should.have.property('name');
            userInfo.should.not.have.property('email');
            userInfo.should.not.have.property('nickname');
        });
    });
});
