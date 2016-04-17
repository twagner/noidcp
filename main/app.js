"use strict";
const express = require('express'),
    session = require('express-session'),
    path = require('path'),
    fs = require('fs'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    routes = require('./routes/index'),
    users = require('./routes/users'),
    authorization = require('./routes/authorization'),
    token = require('./routes/token'),
    userInfo = require('./routes/userInfo'),
    verification = require('./routes/verification'),
    health = require('./routes/health'),
    info = require('./routes/info'),
    openIDConnect = require('./lib/openIDConnect'),
    config = require('./config'),
    https = require('https'),
    http = require('http'),
    env = process.env;

const app = express();


// must define cookie-parser and session before routes
app.use(cookieParser());

// session middleware
let s = session({
  secret: 'is it secret? is it safe?',
  resave: false,
  saveUninitialized: true
});
app.use(s);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(express.static(path.join(__dirname, 'public')));


// OpenID Connect middleware
/*
const config = {
    iss: 'http://localhost',
    dbLocation: 'mem',
    privkey: fs.readFileSync(path.resolve(__dirname, '../privkey.pem')),
    pubkey: fs.readFileSync(path.resolve(__dirname, '../pubkey.pem'))
};
*/

//app.use(openIDConnect(config));


app.use('/', routes);
app.use('/users', users);
app.use('/authorization', openIDConnect(config).authorizationEndpoint, authorization);
app.use('/token', openIDConnect(config).tokenEnpoint, token);
app.use('/userinfo', openIDConnect(config).bearerTokenFilter, openIDConnect(config).userInfoEndpoint, userInfo);
app.use('/health', health);
app.use('/info', info);
//app.use('/verify', openIDConnect(config).verificationEndpoint, verification);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// need this for supertest
module.exports = app;

http.createServer(app).listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
    //var host = server.address().address;
    //var port = server.address().port;

    console.log('Authorization server started.');
});

const options = {
    key: fs.readFileSync(path.resolve(__dirname, '../sslkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../sslcert.pem'))
};

https.createServer(options, app).listen(3443, function () {
    //var host = server.address().address;
    //var port = server.address().port;

    console.log('Secured Authorization server started.');
});
/*
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Authorization server at http://%s:%s', host, port);
});
*/
