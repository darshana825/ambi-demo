/**
 * Calender Event model for communicate calender_events collection in Database
 * Both Events and Todos are stored  in this collection.
 */

'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema;

GLOBAL.CalendarEventsConfig = {
    CACHE_PREFIX :"shared_events:"
};

GLOBAL.CalendarTypes = {
    EVENT: 1,
    TODO: 2,
    TASK: 3
};

GLOBAL.CalendarStatus = {
    PENDING: 1,
    COMPLETED: 2,
    EXPIRED: 3,
    CANCELLED: 4
};

GLOBAL.CalendarSharedStatus = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3,
    EVENT_COMPLETED : 4
};

GLOBAL.CalenderPriority = {
    LOW: 1,
    MED: 2,
    HIGH: 3,
};

GLOBAL.CalendarOrigin = {
    PERSONAL_CALENDAR: 1,
    GROUP_CALENDAR: 2
};

var SharedUsersListSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    shared_status: {
        type : Number,
        default : CalendarSharedStatus.REQUEST_PENDING
    },
    priority_status: {
        type : Number,
        default : 0
    }
});

/**
 * CalenderEvent Basic information
 */
var CalendarEventSchema = new Schema({

    user_id : {
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },

    description : {
        type : Schema.Types.Mixed,
        default : null
    },

    plain_text : {
        type : String,
        default : null
    },

    status : {
        type : Number,
        default : 1 /* | 1 - pending | 2 - completed | 3 - expired | 4 - cancelled */
    },

    priority : {
        type : Number,
        default : 1 /* 1 - low | 2 - medium | 3 - high */
    },

    type : {
        type : Number, /* 1- Event | 2 - To-Do | 3 - Task */
        default : null
    },

    calendar_origin : {
        type : Number, /* 1- PERSONAL_CALENDAR | 2 - GROUP_CALENDAR */
        default : CalendarOrigin.PERSONAL_CALENDAR
    },

    start_date_time : {
        type : String
    },

    end_date_time : {
        type : String
    },

    event_time : {      /* start time */
        type : String,
        default : null
    },

    event_end_time : {      /* end time */
        type : String,
        default : null
    },

    group_id:{
        type: Schema.ObjectId,
        ref: 'Groups',
        default:null
    },

    event_timezone : {
        type : String,
        default : null
    },
    shared_users: [SharedUsersListSchema],
    moved_nextday: {
        type : Boolean,
        default : false
    },

    moved_nextday_count: {
        type : Number,
        default : 0
    },

    created_at : {
        type : Date
    },

    updated_at: {
        type : Date
    }

},{collection:"calender_events"});


CalendarEventSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Add CalenderEvent to the system
 * @param EventData
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.addNew = function (eventData,callBack) {

    var calenderEvent = new this();
    calenderEvent.user_id = eventData.user_id;
    calenderEvent.description = (eventData.description ? eventData.description : 'No title');
    calenderEvent.plain_text = (eventData.plain_text ? eventData.plain_text : 'No title');
    calenderEvent.status = CalendarStatus.PENDING;
    calenderEvent.type = (eventData.type ? eventData.type : 1);
    calenderEvent.calendar_origin = (eventData.calendar_origin ? eventData.calendar_origin : 1);
    calenderEvent.start_date_time = eventData.start_date;
    calenderEvent.end_date_time = eventData.end_date;
    calenderEvent.event_time = eventData.event_time;
    calenderEvent.event_end_time = (eventData.event_end_time ? eventData.event_end_time : null);
    calenderEvent.event_timezone = eventData.event_timezone;
    calenderEvent.shared_users = eventData.shared_users;
    calenderEvent.priority = eventData.priority;
    calenderEvent.group_id = eventData.group_id;

    calenderEvent.save(function(err,resultSet){

        if(err){
            console.log(err);
            callBack({status:400,error:err});
        }else{
            callBack({status:200, event:resultSet});
        }
    });
};

/**
 * Update a given CalenderEvent
 * @param Json filter
 * @param Json value
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.updateEvent = function (filter, value, callBack) {

    var _this = this;
    var options = { multi: true };

    _this.update(filter, value, options, function(err, update) {
        if(err){
            console.log(err);
            callBack({status:400,error:err});
        }else{
            callBack({status:200,event:update});
        }
    });
};

/**
 * Get Event By Id
 * @param Json filter
 * @param Json value
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.getEventById = function(id,callBack){

    var _this = this;

    _this.findOne({_id: id}).lean().exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack({status: 200, event: {}});
                return;
            }
            callBack({status: 200, event: resultSet})
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get single object under a given criteria
 * @param Json filter
 * @param String fields - required fields to be fetched space sparated
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.getOne = function (filter, fields, callBack) {

    var calenderEvent = new this();

    calenderEvent.findOne(filter, fields, function (err, event ) {
        if (err){
            console.log(err);
            callBack({status:400,error:err});
        } else {
            callBack({status:200,event:event});
        }
    })
};

/**
 * Get calander events by a given fiter
 * @param Json filter
 * @param String fields - required fields to be fetched space sparated
 * @param Json options - options matching to the query builder
 * @param callBack
 * @return Json
 */
CalendarEventSchema.statics.get = function (filter, fields, options, callBack) {

    var calenderEvent = new this();
    var options = { multi: true };

    calenderEvent.find(filter, fields, options, function (err, events) {
        if (err){
            console.log(err);
            callBack({status:400,error:err});
        } else {
            callBack({status:200,events:events});
        }
    });
};

/**
 * Share Event | DB
 */
CalendarEventSchema.statics.shareEvent = function(eventId,sharedCriteria,callBack){

    var _this = this;
    _this.update({_id:eventId},
        {$set:sharedCriteria},function(err,resultSet){

            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};

/**
 * Update Shared Events
 * @param criteria
 * @param data
 * @param callBack
 */
CalendarEventSchema.statics.updateSharedEvent = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack(null,{
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err},null);
        }
    });
};


/**
 *
 * Get Calender events, todos, Tasks for the given period sorted by created date
 * @param criteria
 * @param callBack
 */
CalendarEventSchema.statics.getSortedCalenderItems = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).or([{status: 1}, {status: 2}]).sort({event_time: 1}).lean().exec(function(err,resultSet){

        if(!err){
            callBack(null, {
                status:200,
                events:resultSet
            });
        } else {
            console.log("Server error while getSortedCalenderItems --------");
            callBack({status:400,error:err}, null);
        }
    });

};

/**
 *
 * Get Calender events, for the given week
 * @param data object
 *
 */
CalendarEventSchema.statics.getWeeklyCalenderEvensForSharedUser = function(data, callBack){

    var _this = this;
    var moment = require('moment');
    var week = data['week'],month = (data['month'] -1),year = data['year'];

    var startDateOfWeek = moment([year, month]).add((week-1)*7,"days");
    var endDateOfWeek = moment([year,month]).add((week*7)+1,"days").subtract(1,"millisecond");

    if(week == 5){
        endDateOfWeek =  moment([year, month]).endOf('month').subtract(1,"millisecond");
    }

    //get days betweek the week
    var dateArray = [];
    var currentDate = startDateOfWeek;
    while (currentDate <= endDateOfWeek) {
        dateArray.push(currentDate);
        currentDate = moment(currentDate).add(1, 'days');
    }

    var criteria =  { start_date_time: {$gte: startDateOfWeek, $lt: endDateOfWeek }, _id: data['_id']};

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
        if(!err){
            callBack(null, {
                status:200,
                events:resultSet,
                week:week,
                days:dateArray
            });
        } else {
            console.log("Server error while getSortedCalenderItems --------");
            callBack({status:400,error:err}, null);
        }
    });

};

/**
 *
 * Get Calender events, for the given week
 * @param data object
 *
 */
CalendarEventSchema.statics.getWeeklyCalenderEvens = function(data,callBack){
    console.log("1111");
    var _this = this;
    var moment = require('moment');
    var week = data['week'],month = (data['month'] -1),year = data['year'];

    var startDateOfWeek = moment([year, month]).add((week-1)*7,"days");
    var endDateOfWeek = moment([year,month]).add((week*7)+1,"days").subtract(1,"millisecond");

    if(week == 5){
        endDateOfWeek =  moment([year, month]).endOf('month').subtract(1,"millisecond");
    }
    console.log("222");
    //get days betweek the week
    var dateArray = [];
    var currentDate = startDateOfWeek;
    while (currentDate <= endDateOfWeek) {
        dateArray.push(currentDate);
        currentDate = moment(currentDate).add(1, 'days');
    }
    console.log("333");
    var criteria =  { start_date_time: {$gte: startDateOfWeek, $lt: endDateOfWeek }};

    switch (data['filter_by']) {
        case 'group':
            criteria['group_id'] = data['group_id'];
            break;

        case 'shared':
            criteria['_id'] = data['_id'];
             _id: data['_id']
            break;
        default:
            criteria['user_id'] = data['user_id']
    }
    console.log(criteria);
    console.log(" filter_by :: " + data['filter_by']);
    // var criteria =  { start_date_time: {$gte: startDateOfWeek, $lt: endDateOfWeek }, status: 1, user_id: data['user_id']};

    _this.find(criteria).sort({created_at:-1}).exec(function(err,resultSet){
        if(!err){
            callBack(null, {
                status:200,
                events:resultSet,
                week:week,
                days:dateArray
            });
        } else {
            console.log("Server error while getSortedCalenderItems --------");
            callBack({status:400,error:err}, null);
        }
    });

};

/**
 *
 * get the Calender event plain_text of given id
 * @param data object
 *
 */
CalendarEventSchema.statics.bindNotificationData = function(notificationObj, callBack){

    this.getEventById(notificationObj.calendar_id,function(calendarData){

        notificationObj['calendar_text'] = calendarData.event.plain_text;
        notificationObj['calendar_type'] = calendarData.event.type;

        callBack(notificationObj);
    });

};

/**
 * Get Events | Get shared event to user
 */
CalendarEventSchema.statics.ch_getSharedEvents = function(userId,payload,callBack){

    var _this = this;
    var _cache_key = "idx_user:"+CalendarEventsConfig.CACHE_PREFIX+userId;

    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){
        if(csResultSet == null){
            callBack(null);
        }else{
            callBack(csResultSet);
        }

    });

};

/**
 * Share Event | Cache based on User
 * {Create Index}
 */
CalendarEventSchema.statics.ch_shareEventCreateIndex = function(userId,data,callBack){

    var _cache_key = "idx_user:"+CalendarEventsConfig.CACHE_PREFIX+userId;
    var payLoad={
        index:_cache_key,
        id:data.user_id.toString(),
        type: 'shared_events',
        data:data
    }

    ES.createIndex(payLoad,function(resultSet){
        callBack(resultSet)
    });

};

/**
 * Share Event | Cache based on User
 * {Update Event List}
 */
CalendarEventSchema.statics.ch_shareEventUpdateIndex = function(userId,data,callBack){

    var _cache_key = "idx_user:"+CalendarEventsConfig.CACHE_PREFIX+userId;
    var payLoad={
        index:_cache_key,
        id:data.user_id.toString(),
        type: 'shared_events',
        data:data
    }

    ES.update(payLoad,function(resultSet){
        callBack(resultSet)
    });

};

/**
 * delete event based on criteria
 * @param criteria
 * @param callBack
 */
CalendarEventSchema.statics.deleteEvent = function (criteria, callBack) {
    console.log("deleting a calendar event--")

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

CalendarEventSchema.statics.updateSharedStatus = function(postData, user_id, callBack) {

    var _async = require('async');
    var _this = this;
    _async.waterfall([
        function updateSharedStatus(callBack) {
            var shared_status = postData.status == 'REQUEST_REJECTED' ?
                CalendarSharedStatus.REQUEST_REJECTED : CalendarSharedStatus.REQUEST_ACCEPTED;

            var _udata = {
                'shared_users.$.shared_status':shared_status
            };

            if(typeof postData.priority != "undefined" && postData != null){
                _udata['shared_users.$.priority_status'] = postData.priority;
            }

            var criteria = {
                _id:Util.toObjectId(postData.event_id),
                'shared_users.user_id':user_id
            };

            _this.updateSharedEvent(criteria, _udata, function(res){
                callBack(null);
            });
        },
        function updateESSharedStatus(callBack){

            if(postData.status == 'REQUEST_REJECTED'){

                _async.waterfall([
                    function getSharedEvents(callBack){
                        var query={
                            q:"_id:"+user_id
                        };
                        _this.ch_getSharedEvents(user_id, query, function (esResultSet){
                            callBack(null, esResultSet);
                        });

                    },
                    function ch_shareEvent(resultSet, callBack) {
                        if(resultSet != null){
                            var event_list = resultSet.result[0].events;
                            var index = event_list.indexOf(postData.event_id.toString());
                            event_list.splice(index, 1);

                            var query={
                                    q:"user_id:"+user_id
                                },
                                data = {
                                    user_id: user_id,
                                    events: event_list
                                };

                            _this.ch_shareEventUpdateIndex(user_id,data, function(esResultSet){
                                callBack(null);
                            });
                        }else {
                            callBack(null);
                        }
                    }
                ], function (err, resultSet) {
                    callBack(null);
                });

            }else{
                callBack(null);
            }
        }
    ], function (err, resultSet) {
        if(err) {
            callBack({status: 400, error: err});
        } else {
            callBack({status: 200, result: null});
        }
    });

};

mongoose.model('CalendarEvent', CalendarEventSchema);
