/**
 * Created by phizuupc on 3/14/2017.
 */

var NotificationCategoryUpdateHandler = {

    init: function () {
        this.updateNotifications(function (payload) {});
    },
    updateNotifications: function (callBack) {

        var _async = require('async'),
            Notification = require('mongoose').model('Notification');

        var socialNotifications = [],
            productivityNotifications = [],
            todosNotifications = [];

        _async.waterfall([
            function getAllNotificationByType(callBack){
                _async.parallel([
                    function getTodosNotifications(callBack){
                        var criteria = {
                            $and: [
                                {
                                    $or: [
                                        {"notification_type": Notifications.SHARE_CALENDAR},
                                        {"notification_type": Notifications.SHARE_CALENDAR_RESPONSE},
                                        {"notification_type": Notifications.CALENDAR_SCHEDULE_UPDATED},
                                        {"notification_type": Notifications.CALENDAR_SCHEDULE_TIME_CHANGED},
                                        {"notification_type": Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY}
                                    ]
                                },
                                {
                                    $or: [
                                        {"notification_category": {$exists: false}},
                                        {"notification_category": {$eq: ""}},
                                        {"notification_category": {$eq: null}}
                                    ]
                                }
                            ]
                        }

                        Notification.getNotifications(criteria, function (r) {
                            if(typeof r.result != "undefined" && r.result.length > 0){
                                for(var i = 0; i < r.result.length; i++){
                                    todosNotifications.push(
                                        Util.toObjectId(r.result[i]._id)
                                    );
                                }
                            }
                            callBack(null);
                        });
                    },
                    function getSocialNotifications(callBack){
                        var criteria = {
                            $and: [
                                {
                                    $or: [
                                        { "notification_type": Notifications.ADD_GROUP_POST },
                                        { "notification_type": Notifications.LIKE },
                                        { "notification_type": Notifications.SHARE },
                                        { "notification_type": Notifications.COMMENT },
                                        { "notification_type": Notifications.BIRTHDAY }
                                    ]
                                },
                                {
                                    $or: [
                                        {"notification_category": {$exists: false}},
                                        {"notification_category": {$eq: ""}},
                                        {"notification_category": {$eq: null}}
                                    ]
                                }
                            ]
                        }

                        Notification.getNotifications(criteria, function (r) {
                            if(typeof r.result != "undefined" && r.result.length > 0) {
                                for (var i = 0; i < r.result.length; i++) {
                                    socialNotifications.push(
                                        Util.toObjectId(r.result[i]._id)
                                    );
                                }
                            }

                            callBack(null);
                        });
                    },
                    function getProductivityNotifications(callBack){
                        var criteria = {
                            $and: [
                                {
                                    $or: [
                                        { "notification_type": Notifications.SHARE_NOTEBOOK },
                                        { "notification_type": Notifications.SHARE_NOTEBOOK_RESPONSE },
                                        { "notification_type": Notifications.SHARE_FOLDER },
                                        { "notification_type": Notifications.SHARE_FOLDER_RESPONSE },
                                        { "notification_type": Notifications.SHARE_GROUP },
                                        { "notification_type": Notifications.SHARE_GROUP_RESPONSE },
                                        { "notification_type": Notifications.SHARE_GROUP_NOTEBOOK }
                                    ]
                                },
                                {
                                    $or: [
                                        {"notification_category": {$exists: false}},
                                        {"notification_category": {$eq: ""}},
                                        {"notification_category": {$eq: null}}
                                    ]
                                }
                            ]
                        }

                        Notification.getNotifications(criteria, function (r) {
                            if(typeof r.result != "undefined" && r.result.length > 0) {
                                for (var i = 0; i < r.result.length; i++) {
                                    productivityNotifications.push(
                                        Util.toObjectId(r.result[i]._id)
                                    );
                                }
                            }

                            callBack(null);
                        });
                    }
                ], function (err) {
                    callBack(null);
                });
            },

            function updateNotifications(callBack){
                _async.parallel([
                    function updateTodosNotifications(callBack){

                        if(todosNotifications.length > 0){
                            var criteria = {
                                _id: {'$in': todosNotifications}
                            },updateData = {
                                $set: {'notification_category': NotificationCategory.TODOS}
                            }

                            Notification.updateNotifications(criteria, updateData, function (r) {
                                callBack(null);
                            });
                        }else{
                            callBack(null);
                        }
                    },
                    function updateSocialNotifications(callBack){
                        if(socialNotifications.length > 0){
                            var criteria = {
                                _id: {'$in': socialNotifications}
                            },updateData = {
                                $set: {'notification_category': NotificationCategory.SOCIAL}
                            }

                            Notification.updateNotifications(criteria, updateData, function (r) {
                                callBack(null);
                            });
                        }else{
                            callBack(null);
                        }
                    },
                    function updateProductivityNotifications(callBack){
                        if(productivityNotifications.length > 0){
                            var criteria = {
                                _id: {'$in': productivityNotifications}
                            },updateData = {
                                $set: {'notification_category': NotificationCategory.PRODUCTIVITY}
                            }

                            Notification.updateNotifications(criteria, updateData, function (r) {
                                callBack(null);
                            });
                        }else{
                            callBack(null);
                        }
                    }
                ], function (err) {
                    callBack(null);
                });
            }
        ], function (err) {
            callBack(null);
        });
    }
};

module.exports = NotificationCategoryUpdateHandler;