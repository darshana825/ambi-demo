/**
 * Post controller is use for handle all the post related actions
 */

var PostController ={

    /**
     * Add New post to the system.
     * set the post_mode and the relative visible_users params in the post request
     * ex: -
     *      public post - no users.
     *      group post - group memebers
     * @param req
     * @param res
     * @returns {number}
     */
    addPost:function(req,res){

        var outPut ={},CurrentSession = Util.getCurrentSession(req);
        var TimeLinePostHandler = require('../middleware/TimeLinePostHandler');
        var data ={
            has_attachment:(typeof req.body.__hs_attachment != 'undefined')?req.body.__hs_attachment:false,
            content:(typeof req.body.__content != 'undefined')?req.body.__content :"",
            created_by:(req.body.__on_friends_wall === 'true')?req.body.__profile_user_id :CurrentSession.id,
            post_owned_by:CurrentSession.id,
            page_link:(typeof req.body.page_link != 'undefined')?req.body.page_link :"",
            post_visible_mode:(typeof req.body.__post_visible_mode != 'undefined')?req.body.__post_visible_mode:PostVisibleMode.PUBLIC,
            post_mode:(typeof req.body.__post_mode != 'undefined')?req.body.__post_mode:PostConfig.NORMAL_POST,
            post_type:(typeof req.body.__post_type != 'undefined')?req.body.__post_type:PostConfig.PERSONAL_POST,
            file_content:(typeof req.body.__file_content != 'undefined')?req.body.__file_content:"",
            upload_id:(typeof req.body.__uuid  != 'undefined')? req.body.__uuid:"",
            location:(typeof req.body.__lct  != 'undefined')?req.body.__lct:"",
            lat:(typeof req.body.__lat  != 'undefined')?req.body.__lat:"",
            lng:(typeof req.body.__lng  != 'undefined')?req.body.__lng:"",
            life_event:(typeof req.body.__lf_evt  != 'undefined')?req.body.__lf_evt:"",
            shared_post:"",
            visible_users:(typeof req.body.__visible_users != 'undefined')?req.body.__visible_users: [],
            group_id:(typeof req.body.__group != 'undefined')?req.body.__group._id: null,
            group:(typeof req.body.__group != 'undefined')?req.body.__group: {},
            post_comments:{},
        };

        TimeLinePostHandler.addNewPost(data,function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['post']      = resultSet;
            res.status(200).send(outPut);
            return 0;
        });

    },
    /**
     * Get Posts
     * In order to  Load my post then set _own param to me otherwise set it all
     * @param req
     * @param res

     */
    getPost:function(req,res){
        var Post = require('mongoose').model('Post');
        var postsType   = typeof(req.query.__post_type) != 'undefined' ? req.query.__post_type : PostType.PERSONAL_POST;
        var page   = req.query.__pg;

        if(postsType == PostType.GROUP_POST) {

            var id = req.query.__group_id;
            var payLoad = {
                _page: page,
                q:"post_type:2",
            };

            Post.ch_getPost(id,payLoad,postsType,function(resultSet){
                var outPut ={};
                if(resultSet == null){

                    outPut['status'] = ApiHelper.getMessage(200, Alert.LIST_EMPTY, Alert.SUCCESS);
                    outPut['posts'] = [];
                    res.status(200).send(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['posts'] = resultSet;
                res.status(200).send(outPut);
                return 0;
            });
        } else {

            var query={
                q:"user_name:"+req.query.uname,
                index:'idx_usr'
            };
            ES.search(query,function(esResultSet){

                var _id     = esResultSet.result[0].user_id;
                var _page   = req.query.__pg;
                var payLoad = {
                    _page:_page,
                    q:(req.query.__own =="me")?"created_by:"+_id:"*"
                };

                Post.ch_getPost(_id,payLoad,postsType,function(resultSet){

                    var outPut ={};

                    if(resultSet == null){
                        outPut['status']    = ApiHelper.getMessage(200, Alert.LIST_EMPTY, Alert.SUCCESS);
                        outPut['posts']     = [];
                        res.status(200).send(outPut);
                        return 0;
                    }
                    outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                    outPut['posts']      =resultSet;
                    res.status(200).send(outPut);
                    return 0;
                });
            });
        }

    },

    /**
     * Share post on time line
     * @param res
     * @param res
     */
    sharePost:function(req,res){
        var CurrentSession = Util.getCurrentSession(req);
        var data ={
            content:req.body.__content,
            created_by:CurrentSession.id,
            post_owned_by:CurrentSession.id,
            shared_post_id:req.body.__pid,
            post_id:req.body.__pid,
            post_visible_mode:PostVisibleMode.PUBLIC,
            post_mode:(typeof req.body.__post_mode != 'undefined')?req.body.__post_mode:PostConfig.SHARED_POST,
            post_owner:req.body.__own,
            friends_post_sharing: CurrentSession.id != req.body.__own ? true  :false,
            group_id:(typeof req.body.__group_id == 'undefined' || req.body.__group_id.length == 0) ? null : req.body.__group_id,
            visible_users:(typeof req.body.__visible_users != 'undefined')?req.body.__visible_users: [],
            post_type:(typeof req.body.__post_type != 'undefined')?req.body.__post_type:PostType.PERSONAL_POST,
            post_comments:{},
        }

        var TimeLinePostHandler = require('../middleware/TimeLinePostHandler');
        TimeLinePostHandler.sharePost(data,function(resultSet){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['post']      = resultSet;
            res.status(200).send(outPut);
            return 0;
        });
    },

    /**
     * when user update profile picture add that as a post
     * @param req
     * @param res
     */

    profileImagePost:function(req,res){

        var outPut ={},CurrentSession = Util.getCurrentSession(req);

        var TimeLinePostHandler = require('../middleware/TimeLinePostHandler');
        var data ={
            has_attachment:(typeof req.body.__hs_attachment != 'undefined')?req.body.__hs_attachment:false,
            content:(typeof req.body.__content != 'undefined')?req.body.__content :"",
            created_by:CurrentSession.id,
            post_owned_by:CurrentSession.id,
            page_link:(typeof req.body.page_link != 'undefined')?req.body.page_link :"",
            post_visible_mode:PostVisibleMode.PUBLIC,
            post_mode:(typeof req.body.__post_mode != 'undefined')?req.body.__post_mode:PostConfig.NORMAL_POST,
            file_content:(typeof req.body.__file_content != 'undefined')?req.body.__file_content:"",
            upload_id:(typeof req.body.__uuid  != 'undefined')? req.body.__uuid:"",
            location:(typeof req.body.__lct  != 'undefined')?req.body.__lct:"",
            lat:(typeof req.body.__lat  != 'undefined')?req.body.__lat:"",
            lng:(typeof req.body.__lng  != 'undefined')?req.body.__lng:"",
            life_event:(typeof req.body.__lf_evt  != 'undefined')?req.body.__lf_evt:"",
            shared_post:"",
            profile_picture_data:req.body.__profile_picture,
            post_comments:{},
        };

        TimeLinePostHandler.profileImagePost(data,function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['post']      = resultSet;
            res.status(200).send(outPut);
            return 0;
        });

    },

    /**
     * delete post
     * @param req
     * @param res
     */
    deletePost:function(req,res){
        console.log("deletePost")
        var post_id = req.body.__post_id;console.log(post_id);

        var outPut = {};
        var Comment = require('mongoose').model('Comment'),
            Like = require('mongoose').model('Like'),
            Post = require('mongoose').model('Post'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var _unsubscribeUsers = [], _post = {};

        _async.waterfall([

            function deleteAllRecordsFromDB(callback){
                console.log("deleteAllRecordsFromDB")

                _async.parallel([
                    //delete likes
                    function(callback){
                        console.log("delete likes")
                        var _criteria = {post_id:Util.toObjectId(post_id)};
                        Like.deleteLike(_criteria,function(result){
                            callback(null);
                        })
                    },
                    //delete comments
                    function(callback){
                        console.log("delete comments")
                        var _criteria = {post_id:Util.toObjectId(post_id)};
                        Comment.deleteComment(_criteria,function(result){
                            callback(null);
                        })
                    },
                    //delete subscription
                    function(callback){
                        console.log("delete subscription")
                        var _criteria = {post_id:Util.toObjectId(post_id)};
                        SubscribedPost.getSubscribedUsers(_criteria, function(result){
                            for(var i = 0; i < result.users.length; i++){
                                _unsubscribeUsers.push(result.users[i].user_id);
                            }
                            SubscribedPost.deleteSubscribedUsers(_criteria, function(result){
                                callback(null)
                            })
                        })
                    },
                    //delete notification
                    function(callback){
                        console.log("delete notification")
                        var _criteria = {notified_post:Util.toObjectId(post_id)};
                        Notification.getNotifications(_criteria, function(result){
                            var _notifications = result.result;
                            _async.each(_notifications, function(notification, callback){
                                var _notificationCriteria = {notification_id:Util.toObjectId(notification._id)};
                                NotificationRecipient.deleteNotificationRecipients(_notificationCriteria,function(result){
                                    callback(null);
                                })
                            });
                            callback(null);
                        });
                    },
                    //delete post
                    function(callback){
                        console.log("delete post")
                        var _criteria = {notified_post:Util.toObjectId(post_id)};
                        Post.deletePost(_criteria, function(result){
                            callback(null);
                        });
                    }
                ],function(err){
                    callback(null);
                })
            },
            function deleteUploads(callback){
                console.log("deleteUploads")

                _async.parallel([
                    // delete post uploads
                    function(callback){
                        console.log("delete post uploads")

                        var payLoad ={
                            q:"post_id:"+post_id
                        };

                        Post.getPostFromCache(CurrentSession.id,payLoad,function(resultSet){
                            _post = resultSet[0];
                            if(typeof _post.has_attachment != 'undefined' && _post.has_attachment){
                                console.log("has attachment")
                                _async.each(_post.upload, function(upload,callback){
                                    console.log(upload);
                                    ContentUploader.deleteFromCDN(upload, function(result){
                                        callback(null);
                                    })
                                })
                                callback(null);
                            }else{
                                callback(null);
                            }
                        });

                    },
                    // delete comments uploads
                    function(callback){
                        console.log("delete comments uploads")
                        var _redisId = "post:comment:"+post_id,
                            _totalComments = 0,
                            _comments = [];

                        _async.waterfall([
                            function(callback){
                                CacheEngine.getList(_redisId,0,1,function(chResultSet){
                                    _totalComments = chResultSet.result_count;
                                    callback(null);
                                });
                            },
                            function(callback){
                                CacheEngine.getList(_redisId,0,_totalComments,function(chResultSet){
                                    _comments = chResultSet.result;
                                    callback(null);
                                });
                            },
                            function(callback){
                                _async.each(_comments,function(comment,callback){
                                    if(typeof comment.attachment != 'undefined' && comment.attachment != '' && comment.attachment != null){
                                        ContentUploader.deleteFromCDN(comment.attachment, function(result){
                                            callback(null);
                                        })
                                    } else{
                                        callback(null);
                                    }
                                });
                                callback(null);
                            }
                        ],function(err){
                            callback(null)
                        })
                    }

                ],function(err){
                    callback(null);
                });

            },
            function deleteFromCache(callback){
                console.log("deleteFromCache")
                _async.parallel([

                    // delete post from cache
                    function(callback){
                        var payLoad ={
                            q:post_id
                        };

                        _async.each(_post.visible_users, function(visible_user,callback){
                            Post.deletePostFromCache(visible_user,payLoad,function(resultSet) {
                                callback(null);
                            });
                        });
                        callback(null);
                    },
                    // delete all likes of this post from cache
                    function(callback){
                        Like.deleteCache(post_id,function(){
                            callback(null);
                        })
                    },
                    //delete shared post from cache
                    function (callBack){
                        if(typeof _post.shared_post_id != "undefined"){
                            var createdBy = JSON.stringify(_post.created_by);
                            Post.deleteShareFromRedisList(_post.shared_post_id, createdBy, function () {
                                callBack(null);
                            });
                        }else {
                            callBack(null);
                        }
                    },
                    // delete all shares of this post from cache
                    function(callback){
                        Post.deleteShareFromRedis(post_id,function(){
                            callback(null)
                        })
                    },
                    // delete all comments of this post from cache
                    function(callback){
                        Comment.deleteCache(post_id,function(){
                            callback(null);
                        })
                    }

                ],function(err){
                    callback(null);
                })

            }

        ],function(err){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['unsubscribeUsers'] = _unsubscribeUsers;
            res.status(200).send(outPut);
            return 0;
        })
    }
};

module.exports = PostController;
