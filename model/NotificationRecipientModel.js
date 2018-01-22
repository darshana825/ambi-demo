/**
 * Notification Model will communicate with notifications collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Notification
 */
var NotificationRecipientSchema = new Schema({
    notification_id:{
        type: Schema.ObjectId,
        ref: 'Notification',
        default:null
    },
    recipient:{
        type: Schema.ObjectId,
        default:null
    },
    read_status:{
        type:Boolean,
        default:false
    },
    seen_status:{
        type:Boolean,
        default:false
    }
},{collection:"notification_recipients"});

/**
 * Save recipients of a notification
 * @param data
 * @param callBack
 */
NotificationRecipientSchema.statics.saveRecipients = function(data,callBack){

    var recipients = [],
        now = new Date();

    for (var i = 0; data.recipients.length > i; i++) {
        recipients.push({
            notification_id: Util.toObjectId(data.notification_id),
            recipient: Util.toObjectId(data.recipients[i]),
            read_status: false,
            seen_status: false
        });
    }

    this.collection.insert(recipients,function(err,resultSet){
        if(! err){
            callBack({status:200,result:resultSet});
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });
};

NotificationRecipientSchema.statics.getAllRecipientNotification = function (criteria, callBack) {

    this.find(criteria).exec(function (err, resultSet) {

        if (!err) {
            callBack({
                status: 200,
                result: resultSet
            });
        } else {
            console.log("Server Error --------")
            console.log(err)
            callBack({status: 400, error: err});
        }

    })

};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationRecipientSchema.statics.getRecipientNotifications = function(criteria,days,callBack){

    var _this = this;

    console.log("getRecipientNotifications")

    console.log(criteria)

    _this.aggregate([
        { $match:criteria},
        {
            $lookup:{
                from:"notifications",
                localField:"notification_id",
                foreignField:"_id",
                as:"notificationData"
            }
        },
        { $unwind: '$notificationData'},
        {
            $match: {
                "notificationData.created_at" : {$gt:new Date(Date.now() - days*24*60*60 * 1000)}
            }
        },
        {
            $project:{
                _id:1,
                notification_id:"$notification_id",
                recipient_id:"$recipient",
                read_status:1,
                created_at:"$notificationData.created_at",
                notification_type:"$notificationData.notification_type",
                sender_id:"$notificationData.sender",
                post_id:"$notificationData.notified_post",
                notebook_id:"$notificationData.notified_notebook",
                notification_status:"$notificationData.notification_status",
                notified_folder:"$notificationData.notified_folder",
                calendar_id:"$notificationData.notified_calendar"
            }
        },
        { $sort:{ "created_at":-1}}

    ], function(err, resultSet){
        if(!err){

            callBack({
                status:200,
                notifications:resultSet

            });
        }else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });


};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationRecipientSchema.statics.getRecipientNotificationsLimit = function(criteria,reduct_opt,skip,limit,callBack){

    console.log("getRecipientNotificationsLimit")

    var _this = this;

    var criteria_arr = [
        { $match:criteria},
        {
            $lookup:{
                from:"notifications",
                localField:"notification_id",
                foreignField:"_id",
                as:"notificationData"
            }
        },
        { $unwind: '$notificationData'},
        //{
        //    $lookup: {
        //        from:"posts",
        //        localField:"notificationData.notified_post",
        //        foreignField:"_id",
        //        as:"postData"
        //    }
        //},
        //{
        //    $unwind: '$postData'
        //},
        {
            $project:{
                _id:1,
                notification_id:"$notification_id",
                recipient_id:"$recipient",
                read_status:1,
                created_at:"$notificationData.created_at",
                notification_type:"$notificationData.notification_type",
                notification_cat:"$notificationData.notification_category",
                sender_id:"$notificationData.sender",
                post_id:"$notificationData.notified_post",
                notebook_id:"$notificationData.notified_notebook",
                calendar_id:"$notificationData.notified_calendar",
                folder_id:"$notificationData.notified_folder",
                group_id:"$notificationData.notified_group",
                notification_status:"$notificationData.notification_status",
                notified_folder:"$notificationData.notified_folder"
            }
        },
        { $sort:{ "created_at":-1}},
        { $skip:skip},
        { $limit:limit}
    ];

    if(reduct_opt != null){
        var reduct_criteria = {
            $redact: {
                $cond: {
                    "if": {
                        $eq: [ "$notification_cat", reduct_opt ]
                    },
                    "then": "$$KEEP",
                    "else": "$$PRUNE"
                }
            }
        };

        criteria_arr.push(reduct_criteria);
    }

    _this.aggregate([
        criteria_arr
    ], function(err, resultSet){
        if(!err){

            callBack({
                status:200,
                notifications:resultSet

            });
        }else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });


};

/**
 * Update Notification
 * @param criteria
 * @param data
 * @param callBack
 */
NotificationRecipientSchema.statics.updateRecipientNotification = function(criteria, data, callBack){

    var _this = this;

    _this.update(
        criteria, data, {multi:true}, function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                console.log(err)
                callBack({status:400,error:err});
            }
        });

};

/**
 * Update Notification
 * @param criteria
 * @param data
 * @param callBack
 */
NotificationRecipientSchema.statics.updateRecipientNotificationRefactored = function(criteria, data, callBack){

    var _this = this,
        _async = require('async'),
        Notification = require('mongoose').model('Notification');

    _async.waterfall([

        function getNotificationsToRecipient(callBack){
            _this.find({
                recipient: criteria.recipient,
                read_status: false
            }).exec(function (err, resultSet) {
                if (!err) {
                    callBack(null, resultSet);
                }
            });
        },
        function loopNotificationByRecipientId(notificationRecipients, callBack) {
            _async.eachSeries(notificationRecipients, function(notificationRecipient, callBack){

                Notification.getFirstNotification({_id: notificationRecipient.notification_id},function(notification){
                    if(notification.result.notification_type != 'share_notebook' && notification.result.notification_type != 'share_folder'){
                        var updateData = {read_status: true};
                        _this.update(
                            {_id: notificationRecipient._id}, {$set:updateData}, function(err,resultSet){
                                callBack(null);
                            });
                    }else{
                        callBack(null);
                    }

                });

            },function(err){
                callBack(null);
            });
        }

    ],function(err){
        callBack('Updated');
    });
};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationRecipientSchema.statics.getCount = function(criteria,callBack){

    this.count(criteria).exec(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    })

};


/**
 * delete notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationRecipientSchema.statics.deleteNotificationRecipients = function(criteria,callBack){
    console.log("NotificationRecipientSchema.statics.deleteNotificationRecipients")

    this.remove(criteria).exec(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    })

};



mongoose.model('NotificationRecipient',NotificationRecipientSchema);
