/**
 * Created by twagner on 30/10/16.
 */
"use strict";

const settings = require('./settings.default');

// override dbDir
settings.dbDir = process.env.OPENSHIFT_DATA_DIR;

module.exports = settings;