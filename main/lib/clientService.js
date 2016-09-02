/**
 * Created by twagner on 8/28/15.
 */
"use strict";

const Client = require('./model/client'),
    Service = require('./service');

module.exports = function(clientDb) {

    const service = new Service(clientDb, Client, 'clientId');

    /**
     *
     * @param clientId
     * @returns {Promise<Client>}
     */
    service.findByClientId = function(clientId) {
        console.log('ClientService#findByClientId: ' + clientId);
        return this.findById(clientId);
    };

    /**
     * Authenticates clients with a client secret.
     *
     * @param clientId
     * @param clientSecret
     * @returns {Promise.<Client>}
     */
    service.authenticate = function(clientId, clientSecret) {
        console.log('ClientService#authenticate');
        return this.findByClientId(clientId).then(function(client) {
            console.log('ClientService#authenticate: client found: ' + JSON.stringify(client));
            return client.comparePassword(clientSecret).then(function(match) {
                console.log('ClientService#authenticate: password match: ' + match);
                if(match) {
                    return client;
                } else {
                    throw new Error('Password mismatch');
                }
            });
        });
    };

    service.findAll = function() {
        this.createReadStream()
            .on('data', function (data) {
                console.log(data.key, '=', data.value);
            })
            .on('error', function (err) {
                console.log('Oh my!', err);
            })
            .on('close', function () {
                console.log('Stream closed');
            })
            .on('end', function () {
                console.log('Stream closed');
            });
    };

    service.createReadStream  = clientDb.createReadStream;

    return service;
};
