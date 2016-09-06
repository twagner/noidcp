"use strict";

const clientServiceFactory = require('./lib/clientService'),
    userServiceFactory = require('./lib/userService'),
    authorizationCodeServiceFactory = require('./lib/authorizationCodeService'),
    userConsentServiceFactory = require('./lib/userConsentService'),
    idTokenService = require('./lib/idTokenService'),
    accessTokenService = require('./lib/accessTokenService'),
    refreshTokenService = require('./lib/refreshTokenService'),
    AuthenticationRequest = require('./lib/model/authentication'),
    AuthorizationCode = require('./lib/model/authorizationCode'),
    RefreshToken = require('./lib/model/refreshToken'),
    AccessToken = require('./lib/model/accessToken'),
    Client = require('./lib/model/client'),
    User = require('./lib/model/user'),
    dbFactory = require('./lib/dbFactory'),
    levelup = require('levelup'),
    memdown = require('memdown'),
    fs = require('fs'),
    path = require('path'),
    moment = require('moment');

// TODO: file location
let db;
if (process.env.NODE_ENV !== 'production') {
    db = levelup({ db: memdown, valueEncoding: 'json' });
} else {
    db = levelup('./db', { valueEncoding: 'json' });
}

const clientDb = dbFactory(db, 'client');
const userDb = dbFactory(db, 'user');
const authorizationCodeDb = dbFactory(db, 'authorizationCode');
const userConsentDb = dbFactory(db,'userConsent');
const accessTokenDb = dbFactory(db, 'accessToken');
const refreshTokenDb = dbFactory(db, 'refreshToken');

if (process.env.NODE_ENV !== 'production') {
    clientDb.put('111', new Client({
        clientId: '111',
        clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        clientName: 'test',
        redirectUri: 'http://localhost/client'
    }));
    clientDb.put('112', new Client({
        clientId: '112',
        clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        clientName: 'test2',
        redirectUri: 'http://localhost/client2'
    }));
    clientDb.put('s6BhdRkqt3', new Client({
        clientId: 's6BhdRkqt3',
        clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        clientName: 's6BhdRkqt3',
        redirectUri: 'http://noidcjc-tgwagner.rhcloud.com/oauth2callback'
    }));
    clientDb.put('local', new Client({
        clientId: 'local',
        clientSecret: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        clientName: 'local',
        redirectUri: 'http://localhost:9090/oauth2callback'
    }));    
    userDb.put('test', new User({
        sub: 'test',
        givenName: 'Thomas',
        familyName: 'Wagner',
        // password = test
        password: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        email: 'test@mail.de'
    }));
    userDb.put('user1', new User({
        sub: 'user1',
        givenName: 'User',
        familyName: '1',
        // password = test
        password: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        email: 'dummy@mail.de'
    }));
    userDb.put('Birgit.Feldmann@fernuni-hagen.de', new User({
        sub: 'Birgit.Feldmann@fernuni-hagen.de',
        givenName: 'Birgit',
        familyName: 'Feldmann',
        password: '$2a$10$DH8B5ZMp/gYV0FPNmpdj6e9LivlBBjUgVIacxstN/Ob/s8oYaL7xu',
        email: 'Birgit.Feldmann@fernuni-hagen.de'
    }));
    // adding some authorization codes:
    authorizationCodeDb.put('11100000001', new AuthorizationCode({
        code: '11100000001',
        sub: 'user1',
        clientId: '111',
        redirectUri: 'http://localhost/client',
        scope: 'test'
    }));
    authorizationCodeDb.put('11200000001', new AuthorizationCode({
        code: '11200000001',
        clientId: '112',
        redirectUri: 'http://localhost/client2',
        scope: 'test'
    }));
    authorizationCodeDb.put('11100000002', new AuthorizationCode({
        code: '11100000002',
        sub: 'user1',
        clientId: '111',
        redirectUri: 'http://localhost/client',
        scope: 'test'
    }));
    authorizationCodeDb.put('11100000003', new AuthorizationCode({
        code: '11100000003',
        sub: 'user1',
        clientId: '111',
        redirectUri: 'http://localhost/client',
        scope: 'openid test'
    }));
    // revoked refresh token
    refreshTokenDb.put('BKfaW6wjLL0yAp9XdQaO', new RefreshToken({
        token: 'BKfaW6wjLL0yAp9XdQaO',
        clientId: '111',
        revoked: true,
        scope: 'test'
    }));
    // refresh token with different client id.
    refreshTokenDb.put('mZzOhOuFj6yIMXYc7M57', new RefreshToken({
        token: 'mZzOhOuFj6yIMXYc7M57',
        clientId: '112',
        scope: 'test'
    }));
    // expired refresh token.
    refreshTokenDb.put('5PbaQQJtns36mFs1AAZs', new RefreshToken({
        token: '5PbaQQJtns36mFs1AAZs',
        clientId: '111',
        expiration: moment().add(-7, 'd').toDate(),
        scope: 'test'
    }));
    refreshTokenDb.put('WX0X7Kew7f7z7UvGmgQC', new RefreshToken({
        token: 'WX0X7Kew7f7z7UvGmgQC',
        clientId: '111',
        expiration: moment().add(5, 'd').toDate(),
        scope: 'test'
    }));
    refreshTokenDb.put('axBtCHW1FaD0rQLROhv4', new RefreshToken({
        token: 'axBtCHW1FaD0rQLROhv4',
        clientId: '111',
        expiration: moment().add(5, 'd').toDate(),
        scope: 'openid test',
        sub: 'user1'
    }));
    accessTokenDb.put('123456789', new AccessToken({
        sub : 'test',
        clientId : '111',
        token: '123456789',
        expiresIn : 60*60*10,
        scope : 'sub name'
    }));
}

// jwt keys
const privkey = fs.readFileSync(path.resolve(__dirname, '../privkey.pem'));
const pubkey = fs.readFileSync(path.resolve(__dirname, '../pubkey.pem'));
const iss ='https://noidcp-tgwagner.rhcloud.com';
const userService = userServiceFactory(userDb);
const config = {
    clientDb: clientDb,
    userDb: userDb,
    authorizationCodeDb: authorizationCodeDb,
    userConsentDb: userConsentDb,
    accessTokenDb: accessTokenDb,
    refreshTokenDb: refreshTokenDb,
    baseUrl: 'https://noidcp-tgwagner.rhcloud.com',
    /** Issuer Identifier */
    iss: iss,
    privkey: privkey,
    pubkey: pubkey,
    clientService: clientServiceFactory(clientDb),
    userService: userService,
    authorizationCodeService: authorizationCodeServiceFactory(authorizationCodeDb),
    userConsentService: userConsentServiceFactory(userConsentDb),
    idTokenService: idTokenService(iss, privkey, pubkey, userService),
    accessTokenService: accessTokenService(accessTokenDb),
    refreshTokenService: refreshTokenService(refreshTokenDb)

};

module.exports = config;
