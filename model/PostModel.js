/**
 * This is post model that allows to handle all the Operations .
 */
'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema,
     uuid = require('node-uuid');

GLOBAL.PostVisibleMode ={
    PUBLIC:1,
    FRIEND_ONLY:2,
    ONLY_MY:3,
    SELECTED_USERS:4,
    GROUP_MEMBERS:5
};

GLOBAL.PostConfig={
    CACHE_PREFIX :"user:",
    NORMAL_POST:"NP",
    LIFE_EVENT:"LE",
    VIDEO_POST:"VP",
    LOCATION_POST:"LP",
    ALBUM_POST:"AP",
    SHARED_POST:"SP",
    SHARE_PREFIX:"post:share:",
    GROUP_PREFIX:"group:"
};

GLOBAL.PostType={
    PERSONAL_POST :1,
    GROUP_POST:2
};

var PostSchema = new Schema({
    has_attachment:{
        type:Boolean,
        default:false
    },
    content:{
        type:String,
        trim:true
    },
    created_by:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    post_owned_by:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    page_link:{
        type:String,
        trim:true,
        default:null
    },
    post_visible_mode:{
        type:Number,
        default:1
    },
    visible_users:[],
    post_mode:{
        type:String,
        default:PostConfig.NORMAL_POST
    },
    post_type:{
        type:Number,
        default:PostType.PERSONAL_POST
    },
    shared_post_id:{
        type: Schema.ObjectId,
        default:null
    },
    location:{
        type:String,
        trim:true,
        default:null
    },
    lat:{
        type:String,
        trim:true,
        default:null
    },
    lng:{
        type:String,
        trim:true,
        default:null
    },
    life_event:{
        type: String,
        trim:true
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    },
    // this is exist only when the post is a group post
    group_id:{
        type: Schema.ObjectId,
        default:null
    },

},{collection:'posts'});


/**
 *
 */
PostSchema.pre('save', function(next){
    console.log("Post pre save");
    var now = new Date();console.log(now);
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create new post
 * @param post
 * @param callBack
 */
PostSchema.statics.addNew = function(post,callBack){
    var _this = this;
    var _post = new this();
    _post.has_attachment = post.has_attachment;
    _post.content = post.content;
    _post.created_by = Util.toObjectId(post.created_by);
    _post.post_owned_by = Util.toObjectId(post.post_owned_by);
    _post.page_link = post.page_link;
    _post.post_visible_mode = post.post_visible_mode;
    _post.visible_users = post.visible_users;
    _post.post_mode = post.post_mode;
    _post.post_type = post.post_type;
    _post.location = post.location;
    _post.lat = post.lat;
    _post.lng = post.lng;
    _post.life_event = post.life_event;
    _post.shared_post_id = (typeof post.shared_post_id != "undefined")?post.shared_post_id:null;
    _post.group_id = post.group_id;
    _post.save(function(err,postData){

        if(!err){
            callBack({
                status:200,
                post:postData
            });
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });

}

/**
 * Add Post data to the cache
 * @param users
 * @param data
 */
PostSchema.statics.addToCache=function(users,data,callBack){

    var _async = require('async');

    if(data.post_type == PostType.GROUP_POST) {

        // creating the index using group id.
        var _cache_key = "idx_post:"+PostConfig.GROUP_PREFIX+data.group_id;
        var payLoad={
            index:_cache_key,
            id:data.post_id.toString(),
            type: 'posts',
            data:data,
            tag_fields:['content']
        }

        ES.createIndex(payLoad,function(resultSet){
            callBack(resultSet)
        });
    }

    _async.each(users, function (_user, callBack) {
        var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+_user;
        var payLoad={
            index:_cache_key,
            id:data.post_id.toString(),
            type: 'posts',
            data:data,
            tag_fields:['content']
        }

        ES.createIndex(payLoad,function(resultSet){
            callBack(resultSet)
        });
    }, function (err) {
        callBack(null);
    });

}


/**
 * 2 4 | 4 6
 * Get Post From Cache based on User
 * @param userId
 * @param callBack
 */
PostSchema.statics.ch_getPost= function(id,payload,type,callBack){
    var _this = this;

    var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+id;
    if(type == PostType.GROUP_POST) {
        _cache_key = "idx_post:"+PostConfig.GROUP_PREFIX+id;
    }
    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){
        if(csResultSet == null){
            callBack(null);
        }else{
            _this.postList(id,csResultSet.result,function(lpData){
                callBack(lpData);
            });
        }

    });
}


/**
 * Get Single Post from Database
 * @param postId
 * @param callBack
 */
PostSchema.statics.db_getPost = function(criteria,callBack){
    var _this = this;
    _this.findOne(criteria)
        .exec(function(err,postData){
            if(!err){

                var query={
                    q:postData.created_by.toString(),
                    index:'idx_usr'
                };

                //Find User from ElasticSearch
                ES.search(query,function(csResultSet){

                    var _postData = {
                        post_id:postData._id.toString(),
                        has_attachment :postData.has_attachment,
                        content : postData.content,
                        created_at:postData.created_at,
                        page_link : postData.page_link,
                        post_visible_mode : postData.post_visible_mode,
                        location:postData.location,
                        lat:postData.lat,
                        lng:postData.lng,
                        post_mode:postData.post_mode,
                        life_event:postData.life_event,
                        created_by : csResultSet.result[0],
                    };
                    callBack({status:200,post:_postData});

                    return 0;
                });


            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });
}


/**
 *
 */
PostSchema.statics.addShareToRedis = function(postId,data,callback){
    var _cache_key = PostConfig.SHARE_PREFIX+postId;
    CacheEngine.addBottomToList(_cache_key,data,function(outData){
        callback(outData);
    });

}

/**
 * Get Single Post from Database
 * @param postId
 * @param callBack
 */
PostSchema.statics.db_getPostDetailsOnly = function(criteria,callBack){
    console.log("PostSchema.statics.db_getPostDetailsOnly")
    var _this = this;
    _this.findOne(criteria)
        .exec(function(err,postData){
            if(!err){
                callBack({status:200,post:postData});
                return 0;
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });
}


/**
 * Delete Post from Database
 * @param postId
 * @param callBack
 */
PostSchema.statics.deletePost = function(criteria,callBack){
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

    });
}



/**
 * 2 4 | 4 6
 * Get Post From Cache based on Post Id
 * @param userId
 * @param callBack
 */
PostSchema.statics.getPostFromCache= function(userId,payload,callBack){
    var _this = this;

    var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+userId;

    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){
        if(csResultSet == null){
            callBack(null);
        }else{
            callBack(csResultSet.result);
        }

    });

}


/**
 * 2 4 | 4 6
 * Delete Post From Cache based on Post Id
 * @param userId
 * @param callBack
 */
PostSchema.statics.deletePostFromCache= function(userId,payload,callBack){

    var _cache_key = "idx_post:"+PostConfig.CACHE_PREFIX+userId;

    var query={
        id:payload.q,
        type: 'posts',
        index:_cache_key
    };

    //Find User from Elastic search
    ES.delete(query,function(csResultSet){
        //if(csResultSet == null){
        //    callBack(null);
        //}else{
        //    callBack(csResultSet.result);
        //}
        callBack(null);

    });

}


/**
 *
 */
PostSchema.statics.deleteShareFromRedis = function(postId,callback){
    var _cache_key = PostConfig.SHARE_PREFIX+postId;
    CacheEngine.deleteCache(_cache_key,function(outData){
        callback(null)
    });

}

/**
 *
 */
PostSchema.statics.deleteShareFromRedisList = function(postId, data, callback){
    var _cache_key = PostConfig.SHARE_PREFIX+postId;
    CacheEngine.deleteFromList(_cache_key, data, function(outData){
        callback(null);
    });
}


/**
 * DATA FORMATTER HELPER FUNCTION WILL DEFINE HERE
 */

/**
 * Format Post list
 * @param posts
 */
PostSchema.statics.postList=function(userId,posts,callBack){
    var _tmp =[],_out_put =[],_tmp_created_date=[],data_by_date ={};


    var _this = this,
        _async = require('async'),
        Comment = require('mongoose').model('Comment'),
        Groups =  require('mongoose').model('Groups'),
        Like =require('mongoose').model('Like');

    var a =0;

    _async.each(posts,
        function(post,callBack){
            var _post = _this.formatPost(post),
            _created_date = _post.date.time_stamp;

            if(_tmp_created_date.indexOf(_created_date) == -1){
                _tmp_created_date.push(_created_date);
            }


            if( typeof data_by_date[_created_date] == 'undefined' ){
                data_by_date[_created_date] = [];
            }

            _async.waterfall([
            //GET SHARED COUT
                function getSharedCount(callBack){
                    _this.getSharedCount(_post, function (sharedCount) {
                        _post['share_count'] = sharedCount;
                        callBack(null);
                    });
                },
                function getSharedCount(callBack) {
                    if(_post.group_id != null) {
                        Groups.getGroup({_id : _post.group_id }, function (groupResult) {
                            if(groupResult.status == 200) {
                                _post['group'] = groupResult.group[0];
                            }
                            callBack(null);
                        });
                    } else {
                        callBack(null);
                    }
                },
                function addSharedPostOwner(callBack) {

                    if(_post.shared_post != undefined && _post.shared_post.hasOwnProperty('created_by')) {
                        if(!_post.shared_post.created_by.hasOwnProperty('user_id')) {
                            callBack(null);
                        }
                        var query = {
                            q: "user_id:" + _post.shared_post.created_by.user_id.toString(),
                            index: 'idx_usr'
                        };
                        ES.search(query, function (csResultSet) {
                            if(csResultSet) {
                                let _sharedPost = _post.shared_post;
                                delete _post['shared_post'];
                                delete _sharedPost['created_by'];
                                _sharedPost.created_by = csResultSet.result[0];
                                _post['shared_post'] = _sharedPost;
                                callBack(null);
                            } else {
                                callBack(null);
                            }
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
                function getCommentCount(callBack) {
                   //GET COMMENT COUNT
                   Comment.getCommentCount(_post.post_id, function (commentCount) {
                       _post['comment_count'] = commentCount;

                       if (post.post_owned_by !== undefined) {
                           //Find User from Elastic search
                           var profile_query = {
                               q: "user_id:" + post.post_owned_by.toString(),
                               index: 'idx_usr'
                           };
                           var query = {
                               q: "user_id:" + post.created_by.toString(),
                               index: 'idx_usr'
                           };
                           ES.search(query, function (csResultSet) {
                               _post['created_by'] = csResultSet.result[0];

                               ES.search(profile_query, function (csResultSet) {
                                   delete _post['post_owned_by'];
                                   _post['post_owned_by'] = csResultSet.result[0];

                                   Like.getLikedUsers(userId, _post.post_id, 0, function (likedUsers, likedUserIds) {

                                       _post['like_count'] = likedUsers.length;
                                       _post['liked_user'] = likedUsers;
                                       _post['is_i_liked'] = (likedUserIds.indexOf(userId) == -1) ? 0 : 1;

                                       data_by_date[_created_date].push(_post);

                                       callBack();
                                   })

                               });
                           });
                       } else {
                           //Find User from Elastic search
                           var query = {
                               q: "user_id:" + post.created_by.toString(),
                               index: 'idx_usr'
                           };
                           ES.search(query, function (csResultSet) {
                               _post['created_by'] = csResultSet.result[0];
                               Like.getLikedUsers(userId, _post.post_id, 0, function (likedUsers, likedUserIds) {

                                   _post['like_count'] = likedUsers.length;
                                   _post['liked_user'] = likedUsers;
                                   _post['is_i_liked'] = (likedUserIds.indexOf(userId) == -1) ? 0 : 1;

                                   data_by_date[_created_date].push(_post);

                                   callBack();
                               })
                           });
                       }

                   });
                }
            ],function(err){
                callBack(null);
            })

        },
        function(err){
            _tmp_created_date.sort(function(a,b){
                return b - a;
            });

            for(var i = 0 ; i< _tmp_created_date.length;i++){
                var _created_date = _tmp_created_date[i];
                for(var a = 0 ; a< data_by_date[_created_date].length;a++){
                    _out_put.push(data_by_date[_created_date][a]);
                }
            }
            callBack(_out_put)

        }
    );

};


/**
 * Format Post list
 * @param posts
 */
PostSchema.statics.getSharedCount=function(post,callBack){
    // var _this = this,
    //     _async = require('async');
    //
    // var criteria = {
    //     $and : [
    //         {shared_post_id: Util.toObjectId(post.post_id)},
    //         {post_mode: 'SP'}
    //     ]
    // };
    //
    // _this.find(criteria)
    //     .exec(function(err,resultSet){
    //         if(!err){
    //             callBack(resultSet.length);
    //         }else{
    //             console.log("Server Error --------")
    //             callBack({status:400,error:err});
    //         }
    //     });
    var _this = this;
    var _cache_key = PostConfig.SHARE_PREFIX+post.post_id.toString();
    CacheEngine.getListCount(_cache_key,function(chResultCount){
        callBack(chResultCount);
    });

};

/**
 * Format Post object
 * @param postData
 */
PostSchema.statics.formatPost=function(postData){

    var outPut = {
        post_id:postData.post_id,
        has_attachment:(postData.has_attachment)?postData.has_attachment:false,
        post_mode:postData.post_mode,
        post_type:postData.post_type,
        content:(postData.content)?postData.content:"",
        created_by:postData.created_by,
        post_owned_by:postData.post_owned_by,
        post_visible_mode:postData.post_visible_mode,
        date:DateTime.explainDate(postData.created_at),
        location:(postData.location)?postData.location:"",
        lat:(postData.lat)?postData.lat:"",
        lng:(postData.lng)?postData.lng:"",
        life_event:(postData.life_event)?postData.life_event:"",
        upload:(postData.has_attachment)?postData.upload:[],
        shared_post:(postData.shared_post)?postData.shared_post:"",
        group_id:(postData.group_id)?postData.group_id:null,
        post_comments:{},
    }
    return outPut;
};

PostSchema.statics.bindNotificationData = function(notificationObj, user_id, callBack){

    var criteria = {
        _id: Util.toObjectId(notificationObj.post_id)
    };

    this.db_getPost(criteria, function (postData){

        notificationObj['post_owner_username'] = postData.post.created_by.user_name;

        if(user_id.toString() == postData.post.created_by.user_id.toString()){
            notificationObj['post_owner_name'] = "your";
        }else{
            notificationObj['post_owner_name'] = postData.post.created_by.first_name+" "+postData.post.created_by.last_name;
        }

        callBack(notificationObj);
    });

};

mongoose.model('Post',PostSchema);
