/**
 * Created by twagner on 8/19/15.
 */
"use strict";

const Model = require('./model'),
    crypto = require('crypto');

function UserConsent(data) {
    Model.call(this);

    // the id (subject)
    this.sub = null;
    this.clientId = null;
    this.granted = false;
    this.scope = null;

    this.init(data);

    this.generateId();
}

UserConsent.prototype = Object.create(Model.prototype);
UserConsent.prototype.constructor = UserConsent;

UserConsent.prototype.generateId = function() {
    if (!this.sub) {
        throw new Error('sub property is required!');
    }
    if (!this.clientId) {
        throw new Error('clientId property is required!');
    }
    const shasum = crypto.createHash('sha1');
    shasum.update(this.sub + '' + this.clientId);
    if (this.scope) {
        shasum.update(this.scope);
    }
    this.userConsentId = shasum.digest('hex');
    console.log('UserConsent#generateId: ' + this.userConsentId);
    return this.userConsentId;
};

module.exports = UserConsent;