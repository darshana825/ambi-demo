
var CalendarEventHandler = {
    init: function () {

        var schedule = require('node-schedule');
        var moment = require('moment');

        var cron = require('node-cron');

        cron.schedule('0 * * * *', function(){
            //console.log('running a task every hour 111 @ ' + moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log("***************************************************");
            console.log("------------ START SCHEDULE ---- @ " + moment().format('YYYY-MM-DD HH:mm:ss'));
            console.log("***************************************************");

            CalendarEventHandler.calendarEventMovingProcess();
        });

        /*var rule = new schedule.RecurrenceRule();
        rule.hour = 23;
        rule.minute = 50;

        // 0 0 0/8 * * ? - run on every 8 hours

        var k = schedule.scheduleJob("@hourly", function () {
            "use strict";
            console.log('running a task every hour 222 @ ' + moment().format('YYYY-MM-DD HH:mm:ss'));
        });

        var j = schedule.scheduleJob("0 0 * * * *", function () {

            console.log('running a task every hour 333 @ ' + moment().format('YYYY-MM-DD HH:mm:ss'));

            //console.log("***************************************************");
            //console.log("------------ START SCHEDULE ---- @ " + moment().format('YYYY-MM-DD HH:mm:ss'));
            //console.log("***************************************************");
            //
            //CalendarEventHandler.calendarEventMovingProcess();
        });*/

    },

    calendarEventMovingProcess: function() {

        var _async = require('async'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            moment = require('moment-timezone'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');




        _async.waterfall([
            function getAllForTheDay(callBack) {
                console.log("start method getAllForTheDay");
                var day = new Date();
                var startTimeOfDay = moment(day).format('YYYY-MM-DD'); //format the given date as mongo date object
                var endTimeOfDay = moment(day).add(1, "day").format('YYYY-MM-DD'); //get the next day of given date
                var criteria = {start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay}, type: 2, status: 1};

                CalendarEvent.getSortedCalenderItems(criteria, function (err, result) {
                    callBack(null, result.events);
                });
            },
            function getMovableEventsList(eventsList, callBack) {
                console.log("start method getMovableEventsList");
                if (typeof eventsList != "undefined" && eventsList.length > 0) {
                    console.log("eventsList.length--" + eventsList.length);

                    var movableList = [];
                    for (var i in eventsList) {

                        var _date = moment(eventsList[i].start_date_time);

                        if(eventsList[i].event_end_time != undefined) {
                            console.log("this is with end time ---");
                            var calDate = moment(eventsList[i].start_date_time).format('YYYY-MM-DD');
                            _date = moment(calDate + ' ' + eventsList[i].event_end_time, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
                        }

                        console.log("calendar _date >", _date);

                        //var _time = eventsList[i].event_time;
                        //if(typeof _time != 'undefined' && _time) {
                        //    var splitTime = _time.split(":");
                        //    _date.add(splitTime[0], 'h');
                        //    _date.add(splitTime[1], 'm');
                        //}

                        var now = moment().utc();

                        var eventTimeFromUserZone = moment(_date).format('YYYY-MM-DD HH:mm:ss');
                        //var nowTimeFromUserZone = moment(now).utcOffset(eventsList[i].event_timezone).format('YYYY-MM-DD HH:mm:ss');
                        // construct a moment object
                        var nowTimeFromUserZone = moment.tz(eventsList[i].event_timezone).format('YYYY-MM-DD HH:mm:ss');

                        console.log("eventTimeFromUserZone--" + eventTimeFromUserZone);
                        console.log("nowTimeFromUserZone--" + nowTimeFromUserZone);
                        console.log("==============================================");

                        if (nowTimeFromUserZone > eventTimeFromUserZone) {
                            movableList.push(eventsList[i]);
                        }
                    }
                    callBack(null, movableList);

                } else {
                    callBack(null, null);
                }
            },
            function moveToNextDay(movableList, callBack) {
                console.log("start method moveToNextDay");
                if (typeof movableList != "undefined" && movableList) {
                    console.log("movableList.length--" + movableList.length);

                    _async.each(movableList, function (movingEvent, callBack) {

                        if (typeof movingEvent != "undefined" && movingEvent) {

                            _async.waterfall([

                                function doUpdateEvent(callBack) {
                                    console.log("start method doUpdateEvent");
                                    var criteria = {
                                        _id: movingEvent._id
                                    };
                                    var movedCount = movingEvent.moved_nextday_count++;
                                    var updateData = {
                                        start_date_time: moment(movingEvent.start_date_time).add(1, "day").format('YYYY-MM-DD HH:mm:ss'),
                                        moved_nextday: true,
                                        moved_nextday_count: movedCount
                                    };
                                    CalendarEvent.updateEvent(criteria, updateData, function (res) {
                                        callBack(null, res, movingEvent);
                                    });
                                },

                                function addNotification(stt, movedEvent, callBack) {

                                    console.log("start method addNotification");
                                    console.log(stt);

                                    if (stt.status == 200) {
                                        var _data = {
                                            sender: movedEvent.user_id,
                                            notification_type: Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY,
                                            notified_calendar: movedEvent._id
                                        }
                                        Notification.saveNotification(_data, function (res) {
                                            if (res.status == 200) {
                                                callBack(null, res.result._id, movedEvent);
                                            }

                                        });

                                    } else {
                                        callBack(null, null, null);
                                    }
                                },

                                function notifyingUsers(notification_id, movedEvent, callBack) {

                                    console.log("start method notifyingUsers");
                                    console.log("notification_id >>" + notification_id);
                                    console.log(notification_id);

                                    var notifyUsers = [];
                                    notifyUsers.push(movedEvent.user_id);

                                    if (typeof movedEvent.shared_users != "undefined" && movingEvent) {
                                        for (var u = 0; u < movedEvent.shared_users.length; u++) {
                                            if(typeof movedEvent.shared_users[u].user_id != 'undefined') {
                                                notifyUsers.push(movedEvent.shared_users[u].user_id);
                                            }
                                        }
                                    }

                                    console.log("notifyingUsers list >>");
                                    console.log(notifyUsers);

                                    if (typeof notification_id != 'undefined') {
                                        var _data = {
                                            notification_id: notification_id,
                                            recipients: notifyUsers
                                        };
                                        NotificationRecipient.saveRecipients(_data, function (res) {
                                            callBack(null);
                                        })

                                    } else {
                                        callBack(null);
                                    }

                                }
                            ], function (err) {
                                if(err) {
                                    console.log("event notification error ---");
                                }
                                callBack(null);
                            });

                        } else {
                            callBack(null);
                        }
                    }, function(err){
                        if(err) {
                            console.log("event each error ---");
                        }
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }

            }

        ], function (err) {

            if(err) {
                console.log("event updating error ---");
            }
            console.log("***************************************************");
            console.log("----- END calendarEventMovingProcess SCHEDULE -----");
            console.log("***************************************************");
        });

    }

};

module.exports = CalendarEventHandler;