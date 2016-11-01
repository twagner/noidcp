/**
 * Created by twagner on 8/28/15.
 */
"use strict";
const User = require('./model/user'),
    Service = require('./service');

module.exports = function(userDb) {
    const service = new Service(userDb, User, 'sub');

    /**
     *
     * @param sub
     * @returns {Promise.<User>}
     */
    service.findBySub = function(sub) {
        console.log('UserService#findBySub: ' + sub);
        return this.findById(sub);
    };

    service.createReadStream  = userDb.createReadStream;

    return service;

};
