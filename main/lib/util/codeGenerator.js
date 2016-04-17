"use strict";

const crypto = require('crypto');


function CodeGenerator() {
    this.charSet = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
}

/**
 * Function that generate a random string code.
 *
 * https://github.com/spring-projects/spring-security-oauth/blob/master/spring-security-oauth2/src/main/java/org/springframework/security/oauth2/common/util/RandomValueStringGenerator.java
 *
 */
CodeGenerator.prototype.generate = function(codeLength) {

    let bytes = crypto.randomBytes(codeLength);
    let code = new Array(codeLength);
    for (let i = 0; i < codeLength; i++) {
        // mod with charset length so that the index always stays within range. 
        code[i] = this.charSet[bytes[i] % this.charSet.length];
    }
    return code.join('');
};


const generator = new CodeGenerator();
module.exports = generator;