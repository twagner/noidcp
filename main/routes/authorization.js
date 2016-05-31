/* Authorization endpoint */
"use strict";
const express = require('express'),
    router = express.Router(),
    Q = require('q');


/*
 * Flow:
 *
 * validate client id and request uri
 * if valid and user is not logged in show login page
 * if valid and user is logged in show consent page
 * else show error page to user
 * on post login
 * retrieve user
 * compare user password
 * if user is valid show consent page
 * else show login page again
 * on post consent page
 * validate the request
 *   check client id and request uri again?!
 * read user decision
 * if valid and user authorizes generate code and send to client
 * else send error to client
 *
 */

/*
 * @private
 * Protect routes from unauthenticated access.
 */
function _restrict(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.render('login', {
        // TODO: include as jwt to prevent disclosure
        data: req.aq
    });
}

function _validate(req, res, next) {

    req.check('response_type', 'Invalid response_type').notEmpty();
    req.check('client_id', 'Invalid client_id').notEmpty().isAlphanumeric();
    // TODO: validate uri (need own validator that decodes the url first).
    req.check('redirect_uri', 'Invalid redirect_uri').notEmpty();
    //req.check('redirect_uri', 'Invalid redirect_uri').isURL();

    req.sanitize('scope').escape();

    if (req.validationErrors()) {
        return res.render('error', {
            message: 'Invalid request'
        });
    }
    next();
}

/**
 * Error handler
 *
 * @param req
 * @param res
 * @param next
 * @private
 */
function _error(error, req, res, next) {

    console.log("Authentication Error: " + error.message);

    if (error.name === 'AuthenticationError') {
        const errorCode = error.error;
        if (errorCode=== 'invalid_user_credentials' || errorCode === 'user_not_found') {
            return res.render('login', {
                // TODO: include as jwt to prevent disclosure
                data: req.aq
            });
        } else if (error.httpStatus === 302) {
            // redirect to client with error
            return res.redirect(302, error.toUri());
        } else {
            return res.render('error', {
                message: error.message
            });
        }

    } else {
        return res.render('error', {
            message: 'Internal Server Error'
        });
    }
}


function _authenticate(req, res, next) {

    console.log('Authorization request');

    // The methods used by the Authorization Server to Authenticate the End-User (e.g. username and password,
    // session cookies, etc.) are beyond the scope of this specification.

    //The Authorization Server MUST attempt to Authenticate the End-User in the following cases:
    // - The End-User is not already Authenticated.
    // - The Authentication Request contains the prompt parameter with the value login. In this case,
    //   the Authorization Server MUST reauthenticate the End-User even if the End-User is already authenticated.

    // The Authorization Server MUST NOT interact with the End-User in the following case:
    // - The Authentication Request contains the prompt parameter with the value none. In this case, the
    //   Authorization Server MUST return an error if an End-User is not already Authenticated
    //   or could not be silently Authenticated.
    let promptForLogin;
    try {
        promptForLogin = req.aq.shouldPromptForLoginSync();
    } catch(e) {
        return _error(e, req, res, next);
    }
    if (promptForLogin) {
        console.log('Authorization request: render login');
        // display login page

        return res.render('login', {
            // TODO: include as jwt to prevent disclosure
            data: req.aq,
            title: 'Login'
        });

    } else if (req.aq.shouldPromptForAccountSync()) {

        // TODO: account selection
        console.log('Authorization request: account selection');
    } else {
        // forward to decision
        console.log('Authorization request: check prompt for decision.');
        // check if consent is already granted (or if it is an internal client).
        req.aq.shouldPromptForConsent().then(function(prompt) {

            if (prompt) {
                console.log('Authorization request: must prompt for decision.');
                return res.render('decision', {
                    data: req.aq,
                    title: 'Decision'
                });
            } else {

                // authorize
                return req.aq.authorize().then(function(ar) {
                    return res.redirect(302, ar.toUri());
                });
            }

        }).catch(function(error) {
            console.log('Authorization request: error');
            return _error(error, req, res, next);
        });

    }
}

/*
 * Clients may use GET to send the authorization request.
 */
router.get('/', [_validate, _authenticate]);

/*
 * Clients may use POST to send the authorization request.
 */
router.post('/', [_validate, _authenticate]);

router.post('/justlogin', function(req, res, next) {

    console.log('Authorization: post from login page.');

    return Q.ninvoke(req.session, "regenerate").then(function() {

        console.log('Authorization: session regenerated');

        return req.aq.authenticateUser().then(function(user) {
            console.log("Authorization: user authenticated.");

            req.session.user = user;
            const now = new Date();
            req.session.authTime = now.getTime();

            return res.end();

        }).catch(function(error) {
            return _error(error, req, res, next);
        });
    });

});

router.post('/login', function(req, res, next) {

    console.log('Authorization: post from login page.');

    return Q.ninvoke(req.session, "regenerate").then(function() {

        console.log('Authorization: session regenerated');

        return req.aq.authenticateUser().then(function(user) {
            console.log("Authorization: user authenticated.");

            req.session.user = user;
            const now = new Date();
            req.session.authTime = now.getTime();

            return req.aq.shouldPromptForConsent().then(function(prompt) {
                console.log("Authorization: should prompt for consent.");

                if (prompt) {
                    return res.render('decision', {
                        // TODO: include as jwt to prevent disclosure
                        data: req.aq,
                        title: 'Decision'
                    });
                } else {

                    return req.aq.authorize().then(function(ar) {
                        return res.redirect(302, ar.toUri());
                    });
                }
            });
        }).catch(function(error) {
            return _error(error, req, res, next);
        });
    });

});

/**
 * receive decision from user
 */
router.post('/decision', _restrict, function(req, res, next) {
    // TODO: howto prevent direct submit with granted parameter?
    return req.aq.userConsent().then(function(uc) {
        console.log('Authorization: user consent added.');
        if (uc.granted) {
            return req.aq.authorize().then(function (ar) {
                return res.redirect(302, ar.toUri());
            });
        }
    }).catch(function(error) {
        console.log('Authorization: user consent denied.');
        return _error(error, req, res, next);
    });
});


module.exports = router;