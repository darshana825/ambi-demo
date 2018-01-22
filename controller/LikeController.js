/**
 * Like controller
 */
var LikeController ={


    /**
     * Add Like to selected post
     * @param req
     * @param res
     */
    doLike:function(req,res){
        var outPut = {}
        if(typeof req.body.__post_id == 'undefined' || typeof req.body.__post_id == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_ID_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var Like = require('mongoose').model('Like'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var _like ={
            post_id:req.body.__post_id,
            user_id:CurrentSession.id
        };

        var _likeData = [];
        _async.waterfall([
            function isAlreadyLiked(callBack){
                Like.isAlreadyLiked(req.body.__post_id, CurrentSession.id, function(resultSet){
                    if(resultSet.status != 200) {
                        callBack(resultSet.error);
                    } else if (resultSet.liked == true) {
                        callBack("Already liked");
                    } else {
                        callBack(null);
                    }
                });
            },
            function saveLikeInDb(callBack){
                Like.addLike(_like,function(resultSet){
                    _likeData = resultSet.like;
                    callBack(null)
                });
            },

            function getUserDetails(callBack){
                var query={
                    q:_like.user_id.toString(),
                    index:'idx_usr'
                };
                ES.search(query,function(csResultSet){
                    _likeData['liked_by'] = csResultSet.result[0];
                    //var _formattedLike ={
                    //    like_id:_likeData._id.toString(),
                    //    post_id:_likeData.post_id.toString(),
                    //    created_at:_likeData.created_at,
                    //    liked_by:csResultSet.result[0]
                    //};

                    //ADD TO THE CACHE
                    //Like.addToCache(_formattedLike.post_id,_formattedLike);
                    callBack(null)
                });
            },
            function getOtherSubscribedUsers(callBack){

                var _data = {
                    post_id:Util.toObjectId(req.body.__post_id),
                    user_id:{$ne:Util.toObjectId(_likeData.user_id)}
                }
                SubscribedPost.getSubscribedUsers(_data, function(res){
                    var _users = [];
                    for(var i = 0; i < res.users.length; i++){
                        _users.push(res.users[i].user_id);
                    }
                    _likeData['subscribedUsers']= _users;
                    callBack(null);
                })
            },
            function addNotification(callBack){

                if(_likeData.subscribedUsers.length > 0){

                    var _data = {
                        sender:_likeData.user_id,
                        notification_type:Notifications.LIKE,
                        notified_post:req.body.__post_id
                    }
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            _likeData['notification_id'] = res.result._id;
                        }
                        callBack(null);
                    });

                } else{
                    callBack(null);
                }
            },

            function notifyUsers(callBack){

                if(_likeData.subscribedUsers.length > 0 && typeof _likeData.notification_id != 'undefined'){
                    var _data = {
                        notification_id:_likeData.notification_id,
                        recipients:_likeData.subscribedUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })
                } else{
                    callBack(null);
                }
            }
        ],function(err,resultSet){
            if(err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ALREADY_LIKED, Alert.ALREADY_LIKED);
                outPut['like'] = null;
                res.status(406).send(outPut);
                return ;
            } else {
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['like']   = _likeData;
                res.status(200).send(outPut);
            }

        });


    }


}


module.exports = LikeController
