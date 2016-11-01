/**
 * Created by twagner on 30/10/16.
 */

"use strict";

const auth = require('basic-auth');

const securityFilter = function(config) {

    if (!config.userService || !config.authorizedUser) {
        throw new Error("Invalid configuration for SecurityFilter!");
    }

    const obj = {};

    return function(req, res, next) {
        const credentials = auth(req);
        if (!credentials || !credentials.name || !credentials.pass) {
            return res.status(403).end();
        }
        return config.userService.findBySub(credentials.name).then(function(user) {
            console.log('SecurityFilter#authenticateUser: user ' + user.sub);
            // match password
            return user.comparePassword(credentials.pass).then(function (match) {
                console.log('SecurityFilter#authenticateUser: match password ' + match);
                if (!match) {
                    return res.status(403).end();
                }
                if (user.sub !== config.authorizedUser) {
                    return res.status(403).end();
                }
                next();
            });
        }, function() {
            return res.status(403).end();
        });
    };
    //return obj;
};

module.exports = securityFilter;