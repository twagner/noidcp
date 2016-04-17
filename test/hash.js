var bcrypt = require('bcryptjs');
/*
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash("B4c0/\/", salt, function(err, hash) {
        // Store hash in your password DB.
        console.log(hash);
    });
});
*/

bcrypt.compare("user1", '$2a$10$kZ5bqr0plu7xO1qxtu7YsemDMn.fwscLi3yaAdVZWXP3Y7lMwZKXd', function(err, done) { console.log(done); });
