
"use strict";

const should = require('should'),
    Client = require('../../main/lib/model/client');

describe("Client", function() {

    describe("#matchRedirectUrl1", function() {
        it("should return true ", function() {
            var client = new Client();
            client.redirectUri = 'http%3A%2F%2Flocalhost%2Fclient';
            
            var m = client.matchRedirectUri(encodeURIComponent('http://localhost/client'));
            m.should.eql(true);
                
        });
    });

    describe("#matchRedirectUrl2", function() {
        it("should return true ", function() {
            var client = new Client();
            client.redirectUri = 'http://localhost/test/1';
            
            var m = client.matchRedirectUri(encodeURIComponent('http://localhost/test/1'));
            m.should.eql(true);
                
        });
    });    
    
    describe("#constructor", function() {
        it("should populate the client arributes from the given object.", function() {
            var client = new Client({
                clientName: "test",
                redirectUri: "http://localhost"
            });
            client.clientName.should.eql("test");
            client.redirectUri.should.eql("http://localhost");
                
        });
    });  
    
    describe("#getEncodedRedirectUri", function() {
        it("should return the redirectUri 'application/x-www-form-urlencoded' encoded", function() {
            var client = new Client({
                clientName: "test",
                redirectUri: "http://localhost/q ry"
            });
            
            client.getEncodedRedirectUri().should.eql("http%3A%2F%2Flocalhost%2Fq+ry");
                
        });
    }); 

    describe("#comparePassword", function() {
        it("should compare the given clientSecret with the stored one.", function(done) {
                
            var client = new Client({
                clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu'
            });
            var p = client.comparePassword("test");
            p.then(function(value) { 

                value.should.eql(true);

                done();
            }).done();
            
        });
    });  

    describe("#comparePassword2", function() {
        it("should compare the given clientSecret with the stored one.", function(done) {
                
            var client = new Client({
                clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu'
            });
            var p = client.comparePassword("invalid");
            p.then(function(value) { 

                value.should.eql(false);

                done();
            }).done();
            
        });
    });          
});

