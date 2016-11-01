const bcrypt = require('bcryptjs');

const plaintext = process.argv[2];

if (plaintext) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(plaintext, salt, function(err, hash) {
            if (err) {
                return console.log("Error hashing password!");
            }
            console.log(hash);
        });
    });
} else {
    console.log("Usage: node passwd.js <password>");
}
