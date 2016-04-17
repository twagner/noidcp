/**
 * Created by twagner on 2/11/15.
 */
"use strict";
const S = require('string');

function TokenError(error, description) {
    this.name = 'TokenError';
    this.error = error;
    this.message = S(this.error).humanize().s;
    if (description) {
        this.description = description;
    } else {
        this.description = this.message;
    }
    this.httpStatus = 400;

}

TokenError.prototype = Object.create(Error.prototype);
TokenError.prototype.constructor = TokenError;

module.exports = TokenError;