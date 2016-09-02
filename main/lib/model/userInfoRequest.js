/**
 * Created by twagner on 10/02/16.
 */
"use strict";


function UserInfoRequest(dependencies) {
    this._userService = dependencies.userService;
    this._accessTokenService = dependencies.accessTokenService;
}

UserInfoRequest.prototype.getDefaultUserInfo = function(sub) {
    return this.getUserInfoByScope(sub, 'sub name');
};

UserInfoRequest.prototype.getUserInfoByScope = function(sub, scope) {
    return this._getUser(sub).then(function(user) {
        return user.userInfoSync(scope);
    });
};

UserInfoRequest.prototype._getUser = function(sub) {
    return this._userService.findById(sub).then(function(user) {
        return user;
    });
};

module.exports = UserInfoRequest;