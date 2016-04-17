var should = require('should'),
    User = require('../../main/lib/model/user');

describe("User", function() {
    describe("#name", function() {
        it("should return the concatenation of names", function() {
                
            var u = new User();
            u.givenName = "Karl";
            u.middleName = "Friedrich";
            u.familyName = "Blumenkohl";
            var name = u.name();
            name.should.equal('Karl Friedrich Blumenkohl');
        });
    });

    describe("#hash", function() {
        it("should encrypt the given passord.", function(done) {
                
            var u = new User();
            var p = u.hash("test");
            p.then(function(value) { 
                console.log(value);
                (value !== null).should.eql(true);
                u.password = value;
                console.log(u);
                // test is done
                done();
            }).done();
            
        });
    });

    describe("#comparePassword", function() {
        it("should compare the given passord with the stored one.", function(done) {
                
            var u = new User();
            u.password = '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu';
            var p = u.comparePassword("test");
            p.then(function(value) { 

                value.should.eql(true);

                done();
            }).done();
            
        });
    });        
});
