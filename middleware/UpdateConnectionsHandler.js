/**
 * Created by phizuupc on 3/14/2017.
 */

var UpdateConnectionsHandler = {

    init: function () {
        this.updateConnections(function (payload) {
            console.log("RUNNING");
        });
    },


    updateConnections: function (callBack) {

        var _async = require('async');
        var Connection = require('mongoose').model('Connection');
        _async.waterfall([
            function updatePersonalConnections(callBack){

                var criteria = {
                    connected_with_type: { $exists: false },
                    connected_with: { $exists: true }
                };
                var values = {
                    $set: { connected_with_type: 1 }
                }

                Connection.collection.update(criteria, values, {multi: true}, function (err, updateResult) {
                    if (!err) {
                        console.log("USER CONNECTION - UPDATED SUCCSSFULLY");
                        callBack(null);
                    } else {
                        console.log("user connection update error \n");
                        console.log(err);
                        callBack(err);
                    }
                });
            },
            function updateGroupdConnections(callBack){

                var criteria = {
                    connected_with_type: { $exists: false },
                    connected_group: { $exists: true }
                };
                var values = {
                    $set: { connected_with_type: 2 }
                }

                Connection.collection.update(criteria, values, {multi: true}, function (err, updateResult) {
                    if (!err) {
                        console.log("GROUP CONNECTION - UPDATED SUCCSSFULLY");
                        callBack(null);
                    } else {
                        console.log("group connection update error \n");
                        console.log(err);
                        callBack(err);
                    }
                });
            }
        ], function (err) {
            callBack(null);
        });
    }
};

module.exports = UpdateConnectionsHandler;
