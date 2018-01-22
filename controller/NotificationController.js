'use strict';

/**
 * Handle notification related operation in the class
 */

var NotificationController ={

    getNotifications:function(req,res){

        var days = req.query.days; console.log("Days = "+days);
        var pg = req.query.pg;console.log("pg = "+pg);

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id)},
            skip = (pg - 1)*Config.NOTIFICATION_RESULT_PER_PAGE, limit = Config.NOTIFICATION_RESULT_PER_PAGE,
            _notifications = {}, _redisIds = [], notifications = {},
            _unreadCount = 0, _formattedNotificationData = [], _postIds = [], _userIds = [],
            _users = {}, _postData = {}, _totalNotifications = 0, outPut = {}, _noOfNotifications = 0, _notebookIds = [], notebookData = [],
            _folderIds = [], _folderData = [], _calendarIds = [], _calendarData = [];

        _async.waterfall([
            function getNotificationCount(callBack){
                console.log("getNotificationCount")

                if(typeof days != 'undefined'){
                    console.log("days defined so call count functions")
                    _async.parallel([
                        function(callBack){
                            NotificationRecipient.getCount(criteria,function(result){
                                _totalNotifications = result.result;
                                outPut['header'] ={
                                    total_result:_totalNotifications,
                                    result_per_page:Config.NOTIFICATION_RESULT_PER_PAGE,
                                    total_pages:Math.ceil(_totalNotifications/Config.NOTIFICATION_RESULT_PER_PAGE)
                                };
                                callBack(null);
                            });
                        },
                        function(callBack){
                            var _unreadCriteria = {recipient:Util.toObjectId(user_id), read_status:false};
                            NotificationRecipient.getCount(_unreadCriteria,function(result){
                                _unreadCount = result.result;
                                callBack(null);
                            });
                        }
                    ], function(err){
                        callBack(null);
                    });
                }else{
                    callBack(null);
                }

            },
            function getTodayNotifications(callBack){
                console.log("getTodayNotifications")

                if(typeof days != 'undefined'){
                    console.log("days defined so get todays notifications")

                    NotificationRecipient.getRecipientNotifications(criteria, days, function(resultSet){

                        notifications = resultSet.notifications;
                        var _types = [], _type = '';

                        for(var i = 0; i < notifications.length; i++){

                            if(notifications[i]['notification_type'] == Notifications.BIRTHDAY ||
                                notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK ||
                                notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.SHARE_FOLDER ||
                                notifications[i]['notification_type'] == Notifications.SHARE_FOLDER_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR ||
                                notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY){
                                _type = notifications[i]['notification_type']
                            } else {
                                _type = notifications[i]['post_id']+notifications[i]['notification_type'];
                                _redisIds.push("post:"+notifications[i]['notification_type']+":"+notifications[i]['post_id']);
                                if(_postIds.indexOf(notifications[i]['post_id'].toString()) == -1){
                                    _postIds.push(notifications[i]['post_id'].toString());
                                }
                            }
                            if(notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK ||
                                notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK_RESPONSE) {
                                var noteObj = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:notifications[i]['notebook_id'],
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[notifications[i]['sender_id'].toString()],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:notifications[i]['notification_status'],
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                if(_types.indexOf(_type) == -1){
                                    _types.push(_type);
                                    _notifications[_type] = [noteObj];
                                } else {
                                    _notifications[_type].push(noteObj);
                                }
                                if(_notebookIds.indexOf(notifications[i]['notebook_id']) == -1 && typeof notifications[i]['notebook_id'] != 'undefined') {
                                    _notebookIds.push(notifications[i]['notebook_id']);
                                }

                                _noOfNotifications++;

                            } else if(notifications[i]['notification_type'] == Notifications.SHARE_FOLDER || notifications[i]['notification_type'] == Notifications.SHARE_FOLDER_RESPONSE){
                                var folderObj = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:notifications[i]['notebook_id'],
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[notifications[i]['sender_id'].toString()],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:notifications[i]['notification_status'],
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                if(_types.indexOf(_type) == -1){
                                    _types.push(_type);
                                    _notifications[_type] = [folderObj];
                                } else {
                                    _notifications[_type].push(folderObj);
                                }
                                if(_folderIds.indexOf(notifications[i]['notified_folder']) == -1 && typeof notifications[i]['notified_folder'] != 'undefined') {
                                    _folderIds.push(notifications[i]['notified_folder']);
                                }
                                _noOfNotifications++;

                            } else if(notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR ||
                                notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY){

                                var calendarObj = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:notifications[i]['notebook_id'],
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[notifications[i]['sender_id'].toString()],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:notifications[i]['notification_status'],
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                if(_types.indexOf(_type) == -1){
                                    _types.push(_type);
                                    _notifications[_type] = [calendarObj];
                                } else {
                                    _notifications[_type].push(calendarObj);
                                }
                                if(_calendarIds.indexOf(notifications[i]['calendar_id']) == -1 && typeof notifications[i]['calendar_id'] != 'undefined') {
                                    _calendarIds.push(notifications[i]['calendar_id']);
                                }
                                _noOfNotifications++;

                            } else if(_types.indexOf(_type) == -1){
                                _types.push(_type)
                                _notifications[_type] = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:'',
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:'',
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:'',
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                _noOfNotifications++;
                            }
                        }
                        _totalNotifications = _totalNotifications - notifications.length;
                        outPut['header'] ={
                            total_result:_totalNotifications,
                            result_per_page:Config.NOTIFICATION_RESULT_PER_PAGE,
                            total_pages:Math.ceil(_totalNotifications/Config.NOTIFICATION_RESULT_PER_PAGE)
                        };
                        callBack(null);

                    });

                } else{
                    callBack(null);
                }
            },
            function getNotifications(callBack){
                console.log("getNotifications")

                if(_noOfNotifications < 5){
                    console.log("_noOfNotifications < 5");
                    console.log(skip);
                    console.log(limit);
                    NotificationRecipient.getRecipientNotificationsLimit(criteria,skip,limit,function(resultSet){
                        notifications = resultSet.notifications;
                        var _types = [], _type = '';

                        for(var i = 0; i < notifications.length; i++){

                            if(notifications[i]['notification_type'] == Notifications.BIRTHDAY ||
                                notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK ||
                                notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.SHARE_FOLDER ||
                                notifications[i]['notification_type'] == Notifications.SHARE_FOLDER_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR ||
                                notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY){
                                _type = notifications[i]['notification_type']
                            } else{
                                _type = notifications[i]['post_id']+notifications[i]['notification_type'];
                                _redisIds.push("post:"+notifications[i]['notification_type']+":"+notifications[i]['post_id']);
                                if(_postIds.indexOf(notifications[i]['post_id'].toString()) == -1){
                                    _postIds.push(notifications[i]['post_id'].toString());
                                }
                            }

                            if(notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK ||
                                notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK_RESPONSE) {
                                var noteObj = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:notifications[i]['notebook_id'],
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[notifications[i]['sender_id'].toString()],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:notifications[i]['notification_status'],
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                if(_types.indexOf(_type) == -1){
                                    _types.push(_type);
                                    _notifications[_type] = [noteObj];
                                } else {
                                    _notifications[_type].push(noteObj);
                                }
                                if(_notebookIds.indexOf(notifications[i]['notebook_id']) == -1 && typeof notifications[i]['notebook_id'] != 'undefined') {
                                    _notebookIds.push(notifications[i]['notebook_id']);
                                }
                                _noOfNotifications++;

                            } else if(notifications[i]['notification_type'] == Notifications.SHARE_FOLDER || notifications[i]['notification_type'] == Notifications.SHARE_FOLDER_RESPONSE){
                                var folderObj = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:notifications[i]['notebook_id'],
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[notifications[i]['sender_id'].toString()],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:notifications[i]['notification_status'],
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                if(_types.indexOf(_type) == -1){
                                    _types.push(_type);
                                    _notifications[_type] = [folderObj];
                                } else {
                                    _notifications[_type].push(folderObj);
                                }
                                if(_folderIds.indexOf(notifications[i]['notified_folder']) == -1 && typeof notifications[i]['notified_folder'] != 'undefined') {
                                    _folderIds.push(notifications[i]['notified_folder']);
                                }
                                _noOfNotifications++;

                            } else if(notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR ||
                                notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR_RESPONSE ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                                notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY){

                                var calendarObj = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:notifications[i]['notebook_id'],
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[notifications[i]['sender_id'].toString()],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:notifications[i]['notification_status'],
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                if(_types.indexOf(_type) == -1){
                                    _types.push(_type);
                                    _notifications[_type] = [calendarObj];
                                } else {
                                    _notifications[_type].push(calendarObj);
                                }
                                if(_calendarIds.indexOf(notifications[i]['calendar_id']) == -1 && typeof notifications[i]['calendar_id'] != 'undefined') {
                                    _calendarIds.push(notifications[i]['calendar_id']);
                                }
                                _noOfNotifications++;

                            } else if(_types.indexOf(_type) == -1){
                                _notifications[_type] = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:'',
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:'',
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                _types.push(_type)
                                _notifications[_type] = {
                                    post_id:notifications[i]['post_id'],
                                    notebook_id:'',
                                    folder_id:notifications[i]['notified_folder'],
                                    calendar_id:notifications[i]['calendar_id'],
                                    notification_type:notifications[i]['notification_type'],
                                    read_status:notifications[i]['read_status'],
                                    post_owner:null,
                                    created_at:notifications[i]['created_at'],
                                    senders:[],
                                    sender_count:0,
                                    notification_ids:[],
                                    notification_id:notifications[i]['notification_id'],
                                    notification_status:'',
                                    sender_id:notifications[i]['sender_id'].toString(),
                                    notebook_name:'',
                                    folder_name:'',
                                    calendar_text:''
                                };
                                _noOfNotifications++;
                            }
                        }
                        callBack(null);
                    });
                } else{
                    console.log("_noOfNotifications > 5");
                    callBack(null);
                }
            },
            function getPostData(callBack){
                var Post = require('mongoose').model('Post');
                _async.each(_postIds, function(_postId, callBack){

                    Post.db_getPostDetailsOnly({_id:_postId}, function(resultPost){

                        _postData[_postId] = {
                            postOwner:resultPost.post.created_by
                        };
                        callBack(null)
                    });
                }, function(err){
                    callBack(null)
                });
            },
            function getNotebookData(callBack){
                var NoteBook = require('mongoose').model('Notebook');
                if(_notebookIds.length > 0) {
                    _async.each(_notebookIds, function (_notebookId, callBack) {

                        NoteBook.getNotebookById(_notebookId,function(resultSet){
                            var _ndata = {
                                notebook_id : _notebookId,
                                notebook_name : resultSet.name
                            };
                            notebookData.push(_ndata);
                            callBack(null);
                        });
                    }, function (err) {
                        callBack(null);
                    });
                } else {
                    callBack(null);
                }
            },
            function getFolderData(callBack){
                var Folders = require('mongoose').model('Folders');
                if(_folderIds.length > 0) {
                    _async.each(_folderIds, function (_folderId, callBack) {
                        Folders.getFolderById(_folderId,function(resultSet){
                            var _fdata = {
                                folder_id : _folderId,
                                folder_name : resultSet.name
                            };
                            _folderData.push(_fdata);
                            callBack(null);
                        });
                    }, function (err) {
                        callBack(null);
                    });
                } else {
                    callBack(null);
                }
            },
            function getCalendarData(callBack){
                var CalendarEvent = require('mongoose').model('CalendarEvent');
                if(_calendarIds.length > 0) {
                    _async.each(_calendarIds, function (_calId, callBack) {

                        CalendarEvent.getEventById(_calId,function(resultSet){
                            if(resultSet.error) {
                                callBack(resultSet.error, null);
                            }
                            
                            var _data = {
                                calendar_id : _calId,
                                calendar_text : resultSet.event.plain_text
                            };
                            _calendarData.push(_data);
                            
                            callBack(null);
                        });
                    }, function (err) {
                        callBack(null);
                    });
                } else {
                    callBack(null);
                }
            },
            function getDetails(callBack){
                for(var i = 0; i < notifications.length; i++){

                    var x = 0;

                    if(notifications[i]['notification_type'] == Notifications.BIRTHDAY) {

                        if (_notifications[notifications[i]['notification_type']]['senders'].indexOf(notifications[i]['sender_id'].toString()) == -1 && x < 3) {
                            _notifications[notifications[i]['notification_type']]['senders'].push(notifications[i]['sender_id'].toString());
                            x++;

                            if (_userIds.indexOf(notifications[i]['sender_id'].toString()) == -1) {
                                _userIds.push(notifications[i]['sender_id'].toString());
                            }
                        }

                        if (x > 3) {
                            var _senderCount = _notifications[notifications[i]['notification_type']]['sender_count'];
                            _senderCount++;
                            _notifications[notifications[i]['notification_type']]['sender_count'] = _senderCount;
                        }

                    } else if(notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK ||
                        notifications[i]['notification_type'] == Notifications.SHARE_NOTEBOOK_RESPONSE ||
                        notifications[i]['notification_type'] == Notifications.SHARE_FOLDER ||
                        notifications[i]['notification_type'] == Notifications.SHARE_FOLDER_RESPONSE ||
                        notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR ||
                        notifications[i]['notification_type'] == Notifications.SHARE_CALENDAR_RESPONSE ||
                        notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                        notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                        notifications[i]['notification_type'] == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY) {
                        if (_userIds.indexOf(notifications[i]['sender_id'].toString()) == -1) {
                            _userIds.push(notifications[i]['sender_id'].toString());
                        }

                    } else{
                        _notifications[notifications[i]['post_id']+notifications[i]['notification_type']]['post_owner'] = _postData[notifications[i]['post_id']]['postOwner'];
                        if(_userIds.indexOf(_postData[notifications[i]['post_id']]['postOwner'].toString()) == -1){
                            _userIds.push(_postData[notifications[i]['post_id']]['postOwner'].toString());
                        }
                    }

                }
                callBack(null)

            },
            function getSendersFromRedis(callBack){

                _async.each(_redisIds, function(_redisId, callBack){

                    CacheEngine.getList(_redisId,0,10,function(chResultSet){

                        var _tempRedisIdArr = _redisId.split(":");
                        var _tempPostId = _tempRedisIdArr[2];
                        var _tempNotificationType = _tempRedisIdArr[1];

                        _notifications[_tempPostId+_tempNotificationType]['sender_count'] = chResultSet.result_count;

                        var _res = chResultSet.result;
                        var x = 0;
                        for(var i = 0; i < _res.length; i++){

                            if(x > 2){
                                break;
                            }

                            var _senderCount = _notifications[_tempPostId+_tempNotificationType]['sender_count'];
                            _senderCount--;
                            _notifications[_tempPostId+_tempNotificationType]['sender_count'] = _senderCount;

                            if(typeof _res[i] === 'object'){

                                if(user_id !== _res[i].commented_by.user_id){
                                    x++;
                                    if(_notifications[_tempPostId+_tempNotificationType]['senders'].indexOf(_res[i].commented_by.user_id) == -1){
                                        _notifications[_tempPostId+_tempNotificationType]['senders'].push(_res[i].commented_by.user_id);
                                    }

                                    if(_userIds.indexOf(_res[i].commented_by.user_id) == -1){

                                        _userIds.push(_res[i].commented_by.user_id);

                                        _users[_res[i].commented_by.user_id] = {
                                            name : _res[i].commented_by.first_name+" "+_res[i].commented_by.last_name,
                                            profile_image : "",
                                            user_name: _res[i].commented_by.user_name
                                        };

                                        if(typeof _res[i].commented_by.images != 'undefined' && typeof _res[i].commented_by.images.profile_image != 'undefined' &&
                                            typeof _res[i].commented_by.images.profile_image.http_url != 'undefined'){
                                            _users[_res[i].commented_by.user_id].profile_image = _res[i].commented_by.images.profile_image.http_url;
                                        }

                                    }

                                }

                            } else{

                                if(user_id !== _res[i].toString()){
                                    x++;
                                    if(_notifications[_tempPostId+_tempNotificationType]['senders'].indexOf(_res[i].toString()) == -1){
                                        _notifications[_tempPostId+_tempNotificationType]['senders'].push(_res[i].toString());
                                    }

                                    if(_userIds.indexOf(_res[i].toString()) == -1){
                                        _userIds.push(_res[i].toString());

                                    }
                                }

                            }
                        }
                        callBack(null);
                    });


                }, function (err) {
                    callBack(null);
                })
            },
            function getUserDetails(callBack){
                _async.each(_userIds,function(_userId, callBack){

                    if(typeof _users[_userId] == 'undefined'){
                        var query={
                            q:"user_id:"+_userId.toString(),
                            index:'idx_usr'
                        };
                        //Find User from Elastic search
                        ES.search(query,function(csResultSet){

                            _users[_userId] = {
                                name : csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name'],
                                profile_image : "",
                                user_name: csResultSet.result[0]['user_name']
                            };
                            if(typeof csResultSet.result[0].images != 'undefined' && typeof csResultSet.result[0].images.profile_image != 'undefined' &&
                                typeof csResultSet.result[0].images.profile_image.http_url != 'undefined'){
                                _users[_userId].profile_image = csResultSet.result[0].images.profile_image.http_url;
                            }

                            callBack(null);
                        });
                    }else{
                        callBack(null);
                    }


                },function(err){
                    callBack(null)

                });
            },
            function setNotebookName(callBack){
                if(notebookData.length > 0) {
                    for (var key in _notifications) {
                        if (key == Notifications.SHARE_NOTEBOOK || key == Notifications.SHARE_NOTEBOOK_RESPONSE) {
                            var obj = _notifications[key];
                            for (var i in obj) {
                                if(typeof _notifications[key][i].notebook_id != 'undefined') {
                                    for (var k in notebookData) {
                                        if(notebookData[k].notebook_id == _notifications[key][i].notebook_id) {
                                            _notifications[key][i]['notebook_name'] = notebookData[k].notebook_name;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                callBack(null);
            },
            function setFolderName(callBack){
                if(_folderData.length > 0) {
                    for (var key in _notifications) {
                        if (key == Notifications.SHARE_FOLDER || key == Notifications.SHARE_FOLDER_RESPONSE) {
                            var obj = _notifications[key];
                            for (var i in obj) {
                                if(typeof _notifications[key][i].folder_id != 'undefined') {
                                    for (var k in _folderData) {
                                        if(_folderData[k].folder_id == _notifications[key][i].folder_id) {
                                            _notifications[key][i]['folder_name'] = _folderData[k].folder_name;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                callBack(null);
            },
            function setCalendarText(callBack){
                if(_calendarData.length > 0) {
                    for (var key in _notifications) {
                        if (key == Notifications.SHARE_CALENDAR ||
                            key == Notifications.SHARE_CALENDAR_RESPONSE ||
                            key == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                            key == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                            key == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY) {
                            var obj = _notifications[key];
                            for (var i in obj) {
                                if(typeof _notifications[key][i].calendar_id != 'undefined') {
                                    for (var k in _calendarData) {
                                        if(_calendarData[k].calendar_id == _notifications[key][i].calendar_id) {
                                            _notifications[key][i]['calendar_text'] = _calendarData[k].calendar_text;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                callBack(null);
            },
            function finalizeData(callBack){

                for (var key in _notifications) {

                    var obj = _notifications[key];
                    if(key != Notifications.SHARE_NOTEBOOK &&
                        key != Notifications.SHARE_NOTEBOOK_RESPONSE &&
                        key != Notifications.SHARE_FOLDER &&
                        key != Notifications.SHARE_FOLDER_RESPONSE &&
                        key != Notifications.SHARE_CALENDAR &&
                        key != Notifications.SHARE_CALENDAR_RESPONSE &&
                        key != Notifications.CALENDAR_SCHEDULE_UPDATED &&
                        key != Notifications.CALENDAR_SCHEDULE_TIME_CHANGED &&
                        key != Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY) {

                        if(obj.senders.length > 0){

                            var _postOwnerName = "",
                                _postOwnerUsername = "",
                                birthdayDay = "";

                            if(obj.notification_type == Notifications.BIRTHDAY){
                                var createdDate = new Date(obj.created_at);
                                var diff = Math.floor((new Date() - createdDate) / 1000);
                                if(diff < 86400){
                                    birthdayDay = "today";
                                } else{
                                    birthdayDay = "yesterday";
                                }

                            } else {

                                if(obj.post_owner == user_id){
                                    _postOwnerName = "your";
                                }else{
                                    _postOwnerName = _users[obj.post_owner]['name']+"'s";
                                }
                                _postOwnerUsername = _users[obj.post_owner]['user_name'];
                            }

                            var _data = {
                                post_id:obj.post_id,
                                notification_type:obj.notification_type,
                                read_status:obj.read_status,
                                created_at:DateTime.explainDate(obj.created_at),
                                post_owner_username:_postOwnerUsername,
                                post_owner_name:_postOwnerName,
                                sender_profile_picture:_users[obj.senders[0]]['profile_image'],
                                sender_name:_users[obj.senders[0]]['name'],
                                sender_user_name:_users[obj.senders[0]]['user_name'],
                                sender_count:obj.sender_count,
                                birthday:birthdayDay,
                                notebook_id:obj.notebook_id,
                                folder_id:obj.folder_id,
                                notification_id:obj.notification_id
                            };

                            if(obj.senders.length == 2){
                                if(obj.sender_count == 0){
                                    _data['sender_name'] += ' and ';
                                }else{
                                    _data['sender_name'] += ', ';
                                }
                                _data['sender_name'] += _users[obj.senders[1]]['name'];
                            }

                            if(obj.senders.length == 3){
                                _data['sender_name'] += ', '+ _users[obj.senders[1]]['name'];
                                if(obj.sender_count == 0){
                                    _data['sender_name'] += ' and ';
                                }else{
                                    _data['sender_name'] += ', ';
                                }
                                _data['sender_name'] += _users[obj.senders[2]]['name'];
                            }

                            _formattedNotificationData.push(_data);

                        }
                    } else if(key == Notifications.SHARE_NOTEBOOK || key == Notifications.SHARE_NOTEBOOK_RESPONSE) {
                        for (var i in obj) {
                            var _data = {
                                post_id:obj[i].post_id,
                                notification_type:obj[i].notification_type,
                                read_status:obj[i].read_status,
                                created_at:DateTime.explainDate(obj[i].created_at),
                                post_owner_username:'   ',
                                post_owner_name:_users[obj[i].senders[0]]['name'],
                                sender_profile_picture:_users[obj[i].senders[0]]['profile_image'],
                                sender_name:_users[obj[i].senders[0]]['name'],
                                sender_user_name:_users[obj[i].senders[0]]['user_name'],
                                sender_count:obj[i].sender_count,
                                birthday:'',
                                notebook_id:obj[i].notebook_id,
                                notification_id:obj[i].notification_id,
                                notification_status:obj[i]['notification_status'] == "REQUEST_ACCEPTED" ? "accepted" : "declined",
                                notebook_name:obj[i]['notebook_name'],
                                sender_id:obj[i]['sender_id'],
                                folder_id:''
                            };

                            _formattedNotificationData.push(_data);
                        }

                    } else if(key == Notifications.SHARE_FOLDER || key == Notifications.SHARE_FOLDER_RESPONSE){

                        for (var i in obj) {
                            var _data = {
                                post_id:obj[i].post_id,
                                notification_type:obj[i].notification_type,
                                read_status:obj[i].read_status,
                                created_at:DateTime.explainDate(obj[i].created_at),
                                post_owner_username:'   ',
                                post_owner_name:_users[obj[i].senders[0]]['name'],
                                sender_profile_picture:_users[obj[i].senders[0]]['profile_image'],
                                sender_name:_users[obj[i].senders[0]]['name'],
                                sender_user_name:_users[obj[i].senders[0]]['user_name'],
                                sender_count:obj[i].sender_count,
                                birthday:'',
                                notebook_id:'',
                                notification_id:obj[i].notification_id,
                                notification_status:obj[i]['notification_status'] == "REQUEST_ACCEPTED" ? "accepted" : "declined",
                                folder_id:obj[i].folder_id,
                                folder_name:obj[i]['folder_name'],
                                sender_id:obj[i]['sender_id']
                            };

                            _formattedNotificationData.push(_data);
                        }
                    } else if(key == Notifications.SHARE_CALENDAR ||
                        key == Notifications.SHARE_CALENDAR_RESPONSE ||
                        key == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                        key == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED ||
                        key == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY){

                        for (var i in obj) {
                            var _data = {
                                post_id:obj[i].post_id,
                                notification_type:obj[i].notification_type,
                                read_status:obj[i].read_status,
                                created_at:DateTime.explainDate(obj[i].created_at),
                                post_owner_username:'   ',
                                post_owner_name:_users[obj[i].senders[0]]['name'],
                                sender_profile_picture:_users[obj[i].senders[0]]['profile_image'],
                                sender_name:_users[obj[i].senders[0]]['name'],
                                sender_user_name:_users[obj[i].senders[0]]['user_name'],
                                sender_count:key == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY ? 0 : obj[i].sender_count,
                                birthday:'',
                                notebook_id:'',
                                notification_id:obj[i].notification_id,
                                notification_status:obj[i]['notification_status'] == "REQUEST_ACCEPTED" ? "accepted" : "declined",
                                folder_id:'',
                                calendar_id:obj[i].calendar_id,
                                calendar_text:obj[i]['calendar_text'],
                                sender_id:obj[i]['sender_id']
                            };

                            _formattedNotificationData.push(_data);
                        }
                    }

                }

                callBack(null);

            },
            function doSortingBefore(callBack) {
                //sorting the list by created date
                _formattedNotificationData.sort(function(a,b){
                    return b.created_at.time_stamp - a.created_at.time_stamp;
                });

                callBack(null);
            }
        ],function(err){
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['unreadCount'] = _unreadCount;
            outPut['notifications'] = _formattedNotificationData;

            res.status(200).json(outPut);
        });

    },

    getNotificationsList: function (req, res) {
        var days = req.query.days; console.log("Days = "+days);
        var pg = req.query.pg;console.log("pg = "+pg);
        var cat = req.query.cat;
        var reduct_opt = null;

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Post = require('mongoose').model('Post'),
            User = require('mongoose').model('User'),
            NoteBook = require('mongoose').model('Notebook'),
            Folder = require('mongoose').model('Folders'),
            Calendar = require('mongoose').model('CalendarEvent'),
            Groups = require('mongoose').model('Groups'),
            _async = require('async'),
            grep = require('grep-from-array'),
            _arrIndex = require('array-index-of-property'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id)},
            skip = (pg - 1)*Config.NOTIFICATION_RESULT_PER_PAGE, limit = Config.NOTIFICATION_RESULT_PER_PAGE,
            _formattedNotificationData = {}, outPut = {};

        if(typeof cat != "undefined"){
            reduct_opt = cat;
        }

        console.log(criteria);

        NotificationRecipient.getRecipientNotificationsLimit(criteria,reduct_opt,skip,15,function(resultSet){
            var notifications = resultSet.notifications;
            var resultNotifications= [];
            _async.eachSeries(notifications, function(notification, callBack){

                var _notificationType = notification.notification_type.toString();

                _async.waterfall([

                    function trimNotificationsGetSenders(callBack){

                        if(_notificationType == Notifications.LIKE || _notificationType == Notifications.COMMENT || _notificationType == Notifications.SHARE ||
                            _notificationType == Notifications.ADD_GROUP_POST) {

                            var currentPostId = notification.post_id.toString();

                            //- Group post objects with same _id and notification_type
                            var groupedNotificationObj = grep(notifications, function (e) {
                                return (((e.post_id != null ? e.post_id.toString() : null) == currentPostId) && (e.notification_type.toString() == _notificationType));
                            });

                            var related_senders = [notification['sender_id']];

                            //- Push sender ids of grouped objects and splice
                            for (var inc = 1; inc < groupedNotificationObj.length; inc++) {

                                related_senders.push(groupedNotificationObj[inc].sender_id);

                                var index = notifications.indexOfProperty('_id', groupedNotificationObj[inc]._id);
                                notifications.splice(index, 1);
                            }

                            callBack(null, related_senders);
                        }else if(_notificationType == Notifications.SHARE_NOTEBOOK || _notificationType == Notifications.SHARE_NOTEBOOK_RESPONSE){

                                var currentNotebookId = notification.notebook_id.toString();

                                //- Group notebook objects with same _id and notification_type
                                var groupedNotificationObj = grep(notifications, function(e){
                                    return (((e.notebook_id != null ? e.notebook_id.toString() : null) == currentNotebookId) && (e.notification_type.toString() == _notificationType));
                                });

                                var related_senders = [notification['sender_id']];

                                //- Push sender ids of grouped objects and splice
                                for(var inc = 1; inc < groupedNotificationObj.length; inc++){

                                    related_senders.push(groupedNotificationObj[inc].sender_id);

                                    var index = notifications.indexOfProperty('_id', groupedNotificationObj[inc]._id);
                                    notifications.splice(index, 1);
                                }

                                callBack(null, related_senders);

                        }else if(_notificationType == Notifications.SHARE_FOLDER || _notificationType == Notifications.SHARE_FOLDER_RESPONSE){

                            var currentFolderId = notification.folder_id.toString();

                            //- Group folder objects with same _id and notification_type
                            var groupedNotificationObj = grep(notifications, function(e){
                                return (((e.folder_id != null ? e.folder_id.toString() : null) == currentFolderId) && (e.notification_type.toString() == _notificationType));
                            });

                            var related_senders = [notification['sender_id']];

                            //- Push sender ids of grouped objects and splice
                            for(var inc = 1; inc < groupedNotificationObj.length; inc++){

                                related_senders.push(groupedNotificationObj[inc].sender_id);

                                var index = notifications.indexOfProperty('_id', groupedNotificationObj[inc]._id);
                                notifications.splice(index, 1);
                            }

                            callBack(null, related_senders);
                        }else if(_notificationType == Notifications.SHARE_CALENDAR || _notificationType == Notifications.SHARE_CALENDAR_RESPONSE || _notificationType == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                            _notificationType == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED || _notificationType == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY ||
                            _notificationType == Notifications.SHARE_GROUP_TASK || _notificationType == Notifications.SHARE_GROUP_TASK_RESPONSE){

                            var currentCalendarId = notification.calendar_id.toString();

                            //- Group calendar objects with same _id and notification_type
                            var groupedNotificationObj = grep(notifications, function(e){
                                return (((e.calendar_id != null ? e.calendar_id.toString() : null) == currentCalendarId) && (e.notification_type.toString() == _notificationType));
                            });

                            var related_senders = [notification['sender_id']];

                            //- Push sender ids of grouped objects and splice
                            for(var inc = 1; inc < groupedNotificationObj.length; inc++){

                                related_senders.push(groupedNotificationObj[inc].sender_id);

                                var index = notifications.indexOfProperty('_id', groupedNotificationObj[inc]._id);
                                notifications.splice(index, 1);
                            }

                            callBack(null, related_senders);

                        }else if(_notificationType == Notifications.SHARE_GROUP || _notificationType == Notifications.SHARE_GROUP_RESPONSE) {

                            var currentGroupId = notification.group_id.toString();

                            //- Group gruop objects with same _id and notification_type
                            var groupedNotificationObj = grep(notifications, function (e) {
                                return (((e.group_id != null ? e.group_id.toString() : null) == currentGroupId) && (e.notification_type.toString() == _notificationType));
                            });

                            var related_senders = [notification['sender_id']];

                            //- Push sender ids of grouped objects and splice
                            for (var inc = 1; inc < groupedNotificationObj.length; inc++) {

                                related_senders.push(groupedNotificationObj[inc].sender_id);

                                var index = notifications.indexOfProperty('_id', groupedNotificationObj[inc]._id);
                                notifications.splice(index, 1);
                            }

                            callBack(null, related_senders);

                        } else if(_notificationType == Notifications.SHARE_GROUP_NOTEBOOK){
                            var currentNotebookId = notification.notebook_id.toString();

                            //- Group notebook objects with same _id and notification_type
                            var groupedNotificationObj = grep(notifications, function(e){
                                return (((e.notebook_id != null ? e.notebook_id.toString() : null) == currentNotebookId) && (e.notification_type.toString() == _notificationType));
                            });

                            var related_senders = [notification['sender_id']];

                            //- Push sender ids of grouped objects and splice
                            for(var inc = 1; inc < groupedNotificationObj.length; inc++){

                                related_senders.push(groupedNotificationObj[inc].sender_id);

                                var index = notifications.indexOfProperty('_id', groupedNotificationObj[inc]._id);
                                notifications.splice(index, 1);
                            }

                            callBack(null, related_senders);
                        }else {
                            callBack(null, null);
                        }
                    },
                    function getSenders(relatedSenders, callBack){
                        if(relatedSenders != null) {
                            User.getSenderDetails(relatedSenders, function (usersObj) {
                                // trim same sender pending...
                                var _senderArray = [];
                                var _formattedUsers = [];

                                if(usersObj.status == 200) {
                                    var userList = usersObj.users_list;
                                    if(userList != "undefined" && userList.length > 0) {
                                        for (var i=0; i < userList.length; i++){
                                            if(_senderArray.indexOf(userList[i].sender_id.toString()) == -1){
                                                _senderArray.push(userList[i].sender_id.toString());
                                                _formattedUsers.push(userList[i]);
                                            }
                                        }
                                    }
                                }

                                var senderObj = {
                                    sender_count: 0,
                                    sender_id: "",
                                    sender_name: "",
                                    sender_profile_picture: "",
                                    sender_user_name: "",
                                };
                                if(_formattedUsers != undefined && _formattedUsers.length > 0) {
                                    switch (_formattedUsers.length) {
                                        case 1:
                                            senderObj['sender_id'] = _formattedUsers[0].sender_id;
                                            senderObj['sender_name'] = _formattedUsers[0].sender_name;
                                            senderObj['sender_profile_picture'] = _formattedUsers[0].profile_image;
                                            senderObj['sender_user_name'] = _formattedUsers[0].sender_user_name;
                                            senderObj['sender_count'] = 0;
                                            break;
                                        case 2:
                                            senderObj['sender_id'] = _formattedUsers[0].sender_id;
                                            senderObj['sender_name'] = _formattedUsers[0].sender_name + " and " + _formattedUsers[1].sender_name;
                                            senderObj['sender_profile_picture'] = _formattedUsers[0].profile_image;
                                            senderObj['sender_user_name'] = _formattedUsers[0].sender_user_name;
                                            senderObj['sender_count'] = 0;
                                            break;
                                        case 3:
                                            senderObj['sender_id'] = _formattedUsers[0].sender_id;
                                            senderObj['sender_name'] = _formattedUsers[0].sender_name + ", " + _formattedUsers[1].sender_name;
                                            senderObj['sender_profile_picture'] = _formattedUsers[0].profile_image;
                                            senderObj['sender_user_name'] = _formattedUsers[0].sender_user_name;
                                            senderObj['sender_count'] = 1;
                                            break;
                                        default:
                                            senderObj['sender_id'] = _formattedUsers[0].sender_id;
                                            senderObj['sender_name'] = _formattedUsers[0].sender_name + ", " + _formattedUsers[1].sender_name;
                                            senderObj['sender_profile_picture'] = _formattedUsers[0].profile_image;
                                            senderObj[''] = _formattedUsers[0].sender_user_name;
                                            senderObj['sender_count'] = (_formattedUsers.length - 2);
                                            break;
                                    }
                                }


                                callBack(null, senderObj);
                            });
                        }else {
                            callBack(null, {
                                sender_count: "",
                                sender_id: "",
                                sender_name: "",
                                sender_profile_picture: "",
                                sender_user_name: "",
                            });
                        }
                    },
                    function createNotificationObj(senderData, callBack) {
                        var notificationObj = {
                            notification_id:notification['notification_id'],
                            notification_type:notification['notification_type'],
                            notification_category:notification['notification_cat'],
                            read_status: notification['read_status'],
                            created_at: DateTime.explainDate(notification['created_at']),

                            //- Sender Info
                            sender_id: senderData.sender_id,
                            sender_name: senderData.sender_name,
                            sender_profile_picture: senderData.sender_profile_picture,
                            sender_user_name: senderData.sender_user_name,
                            sender_count: senderData.sender_count,

                            //- Post details
                            post_id: (notification['post_id'] != null ? notification['post_id'] : ""),

                            //- Notebook details
                            notebook_id: (notification['notebook_id'] != null ? notification['notebook_id'] : ""),

                            //- Notebook details
                            folder_id: (notification['folder_id'] != null ? notification['folder_id'] : ""),

                            //- calendar details
                            calendar_id: (notification['calendar_id'] != null ? notification['calendar_id'] : ""),

                            //- group details
                            group_id: (notification['group_id'] != null ? notification['group_id'] : ""),

                        };

                        //- Notification status for (Notebook, Folder, ...)
                        if(notification['notification_status'] == "REQUEST_ACCEPTED"){
                            notificationObj['notification_status'] = "accepted";
                        } else if(notification['notification_status'] == "EVENT_COMPLETED"){
                            notificationObj['notification_status'] = "completed";
                        } else {
                            notificationObj['notification_status'] = "declined";
                        }

                        if(notification['notification_type'] == Notifications.LIKE || notification['notification_type'] == Notifications.COMMENT || notification['notification_type'] == Notifications.SHARE) {
                            Post.bindNotificationData(notificationObj, user_id, function (r) {
                                resultNotifications.push(r);
                                callBack(null);
                            });
                        } else if(notification['notification_type'] == Notifications.SHARE_NOTEBOOK || notification['notification_type'] == Notifications.SHARE_NOTEBOOK_RESPONSE){
                            NoteBook.bindNotificationData(notificationObj, function (r) {
                                resultNotifications.push(r);
                                callBack(null);
                            });
                        } else if(notification['notification_type'] == Notifications.SHARE_FOLDER || notification['notification_type'] == Notifications.SHARE_FOLDER_RESPONSE){
                            Folder.bindNotificationData(notificationObj, function (r) {
                                resultNotifications.push(r);
                                callBack(null);
                            });
                        } else if(notification['notification_type'] == Notifications.SHARE_CALENDAR || notification['notification_type'] == Notifications.SHARE_CALENDAR_RESPONSE ||
                            notification['notification_type'] == Notifications.CALENDAR_SCHEDULE_UPDATED ||
                            notification['notification_type'] == Notifications.CALENDAR_SCHEDULE_TIME_CHANGED || notification['notification_type'] == Notifications.CALENDAR_SCHEDULE_CARRIED_NEXT_DAY ||
                            notification['notification_type'] == Notifications.SHARE_GROUP_TASK || notification['notification_type'] == Notifications.SHARE_GROUP_TASK_RESPONSE){

                            _async.waterfall([
                                function bindCalendarData(callBack) {
                                    Calendar.bindNotificationData(notificationObj, function (r) {
                                        if(typeof notificationObj.group_id != "undefined" && notificationObj.group_id != null && notificationObj.group_id != ""){
                                            callBack(null, r);
                                        }else {
                                            resultNotifications.push(r);
                                            callBack(null, r);
                                        }
                                    });
                                },
                                function getGroupData(notificationObj, callBack) {

                                    if(typeof notificationObj.group_id != "undefined" && notificationObj.group_id != null && notificationObj.group_id != ""){
                                        Groups.bindNotificationData(notificationObj, function (r) {
                                            notificationObj['group_name'] = r.group_name;
                                            resultNotifications.push(notificationObj);
                                            callBack(null);
                                        });
                                    }else {
                                        callBack(null);
                                    }
                                }
                            ],function(err){
                                callBack(null);
                            });
                        } else if(notification['notification_type'] == Notifications.SHARE_GROUP || notification['notification_type'] == Notifications.SHARE_GROUP_RESPONSE){
                            Groups.bindNotificationData(notificationObj, function (r) {
                                resultNotifications.push(r);
                                callBack(null);
                            });
                        } else if(notification['notification_type'] == Notifications.SHARE_GROUP_NOTEBOOK){

                            _async.waterfall([
                                function getNotebookData(callBack) {
                                    NoteBook.bindNotificationData(notificationObj, function (r) {
                                        callBack(null, r);
                                    });
                                },
                                function getGroupData(notificationObj, callBack) {
                                    Groups.bindNotificationData(notificationObj, function (r) {
                                        notificationObj['group_name'] = r.group_name;
                                        resultNotifications.push(notificationObj);
                                        callBack(null);
                                    });
                                }
                            ],function(err){
                                callBack(null);
                            });
                        }else  if(notification['notification_type'] == Notifications.ADD_GROUP_POST){
                            _async.waterfall([
                                function getPostData(callBack){
                                    Post.bindNotificationData(notificationObj, user_id, function (r) {
                                        callBack(null, r);
                                    });
                                },
                                function getGroupData(notificationObj, callBack) {
                                    Groups.bindNotificationData(notificationObj, function (r) {
                                        notificationObj['group_name'] = r.group_name;
                                        resultNotifications.push(notificationObj);
                                        callBack(null);
                                    });
                                }
                            ],function(err){
                                callBack(null);
                            });
                        }else {
                            callBack(null);
                        }

                    }


                ],function(err){
                    callBack(null);
                });

            },function(err){
                outPut['header'] ={
                    total_result:resultNotifications.length,
                    result_per_page:Config.NOTIFICATION_RESULT_PER_PAGE,
                    total_pages:Math.ceil(resultNotifications.length/Config.NOTIFICATION_RESULT_PER_PAGE)
                };
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['notifications'] = resultNotifications;
                res.status(200).json(outPut);
            });
        });
    },

    updateNotifications: function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            _async = require('async'),
            _data = {read_status:true},
            _notification_ids = [],
            user_id = Util.getCurrentSession(req).id;


        if(typeof req.body.notification_type != 'undefined' &&
            (req.body.notification_type == Notifications.SHARE_NOTEBOOK_RESPONSE ||
            req.body.notification_type == Notifications.SHARE_FOLDER_RESPONSE ||
            req.body.notification_type == Notifications.SHARE_CALENDAR_RESPONSE)) {

            var _criteria = {notification_id:Util.toObjectId(req.body.notification_id), recipient:Util.toObjectId(user_id)};
            NotificationRecipient.updateRecipientNotification(_criteria, _data, function(result){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            });

        } else if(typeof req.body.post_id != 'undefined' && typeof req.body.notification_type != 'undefined'){

            _async.waterfall([
                function getNotifications(callBack){
                    var _criteria = {notified_post:req.body.post_id, notification_type:req.body.notification_type};
                    Notification.getNotifications(_criteria, function(res){
                        if(res.error) {
                            callBack(res.error);
                        } else {
                            for(var i = 0; i < res.result.length; i++){
                                _notification_ids.push(res.result[i]._id)
                            }
                        }
                        callBack(null);
                    });
                },
                function updateNotifications(callBack){
                    _async.each(_notification_ids,function(_notificationId, callBack){

                        var _criteria = {notification_id:Util.toObjectId(_notificationId), recipient:Util.toObjectId(user_id)};

                        NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                            callBack(null);
                        });

                    },function(err){
                        callBack(null);
                    });

                },
                function updateNotifications(callBack){
                    var _criteria = {notification_id:Util.toObjectId(req.body.notification_id), recipient:Util.toObjectId(user_id)};
                    NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                        callBack(null);
                    });
                }
            ],function(err){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            })
        }else{
            var _criteria = {recipient:Util.toObjectId(user_id)};

            NotificationRecipient.updateRecipientNotificationRefactored(_criteria, _data, function(result){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    data: result
                };
                res.status(200).json(outPut);
            });
        }

    },

    getDetails:function(req,res){

        var post_id = req.query.post_id,
            notification_type = req.query.notification_type,
            Post = require('mongoose').model('Post'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {_id:Util.toObjectId(post_id)},
            _postData = {},
            _notificationData = {},
            _notificationSenderIds = [],
            _notificationSenders = {},
            _formattedData = {},
            created_at = new Date(),
            redis_id = "post:"+notification_type+":"+post_id;

        _async.waterfall([
            function getPostDetails(callback){
                Post.db_getPost(criteria, function(result){
                    _postData = result.post;
                    callback(null);
                });
            },
            function getNotificationData(callback){
                CacheEngine.getList(redis_id,0,10,function(chResultSet){

                    _notificationData['sender_count'] = chResultSet.result_count;
                    _notificationData['senders'] = [];

                    var _res = chResultSet.result;
                    var x = 0;
                    for(var i = 0; i < _res.length; i++){

                        if(x > 2){
                            break;
                        }

                        var _senderCount = _notificationData['sender_count'];
                        _senderCount--;
                        _notificationData['sender_count'] = _senderCount;

                        if(typeof _res[i] === 'object'){

                            if(user_id !== _res[i].commented_by.user_id){
                                x++;
                                if(_notificationData['senders'].indexOf(_res[i].commented_by.user_id) == -1){
                                    _notificationData['senders'].push(_res[i].commented_by.user_id);
                                }

                                if(_notificationSenderIds.indexOf(_res[i].commented_by.user_id) == -1){

                                    _notificationSenderIds.push(_res[i].commented_by.user_id);

                                    _notificationSenders[_res[i].commented_by.user_id] = {
                                        name : _res[i].commented_by.first_name+" "+_res[i].commented_by.last_name,
                                        profile_image : _res[i].commented_by.images.profile_image.http_url
                                    }

                                }

                            }

                        } else{

                            if(user_id !== _res[i].toString()){
                                x++;
                                if(_notificationData['senders'].indexOf(_res[i].toString()) == -1){
                                    _notificationData['senders'].push(_res[i].toString());
                                }

                                if(_notificationSenderIds.indexOf(_res[i].toString()) == -1){
                                    _notificationSenderIds.push(_res[i].toString());

                                }
                            }

                        }
                    }
                    callback(null);
                });
            },
            function getSenders(callBack){

                _async.each(_notificationSenderIds,function(_notificationSenderId, callBack){

                    if(typeof _notificationSenders[_notificationSenderId] == 'undefined'){
                        var query={
                            q:"user_id:"+_notificationSenderId.toString(),
                            index:'idx_usr'
                        };
                        //Find User from Elastic search
                        ES.search(query,function(csResultSet){

                            _notificationSenders[_notificationSenderId] = {
                                name : csResultSet.result[0]['first_name']+" "+csResultSet.result[0]['last_name'],
                                profile_image : csResultSet.result[0]['images']['profile_image']['http_url']
                            }
                            callBack(null);
                        });
                    }else{
                        callBack(null);
                    }


                },function(err){
                    callBack(null)

                });

            },
            function finalizeData(callBack){

                    if(_notificationData.senders.length > 0){

                        var postOwnerName = "";
                        if(_postData.created_by.user_id == user_id){
                            postOwnerName = "your"
                        }else{
                            postOwnerName = _postData.created_by.first_name+" "+_postData.created_by.last_name
                        }

                        var _data = {
                            post_id:_postData.post_id,
                            notification_type:notification_type,
                            read_status:false,
                            created_at:DateTime.explainDate(created_at),
                            post_owner_username:_postData.created_by.user_name,
                            post_owner_name:postOwnerName,
                            sender_profile_picture:_notificationSenders[_notificationData.senders[0]]['profile_image'],
                            sender_name:_notificationSenders[_notificationData.senders[0]]['name'],
                            sender_count:_notificationData.sender_count
                        };

                        if(_notificationData.senders.length == 2){
                            if(_notificationData.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _notificationSenders[_notificationData.senders[1]]['name'];
                        }

                        if(_notificationData.senders.length == 3){
                            _data['sender_name'] += ', '+ _notificationSenders[_notificationData.senders[1]]['name'];
                            if(_notificationData.sender_count == 0){
                                _data['sender_name'] += ' and ';
                            }else{
                                _data['sender_name'] += ', ';
                            }
                            _data['sender_name'] += _notificationSenders[_notificationData.senders[2]]['name'];
                        }

                        _formattedData = _data;

                    }


                callBack(null);

            }

        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                data:_formattedData

            };
            res.status(200).json(outPut);
        });


    },

    getNotificationCount:function(req,res){
        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            _async = require('async'),
            user_id = Util.getCurrentSession(req).id,
            criteria = {recipient:Util.toObjectId(user_id),read_status:false};

        NotificationRecipient.getCount(criteria,function(result){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                count:result.result
            };
            res.status(200).json(outPut);
        })


    },

    updateNotebookNotifications: function(req,res){

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            NoteBook = require('mongoose').model('Notebook'),
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
            function updateSharedStatus(callBack) {
                var shared_status = req.body.status == 'REQUEST_REJECTED' ?
                    SharedRequestStatus.REQUEST_REJECTED : SharedRequestStatus.REQUEST_ACCEPTED;

                var _udata = {
                    'shared_users.$.status':shared_status
                };
                var criteria = {
                    _id:Util.toObjectId(req.body.notebook_id),
                    'shared_users.user':user_id
                };

                NoteBook.updateSharedNotebook(criteria, _udata, function(res){
                    callBack(null);
                });
            },
            function updateESSharedStatus(callBack){
                // Disable code path.  Unnecessary? PBale
                callBack(null);
                return;

                if(req.body.status == 'REQUEST_REJECTED'){

                    _async.waterfall([
                        function getSharedNoteBooks(callBack){
                            var query={
                                q:"_id:"+user_id
                            };
                            NoteBook.ch_getSharedNoteBooks(user_id, query, function (esResultSet){
                                callBack(null, esResultSet);
                            });

                        },
                        function ch_shareNoteBook(resultSet, callBack) {
                            if(resultSet != null){
                                var notebook_list = resultSet.result[0].notebooks;
                                var index = notebook_list.indexOf(req.body.notebook_id.toString());
                                notebook_list.splice(index, 1);

                                var query={
                                        q:"user_id:"+user_id
                                    },
                                    data = {
                                        user_id: user_id,
                                        notebooks: notebook_list
                                    };

                                NoteBook.ch_shareNoteBookUpdateIndex(user_id,data, function(esResultSet){
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
            },
            function addNotification(callBack){

                var _data = {
                    sender:user_id,
                    notification_type:Notifications.SHARE_NOTEBOOK_RESPONSE,
                    notified_notebook:req.body.notebook_id,
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
     * user responded to shared folder request
     * @param req
     * @param res
     */

    updateFolderNotifications: function(req,res){

        console.log("updateFolderNotifications")

        var NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Notification = require('mongoose').model('Notification'),
            Folder = require('mongoose').model('Folders'),
            FolderDocs = require('mongoose').model('FolderDocs'),
            _async = require('async'),
            _data = {read_status:true},
            user_id = Util.getCurrentSession(req).id,
            _esFolder = {};

        _async.waterfall([
            function updateNotifications(callBack){
                console.log("updateNotifications");
                var _criteria = {notification_id:Util.toObjectId(req.body.notification_id), recipient:Util.toObjectId(user_id)};
                NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                    callBack(null);
                });
            },
            function updateSharedStatus(callBack) {
                console.log("updateSharedStatus")
                var shared_status = req.body.status == 'REQUEST_REJECTED' ?
                    SharedRequestStatus.REQUEST_REJECTED : SharedRequestStatus.REQUEST_ACCEPTED;

                var _udata = {
                    'shared_users.$.status':shared_status
                };
                var criteria = {
                    _id:Util.toObjectId(req.body.folder_id),
                    'shared_users.user_id':user_id
                };

                Folder.updateSharedFolder(criteria, _udata, function(res){
                    callBack(null);
                });
            },
            function addFolderToES(callBack){
                console.log("addFolderToES");
                console.log(req.body.status);

                if(req.body.status == "REQUEST_ACCEPTED"){

                    Folder.getFolderById(Util.toObjectId(req.body.folder_id), function(result){

                        console.log("folder info");
                        console.log(result);
                        _esFolder = {
                            cache_key:FolderConfig.ES_INDEX_SHARED_FOLDER+user_id.toString(),
                            folder_id:result._id,
                            folder_name:result.name,
                            folder_color:result.color,
                            folder_owner:result.user_id,
                            folder_user:user_id,
                            folder_updated_at:result.updated_at,
                            folder_shared_mode:FolderSharedMode.VIEW_ONLY
                        };

                        Folder.addFolderToCache(_esFolder, function(res){
                            callBack(null);
                        });

                    });

                } else{
                    callBack(null);
                }
            },
            function addDocumentsToES(callBack){
                console.log("addDocumentsToES");
                console.log(req.body.status);

                if(req.body.status == "REQUEST_ACCEPTED"){

                    var _criteria = {folder_id:Util.toObjectId(req.body.folder_id)}

                    FolderDocs.getFolderDocument(_criteria, function(result){
                        if(result.status == 200){
                            var _docs = result.document;

                            _async.eachSeries(_docs, function(doc, callback){

                                console.log("=====================")
                                console.log(doc);

                                var _esDocument = {
                                    cache_key:FolderDocsConfig.ES_INDEX_SHARED_DOC+user_id,
                                    document_id:doc._id,
                                    document_name:doc.name,
                                    content_type:doc.content_type,
                                    document_owner:doc.user_id,
                                    document_user:user_id,
                                    file_path:doc.file_path,
                                    thumb_path:doc.thumb_path,
                                    folder_id:_esFolder.folder_id,
                                    folder_name:_esFolder.folder_name
                                };
                                FolderDocs.addDocToCache(_esDocument, function(res){callback(null)});

                            },function(err){
                                callBack(null);
                            });

                        } else{
                            callBack(null);
                        }
                    });

                } else{
                    callBack(null);
                }

            },
            function addNotification(callBack){
                console.log("addNotification")
                var _data = {
                    sender:user_id,
                    notification_type:Notifications.SHARE_FOLDER_RESPONSE,
                    notified_folder:req.body.folder_id,
                    notification_status:req.body.status.toString()
                }
                Notification.saveNotification(_data, function(res){
                    if(res.status == 200) {
                        callBack(null,res.result._id);
                    }
                });
            },
            function notifyingUsers(notification_id, callBack){
                console.log("notifyingUsers")
                var userList = [req.body.notification_sender];
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


    }

};

module.exports = NotificationController;
