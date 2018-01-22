/**
 * TimeLinePostHandler is middle ware class that perform Time line post operations
 */


var TimeLinePostHandler ={

    /**
     * Add new post is collection of sub tasks.
     * 1) Get Post owner friend list. This will help to retrieve data fast based on the friends
     * 2) Save Post in to the data base
     * 3) If attachment exist copy from temp location to the CDN
     * 4) Update Elastic Search
     * 5) Return Formatted Dataset to the front end
     * @param postData
     * @param callBack
     */
    addNewPost:function(postData,callBack){
        var _async = require('async'),
            Post = require('mongoose').model('Post'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Comment = require('mongoose').model('Comment'),
            _post = postData;

        _async.waterfall([
            //GET FRIEND LIST BASED ON POST OWNER
            function getPostVisibleUsers(callBack){
                // Add to Cache when it is public or Friend only
                // TODO:: think for Friend only algorithm separately
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                    parseInt(_post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                    var Connection = require('mongoose').model('Connection'),
                        status =[ConnectionStatus.REQUEST_ACCEPTED];
                    Connection.getFriends(_post.created_by,status,function(myFriendIds){
                        _post.visible_users = myFriendIds.friends_ids;
                        _post.visible_users.push(_post.created_by);
                        callBack(null)
                    });
                }
                //Add to list it is Friend only for me
                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                    _post.visible_users.push(_post.created_by);
                    _post.visible_users.push(_post.post_owned_by);
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.GROUP_MEMBERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }
            },
            function savePostInDb(callBack){
                Post.addNew(_post,function(postData){

                    if(postData.status ==200){
                        _post.post_id       = postData.post._id;
                        _post['created_at'] = postData.post.created_at;
                        _post['shared_post'] = {};
                        _post.shared_post_id = "";
                    }
                    callBack(null)
                });

            },
            function subscribeToPost(callBack){
                var _data = {
                    user_id:_post.created_by,
                    post_id:_post.post_id
                };

                // if the post is a group post, all the group members needed to be subscribed.
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.GROUP_MEMBERS && _post.visible_users.length > 0){

                    var _visible_users = _post.visible_users;
                    if(_visible_users.indexOf(_post.created_by) == -1) {
                        _visible_users.push(_post.created_by);
                    }

                    var i = 0;
                    _visible_users.forEach(function(_user) {

                        _data = {
                            user_id:_user,
                            post_id:_post.post_id
                        };

                        SubscribedPost.saveSubscribe(_data, function(res){
                            i = i+1;
                            if(i == _visible_users.length) {
                                callBack(null);
                            }
                        });
                    });
                } else {
                    SubscribedPost.saveSubscribe(_data, function(res){
                        callBack(null);
                    });
                }

            },

            //COPY CONTENT TO CDN
            function copyToCDN(callBack){

                _post['upload'] = [];
                if(_post.has_attachment){
                    var payLoad ={
                       entity_id:_post.upload_id,
                       entity_tag:UploadMeta.TIME_LINE_IMAGE,
                       post_id: _post.post_id,
                       file_content: _post.file_content
                    };

                    ContentUploader.copyFromTempToDb(payLoad,function(uploadData){
                        _post['upload']= uploadData;
                        callBack(null)
                    })
                }else{
                    callBack(null)
                }
            },

            function saveInCache(callBack){
                Post.addToCache(_post.visible_users,_post,function(chData){});
                callBack(null)
            },

            function addNotification(callBack) {
                if (_post.visible_users.length > 0 && parseInt(_post.post_visible_mode) == PostVisibleMode.GROUP_MEMBERS ) {

                    var _data = {
                        sender : _post.created_by,
                        notification_type : Notifications.ADD_GROUP_POST,
                        notified_group : _post.group_id,
                        notified_post : _post.post_id
                    }

                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id);
                        }
                    });
                } else {
                    callBack(null, null);
                }
            },
            function notifyingUsers(notification_id, callBack) {

                if (typeof notification_id != 'undefined' && _post.visible_users.length > 0 && parseInt(_post.post_visible_mode) == PostVisibleMode.GROUP_MEMBERS) {

                    var recipients = [];

                    for(var i=0; i < _post.visible_users.length; i++){
                        if(postData.created_by != _post.visible_users[i]){
                            recipients.push(_post.visible_users[i]);
                        }
                    }

                    var _data = {
                        notification_id: notification_id,
                        recipients: recipients
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }
            },
            function getCommentsForThePost(callBack) {
                var post_id = _post.post_id;
                Comment.getComments(post_id,0,function(resultSet){
                    delete _post['post_comments'];
                    _post['post_comments'] = resultSet;
                    callBack(null);
                });
            },
            function finalizedPost(callBack){

                if(_post.post_owned_by !== undefined) {
                    var query = {
                        q: "user_id:" + _post.created_by.toString(),
                        index: 'idx_usr'
                    };
                    var profile_query = {
                        q: "user_id:" + _post.post_owned_by.toString(),
                        index: 'idx_usr'
                    };

                    _post['date'] = DateTime.explainDate(_post.created_at);
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        delete _post['created_by'];
                        _post['created_by'] = csResultSet.result[0];

                        ES.search(profile_query, function (csResultSet) {
                            delete _post['post_owned_by'];
                            _post['post_owned_by'] = csResultSet.result[0];

                            callBack(null);

                        });

                    });
                }else{
                    var query = {
                        q: "user_id:" + _post.created_by.toString(),
                        index: 'idx_usr'
                    };

                    _post['date'] = DateTime.explainDate(_post.created_at);
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        delete _post['created_by'];
                        _post['created_by'] = csResultSet.result[0];
                        callBack(null);
                    });
                }
            }

        ],function(err,resultSet){
            callBack(_post)
        });


    },

    /**
     * Share Post
     * 1) Get Post owner friend list. This will help to retrieve data fast based on the friends
     * 2) Save Post in to the data base
     * 3) Get Shared Post detail from ES
     * 4) Update Elastic Search
     * 5) Return Formatted Dataset to the front end
     * @param data
     * @param callBack
     */
    sharePost:function(postData,callBack){

        console.log("sharePost")

        var _async = require('async'),
            Post = require('mongoose').model('Post'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Comment = require('mongoose').model('Comment'),
            _post = postData;
            console.log(_post);
        _async.waterfall([
            //GET FRIEND LIST BASED ON POST OWNER
            function getPostVisibleUsers(callBack){
                console.log("getPostVisibleUsers")
                // Add to Cache when it is public or Friend only
                // TODO:: think for Friend only algorithm separately
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                    parseInt(_post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                    var Connection = require('mongoose').model('Connection'),
                        status =[ConnectionStatus.REQUEST_ACCEPTED];
                    Connection.getFriends(_post.created_by,status,function(myFriendIds){

                        if(_post.friends_post_sharing && myFriendIds.friends_ids.length > 0) {
                            var index = myFriendIds.friends_ids.indexOf(_post.post_owner);
                            if(index != -1) {
                                myFriendIds.friends_ids.splice(index, 1);
                            }
                        }

                        _post.visible_users = myFriendIds.friends_ids;
                        _post.visible_users.push(_post.created_by);
                        if(_post.created_by != _post.post_owner && _post.visible_users.indexOf(_post.post_owner) == -1) { //If shared other user post
                            _post.visible_users.push(_post.post_owner);
                        }
                        callBack(null)
                    });
                }
                //Add to list it is Friend only for me
                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                    _post.visible_users.push(_post.created_by);
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.GROUP_MEMBERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }
            },
            function savePostInDb(callBack){
                console.log("savePostInDb")
                Post.addNew(_post,function(postData){
                    if(postData.status ==200){
                        _post.post_id       = postData.post._id;
                        _post['created_at'] = postData.post.created_at;
                    }
                    callBack(null)
                });
            },
            function saveToRedis(callBack){
                console.log("saveToRedis")
                Post.addShareToRedis(_post.shared_post_id,_post.created_by, function(res){
                    callBack(null)
                });
            },
            function subscribeToPost(callBack){
                // console.log("subscribeToPost")
                // var _data = {
                //     user_id:_post.created_by,
                //     post_id:_post.post_id
                // }
                // SubscribedPost.saveSubscribe(_data, function(res){
                //     callBack(null);
                // })
                var _data = {
                    user_id:_post.created_by,
                    post_id:_post.post_id
                };

                // if the post is a group post, all the group members needed to be subscribed.
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.GROUP_MEMBERS && _post.visible_users.length > 0){

                    var _visible_users = _post.visible_users;
                    if(_visible_users.indexOf(_post.created_by) == -1) {
                        _visible_users.push(_post.created_by);
                    }

                    for (var i = 0; i < _visible_users.length; i++) {
                        var _user = _visible_users[i];
                        _data = {
                            user_id:_user,
                            post_id:_post.post_id
                        };

                        SubscribedPost.saveSubscribe(_data, function(res){
                            if(i == _visible_users.length) {
                                callBack(null);
                            }
                        });
                    }
                } else {
                    SubscribedPost.saveSubscribe(_data, function(res){
                        callBack(null);
                    });
                }
            },
            function getOtherSubscribedUsers(callBack){
                console.log("getOtherSubscribedUsers")
                var _data = {
                    post_id:Util.toObjectId(_post.shared_post_id),
                    user_id:{$ne:Util.toObjectId(_post.created_by)}
                }
                SubscribedPost.getSubscribedUsers(_data, function(res){
                    var _users = [];
                    for(var i = 0; i < res.users.length; i++){
                        _users.push(res.users[i].user_id);
                    }

                    callBack(null, _users);
                })
            },
            function addNotification(subscribed_users, callBack){
                console.log("addNotification")
                var notification_id = 0;

                if(subscribed_users.length > 0){

                    var _data = {
                        sender:_post.created_by,
                        notification_type:Notifications.SHARE,
                        notified_post:_post.shared_post_id
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            notification_id = res.result._id;
                        }
                        callBack(null, subscribed_users, notification_id);
                    });

                } else{
                    callBack(null, subscribed_users, notification_id);
                }
            },

            function notifyUsers(subscribed_users, notification_id, callBack){
                console.log("notifyUsers")
                if(subscribed_users.length > 0 && typeof notification_id != 0){
                    var _data = {
                        notification_id:notification_id,
                        recipients:subscribed_users
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })
                } else{
                    callBack(null);
                }
            },
            //GET SHARED POST FROM CACHE
            function getPostFromCache(callBack){
                var _pay_load = {
                    q:"post_id:"+_post.shared_post_id,
                }

                var getPostBy = _post.post_owner;
                if(_post.post_type == PostType.GROUP_POST) {
                    getPostBy = _post.group_id;
                }

                Post.ch_getPost(getPostBy,_pay_load,_post.post_type, function(csResultSet){
                    if(csResultSet.length >0){
                        var selected_post = csResultSet[0];
                        delete selected_post.date;
                        delete selected_post.comment_count;
                        delete selected_post.like_count;
                        delete selected_post.liked_user;
                        delete selected_post.is_i_liked;
                        delete selected_post.is_i_liked;
                        delete selected_post.shared_post;


                        _post.shared_post = selected_post;
                        _post.is_i_liked = false;
                        _post.upload = [];

                    }
                    callBack(null);
                });

            },
            function saveInCache(callBack){
                
                Post.addToCache(_post.visible_users,_post,function(chData){ });
                callBack(null)
            },
            function getCommentsForThePost(callBack) {
                var post_id = _post.post_id;
                Comment.getComments(post_id,0,function(resultSet){
                    delete _post['post_comments'];
                    _post['post_comments'] = resultSet;
                    callBack(null);
                });
            },
            function finalizedPost(callBack){
                console.log("finalizedPost")

                if(_post.post_owned_by !== undefined) {
                    var query = {
                        q: "user_id:" + _post.created_by.toString(),
                        index: 'idx_usr'
                    };
                    var profile_query = {
                        q: "user_id:" + _post.post_owned_by.toString(),
                        index: 'idx_usr'
                    };
                    _post['date'] = DateTime.explainDate(_post.created_at)
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        delete _post['created_by'];
                        _post['created_by'] = csResultSet.result[0];
                        ES.search(profile_query, function (csResultSet) {
                            delete _post['post_owned_by'];
                            _post['post_owned_by'] = csResultSet.result[0];

                            callBack(null);

                        });
                    });
                }else{
                    var query = {
                        q: "user_id:" + _post.created_by.toString(),
                        index: 'idx_usr'
                    };
                    _post['date'] = DateTime.explainDate(_post.created_at)
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        delete _post['created_by'];
                        _post['created_by'] = csResultSet.result[0];
                        callBack(null);
                    });
                }
            }

        ],function(err,resultSet){

            callBack(_post)
        });
    },


    /**
     * Profile image post is collection of sub tasks.
     * 1) Get Post owner friend list. This will help to retrieve data fast based on the friends
     * 2) Save Post in to the data base
     * 3) Profile picture already in CDN. Only need to add another record in Upload table.
     * 4) Update Elastic Search
     * 5) Return Formatted Dataset to the front end
     * @param postData
     * @param callBack
     */
    profileImagePost:function(postData,callBack){
        var _async = require('async'),
            Post = require('mongoose').model('Post'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Comment = require('mongoose').model('Comment'),
            _post = postData;
        _async.waterfall([
            //GET FRIEND LIST BASED ON POST OWNER
            function getPostVisibleUsers(callBack){
                // Add to Cache when it is public or Friend only
                // TODO:: think for Friend only algorithm separately
                if(parseInt(_post.post_visible_mode) == PostVisibleMode.PUBLIC ||
                    parseInt(_post.post_visible_mode) == PostVisibleMode.FRIEND_ONLY ){
                    var Connection = require('mongoose').model('Connection'),
                        status =[ConnectionStatus.REQUEST_ACCEPTED];
                    Connection.getFriends(_post.created_by,status,function(myFriendIds){
                        _post.visible_users = myFriendIds.friends_ids;
                        _post.visible_users.push(_post.created_by);
                        callBack(null)
                    });
                }
                //Add to list it is Friend only for me
                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.ONLY_MY){
                    _post.visible_users.push(_post.created_by);
                    callBack(null)
                }

                else if(parseInt(_post.post_visible_mode) == PostVisibleMode.SELECTED_USERS){
                    _post.visible_users= _post.visible_users;
                    callBack(null)
                }
            },
            function savePostInDb(callBack){

                Post.addNew(_post,function(postData){

                    if(postData.status ==200){
                        _post.post_id       = postData.post._id
                        _post['created_at'] = postData.post.created_at;
                        _post['shared_post'] = {};
                        _post.shared_post_id = "";
                    }
                    callBack(null)
                });

            },
            function subscribeToPost(callBack){
                var _data = {
                    user_id:_post.created_by,
                    post_id:_post.post_id
                }
                SubscribedPost.saveSubscribe(_data, function(res){
                    callBack(null);
                })

            },
            //Add to Uploads
            function saveUploads(callBack){

                var Upload = require('mongoose').model('Upload'),
                    upload_data = [],
                    upload = [];
                _post['upload'] = [];
                if(_post.has_attachment){

                    upload['file_name'] = _post['profile_picture_data']['file_name'];
                    upload['file_type'] = _post['profile_picture_data']['file_type'];
                    upload['is_default'] = _post['profile_picture_data']['is_default'];
                    upload['entity_id'] = _post['post_id'];
                    upload['entity_tag'] = _post['profile_picture_data']['entity_tag'];
                    upload['content_title'] = _post['profile_picture_data']['title'];

                    Upload.saveOnDb(upload,function(dbResultSet){
                        upload_data.push({
                            entity_id:upload.entity_id,
                            file_name:upload.file_name,
                            file_type:upload.file_type,
                            http_url:_post['profile_picture_data']['http_url']
                        });

                        _post['upload']= upload_data;
                        callBack(null)
                    });

                }else{
                    callBack(null)
                }

            },
            function saveInCache(callBack){
                Post.addToCache(_post.visible_users,_post,function(chData){
                    "use strict";
                    callBack(null)
                });
            },
            function getCommentsForThePost(callBack) {
                var post_id = _post.post_id;
                Comment.getComments(post_id,0,function(resultSet){
                    delete _post['post_comments'];
                    _post['post_comments'] = resultSet;
                    callBack(null);
                });
            },
            function finalizedPost(callBack){

                if(_post.post_owned_by !== undefined) {
                    var query = {
                        q: "user_id:" + _post.created_by.toString(),
                        index: 'idx_usr'
                    };
                    var profile_query = {
                        q: "user_id:" + _post.post_owned_by.toString(),
                        index: 'idx_usr'
                    };

                    _post['date'] = DateTime.explainDate(_post.created_at)
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        delete _post['created_by'];
                        _post['created_by'] = csResultSet.result[0];
                        ES.search(profile_query, function (csResultSet) {
                            delete _post['post_owned_by'];
                            _post['post_owned_by'] = csResultSet.result[0];

                            callBack(null);

                        });
                    });
                }else{
                    var query = {
                        q: "user_id:" + _post.created_by.toString(),
                        index: 'idx_usr'
                    };

                    _post['date'] = DateTime.explainDate(_post.created_at)
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        delete _post['created_by'];
                        _post['created_by'] = csResultSet.result[0];
                        callBack(null);
                    });
                }
            }

        ],function(err,resultSet){
            callBack(_post)
        });


    }

};

module.exports = TimeLinePostHandler;
