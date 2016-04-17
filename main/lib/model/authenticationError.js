"use strict";
const S = require('string');


/**
 * TODO: Better constructor.
 * TODO: Need to differentiate if we must send the error to the client or to the end user.
 * TODO: Move to lib
 *
 * @param error
 * @param opts
 * @constructor
 */
function AuthenticationError(error, opts) {
    this.name = 'AuthenticationError';
    this.error = error || 'server_error';
    this.message = S(this.error).humanize().s || 'Default Message';
    this.description = this.message;
    this.state = null;
    this.uri = null;
    this.redirectUri = '';

    // Status in 3xx range means that we send the error to the client.
    // Otherwise the error is returned to the end user (browser).
    this.httpStatus = 302;

    switch (error) {
        // OAuth2 error codes
        case 'invalid_request':
        case 'unauthorized_client':
        case 'access_denied':
        case 'unsupported_response_type':
        case 'invalid_scope':
        case 'server_error':
        case 'temporarily_unavailable':
        // Additional OpenID error codes:
        case 'interaction_required':
        case 'login_required':
        case 'account_selection_required':
        case 'consent_required':
        case 'invalid_request_uri':
        case 'invalid_request_object':
        case 'request_not_supported':
        case 'request_uri_not_supported':
        case 'registration_not_supported':
            this.httpStatus = 302;
            break;
        // own error codes
        case 'invalid_client_id':
        case 'invalid_redirect_uri':
        case 'invalid_user_credentials':
            this.httpsStatus = 400;
            break;
        case 'client_not_found':
        case 'user_not_found':
            this.httpStatus = 404;
            break;
        case 'internal_server_error':
            this.httpStatus = 500;
            break;
        default:
            this.httpStatus = 500;
    }

    if (opts) {
        for (let attr in opts) {
            if (this.hasOwnProperty(attr)) this[attr] = opts[attr];
        }
    }
}

AuthenticationError.prototype = Object.create(Error.prototype);
AuthenticationError.prototype.constructor = AuthenticationError;

AuthenticationError.prototype.toUri = function() {
    var q = this.redirectUri + '?error=' + this.error;
    if (this.state) {
        q += '&state=' + encodeURIComponent(this.state);
    }
    if (this.description) {
        q += '&error_description=' + encodeURIComponent(this.description);
    }
    if (this.uri) {
        q += '&error_uri=' + encodeURIComponent(this.uri);
    }
    return q;
}; 

module.exports = AuthenticationError;






