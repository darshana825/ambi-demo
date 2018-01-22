'use strict';

/**
 * Handle notification sms related operation in the class
 */



var NotificationSMSController = {

    /**
     * Add/Update Notification SMS Data
     * @param req
     * @param res
     * @returns {}
     */
    setNotificationSMS: function (req, res) {

        var _async = require('async'),
            NotificationSMS = require('mongoose').model('NotificationSMS'),
            CurrentSession = Util.getCurrentSession(req);
        var data = {
            phone_number: (typeof req.body.__phone_number != 'undefined') ? req.body.__phone_number : "+94778066593",
            profile_owned_by: CurrentSession.id,
            notification_mode: (typeof req.body.__notification_mode != 'undefined') ? req.body.__notification_mode : NotificationMode.MORNING_NOTIFICATIONS,
            custom_time: (typeof req.body.__custom_time != 'undefined') ? req.body.__custom_time : ""
        };

        _async.waterfall([

            function getUserNotificationData(callBack) {
                var resultData = NotificationSMS.getNotificationDataById(data.profile_owned_by, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function updateNotificationData(resultSet, callBack) {
                if (resultSet != null) {
                    NotificationSMS.updateNotificationData(resultSet.id, data, function (resultSet) {
                        callBack(null, resultSet);
                    });
                } else {
                    NotificationSMS.addNotificationData(data, function (resultSet) {
                        callBack(null, resultSet);
                    });
                }
            }

        ], function (err, resultSet) {
            if (err) {
                console.log(err);
                return;
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                notes: resultSet
            }
            res.status(200).json(outPut);
        });

    },

    /**
     * Fire per SMS
     * @param userId
     * @param todoListObj
     */
    sendNotificationSMS: function (userId, todoListObj) {
        var _async = require('async'),
            NotificationSMS = require('mongoose').model('NotificationSMS');

        _async.waterfall([

            function getNotificationUsersData(callBack) {
                var resultData = NotificationSMS.getNotificationDataById(userId, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function fireNotifications(resultSet, callBack) {
                if (resultSet == null) {
                    return
                }

                NotificationSMS.fireMessage(resultSet.phone_number, todoListObj);

            }

        ], function (err, resultSet) {
            if (err) {
                console.log(err);
                return;
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                notes: resultSet
            }
            res.status(200).json(outPut);
        });

    },

    /**
     * Background Running Function
     */
    watchForNotificationSMS: function () {
        var _async = require('async'),
            cron = require('cron'),
            NotificationSMS = require('mongoose').model('NotificationSMS');

        var morningNotificationsJobs = new cron.CronJob('00 00 04 * * *', function () {
            _async.waterfall([

                function getNotificationUsersData(callBack) {
                    var resultData = NotificationSMS.getNotificationListM(function (resultSet) {
                        callBack(null, resultSet);
                    });
                },
                function fireNotifications(resultSet, callBack) {
                    if (resultSet == null) {
                        return
                    }

                    NotificationSMSController.getTodoListM(resultSet);

                }

            ], function (err, resultSet) {
                if (err) {
                    console.log(err);
                    return;
                }
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    notes: resultSet
                }
                res.status(200).json(outPut);
            });
        }, null, true);

        var customNotificationsJob = new cron.CronJob('* * * * *', function () {
            _async.waterfall([

                function getNotificationUsersData(callBack) {
                    var resultData = NotificationSMS.getNotificationListC(function (resultSet) {
                        callBack(null, resultSet);
                    });
                },
                function fireNotifications(resultSet, callBack) {
                    if (resultSet == null) {
                        return
                    }

                    NotificationSMSController.getTodoListC(resultSet);

                }

            ], function (err, resultSet) {
                if (err) {
                    console.log(err);
                    return;
                }
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    notes: resultSet
                }
                res.status(200).json(outPut);
            });
        }, null, true);

    },

    /**
     * Background Running Function
     * @param userId
     */
    getTodoListM: function (resultSet) {
        var NotificationSMS = require('mongoose').model('NotificationSMS'),
            moment = require('moment');
        // asyncLoop(resultSet.length, function (loop) {
            // getreuslts(resultSet[loop.index], function (response) {
            //     loop.next();
            // });
        // });
    },

    /**
     * Background Running Function
     * @param userId
     */
    getTodoListC: function (resultSet) {
        var NotificationSMS = require('mongoose').model('NotificationSMS'),
            moment = require('moment');

        // asyncLoop(resultSet.length, function (loop) {
        //     var customTime = moment(resultSet[loop.index].custom_time).format("HH:mm");
        //     var now = moment(new Date()).format("HH:mm");
        //     if (customTime === now) {
        //         getreuslts(resultSet[loop.index], function (response) {
        //             loop.next();
        //         });
        //     }
        // });
    }


};

function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function () {
            if (done) {
                return;
            }

            if (index < iterations) {
                index++;
                func(loop);

            } else {
                done = true;
                callback();
            }
        },

        iteration: function () {
            return index - 1;
        },

        break: function () {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}

module.exports = NotificationSMSController;
