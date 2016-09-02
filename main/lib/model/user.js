"use strict";

const Model = require('./model'),
    Q = require('q'),
    bcrypt = require('bcryptjs'),
    _ = require('underscore');

function User(data) {
    Model.call(this);

    // the id (subject)
    this.sub = null;

    this.givenName = "";
    this.familyName = "";
    this.middleName = "";
    this.nickname = "";
    this.preferredUsername = "";
    this.profile = null;
    this.picture = null;
    this.website = null;
    this.email = null;
    this.emailVerified = null;
    this.gender = null;
    this.birthdate = null;
    this.zoneinfo = "Europe/Paris";
    this.locale = "de_DE";
    this.phoneNumber = null;
    this.phoneNumberVerified = false; 	
    this.address = null;
    this.updatedAt = null;

    this.password = null;

    this.init(data);

    this._userInfo = {
        sub: this.sub,
        name : this.name(),
        given_name: this.givenName,
        family_name: this.familyName,
        middle_name: this.middleName,
        nickname: this.nickname,
        preferred_username: this.preferredUsername,
        profile: this.profile,
        picture: this.picture,
        website: this.website,
        email: this.email,
        email_verified: this.emailVerified,
        gender: this.gender,
        birthdate: this.birthdate,
        zoneinfo: this.zoneinfo,
        locale: this.locale,
        phone_number: this.phoneNumber,
        phone_number_verified: this.phoneNumberVerified,
        address: this.address,
        updated_at: this.updatedAt
    };
}

User.prototype = new Model();
User.prototype.constructor = User;

/**
 * End-User's full name in displayable form including all name parts, possibly 
 * including titles and suffixes, ordered according to the End-User's 
 * locale and preferences. 
 */
User.prototype.name = function () {
    let name = "";
    if (this.givenName) {
        name = this.givenName;
    }
    if (this.middleName) {
        name += " " + this.middleName;
    }
    if (this.familyName) {
        name += " " + this.familyName;
    }
    return name;
};

User.prototype.toJson = function() {
    return JSON.stringify(this._userInfo);
};

/**
 * Returns userInfo by scope.
 * @param scope
 * @returns {{}}
 */
User.prototype.userInfoSync = function(scope) {

    // default claims returned by this method.
    let claims = ['sub', 'name'];
    if (scope) {
        claims = scope.split(" ");
    }
    const payload = {};
    const self = this;
    _.each(claims, function(key, index, list) {
        payload[key] = self._userInfo[key];
    });
    return payload;
};

User.prototype.hash = function(plaintext) {
    return Q.nfcall(this.hashPwd_, plaintext);
};

User.prototype.comparePassword = function(plaintext) {
    return Q.nfcall(bcrypt.compare, plaintext, this.password);
};

User.prototype.hashPwd_ = function(plaintext, cb) {
    const self = this;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(plaintext, salt, function(err, hash) {
            cb(err, hash);
        });
    });
};

User.prototype._id = null;



module.exports = User;
