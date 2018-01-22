'use strict';

/**
 * The Calender Controller
 */
var CalendarController = {
    /**
     * Return a specific event by a given ID
     * @param req
     * @param res
     * @return Json
    */
    getEvent: function(req,res) {
        var eventId = req.body.eventId;
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var User = require('mongoose').model('User');
        var _async = require('async');
        _async.waterfall([
            function getEvent(callBack){
                CalendarEvent.getEventById(eventId, function(result) {
                    if(result.error) {
                        callBack(result.error, null);
                    }
                    callBack(null, result.event);
                });
            },

            function getUser(event, callBack) {
                event.sharedWithNames = [];
                event.sharedWithIds = [];
                var arrUsers = event.shared_users;
                var arrNames = [];
                var arrIds = [];

                if(arrUsers.length == 0) {
                    callBack(null, event);
                }

                var fetched = 0;
                for (var i = 0; i < arrUsers.length; i++) {
                    var objUser = arrUsers[i];
                    var name = "";
                    User.findUser({_id: objUser.user_id}, function (userResult) {
                        if(userResult.error) {
                            callBack(userResult.error, null);
                        }

                        name = userResult.user.first_name + " " + userResult.user.last_name;
                        arrNames.push(name);
                        arrIds.push(userResult.user._id);


                        if(++fetched == arrUsers.length) {
                            event.sharedWithNames = arrNames;
                            event.sharedWithIds = arrIds;
                            callBack(null, event);
                        }
                    });
                }
            }
        ], function (err, event) {
            var outPut = {};
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['event'] = event;
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getEvents: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var UserId = CurrentSession.id;

        CalendarEvent.get({}, {}, {}, function (err, result) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * This action creates a Event based on the parameters we are sending.
     * @param req
     * @param res
     * @return Json
     */
    addEvent: function (req, res) {
        var CurrentSession = Util.getCurrentSession(req);
        var _async = require('async'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            UserId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            User = require('mongoose').model('User'),
            notifyUsers = (typeof req.body.shared_users != 'undefined' ? req.body.shared_users : []); //this should be an array

        var eventType = CalendarTypes.EVENT;
        switch(req.body.type) {
            case 'todo':
                eventType = CalendarTypes.TODO;
                break;
            case 'task':
                eventType = CalendarTypes.TASK;
                break;
            default:
                eventType = CalendarTypes.EVENT;
        }

        _async.waterfall([

            function addNewToDb(callBack) {

                var sharedUserList = [];

                if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {
                    for (var i = 0; notifyUsers.length > i; i++) {
                        var obj = {
                            user_id: notifyUsers[i],
                            shared_status: CalendarSharedStatus.REQUEST_PENDING,
                            priority_status: 0
                        }
                        sharedUserList.push(obj);
                    }
                }

                var eventData = {
                    user_id: UserId,
                    description: req.body.description,
                    plain_text: req.body.plain_text,
                    type: eventType,
                    start_date: req.body.apply_date,
                    end_date: req.body.end_date,
                    event_time: req.body.event_time,
                    event_end_time: req.body.event_end_time,
                    event_timezone: req.body.event_timezone,
                    shared_users: sharedUserList,
                    priority:  (typeof req.body.priority != 'undefined' ? req.body.priority : CalenderPriority.LOW),
                    calendar_origin : req.body.calendar_origin,
                    group_id : req.body.group_id
                };

                CalendarEvent.addNew(eventData, function (event) {

                    var sharedUsers = event.event.shared_users;
                    if (typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                        _async.each(sharedUsers, function (sharedUser, callBack) {
                            _async.waterfall([
                                function isESIndexExists(callBack) {
                                    var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + sharedUser.user_id.toString();

                                    var query = {
                                        index: _cache_key,
                                        id: sharedUser.user_id.toString(),
                                        type: 'shared_events',
                                    };
                                    ES.isIndexExists(query, function (esResultSet) {
                                        callBack(null, esResultSet);
                                    });
                                },
                                function getSharedEvents(resultSet, callBack) {
                                    if (resultSet) {
                                        var query = {
                                            q: "_id:" + sharedUser.user_id.toString()
                                        };
                                        CalendarEvent.ch_getSharedEvents(sharedUser.user_id, query, function (esResultSet) {
                                            callBack(null, esResultSet);
                                        });
                                    } else {
                                        callBack(null, null);
                                    }
                                },
                                function ch_shareEvent(resultSet, callBack) {
                                    if (resultSet != null) {
                                        var event_list = resultSet.result[0].events;
                                        var index_a = event_list.indexOf(event.event._id);
                                        if (index_a == -1) { //in any case if the event id exists in the shared list not adding it again
                                            event_list.push(event.event._id);
                                            var query = {
                                                    q: "user_id:" + sharedUser.user_id.toString()
                                                },
                                                data = {
                                                    user_id: sharedUser.user_id,
                                                    events: event_list
                                                };

                                            CalendarEvent.ch_shareEventUpdateIndex(sharedUser.user_id, data, function (esResultSet) {
                                                callBack(null);
                                            });
                                        } else {
                                            callBack(null);
                                        }
                                    } else {
                                        var query = {
                                                q: "user_id:" + sharedUser.user_id.toString()
                                            },
                                            data = {
                                                user_id: sharedUser.user_id,
                                                events: [event.event._id]
                                            };
                                        CalendarEvent.ch_shareEventCreateIndex(sharedUser.user_id, data, function (esResultSet) {
                                            callBack(null, event);
                                        });
                                    }
                                }
                            ], function (err, resultSet) {
                                callBack(null, event);
                            });
                        }, function (err, resultSet) {
                            callBack(null, event);
                        });
                    } else {
                        callBack(null, event);
                    }
                });
            },
            function addNotification(calEvent, callBack) {

                if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {

                    var _data = {
                        sender: UserId,
                        notified_calendar: calEvent.event._id,
                        notified_group: req.body.group_id
                    }

                    if(eventType == CalendarTypes.TASK){
                        _data['notification_type'] = Notifications.SHARE_GROUP_TASK;
                    }else {
                        _data['notification_type'] = Notifications.SHARE_CALENDAR;
                    }


                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id, calEvent);
                        }

                    });

                } else {
                    callBack(null, null, calEvent);
                }
            },
            function notifyingUsers(notification_id, calEvent, callBack) {

                if (typeof notification_id != 'undefined' && notifyUsers.length > 0) {
                    var _data = {
                        notification_id: notification_id,
                        recipients: notifyUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null, calEvent);
                    })

                } else {
                    callBack(null, calEvent);
                }
            },
            function getNotifyUsers(calEvent, callBack){
                var _usernames = [];
                if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {
                    User.getSenderDetails(notifyUsers, function (_shared_users) {
                        if(_shared_users.status == 200) {
                            var userList = _shared_users.users_list;
                            for(var i = 0; i < userList.length; i++){
                                if(CurrentSession.id != userList[i].sender_id){
                                    _usernames.push(userList[i].sender_user_name);
                                }
                            }
                        }

                        callBack(null, {users: _usernames, e: calEvent});
                    });
                }else {
                    callBack(null, {users: [], e: calEvent});
                }
            },

        ], function (err, resultSet) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = resultSet.e.event;
                outPut['shared_users'] = resultSet.users;
                res.status(200).send(outPut);
            }
        });

    },


    /**
     * removing calendar event from db and es
     * renoving notification recepiens
     * removing notification
     * @param req
     * @param res
     */
    deleteCalendarEvent: function (req, res) {

        console.log("came to deleteCalendarEvent");
        var CurrentSession = Util.getCurrentSession(req),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async');

        var UserId = CurrentSession.id;
        var moment = require('moment');
        var eventId = req.body.event_id;
        var myEvent = '';

        _async.waterfall([
            function getEventById(callBack) {
                console.log("came to getEventById");
                CalendarEvent.getEventById(eventId, function (result) {
                    if(result.error) {
                        callBack(result.error, null);
                    }
                    myEvent = result.event;
                    callBack(null, result.event);
                });
            },
            function getNotificationByEventId(_event, callBack) {
                console.log("came to getNotificationByEventId");
                if (_event && _event.shared_users.length > 0) {
                    _async.waterfall([
                        function getNotificationByEventId(callBack) {
                            console.log("came to getNotificationByEventId");
                            if (myEvent) {
                                console.log(_event._id);
                                var criteria = {notified_calendar: _event._id};
                                Notification.getNotifications(criteria, function (results) {
                                    if (results.status == 200) {
                                        callBack(null, results.result, _event);
                                    } else {
                                        callBack(null, null, null);
                                    }

                                });
                            } else {
                                callBack(null, null, null);
                            }

                        },
                        function getNotificationIdAll(_notifications, _event, callBack) {
                            if (_notifications) {
                                var _ids = [];
                                for(var i = 0; i < _notifications.length; i++){
                                    _ids.push(_notifications[i]._id);
                                }
                                callBack(null, _ids, _event);
                            } else {
                                callBack(null, null, _event);
                            }
                        },
                        function removeRecipients(_notificationIds, _event, callBack) {
                            console.log("came to removeRecipients");

                            if (_notificationIds.length > 0 && _event) {
                                var _ids = {
                                    $in: _notificationIds
                                }
                                var criteria = {notification_id: _ids}
                                NotificationRecipient.deleteNotificationRecipients(criteria, function (results) {
                                    if (results.status == 200) {
                                        callBack(null, results.status, _notificationIds);
                                    } else {
                                        callBack(null, null, null);
                                    }
                                });
                            } else {
                                callBack(null, null, null);
                            }
                        },
                        function removeNotification(delRecipients, _notificationIds, callBack) {
                            console.log("came to removeNotification");
                            if (delRecipients == 200 && _notificationIds.length > 0) {
                                var _ids = {
                                    $in: _notificationIds
                                }
                                var criteria = {_id: _ids}

                                Notification.deleteNotification(criteria, function (results) {
                                    if (results.status == 200) {
                                        callBack(null, results.status);
                                    } else {
                                        callBack(null, null);
                                    }

                                });
                            } else {
                                callBack(null, null);
                            }
                        },
                        function removeEventFromESSharedEvents(delNotification, callBack) {
                            console.log("came to removeEventFromESSharedEvents");
                            if (delNotification == 200 && myEvent) {

                                var sharedUsers = myEvent.shared_users;
                                if (typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                                    _async.each(sharedUsers, function (sharedUser, callBack) {
                                        _async.waterfall([
                                            function isESIndexExists(callBack) {
                                                console.log("came to isESIndexExists");
                                                var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + sharedUser.user_id.toString();
                                                var query = {
                                                    index: _cache_key,
                                                    id: sharedUser.user_id.toString(),
                                                    type: 'shared_events',
                                                };
                                                ES.isIndexExists(query, function (esResultSet) {
                                                    callBack(null, esResultSet);
                                                });
                                            },
                                            function getSharedEvents(resultSet, callBack) {
                                                if (resultSet) {
                                                    console.log("index exists---");
                                                    var query = {
                                                        q: "_id:" + sharedUser.user_id.toString()
                                                    };
                                                    CalendarEvent.ch_getSharedEvents(sharedUser.user_id, query, function (esResultSet) {
                                                        callBack(null, esResultSet);
                                                    });
                                                } else {
                                                    callBack(null, null);
                                                }
                                            },
                                            function ch_updateEvent(resultSet, callBack) {
                                                if (resultSet != null) {
                                                    var event_list = resultSet.result[0].events;
                                                    var index_a = event_list.indexOf(myEvent._id);
                                                    if (index_a == -1) { //event id should exists
                                                        event_list.splice(index_a, 1);//removing event id from array
                                                        var query = {
                                                                q: "user_id:" + sharedUser.user_id.toString()
                                                            },
                                                            data = {
                                                                user_id: sharedUser.user_id,
                                                                events: event_list
                                                            };

                                                        CalendarEvent.ch_shareEventUpdateIndex(sharedUser.user_id, data, function (esResultSet) {
                                                            callBack(null);
                                                        });
                                                    } else {
                                                        callBack(null);
                                                    }
                                                } else {
                                                    callBack(null);
                                                }
                                            }

                                        ], function (err) {
                                            callBack(null);
                                        })
                                    }, function (err) {
                                        callBack(null);
                                    });
                                }

                            } else {
                                callBack(null);
                            }
                        }

                    ], function (err) {
                        callBack(null);
                    })
                } else {
                    callBack(null);
                }
            },
            function removeEventFinally(callBack) {
                console.log("came to removeEventFinally");
                var criteria = {_id: eventId}

                CalendarEvent.deleteEvent(criteria, function (results) {
                    if (results.status == 200) {
                        callBack(null, results.status);
                    } else {
                        callBack(null, null);
                    }
                });
            }


        ], function (err, _status) {

            var outPut = {};
            if (err || _status != 200) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }

        });


    },


    /**
     * Return all events todos tasks for given month
     * @param req
     * @param res
     * @return Json
     */
    getAllForSpecificMonth: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');
        var UserId = CurrentSession.id;
        var moment = require('moment');

        var month = req.query.month;
        var year = req.query.year;
        var user_id = Util.toObjectId(UserId);
        var _Events = [];
        var startMonth, endMonth;

        if(typeof req.query.calendarType != "undefined" &&  req.query.calendarType == "month"){
            startMonth = month - 2;
            endMonth = month;
        }

        if(typeof req.query.calendarType != "undefined" &&  req.query.calendarType == "year"){
            startMonth = month - 1;
            endMonth = month - 1;
        }

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment([year, Number(startMonth)]).startOf('month').format('YYYY-MM-DD');

        // Clone the value before .endOf()
        var endDate = moment([year, Number(endMonth)]).endOf('month').add(1, 'day').format('YYYY-MM-DD');
        var calendar_origin = typeof(req.query.calendarOrigin) != 'undefined' ? req.query.calendarOrigin : 1; // PRESONAL_CALENDAR || GROUP_CALENDAR
        var criteria = {start_date_time: {$gte: startDate, $lt: endDate}, status: 1};

        if(calendar_origin == CalendarOrigin.GROUP_CALENDAR && typeof req.query.groupId != "undefined") {
            criteria['group_id'] = Util.toObjectId(req.query.groupId);
        } else {
            criteria['user_id'] = user_id;
        }

        if(req.query.events_type) {
            criteria['type'] = req.query.events_type;
        }

        if(req.query.priority) {
            criteria['priority'] = req.query.priority;
        }

        if(req.query.status) {
            criteria['status'] = req.query.status;
        }

        _async.waterfall([
            function getEventsFromDB(callBack) {
                CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function getSharedEvents(resultSet, callBack) {

                if (typeof resultSet != 'undefined' && resultSet) {

                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        if(typeof esResultSet != 'undefined' && esResultSet) {
                            var sharedEvents = esResultSet.result[0].events;

                            _async.each(sharedEvents, function (sharedEvent, callBack) {

                                var condition = {
                                    start_date_time: {$gte: startDate, $lt: endDate},
                                    _id: sharedEvent,
                                };

                                if(calendar_origin == CalendarOrigin.GROUP_CALENDAR && typeof req.query.groupId != "undefined") {
                                    criteria['group_id'] = Util.toObjectId(req.query.groupId);
                                }

                                CalendarEvent.getSortedCalenderItems(condition, function (err, result) {

                                    if(typeof result != 'undefined' && result) {

                                        if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                            var _Shared_users = result.events[0].shared_users;

                                            if(_Shared_users != null && typeof _Shared_users != 'undefined'){

                                                for(var inc = 0; inc < _Shared_users.length; inc++){

                                                    /**
                                                     * If group_id is set and event.group_id is equal to requested group_id then condition parameter set as true.
                                                     * If group_id is not set then also condition parameter set as true.
                                                     * So this 'group_condition' parameter should always need as 'true' to pass
                                                     * @type {boolean}
                                                     */
                                                    var group_condition = (calendar_origin == CalendarOrigin.GROUP_CALENDAR && req.query.groupId != undefined) ? result.group_id == req.query.groupId : true;

                                                    if(_Shared_users != null && typeof _Shared_users != 'undefined' && result.user_id != user_id){

                                                        for(var inc = 0; inc < _Shared_users.length; inc++){

                                                            if(_Shared_users[inc].user_id == user_id && (_Shared_users[inc].shared_status == CalendarSharedStatus.REQUEST_PENDING || _Shared_users[inc].shared_status == CalendarSharedStatus.REQUEST_ACCEPTED) && group_condition != false){
                                                                _Events.push(result.events[0]);
                                                            }
                                                        }
                                                    }

                                                }
                                            }

                                        }
                                    }
                                    callBack(null);

                                });
                            }, function (err) {
                                callBack(null, _Events);
                            });
                        } else {
                            callBack(null, _Events);
                        }

                    });
                } else {
                    callBack(null, _Events);
                }
            },
            // function getMyGroups(resultSet, callBack) {
            //     var query={
            //         q:"status:3", // accepted
            //         index:'idx_connections:'+user_id
            //     };
            //
            //     ES.search(query,function(groupIndexes){
            //         callBack(null, _Events);
            //     });
            // },
            // function getMyGroupEvents(indexes, callBack) {
            //
            //     if(indexes != null && indexes.result_count > 0 && calendar_origin != CalendarOrigin.GROUP_CALENDAR) {
            //
            //         var i = 0;
            //         indexes.result.forEach(function(group) {
            //             var groupCriteria = {start_date_time: {$gte: startDate, $lt: endDate}, status: 1, group_id:  group._id};
            //             CalendarEvent.getSortedCalenderItems(groupCriteria, function (err, resultSet) {
            //                 if(err) {
            //                     callBack(null, null);
            //                 } else {
            //                     Array.prototype.push.apply(_Events, resultSet.events); // this trick is for merging two arrays. Can't use concat becase concat creates a new array
            //                     i = i+1;
            //                     if(i == indexes.result_count) {
            //                         callBack(null, _Events);
            //                     }
            //                 }
            //
            //             });
            //         });
            //     } else {
            //         callBack(null, _Events);
            //     }
            // }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['event_count'] = _Events.length;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for given month
     * @param req
     * @param res
     * @return Json
     */
    getNewTasks: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');
        var moment = require('moment');

        var user_id = Util.toObjectId(CurrentSession.id);
        var _Events = [];

        var startDate = req.query.start_date;
        var groupId = typeof(req.query.group_id) != 'undefined' ? req.query.group_id : ""; // PRESONAL_CALENDAR || GROUP_CALENDAR
        var eventType = typeof(req.query.events_type) != 'undefined' ? req.query.events_type : 3;

        _async.waterfall([

            function getSharedEvents(callBack) {

                var user_id = CurrentSession.id;
                var query = {
                    q: "_id:" + user_id.toString()
                };

                CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                    if(typeof esResultSet != 'undefined' && esResultSet) {
                        var sharedEvents = esResultSet.result[0].events;
                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            _async.waterfall([
                                function getSortedCalendarItem(callBack){
                                    var condition = {
                                        start_date_time: {$gte: startDate},
                                        _id: sharedEvent,
                                        group_id : groupId,
                                        type : eventType, // 3 - Task
                                    };
                                    CalendarEvent.getSortedCalenderItems(condition, function (err, result) {
                                        callBack(null, result);
                                    });
                                },
                                function composeUsers(result, callBack){

                                    if(result && result.events[0] && result.events[0].shared_users) {
                                        var _currentEvent = result.events[0];
                                        var _Shared_users = _currentEvent.shared_users;

                                        _async.each(_Shared_users, function (member, callBack) {
                                            if(member.user_id == user_id && (member.shared_status == CalendarSharedStatus.REQUEST_PENDING)){

                                                var query = {
                                                    q: "user_id:" + _currentEvent.user_id.toString(),
                                                    index: 'idx_usr'
                                                };
                                                //Find User from Elastic search
                                                ES.search(query, function (csResultSet) {
                                                    if (csResultSet != undefined) {
                                                        var _result = csResultSet.result[0];
                                                        var _images = _result['images'];
                                                        var _pic = _images.hasOwnProperty('http_url') ? _images['http_url'] : _images.hasOwnProperty('profile_image') ? _images['profile_image']['http_url'] : "images/default-profile-pic.png";
                                                        _pic = _pic == undefined ? "images/default-profile-pic.png" : _pic;

                                                        _currentEvent['user_name'] = _result['first_name'] + " " + _result['last_name'];
                                                        _currentEvent['user_image'] = _pic;

                                                        _Events.push(result.events[0]);
                                                        callBack(null);
                                                    }else {
                                                        callBack(null);
                                                    }
                                                });

                                            } else {
                                                callBack(null);
                                            }

                                        }, function (err) {
                                            callBack(null);
                                        });

                                    } else {
                                        callBack(null);
                                    }
                                }
                            ], function (err, _Events) {
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    } else {
                        console.log("no shared events");
                        callBack(null, _Events);
                    }
                });
            },
            function sortTasks(allTasks, callBack){
                var sortedTasks = Util.sortByKeyASC(allTasks, 'start_date_time');
                callBack(null, allTasks);
            },
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['event_count'] = _Events.length;
                res.status(200).send(outPut);
            }
        });
    },

    getPriorityList: function(req, res) {
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');
        var moment = require('moment');

        var startDate = req.query.start_date;
        var priority = req.query.priority;

        var currentUserId = Util.toObjectId(CurrentSession.id);
        var _Events = [];

        _async.waterfall([

            function getOwnTasks(callBack) {
                var condition = {
                    start_date_time : {$gte: startDate},
                    group_id : req.query.group_id,
                    user_id : currentUserId,
                    type : req.query.events_type
                };

                if(typeof priority != 'undefined') {
                    condition['priority'] = priority;
                }

                CalendarEvent.getSortedCalenderItems(condition, function (err, result) {

                    if(typeof result != 'undefined' && result) {

                        _async.each(result.events, function (event, callBack) {
                            _Events.push(event);
                            callBack(null);
                        }, function (err) {
                            callBack(null);
                        });
                    }
                });
            },
            function getSharedTasks(callBack) {
                var user_id = CurrentSession.id;
                var query = {
                    q: "_id:" + user_id.toString()
                };

                // grab user shared tasks.
                CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                    if(typeof esResultSet != 'undefined' && esResultSet) {
                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {
                            var condition = {
                                start_date_time : {$gte: startDate},
                                _id : sharedEvent,
                                group_id : req.query.group_id,
                                type : req.query.events_type
                            };

                            if(typeof priority != 'undefined') {
                                condition['priority'] = priority;
                            }

                            CalendarEvent.getSortedCalenderItems(condition, function (err, result) {

                                if(result && result.events[0] && result.events[0].shared_users) {
                                    var shared_users = result.events[0].shared_users;

                                    _async.each(shared_users, function (member, callBack) {
                                        // if(member.user_id == user_id && (member.shared_status == CalendarSharedStatus.REQUEST_ACCEPTED || member.shared_status == CalendarSharedStatus.EVENT_COMPLETED)){
                                        if(member.user_id == user_id && (member.shared_status == CalendarSharedStatus.REQUEST_ACCEPTED)){
                                            _Events.push(result.events[0]);
                                            callBack(null);
                                        } else {
                                            callBack(null);
                                        }
                                    }, function (err) {

                                        callBack(null);
                                    });
                                } else {
                                    callBack(null);
                                }

                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    } else {
                        console.log("no shared events");
                        callBack(null, _Events);
                    }
                });
            },
            function sortTasks(allTasks, callBack){
                var sortedTasks = Util.sortByKeyASC(allTasks, 'start_date_time');
                callBack(null, allTasks);
            },
            function getUsers(events, callBack) {

                var criteria = {
                    user_id: currentUserId,
                    status: 3
                };
                var User = require('mongoose').model('User');
                User.getConnectionUsers(criteria, function (result) {
                    var friends = result.friends;
                    callBack(null, events, friends);
                });
            },

            function composeUsers(events, users, callBack) {
                for (var e = 0; e < events.length; e++) {
                    var arrUsers = [];
                    var event = events[e];

                    var sharedUsers = (event.shared_users) ? event.shared_users : [];
                    // if (sharedUsers.length == 0) {
                    //     if (e + 1 == (events.length)) {
                    //         callBack(null, events)
                    //     }
                    // }
                    var ownerId = event.user_id;
                    var owner = {
                        'shared_status': CalendarSharedStatus.REQUEST_ACCEPTED,
                        'id': ownerId,
                        'name': 'Owner',
                        'priority' : event.priority
                    };
                    var ownerObj = users.filter(function (e) {
                        return e.user_id == ownerId;
                    });
                    if (ownerId.toString() == currentUserId.toString()) {
                        owner.name = 'me';
                    } else if (ownerObj) {
                        owner.name = ownerObj[0].first_name + " " + ownerObj[0].last_name;
                    }
                    arrUsers.push(owner);

                    for (var u = 0; u < sharedUsers.length; u++) {
                        var userId = sharedUsers[u].user_id;
                        var filterObj = users.filter(function (e) {
                            return e.user_id == userId;
                        });
                        var user = {
                            'shared_status': sharedUsers[u].shared_status,
                            'id': userId,
                            'name': 'Unknown',
                            'priority' : sharedUsers[u].priority_status
                        };

                        if (currentUserId.toString() == userId.toString()) {
                            user.name = 'me';
                        } else if (filterObj) {
                            user.name = filterObj[0].first_name + " " + filterObj[0].last_name;
                        }

                        arrUsers.push(user);
                        // if (u + 1 == sharedUsers.length && e + 1 == events.length) {
                        //     arrUsers.push(owner);
                        //     events[e].shared_users = arrUsers;
                        //     callBack(null, events);
                        // }
                    }
                    events[e].shared_users = arrUsers;
                }

                callBack(null, events);
            }
        ], function (err, events) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = events;
                outPut['event_count'] = _Events.length;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for given date range
     * @param req
     * @param res
     * @return Json
     */
    getAllForDateRange: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var UserId = CurrentSession.id;
        var moment = require('moment');
        var _async = require('async');

        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var user_id = Util.toObjectId(UserId);
        var _Events = [];

        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment(start_date).format('YYYY-MM-DD');

        // Clone the value before .endOf()
        var endDate = moment(end_date).add(1,'day').format('YYYY-MM-DD');
        var calendar_origin = typeof(req.query.calendarOrigin) != 'undefined' ? req.query.calendarOrigin : 1; // PRESONAL_CALENDAR || GROUP_CALENDAR
        var criteria = {start_date_time: {$gte: startDate, $lt: endDate}, status: 1};

        if(calendar_origin == CalendarOrigin.GROUP_CALENDAR) {
            criteria['group_id'] = req.query.groupId;
        } else {
            criteria['user_id'] = user_id;
        }

        _async.waterfall([
            function getEventsFromDB(callBack) {
                CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {
                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },

            function getSharedEvents(resultSet, callBack) {

                if (typeof resultSet != 'undefined' && resultSet) {

                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        if(typeof esResultSet != 'undefined' && esResultSet) {

                            var sharedEvents = esResultSet.result[0].events;

                            _async.each(sharedEvents, function (sharedEvent, callBack) {

                                var condition = {
                                    start_date_time: {$gte: startDate, $lt: endDate},
                                    _id: sharedEvent,
                                };

                                CalendarEvent.getSortedCalenderItems(condition, function (err, result) {

                                    if(typeof result != 'undefined' && result) {

                                        if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                            var _Shared_users = result.events[0].shared_users;

                                            /**
                                             * If group_id is set and event.group_id is equal to requested group_id then condition parameter set as true.
                                             * If group_id is not set then also condition parameter set as true.
                                             * So this 'group_condition' parameter should always need as 'true' to pass
                                             * @type {boolean}
                                             */
                                            var group_condition = (calendar_origin == CalendarOrigin.GROUP_CALENDAR && req.query.groupId != undefined) ? result.group_id == req.query.groupId : true;

                                            if(_Shared_users != null && typeof _Shared_users != 'undefined' && result.user_id != user_id){

                                                for(var inc = 0; inc < _Shared_users.length; inc++){

                                                    if(_Shared_users[inc].user_id == user_id && (_Shared_users[inc].shared_status == CalendarSharedStatus.REQUEST_PENDING || _Shared_users[inc].shared_status == CalendarSharedStatus.REQUEST_ACCEPTED) && group_condition != false){
                                                        _Events.push(result.events[0]);
                                                    }
                                                }
                                            }

                                        }
                                    }
                                    callBack(null);

                                });
                            }, function (err) {
                                callBack(null, _Events);
                            });
                        } else {
                            callBack(null, _Events);
                        }

                    });
                } else {
                    callBack(null, _Events);
                }

            },
            function getMyGroups(resultSet, callBack) {
                var query={
                    q:"status:3", // accepted
                    index:'idx_connections:'+user_id
                };

                ES.search(query,function(groupIndexes){
                    callBack(null, _Events);
                });
            },
            function getMyGroupEvents(indexes, callBack) {

                if(indexes != null && indexes.result_count > 0 && calendar_origin != CalendarOrigin.GROUP_CALENDAR) {

                    var i = 0;
                    indexes.result.forEach(function(group) {
                        var groupCriteria = {start_date_time: {$gte: startDate, $lt: endDate}, status: 1, group_id:  group._id};
                        CalendarEvent.getSortedCalenderItems(groupCriteria, function (err, resultSet) {
                            if(err) {
                                callBack(null, null);
                            } else {
                                Array.prototype.push.apply(_Events, resultSet.events); // this trick is for merging two arrays. Can't use concat becase concat creates a new array
                                i = i+1;
                                if(i == indexes.result_count) {
                                    callBack(null, _Events);
                                }
                            }

                        });
                    });
                } else {
                    callBack(null, _Events);
                }
            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for given week
     * @param req
     * @param res
     * @return Json
     */
    getAllForSpecificWeek: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');

        var _Events = [];
        var _Week = [];
        var _Days = [];
        var data = {};
        data['week'] = req.query.week;
        data['month'] = req.query.month;
        data['year'] = req.query.year;
        data['user_id'] = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getWeeklyCalenderEvens(callBack) {
                CalendarEvent.getWeeklyCalenderEvens(data, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function isESIndexExists(resultSet, callBack) {
                var user_id = CurrentSession.id;
                var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + user_id;
                var query = {
                    index: _cache_key,
                    id: user_id,
                    type: 'shared_events',
                };
                ES.isIndexExists(query, function (esResultSet) {
                    callBack(null, {
                        eventsDb: resultSet,
                        isExists: esResultSet
                    });
                });
            },
            function getSharedEvents(resultSet, callBack) {
                if (resultSet.isExists) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            var dataVal = {};
                            dataVal['week'] = req.query.week;
                            dataVal['month'] = req.query.month;
                            dataVal['year'] = req.query.year;
                            dataVal['_id'] = sharedEvent;

                            CalendarEvent.getWeeklyCalenderEvensForSharedUser(dataVal, function (err, result) {

                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                    _Events.push(result.events[0]);
                                    _Week = result.week;
                                    _Days = result.days;
                                }
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    });
                } else {
                    callBack(null, _Events);
                }

            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['week'] = _Week;
                outPut['days'] = _Days;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for current week
     * @param req
     * @param res
     * @return Json
     */
    getAllEventForCurrentWeek: function (req, res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var _async = require('async');

        var _Events = [];
        var _Week = [];
        var _Days = [];

        var data = {};
        data['week'] = Math.ceil(moment().format('DD') / 7);
        data['month'] = moment().format('MM');
        data['year'] = moment().format('YYYY');
        data['user_id'] = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getWeeklyCalenderEvens(callBack) {
                CalendarEvent.getWeeklyCalenderEvens(data, function (err, resultSet) {

                    _Events = resultSet.events;
                    callBack(null, resultSet.events);
                });
            },
            function isESIndexExists(resultSet, callBack) {
                var user_id = CurrentSession.id;
                var _cache_key = "idx_user:" + CalendarEventsConfig.CACHE_PREFIX + user_id;
                var query = {
                    index: _cache_key,
                    id: user_id,
                    type: 'shared_events',
                };
                ES.isIndexExists(query, function (esResultSet) {
                    callBack(null, {
                        eventsDb: resultSet,
                        isExists: esResultSet
                    });
                });
            },
            function getSharedEvents(resultSet, callBack) {
                if (resultSet.isExists) {
                    var user_id = CurrentSession.id;

                    var query = {
                        q: "_id:" + user_id.toString()
                    };
                    CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet) {

                        var sharedEvents = esResultSet.result[0].events;

                        _async.each(sharedEvents, function (sharedEvent, callBack) {

                            var dataVal = {};
                            dataVal['week'] = Math.ceil(moment().format('DD') / 7);
                            dataVal['month'] = moment().format('MM');
                            dataVal['year'] = moment().format('YYYY');
                            dataVal['_id'] = sharedEvent;

                            CalendarEvent.getWeeklyCalenderEvensForSharedUser(dataVal, function (err, result) {
                                //console.log(result);
                                if (result.events[0] != null && typeof result.events[0] != 'undefined') {
                                    _Events.push(result.events[0]);
                                    _Week = result.week;
                                    _Days = result.days;
                                }
                                callBack(null);
                            });
                        }, function (err) {
                            callBack(null, _Events);
                        });
                    });
                } else {
                    callBack(null, _Events);
                }

            }
        ], function (err, _Events) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_MONTH_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = _Events;
                outPut['week'] = _Week;
                outPut['days'] = _Days;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events todos tasks for next or previous week
     * @param req
     * @param res
     * @return Json
     */
    getAllEventForNextOrPrevWeek: function (req, res) {
        var moment = require('moment');
        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');

        var data = {}, startDateOfWeek, endDateOfWeek;
        data['date'] = req.query.date;
        data['action'] = req.query.action;
        data['user_id'] = Util.toObjectId(CurrentSession.id);
        data['current_month'] = moment(data['date'], 'YYYY-MM-DD').format('MM');
        data['current_year'] = moment(data['date'], 'YYYY-MM-DD').format('YYYY');

        if (data['action'] == 'next') {
            startDateOfWeek = moment(data['date'], 'YYYY-MM-DD').add(7, 'day').format('YYYY-MM-DD');
        } else {
            startDateOfWeek = moment(data['date'], 'YYYY-MM-DD').subtract(7, 'day').format('YYYY-MM-DD');
        }

        data['week'] = Math.ceil(moment(startDateOfWeek).format('DD') / 7);
        data['month'] = moment(startDateOfWeek).format('MM');
        data['year'] = moment(startDateOfWeek).format('YYYY');

        if (data['current_month'] != data['month'] || data['current_year'] != data['year']) {
            if (data['current_year'] != data['year']) {
                if (data['current_year'] > data['year']) {
                    data['week'] = Math.ceil(moment(startDateOfWeek).endOf('month').format('DD') / 7);
                } else {
                    data['week'] = Math.ceil(moment(startDateOfWeek).startOf('month').format('DD') / 7);
                }
            } else {
                if (data['current_month'] > data['month']) {
                    data['week'] = Math.ceil(moment(startDateOfWeek).endOf('month').format('DD') / 7);
                } else {
                    data['week'] = Math.ceil(moment(startDateOfWeek).startOf('month').format('DD') / 7);
                }
            }

        }

        CalendarEvent.getWeeklyCalenderEvens(data, function (err, result) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CALENDAR_WEEK_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = result.events;
                outPut['week'] = result.week;
                outPut['days'] = result.days;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Return all events of a given day
     * @param req
     * @param res
     * @return Json
     */
    getEventsForSpecificDay: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent');
        var moment = require('moment');
        var day = req.body.day;
        var calendar_origin = typeof(req.body.calendar_origin) != 'undefined' ? req.body.calendar_origin : 1; // PRESONAL_CALENDAR || GROUP_CALENDAR
        var _Events = [];

        var user_id = Util.toObjectId(CurrentSession.id);
        var startTimeOfDay = moment(day, 'YYYY-MM-DD').format('YYYY-MM-DD'); //format the given date as mongo date object
        var endTimeOfDay = moment(day, 'YYYY-MM-DD').add(1, "day").format('YYYY-MM-DD'); //get the next day of given date
        var _async = require('async');
        // var criteria =  { start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }, user_id: user_id, calendar_origin: calendar_origin};
        //if(calendar_origin == CalendarOrigin.GROUP_CALENDAR && req.body.group_id != undefined) {
        //    criteria['group_id'] = req.body.group_id;
        //}
        var criteria = {start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }};

        if(calendar_origin == CalendarOrigin.GROUP_CALENDAR && typeof req.body.group_id != "undefined") {
            criteria['group_id'] = Util.toObjectId(req.body.group_id);
        } else {
            criteria['user_id'] = user_id;
        }

        _async.waterfall([

            function getSortedCalenderItems(callBack) {

                if(calendar_origin == CalendarOrigin.GROUP_CALENDAR && req.body.group_id != undefined && req.body.group_id) { // For a specific group
                    _async.waterfall([
                        function getEventsFromDB(callBack) {
                            var grp_criteria =  { start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay }, calendar_origin: calendar_origin, group_id: req.body.group_id};
                            CalendarEvent.getSortedCalenderItems(grp_criteria, function (err, resultSet) {

                                if(err) {
                                    callBack(null, null);
                                } else {
                                    _Events = resultSet.events;
                                    callBack(null, _Events);
                                }

                            });
                        }
                    ], function (err, _Events) {
                        callBack(null, _Events);
                    });

                } else { // Not for a specific group

                    _async.waterfall([
                        function getEventsFromDB(callBack) {

                            CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {

                                if(err) {
                                    callBack(null, null);
                                } else {
                                    _Events = resultSet.events;
                                    callBack(null, resultSet.events);
                                }

                            });
                        },
                        function getSharedEvents(resultSet, callBack) {

                            if (typeof resultSet != 'undefined' && resultSet) {

                                var user_id = CurrentSession.id;

                                var query = {
                                    q: "_id:" + user_id.toString()
                                };

                                //get all shared event ids from ES
                                CalendarEvent.ch_getSharedEvents (user_id, query, function (esResultSet) {

                                    if(typeof esResultSet != 'undefined' && esResultSet) {

                                        var sharedEvents = esResultSet.result[0].events; //these are only ids. no event obj
                                        var condition = {
                                            start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay},
                                            _id : {$in : sharedEvents},
                                        };

                                        // get all events based on id list
                                        CalendarEvent.getSortedCalenderItems(condition, function (err, resultSet) {

                                            if(typeof resultSet != 'undefined' && resultSet) {
                                                //loop each events
                                                _async.each(resultSet.events, function (result, eventsCallBack) {
                                                    var _Shared_users = result.shared_users;

                                                    /**
                                                     * If group_id is set and event.group_id is equal to requested group_id then condition parameter set as true.
                                                     * If group_id is not set then also condition parameter set as true.
                                                     * So this 'group_condition' parameter should always need as 'true' to pass
                                                     * @type {boolean}
                                                     */
                                                    var group_condition = (calendar_origin == CalendarOrigin.GROUP_CALENDAR && req.body.group_id != undefined) ? result.group_id == req.body.group_id : true;

                                                    if(_Shared_users != null && typeof _Shared_users != 'undefined' && result.user_id != user_id){

                                                        _async.each(_Shared_users, function (_Shared_user, sharedUserCallBack) {

                                                            if(_Shared_user.user_id == user_id
                                                                && (_Shared_user.shared_status == CalendarSharedStatus.REQUEST_PENDING || _Shared_user.shared_status == CalendarSharedStatus.REQUEST_ACCEPTED)
                                                                && group_condition != false){

                                                                _async.waterfall([
                                                                    function getSharedOwner(middleCallBack) {
                                                                        console.log("came to get shared event owner----");
                                                                        var query = {
                                                                            q: result.user_id.toString(),
                                                                            index: 'idx_usr'
                                                                        };
                                                                        ES.search(query, function (esResultSet) {

                                                                            if (typeof esResultSet.result[0] == "undefined") {
                                                                                middleCallBack(null, null);
                                                                            } else {
                                                                                var _name = esResultSet.result[0].first_name + " " + esResultSet.result[0].last_name;
                                                                                middleCallBack(null, _name);
                                                                            }
                                                                        });
                                                                    },
                                                                    function setSharedOwner(_name, middleCallBack) {
                                                                        result['owner_name'] = _name;
                                                                        _Events.push(result);
                                                                        middleCallBack(null);
                                                                    }

                                                                ], function (err) {
                                                                    sharedUserCallBack(null);
                                                                });
                                                            } else {
                                                                sharedUserCallBack(null);
                                                            }

                                                        }, function (err) {
                                                            eventsCallBack(null, _Events);
                                                        });
                                                    } else {
                                                        eventsCallBack(null, _Events);
                                                    }

                                                }, function (err) {
                                                    callBack(null, _Events);
                                                });
                                            } else {
                                                callBack(null, _Events);
                                            }

                                        });
                                    } else {
                                        callBack(null, _Events);
                                    }

                                });
                            } else {
                                callBack(null, _Events);
                            }

                        },
                        function getMyGroupEvents(resultSet, callBack) {

                            if(calendar_origin == CalendarOrigin.GROUP_CALENDAR) {
                                callBack(null, _Events);
                            } else {

                                var query={
                                    q:"status:3", // accepted
                                    index:'idx_connections:'+user_id
                                };

                                ES.search(query,function(groupIndexes){
                                    if(groupIndexes != null && groupIndexes.result_count > 0) {
                                        var i = 0;
                                        var arrEvents = [];
                                        groupIndexes.result.forEach(function(group) {

                                            var criteria = {
                                                start_date_time: {$gte: startTimeOfDay, $lt: endTimeOfDay },
                                                group_id: group._id
                                            };

                                            CalendarEvent.getSortedCalenderItems(criteria, function (err, resultSet) {

                                                if(err) {
                                                    callBack(null, null);
                                                } else {
                                                    Array.prototype.push.apply(_Events, resultSet.events); // this trick is for
                                                    i = i+1;
                                                    if(i == groupIndexes.result_count) {
                                                        callBack(null, _Events);
                                                    }
                                                }

                                            });
                                        });
                                    } else {
                                        callBack(null, _Events);
                                    }
                                });
                            }
                        }
                    ], function (err, _Events) {
                        callBack(null, _Events);
                    });
                }
            },

            function getUsers(events, callBack) {

                var criteria = {
                    user_id: user_id,
                    status: 3
                };
                var User = require('mongoose').model('User');
                User.getConnectionUsers(criteria, function (result) {
                    var friends = result.friends;
                    callBack(null, events, friends);
                });
            },

            function composeUsers(events, users, callBack) {

                if (events == undefined || events.length == 0) {
                    callBack(null, []);
                }

                for (var e = 0; e < events.length; e++) {

                    var ownerMarker = "Other";
                    var event = events[e];

                    // console.log("event ====");
                    var sharedUsers = (event.shared_users) ? event.shared_users : [];
                    var ownerId = event.user_id;

                    if(ownerId.toString() == user_id.toString()) {
                        ownerMarker = "Own";
                    }
                    if (sharedUsers.length == 0) {
                        if (e + 1 == (events.length)) {
                            events[e].belong_to = ownerMarker;
                            callBack(null, events)

                        }
                    }

                    var ownerObj = users.filter(function (e) {
                        return e.user_id == ownerId;
                    });
                    if (ownerObj) {
                        events[e].owner_name = ownerObj[0].first_name + " " + ownerObj[0].last_name;
                    }

                    var arrUsers = [];
                    for (var u = 0; u < sharedUsers.length; u++) {
                        var userId = sharedUsers[u].user_id;

                        if(userId.toString() == user_id.toString()) {
                            ownerMarker = "Shared";
                        }
                        var filterObj = users.filter(function (e) {
                            return e.user_id == userId;
                        });

                        var user = {
                            'shared_status': sharedUsers[u].shared_status,
                            'id': userId,
                            'name': 'Unknown',
                            'owner_name': 'Unknown',
                            'shared_user_name': 'Unknown'
                        };

                        if (filterObj) {
                            user.name = filterObj[0].first_name + " " + filterObj[0].last_name;
                            user.shared_user_name = filterObj[0].user_name;
                        }
                        if (ownerObj) {
                            user.owner_name = ownerObj[0].first_name + " " + ownerObj[0].last_name;
                        }

                        arrUsers.push(user);
                        events[e].shared_users = arrUsers;

                        if (u + 1 == sharedUsers.length && e + 1 == events.length) {
                            events[e].belong_to = ownerMarker;
                            callBack(null, events);
                        }
                    }
                    events[e].belong_to = ownerMarker;
                }
            }
        ], function (err, events) {

            var outPut = {};
            if(err){
                outPut['error'] = err;
                res.status(400).send(outPut);
            }else{
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['events'] = events;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Update events for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateEvent: function(req,res) {

        var CalendarEvent = require('mongoose').model('CalendarEvent'),
            Notification = require('mongoose').model('Notification'),
            User = require('mongoose').model('User'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.body.id;
        event_id = Util.toObjectId(event_id);

        var user_id = Util.getCurrentSession(req).id,
            shareUsers = (typeof req.body.shared_users != 'undefined' ? req.body.shared_users : []), //this should be an array
            isTimeChanged = false,
            _description = req.body.description,
            _plain_text = req.body.plain_text,
            _start_date_time = req.body.apply_date,
            _event_time = req.body.event_time ? req.body.event_time : null,
            _event_end_time = req.body.event_end_time,
            _passed_event_time = req.body.event_time,
            _passed_event_end_time = req.body.event_time ? req.body.event_time : null,
            _task_priority = req.body.priority ? req.body.priority : null;


        var sharedUserList = [], notifyUsers = [], removedUsers = [], newlyAddedUsers = [], existingUsers = [];
        _async.waterfall([
            function getEvents(callBack) {
                CalendarEvent.getEventById(event_id, function (resultSet) {
                    if(resultSet.error) {
                        callBack(resultSet.error, null);
                    }
                    callBack(null, resultSet.event);
                });
            },
            function compareSharedUsers(resultSet, callBack) {
                if (typeof resultSet != 'undefined') {

                    if(_event_time != resultSet.event_time){
                        isTimeChanged = true;
                        _passed_event_time = resultSet.event_time;
                    }

                    if(_event_end_time != null && _event_end_time != resultSet.event_end_time){
                        isTimeChanged = true;
                        _passed_event_end_time = resultSet.event_end_time;
                    }


                    if(resultSet.shared_users.length > 0) {

                        if (typeof shareUsers != 'undefined' && shareUsers.length > 0) {

                            /*
                             * Get all the removed user from share events
                             */
                            for (var i = 0; resultSet.shared_users.length > i; i++) {

                                var filterObj = shareUsers.filter(function (e) {

                                    return e.toString() == resultSet.shared_users[i].user_id.toString();
                                });

                                if (typeof filterObj[0] == 'undefined' || filterObj[0] == null) {
                                    removedUsers.push(resultSet.shared_users[i].user_id);
                                }
                            }

                            for (var k = 0; shareUsers.length > k; k++) {
                                var secondFilterObj = resultSet.shared_users.filter(function (e) {
                                    return e.user_id.toString() == shareUsers[k].toString();
                                });

                                if (typeof secondFilterObj[0] == 'undefined' || secondFilterObj[0] == null) {
                                    newlyAddedUsers.push(shareUsers[k]);
                                } else {
                                    existingUsers.push(shareUsers[k]);
                                }
                            }

                        } else {

                            for (var i = 0; resultSet.shared_users.length > i; i++) {
                                removedUsers.push(resultSet.shared_users[i].user_id);
                            }
                        }

                    } else {
                        newlyAddedUsers = shareUsers;
                    }


                    if (typeof shareUsers != 'undefined' && shareUsers.length > 0) {

                        /*
                         * If time changed then all user should be requested again
                         * So all user request set as PENDING again
                         */
                        if (isTimeChanged == true) {
                            for (var i = 0; shareUsers.length > i; i++) {
                                var obj = {
                                    user_id: shareUsers[i],
                                    shared_status: CalendarSharedStatus.REQUEST_PENDING
                                };
                                sharedUserList.push(obj);
                                //notifyUsers.push(shareUsers[i]);
                            }

                        } else {

                            /*
                             * There might be shared users, so their request status kept as it is.
                             * For new shared users request will save as PENDING
                             */
                            for (var i = 0; shareUsers.length > i; i++) {

                                if (typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {

                                    var filterObj = resultSet.shared_users.filter(function (e) {
                                        return e.user_id.toString() == shareUsers[i].toString();
                                    });

                                    if (typeof filterObj != 'undefined' && filterObj.user_id) {
                                        sharedUserList.push(filterObj);
                                    } else {
                                        var obj = {
                                            user_id: shareUsers[i],
                                            shared_status: CalendarSharedStatus.REQUEST_PENDING
                                        };
                                        sharedUserList.push(obj);
                                        //notifyUsers.push(shareUsers[i]);
                                    }

                                } else {
                                    var obj = {
                                        user_id: shareUsers[i],
                                        shared_status: CalendarSharedStatus.REQUEST_PENDING
                                    };
                                    sharedUserList.push(obj);
                                    //notifyUsers.push(shareUsers[i]);
                                }
                            }
                        }
                    }

                    var updateData = {
                        description: _description,
                        plain_text: _plain_text,
                        start_date_time: _start_date_time,
                        event_time: _event_time,
                        event_end_time: _event_end_time,
                        shared_users: sharedUserList,
                        priority: _task_priority
                    };

                    callBack(null, updateData);

                } else {
                    callBack(null, null);
                }
            },
            function updateDbEvent(updateData, callBack) {
                var criteria = {
                    _id: event_id
                };

                CalendarEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null, res.status);
                });
            },
            function updateRemovedUserESSharedStatus(stt, callBack) {
                if (typeof removedUsers != 'undefined' && removedUsers.length > 0) {

                    _async.each(removedUsers, function (removedUser, callBack) {
                        _async.waterfall([
                            function getSharedEvents(callBack) {
                                var query = {
                                    q: "_id:" + removedUser
                                };
                                CalendarEvent.ch_getSharedEvents(removedUser, query, function (esResultSet) {
                                    callBack(null, esResultSet);
                                });

                            },
                            function ch_shareEvent(resultSet, callBack) {
                                if (resultSet != null) {

                                    var event_list = resultSet.result[0].events;
                                    var index = event_list.indexOf(req.body.id.toString());

                                    if (index != -1) {
                                        event_list.splice(index, 1);
                                    }

                                    var query = {
                                            q: "user_id:" + removedUser
                                        },
                                        data = {
                                            user_id: removedUser,
                                            events: event_list
                                        };

                                    CalendarEvent.ch_shareEventUpdateIndex(removedUser, data, function (esResultSet) {
                                        callBack(null, stt);
                                    });
                                } else {
                                    callBack(null, stt);
                                }
                            }
                        ], function (err, resultSet) {
                            callBack(null, stt);
                        });


                    }, function (err, resultSet) {
                        callBack(null, stt);
                    });

                }
                else {
                    callBack(null, stt);
                }
            },
            function updateExistingUsersESSharedStatus(stt, callBack) {
                console.log("updateExistingUsersESSharedStatus called --");

                if (typeof existingUsers != 'undefined' && existingUsers.length > 0) {

                    _async.each(existingUsers, function (existingUser, callBack) {
                        _async.waterfall([
                            function getSharedEvents(callBack) {
                                var query = {
                                    q: "_id:" + existingUser
                                };
                                CalendarEvent.ch_getSharedEvents(existingUser, query, function (esResultSet) {
                                    callBack(null, esResultSet);
                                });

                            },
                            function ch_shareEventUpdate(resultSet, callBack) {
                                if (resultSet != null) {

                                    var event_list = resultSet.result[0].events;
                                    var index = event_list.indexOf(req.body.id.toString());
                                    if (index == -1) {
                                        event_list.splice(0, 0, req.body.id);
                                    }

                                    var query = {
                                            q: "user_id:" + existingUser
                                        },
                                        data = {
                                            user_id: existingUser,
                                            events: event_list
                                        };

                                    CalendarEvent.ch_shareEventUpdateIndex(existingUser, data, function (esResultSet) {
                                        callBack(null, stt);
                                    });
                                } else {
                                    callBack(null, stt);
                                }
                            }
                        ], function (err, resultSet) {
                            callBack(null, stt);
                        });
                    }, function (err, resultSet) {
                        callBack(null, stt);
                    });

                }
                else {
                    callBack(null, stt);
                }
            },
            function newUsersESSharedStatus(stt, callBack) {
                console.log("newUsersESSharedStatus called --");
                if (typeof newlyAddedUsers != 'undefined' && newlyAddedUsers.length > 0) {

                    _async.each(newlyAddedUsers, function (newlyAddedUser, callBack) {
                        _async.waterfall([
                            function getSharedEvents(callBack) {
                                var query = {
                                    q: "_id:" + newlyAddedUser
                                };
                                CalendarEvent.ch_getSharedEvents(newlyAddedUser, query, function (esResultSet) {
                                    callBack(null, esResultSet);
                                });

                            },
                            function ch_shareEventCreate(resultSet, callBack) {
                                if (resultSet == null) {
                                    var query = {
                                            q: "user_id:" + newlyAddedUser
                                        },
                                        data = {
                                            user_id: newlyAddedUser,
                                            events: [event_id]
                                        };
                                    CalendarEvent.ch_shareEventCreateIndex(newlyAddedUser, data, function (esResultSet) {
                                        callBack(null, stt);
                                    });
                                } else {
                                    var event_list = resultSet.result[0].events;
                                    var index = event_list.indexOf(req.body.id.toString());
                                    if (index == -1) {
                                        event_list.splice(0, 0, req.body.id);
                                    }

                                    var query = {
                                            q: "user_id:" + newlyAddedUser
                                        },
                                        data = {
                                            user_id: newlyAddedUser,
                                            events: event_list
                                        };
                                    CalendarEvent.ch_shareEventUpdateIndex(newlyAddedUser, data, function (esResultSet) {
                                        callBack(null, stt);
                                    });
                                }
                            }
                        ], function (err, resultSet) {
                            callBack(null, stt);
                        });
                    }, function (err, resultSet) {
                        callBack(null, stt);
                    });

                } else {
                    callBack(null, stt);
                }
            },
            function addExistingUserNotifications(stt, callBack) {
                console.log("addExistingUserNotifications called --");
                    _async.waterfall([
                        function addNotification(callBack) {

                            if (typeof existingUsers != 'undefined' && existingUsers.length > 0 && stt == 200) {
                                var _data = {
                                    sender: user_id,
                                    notification_type: isTimeChanged == true ? Notifications.CALENDAR_SCHEDULE_TIME_CHANGED : Notifications.CALENDAR_SCHEDULE_UPDATED,
                                    notified_calendar: event_id
                                }
                                Notification.saveNotification(_data, function (res) {
                                    callBack(null, res.result._id);
                                });

                            } else {
                                callBack(null, null);
                            }
                        },
                        function notifyingUsers(notification_id, callBack) {

                            if (typeof notification_id != 'undefined' && existingUsers.length > 0) {
                                var _data = {
                                    notification_id: notification_id,
                                    recipients: existingUsers
                                };
                                NotificationRecipient.saveRecipients(_data, function (res) {
                                    callBack(null);
                                })

                            } else {
                                callBack(null);
                            }
                        }
                    ], function(err) {
                        callBack(null, stt);
                    })
            },

            function addNewUserNotifications(stt, callBack) {
                console.log("addNewUserNotifications called --");
                _async.waterfall([
                    function addNotification(callBack) {

                        if (typeof newlyAddedUsers != 'undefined' && newlyAddedUsers.length > 0 && stt == 200) {
                            var _data = {
                                sender: user_id,
                                notification_type: Notifications.SHARE_CALENDAR,
                                notified_calendar: event_id
                            }
                            Notification.saveNotification(_data, function (res) {
                                callBack(null, res.result._id);
                            });

                        } else {
                            callBack(null, null);
                        }
                    },
                    function notifyingUsers(notification_id, callBack) {

                        if (typeof notification_id != 'undefined' && newlyAddedUsers.length > 0) {
                            var _data = {
                                notification_id: notification_id,
                                recipients: newlyAddedUsers
                            };
                            NotificationRecipient.saveRecipients(_data, function (res) {
                                callBack(null);
                            })

                        } else {
                            callBack(null);
                        }
                    }
                ], function(err) {
                    callBack(null, stt);
                })
            },

            function getNotifyUsers(stt, callBack){
                console.log("getNotifyUsers called --");
                var _usernames = [];
                var arrayAll = existingUsers.concat(newlyAddedUsers);
                if (typeof arrayAll != 'undefined' && arrayAll.length > 0) {
                    User.getSenderDetails(arrayAll, function (_shared_users) {
                        if(_shared_users.status == 200) {
                            var userList = _shared_users.users_list;
                            for(var i = 0; i < userList.length; i++){
                                _usernames.push(userList[i].sender_user_name);
                            }
                        }

                        callBack(null, _usernames);
                    });
                }else {
                    callBack(null, []);
                }
            }
        ], function (err, shared_users) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['event_time'] = {'isTimeChanged':isTimeChanged,'event_time':_event_time,'passed_event_time':_passed_event_time, 'passed_event_end_time' : _passed_event_end_time};
                outPut['shared_users'] = shared_users;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Share an event within users
     * @param req
     * @param res
     */
    shareEvent: function (req, res) {

        var _async = require('async'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            CurrentSession = Util.getCurrentSession(req),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var eventId = req.body.eventId;
        var event_Id = Util.toObjectId(req.body.eventId);
        var notifyUsers = req.body.userId;

        _async.waterfall([
            function getEvent(callBack) {
                var event = CalendarEvent.getEventById(event_Id, function (resultSet) {
                    if(resultSet.error) {
                        callBack(resultSet.error, null);
                    }
                    callBack(null, resultSet.event);
                });
            },
            function shareEvent(resultSet, callBack) {
                var sharedUsers = resultSet.shared_users;
                _async.waterfall([
                    function saveDB(callBack) {
                        _async.each(notifyUsers, function (notifyUser, callBack) {
                            var _sharingUser = {
                                user_id: notifyUser,
                                shared_status: CalendarStatus.PENDING
                            };
                            sharedUsers.push(_sharingUser);
                            var _sharedUsers = {
                                shared_users: sharedUsers
                            }
                            CalendarEvent.shareEvent(event_Id, _sharedUsers, function (resultS) {
                                callBack(null);
                            });


                        }, function (err) {
                            callBack(null);
                        });
                    },
                    function addNotification(callBack) {

                        if (typeof notifyUsers != 'undefined' && notifyUsers.length > 0) {

                            var _data = {
                                sender: CurrentSession.id,
                                notification_type: Notifications.SHARE_CALENDAR,
                                notified_calendar: event_Id
                            };
                            Notification.saveNotification(_data, function (results) {
                                if (results.status == 200) {
                                    callBack(null, results.result._id);
                                } else {
                                    callBack(null);
                                }
                            });

                        } else {
                            callBack(null);
                        }
                    },
                    function notifyingUsers(notification_id, callBack) {

                        if (typeof notification_id != 'undefined' && notifyUsers.length > 0) {

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
                ], function (err, resultSet) {
                    callBack(null, null);
                });
            },
        ], function (err, resultSet) {
            if (err) {
                status: ApiHelper.getMessage(400, err)
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                events: resultSet
            }
            res.status(200).json(outPut);
        });

    },

    /**
     * get shared users for a event
     * @param req
     * @param res
     */
    getEventSharedUsers: function (req, res) {

        var _async = require('async'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            eventId = req.query.eventId;

        var event_Id = Util.toObjectId(req.query.eventId);
        var dataArray = [];

        _async.waterfall([
            function getEevent(callBack) {
                CalendarEvent.getEventById(event_Id, function (resultSet) {
                    if(resultSet.error) {
                        callBack(resultSet.error, null);
                    }
                    callBack(null, resultSet.event);
                });
            },
            function getSharedUsers(resultSet, callBack) {
                if (typeof resultSet.shared_users != 'undefined' && resultSet.shared_users.length > 0) {
                    var sharedUsers = resultSet.shared_users;
                    _async.each(sharedUsers, function (sharedUser, callBack) {

                        if (sharedUser.shared_status == CalendarStatus.PENDING || sharedUser.shared_status == CalendarStatus.COMPLETED) {
                            var usrObj = {};
                            _async.waterfall([

                                function getEsSharedUsers(callBack) {
                                    var query = {
                                        q: "user_id:" + sharedUser.user_id.toString(),
                                        index: 'idx_usr'
                                    };
                                    //Find User from Elastic search
                                    ES.search(query, function (csResultSet) {
                                        if (typeof csResultSet.result != 'undefined' && csResultSet.result_count > 0) {
                                            usrObj.user_name = csResultSet.result[0]['first_name'] + " " + csResultSet.result[0]['last_name'];
                                            usrObj.profile_image = csResultSet.result[0]['images']['profile_image']['http_url'];
                                        } else {
                                            usrObj.user_name = null;
                                            usrObj.profile_image = null;
                                        }

                                        callBack(null);
                                    });

                                },
                                function getSharedUserMoreDetails(callBack) {
                                    var criteria = {_id: sharedUser.user_id.toString()},
                                        showOptions = {
                                            w_exp: true,
                                            edu: true
                                        };

                                    User.getUser(criteria, showOptions, function (resultSet) {

                                        usrObj.country = resultSet.user.country;
                                        if (typeof resultSet.user.education_details[0] != 'undefined' && resultSet.user.education_details.length > 0) {
                                            usrObj.school = resultSet.user.education_details[0].school;
                                            usrObj.degree = resultSet.user.education_details[0].degree;
                                        }
                                        if (typeof resultSet.user.working_experiences[0] != 'undefined' && resultSet.user.working_experiences.length > 0) {
                                            usrObj.company_name = resultSet.user.working_experiences[0].company_name;
                                            usrObj.company_location = resultSet.user.working_experiences[0].location;
                                        }
                                        callBack(null);
                                    })
                                },
                                function finalFunction(callBack) {

                                    usrObj.user_id = sharedUser.user_id;
                                    usrObj.event_id = eventId;
                                    usrObj.shared_status = sharedUser.shared_status;

                                    dataArray.push(usrObj);
                                    callBack(null);
                                }

                            ], function (err) {
                                callBack(null);
                            });

                        } else {
                            callBack(null);
                        }

                    }, function (err) {
                        callBack(null);
                    });
                } else {
                    callBack(null);
                }
            }
        ], function (err) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                results: dataArray
            };
            res.status(200).json(outPut);
        })
    },

    /**
     * event owner can remove shared users from db
     * @param req
     * @param res
     */
    removeSharedEventUser: function (req, res) {

        var CalendarEvent = require('mongoose').model('CalendarEvent'),
            _async = require('async'),
            own_user_id = Util.getCurrentSession(req).id,
            _arrIndex = require('array-index-of-property');


        var event_id = Util.toObjectId(req.body.eventId),
            shared_user_id = req.body.userId;
        var sharedUsers = [];
        var oldSharedUserList = [];

        _async.waterfall([
            function getEvent(callBack) {
                var event = CalendarEvent.getEventById(event_id, function (resultSet) {
                    if(resultSet.error) {
                        callBack(resultSet.error, null);
                    }
                    callBack(null, resultSet.event);
                });
            },
            function updateInDB(resultSet, callBack) {
                sharedUsers = resultSet.shared_users;
                oldSharedUserList = resultSet.shared_users;
                var index = sharedUsers.indexOfProperty('user_id', shared_user_id);

                if (index != -1) {
                    sharedUsers.splice(index, 1);
                }
                var _udata = {
                    'shared_users': sharedUsers
                };
                var criteria = {
                    _id: event_id,
                    user_id: Util.toObjectId(own_user_id),
                    'shared_users.user_id': shared_user_id
                };
                CalendarEvent.updateSharedEvent(criteria, _udata, function (err, result) {
                    if (result.status == 200) {
                        callBack(null, result);
                    } else {
                        callBack(null, null);
                    }
                });
            }
        ], function (err, result) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                update_status: result
            };
            res.status(200).json(outPut);
        })


    },

    /**
     * accept shared event by shared user
     * @param req
     * @param res
     */

    respondToNotification: function(req,res){

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            _async = require('async'),
            _data = {read_status:true},
            user_id = Util.getCurrentSession(req).id;

        _async.waterfall([
            function updateNotifications(callBack){
                var _criteria = {notification_id:Util.toObjectId(req.body.notification_id), recipient:Util.toObjectId(user_id)};
                NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                    callBack(null);
                });
            },
            function updateSharedStatus(callBack){
                var postData = {
                    status: req.body.status,
                    event_id:Util.toObjectId(req.body.event_id)
                };
                CalendarEvent.updateSharedStatus(postData, user_id, function(res){
                    callBack(null);
                });
            },
            // function updateSharedStatus(callBack) {
            //     var shared_status = req.body.status == 'REQUEST_REJECTED' ?
            //         CalendarSharedStatus.REQUEST_REJECTED : CalendarSharedStatus.REQUEST_ACCEPTED;
            //
            //     var _udata = {
            //         'shared_users.$.shared_status':shared_status
            //     };
            //     var criteria = {
            //         _id:Util.toObjectId(req.body.event_id),
            //         'shared_users.user_id':user_id
            //     };
            //
            //     CalendarEvent.updateSharedEvent(criteria, _udata, function(res){
            //         callBack(null);
            //     });
            // },
            // function updateESSharedStatus(callBack){
            //     if(req.body.status == 'REQUEST_REJECTED'){
            //
            //         _async.waterfall([
            //             function getSharedEvents(callBack){
            //                 var query={
            //                     q:"_id:"+user_id
            //                 };
            //                 CalendarEvent.ch_getSharedEvents(user_id, query, function (esResultSet){
            //                     callBack(null, esResultSet);
            //                 });
            //
            //             },
            //             function ch_shareEvent(resultSet, callBack) {
            //                 if(resultSet != null){
            //                     var event_list = resultSet.result[0].events;
            //                     var index = event_list.indexOf(req.body.event_id.toString());
            //                     event_list.splice(index, 1);
            //
            //                     var query={
            //                             q:"user_id:"+user_id
            //                         },
            //                         data = {
            //                             user_id: user_id,
            //                             events: event_list
            //                         };
            //
            //                     CalendarEvent.ch_shareEventUpdateIndex(user_id,data, function(esResultSet){
            //                         callBack(null);
            //                     });
            //                 }else {
            //                     callBack(null);
            //                 }
            //             }
            //         ], function (err, resultSet) {
            //             callBack(null);
            //         });
            //
            //     }else{
            //         callBack(null);
            //     }
            // },
            function addNotification(callBack){

                var _data = {
                    sender:user_id,
                    notification_type:Notifications.SHARE_CALENDAR_RESPONSE,
                    notified_calendar:req.body.event_id,
                    notification_status:req.body.status.toString()
                }
                Notification.saveNotification(_data, function(res){
                    if(res.status == 200) {
                        callBack(null,res.result._id);
                    }
                });

            },
            function notifyingUsers(notification_id, callBack){

                var userList = [req.body.updating_user];
                if(typeof notification_id != 'undefined' && userList.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:userList
                    };

                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })

                } else{
                    callBack(null);
                }
            }
        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        })


    },

    /**
     * accept shared event by shared user
     * @param req
     * @param res
     */

    respondToTask: function(req,res){

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            CalendarEvent = require('mongoose').model('CalendarEvent'),
            _async = require('async'), _grep = require('grep-from-array'),
            user_id = Util.getCurrentSession(req).id, event_id = Util.toObjectId(req.body.event_id), _priority_status = req.body.priority;

        _async.waterfall([
            function getTaskInfo(callBack){
                CalendarEvent.getEventById(event_id, function(resultSet){
                    callBack(null, resultSet.event);
                });
            },
            function updateSharedStatus(task, callBack){
                var user_info = _grep(task.shared_users, function (e) {
                    return e.user_id.toString() == user_id.toString();
                });
                if(user_info[0].shared_status == CalendarSharedStatus.REQUEST_PENDING){
                    var postData = {
                        status: req.body.status,
                        event_id: event_id
                    };

                    if(typeof _priority_status != "undefined" && _priority_status != null){
                        postData['priority'] = _priority_status;
                    }

                    CalendarEvent.updateSharedStatus(postData, user_id, function(res){
                        callBack(null, task);
                    });
                }else {
                    callBack(null, null);
                }
            },
            function addNotification(task, callBack){

                if(task != null){
                    var _data = {
                        sender:user_id,
                        notification_type: Notifications.SHARE_GROUP_TASK_RESPONSE,
                        notified_calendar: event_id,
                        notified_group : task.group_id,
                        notification_status: req.body.status.toString()
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200) {
                            callBack(null,res.result._id, task.user_id);
                        }
                    });
                }else {
                    callBack(null, null, null);
                }

            },
            function notifyingUsers(notification_id, taskOwner, callBack){
                if(notification_id != null && taskOwner != null){
                    var userList = [taskOwner];
                    if(typeof notification_id != 'undefined' && userList.length > 0){

                        var _data = {
                            notification_id:notification_id,
                            recipients:userList
                        };

                        NotificationRecipient.saveRecipients(_data, function(res){
                            callBack(null);
                        })

                    } else{
                        callBack(null);
                    }
                }else {
                    callBack(null);
                }
            }
        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        })
    },

    /**
     * Return all events of the loggedin user.
     * @param req
     * @param res
     * @return Json
     */
    getUserSuggestion: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var User = require('mongoose').model('User');
        var UserId = CurrentSession.id;
        var criteria = {
            user_id: UserId,
            status: 3
        };

        User.getConnectionUsers(criteria, function (err, result) {

            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.COMMENT_POST_ID_EMPTY, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['users'] = result.friends;
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Update events for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateEventCompletion: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.body.id;
        var status = req.body.status;
        event_id = Util.toObjectId(event_id);
        var user_id = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getEvents(callBack) {
                CalendarEvent.getEventById(event_id, function (resultSet) {
                    if(resultSet.error) {
                        callBack(resultSet.error, null);
                    }
                    callBack(null, resultSet.event);
                });
            },
            function updateEvent(resultSet, callBack) {
                var criteria = {
                    _id: event_id
                };
                var updateData = {
                    status: status
                };
                CalendarEvent.updateEvent(criteria, updateData, function (res) {
                    callBack(null, null);
                });
            },
            function addNotification(calEvent, callBack) {
                if(calEvent != null && calEvent.type == CalendarTypes.TASK){
                    var _data = {
                        sender: user_id,
                        notified_calendar: calEvent._id,
                        notified_group: calEvent.group_id,
                        notification_status: "EVENT_COMPLETED",
                        notification_type: Notifications.SHARE_GROUP_TASK_RESPONSE
                    }

                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id, calEvent);
                        }else {
                            callBack(null, null, null);
                        }

                    });
                }else {
                    callBack(null, null, null);
                }
            },
            function notifyingUsers(notification_id, calEvent, callBack) {

                var notifyUsers = [];

                if (typeof notification_id != 'undefined' && notification_id != null) {
                    for(var i = 0;  i< calEvent.shared_users.length; i++){
                        var shared_user = calEvent.shared_users[i];
                        if(shared_user.shared_status == CalendarSharedStatus.REQUEST_ACCEPTED || shared_user.shared_status == CalendarSharedStatus.EVENT_COMPLETED){
                            notifyUsers.push(shared_user.user_id);
                        }
                    }

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
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Update shared user event status for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateSharedEventCompletion: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var CalendarEvent = require('mongoose').model('CalendarEvent'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification');
        var moment = require('moment');
        var _async = require('async');

        var event_id = req.body.id;
        var status = req.body.status;
        var shared_user_id = req.body.shared_user_id;
        event_id = Util.toObjectId(event_id);
        var user_id = Util.toObjectId(CurrentSession.id);

        _async.waterfall([
            function getEvents(callBack) {
                CalendarEvent.getEventById(event_id, function (resultSet) {
                    if(resultSet.error) {
                        callBack(null, null);
                    } else {
                        callBack(null, resultSet.event);
                    }
                });
            },
            function updateEventStatus(resultSet, callBack) {
                if(resultSet != undefined && resultSet != null && resultSet._id != undefined) {
                    var criteria = {
                        _id: event_id,
                        'shared_users.user_id': user_id
                    };
                    var updateData = {
                        'shared_users.$.shared_status': status
                    };
                    CalendarEvent.updateEvent(criteria, updateData, function (res) {
                        callBack(null, resultSet);
                    });
                } else {
                    callBack(null, null);
                }
            },
            function addNotification(calEvent, callBack) {
                if(calEvent != null && calEvent.type == CalendarTypes.TASK){
                    var _data = {
                        sender: user_id,
                        notified_calendar: calEvent._id,
                        notified_group: calEvent.group_id,
                        notification_status: "EVENT_COMPLETED",
                        notification_type: Notifications.SHARE_GROUP_TASK_RESPONSE
                    }

                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id, calEvent);
                        }else {
                            callBack(null, null, null);
                        }

                    });
                }else {
                    callBack(null, null, null);
                }
            },
            function notifyingUsers(notification_id, calEvent, callBack) {

                var notifyUsers = [];

                if (typeof notification_id != 'undefined' && notification_id != null) {
                    notifyUsers.push(calEvent.user_id);

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
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Get my connections
     * @param req
     * @param res
     * @param URL Param string calendarType [ 1 PERSONAL_CALENDAR  | 2 - GROUP_CALENDAR ]
     * @param URL Param string listType [ 1 - Editor suggestions | 2 - input field suggestions ]
     * @return outPut.status
     */
    suggestUsers: function (req, res) {

        var User = require('mongoose').model('User');
        var Connection = require('mongoose').model('Connection');
        var CurrentSession = Util.getCurrentSession(req);

        var userId = CurrentSession.id;
        var search = req.params['q'];
        var calendarType = req.params['calendar_type'] ? req.params['calendar_type'] : 1;
        var listType = req.params['list_type'] ? req.params['list_type'] : 1;
        var groupId = req.params['group_id'] ? req.params['group_id'] != "null" ? req.params['group_id'] : null : null;

        var suggested_users = [];

        if(calendarType == 1) { // if A PERSONAL_CALENDAR
            var criteria = {
                user_id: userId,
                q: 'first_name:' + search + '* OR last_name:' + search + '*'
            };

            Connection.getMyConnectionData(criteria, function (resultSet) {
                if (resultSet.results.length == 0) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                        suggested_users: suggested_users
                    };
                    res.status(200).send(outPut);
                }

                if(listType == 2 ) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                        suggested_users: resultSet.results
                    };
                    res.status(200).send(outPut);
                }
                for (var i = 0; i < resultSet.results.length; i++) {
                    var user = resultSet.results[i];
                    var _images = user.images;
                    var profileImg = (_images.hasOwnProperty('profile_image') && _images.profile_image != 'undefined') ?
                        (_images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : _images.profile_image.http_url
                        : "/images/default-profile-pic.png";

                    var userObj = {
                        name: user.first_name + ' ' + user.last_name,
                        title: (user.cur_designation ? user.cur_designation : 'Unknown'),
                        avatar: profileImg,
                        user_id: user.user_id
                    }
                    suggested_users.push(userObj);

                    if (i + 1 == resultSet.results.length) {
                        var outPut = {
                            status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                            suggested_users: suggested_users
                        };
                        res.status(200).send(outPut);
                        return;
                    }
                }
                return 0;
            });
        } else { // if A GROUP_CALENDAR

            if(groupId == undefined || groupId == null) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    suggested_users: suggested_users
                };
                res.status(200).send(outPut);
                return;
            }

            var criteria = {
                group_id: groupId,
                q: 'first_name:' + search + '* OR last_name:' + search + '*'
            };

            Connection.getGroupConnectionsData(criteria, function (resultSet) {

                if (resultSet.results.length == 0) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                        suggested_users: suggested_users
                    };
                    res.status(200).send(outPut);
                    // return 0;
                }

                if(listType == 2 ) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                        suggested_users: resultSet.results
                    };
                    res.status(200).send(outPut);
                    // return 0;
                }

                for (var i = 0; i < resultSet.results.length; i++) {
                    var user = resultSet.results[i];

                    var _images = user.images;

                    var profileImg = (_images.hasOwnProperty('profile_image') && _images.profile_image != 'undefined') ?
                        (_images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : _images.profile_image.http_url
                        : "/images/default-profile-pic.png";

                    var userObj = {
                        name: user.first_name + ' ' + user.last_name,
                        title: (user.cur_designation ? user.cur_designation : 'Unknown'),
                        avatar: profileImg,
                        user_id: user.user_id
                    }
                    suggested_users.push(userObj);

                    if (i + 1 == resultSet.results.length) {
                        var outPut = {
                            status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                            suggested_users: suggested_users
                        };
                        res.status(200).send(outPut);
                    }
                }
                return 0;
            });

        }
    }


};

module.exports = CalendarController;
