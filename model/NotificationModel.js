/**
 * Notification Model will communicate with notifications collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Notification
 */
var NotificationSchema = new Schema({
    sender: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    notification_type: { // notification for post / comment / share / like / Birthday ...
        type: String,
        trim: true,
        default: null
    },
    notification_category: { // notification category ->> todos[calendar events & todos] / productivity[folder & notebook] / social[post like share comment + group]
        type: String,
        trim: true,
        default: null
    },
    notified_post: { // the post that origin user comment / share / like ...
        type: Schema.ObjectId,
        ref: 'Post',
        default: null
    },
    notified_notebook: { // if a notebook request then notebook id
        type: Schema.ObjectId,
        ref: 'NoteBook',
        default: null
    },
    notified_calendar: { // if a calendar request then event/to-do/task  id
        type: Schema.ObjectId,
        ref: 'CalenderEvent',
        default: null
    },
    notified_folder:{
        type: Schema.ObjectId,
        ref: 'Folders',
        default:null
    },
    notified_group:{ // if a group request then group id
        type: Schema.ObjectId,
        ref: 'Groups',
        default:null
    },
    notification_status:{ // Accept / Reject the invitation ...
        type:String,
        trim:true,
        default:null
    },
    created_at: {
        type: Date
    }
}, {collection: "notifications"});

NotificationSchema.pre('save', function (next) {
    var now = new Date();

    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/**
 * Save notification
 * @param userId
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.saveNotification = function (new_notification, callBack) {

    var notification = new this();
    notification.sender = Util.toObjectId(new_notification.sender);
    notification.notification_type = new_notification.notification_type;

    if (new_notification.notification_type == Notifications.SHARE_CALENDAR ||
        new_notification.notification_type == Notifications.SHARE_CALENDAR_RESPONSE ||
        new_notification.notification_type == Notifications.CALENDAR_SCHEDULE_UPDATED ||
        new_notification.notification_type == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
        new_notification.notification_type == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY) {
        notification.notified_calendar = Util.toObjectId(new_notification.notified_calendar);
        notification.notification_status = new_notification.notification_status;
        notification.notification_category = NotificationCategory.TODOS;

        if(typeof new_notification.notified_group != "undefined" && new_notification.notified_group != null){
            notification.notified_group = Util.toObjectId(new_notification.notified_group);
        }


    } else if (new_notification.notification_type == Notifications.SHARE_NOTEBOOK
        || new_notification.notification_type == Notifications.SHARE_NOTEBOOK_RESPONSE) {
        notification.notified_notebook = Util.toObjectId(new_notification.notified_notebook);
        notification.notification_status = new_notification.notification_status;
        notification.notification_category = NotificationCategory.PRODUCTIVITY;

    } else if(new_notification.notification_type == Notifications.SHARE_FOLDER  || new_notification.notification_type == Notifications.SHARE_FOLDER_RESPONSE) {
        notification.notified_folder = Util.toObjectId(new_notification.notified_folder);
        notification.notification_status = new_notification.notification_status;
        notification.notification_category = NotificationCategory.PRODUCTIVITY;

    } else if(new_notification.notification_type == Notifications.SHARE_GROUP  || new_notification.notification_type == Notifications.SHARE_GROUP_RESPONSE) {
        notification.notified_group = Util.toObjectId(new_notification.notified_group);
        notification.notification_status = new_notification.notification_status;
        notification.notification_category = NotificationCategory.PRODUCTIVITY;

    } else if(new_notification.notification_type == Notifications.SHARE_GROUP_NOTEBOOK) {
        notification.notified_notebook = Util.toObjectId(new_notification.notified_notebook);
        notification.notified_group = Util.toObjectId(new_notification.notified_group);
        notification.notification_status = new_notification.notification_status;
        notification.notification_category = NotificationCategory.PRODUCTIVITY;

    } else if(new_notification.notification_type == Notifications.ADD_GROUP_POST) {
        notification.notified_post = Util.toObjectId(new_notification.notified_post);
        notification.notified_group = Util.toObjectId(new_notification.notified_group);
        notification.notification_category = NotificationCategory.SOCIAL;

    } else if(new_notification.notification_type == Notifications.SHARE_GROUP_TASK || new_notification.notification_type == Notifications.SHARE_GROUP_TASK_RESPONSE){
        notification.notified_calendar = Util.toObjectId(new_notification.notified_calendar);
        notification.notification_status = new_notification.notification_status;
        notification.notification_category = NotificationCategory.PRODUCTIVITY;
        notification.notified_group = Util.toObjectId(new_notification.notified_group);
    } else {
        notification.notified_post = Util.toObjectId(new_notification.notified_post);
        notification.notification_status = "";
        notification.notification_category = NotificationCategory.SOCIAL;

    }

    notification.save(function (err, result) {
        if (!err) {
            callBack({
                status: 200,
                result: result
            });
        } else {
            console.log("Server Error --------")
            console.log(err)
            callBack({status: 400, error: err});
        }
    });


};

/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.getNotifications = function (criteria, callBack) {

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
NotificationSchema.statics.getNotification = function (criteria, callBack) {

    this.findOne(criteria).exec(function (err, resultSet) {

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
 * Update notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.updateNotifications = function (criteria, updateData, callBack) {

    var _this = this;
    _this.update(criteria, updateData,{ upsert: true, multi: true },function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------");
                console.log(err);
                callBack({status:400,error:err});
            }
        });

};


/**
 * Get notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.getFirstNotification = function (criteria, callBack) {
    console.log("NotificationSchema.statics.getFirstNotification")

    this.findOne(criteria).sort({created_at: 1}).exec(function (err, resultSet) {

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
 * delete notifications based on criteria
 * @param criteria
 * @param callBack
 */
NotificationSchema.statics.deleteNotification = function (criteria, callBack) {
    console.log("NotificationSchema.statics.deleteNotification")

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

    })

};


mongoose.model('Notification', NotificationSchema);
