Node OpenID Connect Provider (NOIDCP)
=====================================

## Introduction

>**OpenID Connect 1.0** is a simple identity layer on top of the OAuth 2.0 
protocol. It allows Clients to verify the identity of the End-User 
based on the authentication performed by an Authorization Server, as 
well as to obtain basic profile information about the End-User in an 
interoperable and REST-like manner.

**NOIDCP** implements the OpenID Connect Core 1.0 Specification for 
Identity Providers using the Node.js platform. Currently it supports the
Authorization Code Flow and Implicit Flow. Basic profile information is
provided by the UserInfo Endpoint.

**NOIDCP** uses **LevelDB (LevelUP)**, a key/value store, as a storage engine 
for the various entities like Access Tokens, Clients, Users, Id Tokens, etc.
LevelUP can be backed by different modules like LevelDOWN 
or MemDOWN (in memory storage).

For client and user administration the application provides two REST 
services:

GET     /api/clients            list all clients
POST    /api/clients            creates a new client 
DELETE  /api/clients/:clientId  deletes a client

GET     /api/users              lists all users
POST    /api/users              creates a new user
DELETE  /api/users/:userId      deletes a user 

These services are accessible only by the "root" user.

## Setup

Clone this repo to your desktop and check the settings file for 
your environment (e. g. `settings.production.js`). Then 
run `npm install` to install all the dependencies.

The project uses **grunt** as build tool. You can:

- Run `grunt jshint` to check the code. 
- Run `grunt mochacli` to run the extensive unit and integration tests.

## Demo

An online demo is available:

https://noidcjc-tgwagner.rhcloud.com/

## TODO

- Configurable claims
- Hybrid Code Flow
- Customizable Views
- Customizable JWT settings
- Validate input from REST services

## License

This project is licensed under the terms of the **MIT** license.
