/**
 * Created by twagner on 10/02/16.
 */
"use strict";

function UserInfoRequest(dependencies) {
    this.userService = dependencies.userService;
    this.accessTokenService = dependencies.accessTokenService;
}

UserInfoRequest.prototype.verifyAccessToken = function(bearer) {
    return this.accessTokenService.verify(bearer);
};

UserInfoRequest.prototype.getDefaultUserInfo = function(sub) {
    return this._getUser(sub).then(function(user) {
        const json = {
            sub : user.sub,
            name : user.name(),
            email : user.email
        };
        return json;
    });
};

UserInfoRequest.prototype._getUser = function(sub) {
    return this.userService.findById(sub).then(function(user) {
        return user;
    });
};

module.exports = UserInfoRequest;