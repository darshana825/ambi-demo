/**
 * DB Configurations
 */

var express = require('express');
var MongoStore = require('connect-mongo');
var bluebird = require('bluebird');
var mongoose = require('mongoose');

// use bluebird promise as mongoose promise
mongoose.Promise = bluebird;

var connection = mongoose.connect(Config.DB_HOST, Config.DB_NAME);

/**
 * Connection is connected
 */
mongoose.connection.once('connected', function () {
    console.log("Using mongodb at " + Config.DB_HOST);
    console.log("Connected to database " + Config.DB_NAME);
});

/**
 * If the connection throws an error
 */
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

/**
 * When the connection is disconnected
 */
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

/**
 * Exporting connection
 */
module.exports = connection;