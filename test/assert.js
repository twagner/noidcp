"use strict";

/**
 * Created by twagner on 02/01/16.
 */
module.exports = function(assertations, done) {
    try {
        assertations();
        done();
    } catch(e) {
        done(e);
    }
};