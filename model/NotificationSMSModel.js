/**
 * This is post model that allows to handle all the Operations .
 */
'use strict'
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.NotificationMode = {
    INSTANT_NOTIFICATION: 1,
    MORNING_NOTIFICATIONS: 2,
    CUSTOM_NOTIFICATION: 3
};


var NotificationSMSSchema = new Schema({
    phone_number: {
        type: String,
        trim: true
    },
    profile_owned_by: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    notification_mode: {
        type: Number,
        default: 1
    },
    custom_time: {
        type: Date,
        default: null
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }

}, {collection: 'notification_sms'});


/**
 *
 */
NotificationSMSSchema.pre('save', function (next) {
    console.log("NotificationSMS pre save");
    var now = new Date();
    console.log(now);
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/**
 * Create new NotificationSMSSchema for a user
 * @param NotificationSMSSchema data
 * @param callBack
 */
NotificationSMSSchema.statics.addNotificationData = function (notification_sms, callBack) {
    var _this = this;
    var _notification_sms = new this();
    _notification_sms.phone_number = notification_sms.phone_number;
    _notification_sms.profile_owned_by = Util.toObjectId(notification_sms.profile_owned_by);
    _notification_sms.notification_mode = notification_sms.notification_mode;
    _notification_sms.custom_time = notification_sms.custom_time;
    _notification_sms.save(function (err, postData) {

        if (!err) {
            callBack({
                status: 200,
                post: postData
            });
        } else {
            console.log("Server Error --------");
            console.log(err);
            callBack({status: 400, error: err});
        }

    });

}
/**
 * Update existing NotificationSMSSchema of user
 * @param NotificationSMSSchema data
 * @param callBack
 */
NotificationSMSSchema.statics.updateNotificationData = function (_id, data, callBack) {
    var _this = this;

    _this.update({_id: _id},
        {$set: data}, function (err, resultSet) {

            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });

}

/**
 * Retrieve NotificationSMSSchema of user
 * @param logged user
 * @param callBack
 */
NotificationSMSSchema.statics.getNotificationDataById = function (id, callBack) {
    this.findOne({profile_owned_by: id}).exec(function (err, resultSet) {
        if (!err) {
            console.log(resultSet);
            if (resultSet == null) {
                callBack(null);
                return;
            }

            var notificationData = {
                id: resultSet._id,
                phone_number: resultSet.phone_number,
                notification_mode: resultSet.notification_mode,
                custom_time: resultSet.custom_time
            };


            callBack(notificationData);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

}

/**
 * Retrieve NotificationSMSSchema for all users (Morning Notification)
 * @param callBack
 */
NotificationSMSSchema.statics.getNotificationListM = function (callBack) {
    this.find({notification_mode: NotificationMode.MORNING_NOTIFICATIONS}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }
            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

}

/**
 * Retrieve NotificationSMSSchema for all users (Custom Time)
 * @param callBack
 */
NotificationSMSSchema.statics.getNotificationListC = function (callBack) {
    this.find({notification_mode: NotificationMode.CUSTOM_NOTIFICATION}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }
            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

}

/**
 * Delete NotificationSMSSchema from Database
 * @param postId
 * @param callBack
 */
NotificationSMSSchema.statics.deletePost = function (criteria, callBack) {
    this.remove(criteria).exec(function (err, resultSet) {

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

    });
}
/**
 * Send SMS to user
 * @param postId
 * @param callBack
 */
NotificationSMSSchema.statics.fireMessage = function (phoneNumber, todos) {
    var twilio = require('twilio'),
        accountSid = 'ACe9a935720e267580bf15c2abe20e778c',
        authToken = '58890c7883d5d946cdd336dd4d5b6727',
        client = new twilio.RestClient(accountSid, authToken);

    for (var inc = 0; inc < todos.length; inc++) {
        client.messages.create({
            body: 'Hello from Proglobe\nTodo body\nThank you. ',
            to: '+94778066593',
            from: '+15122629420'
        }, function (err, message) {
            if (err) {
                console.log(err);
            }
        });
    }
}

mongoose.model('NotificationSMS', NotificationSMSSchema);
