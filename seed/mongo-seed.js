var seeder = require('mongoose-seed');
var Config = require('../config/app.config');
var mongoseeds = require('./mongo-seeds.json');

// Connect to MongoDB via Mongoose 
seeder.connect('mongodb://' + Config.DB_HOST + '/' + Config.DB_NAME, function () {

    seeder.loadModels([
        '../model/SecretaryModel.js',
        '../model/NewsModel.js'
    ]);

    seeder.clearModels(['Secretary','News'], function () {
        seeder.populateModels(mongoseeds, function (error, data) {
            process.exit();
        });
    });
});
