/**
 * This is like model that communicate with likes
 */


'use strict';

var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


GLOBAL.LikeConfig ={
    CACHE_PREFIX:"post:like:",
    RESULT_PER_PAGE:100
};


var LikeSchema = new Schema({
    post_id:{
        type: Schema.ObjectId,
        ref: 'Post'
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"likes"});


LikeSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});
/**
 * Add Like to selected post
 * @param likes
 * @param callBack
 */
LikeSchema.statics.addLike = function(likeData,callBack){

    var _like = new this(),
        _this = this;

    _like.post_id = Util.toObjectId(likeData.post_id);
    _like.user_id = Util.toObjectId(likeData.user_id);

    _like.save(function(err,resultSet){
        if(!err){

            _this.addToCache(resultSet.post_id,resultSet.user_id);

            callBack({status:200, like:resultSet})

        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }
    });


};

/**
 * Get Liked Users
 * @param postId
 * @param page
 * @param callBack
 */
LikeSchema.statics.getLikedUsers = function(userId,postId,page,callBack){
    var _this = this,
        _async = require('async'),
        _cache_key = LikeConfig.CACHE_PREFIX+postId,
        liked_users = [],
        liked_user_ids= [];


    var _page = (page <= 1)?0 :parseInt(page)  - 1;
    var _start_index    = LikeConfig.RESULT_PER_PAGE*_page;
    var _end_index      =  (LikeConfig.RESULT_PER_PAGE*(_page+1) -1);

    CacheEngine.getList(_cache_key,_start_index,_end_index,function(chResultSet){

        _async.each(chResultSet.result,
            function(likedUser,callBack){
                var query={
                    q:"user_id:"+likedUser.toString(),
                    index:'idx_usr'
                };
                //Find User from Elastic search
                ES.search(query,function(csResultSet){

                    if(csResultSet.result[0].user_id == userId){
                        liked_users.push({
                            user_id:csResultSet.result[0].user_id,
                            profile_image:"you",
                            name:"You",
                            user_name:csResultSet.result[0].user_name
                        });
                        liked_user_ids.push(csResultSet.result[0].user_id);
                    }else{
                        liked_users.push({
                            user_id:csResultSet.result[0].user_id,
                            profile_image:csResultSet.result[0].images.profile_image.http_url,
                            name:csResultSet.result[0].first_name + " " +csResultSet.result[0].last_name,
                            user_name:csResultSet.result[0].user_name
                        });

                        liked_user_ids.push(csResultSet.result[0].user_id);

                    }


                    callBack();
                });
            },
            function(err){
                callBack(liked_users,liked_user_ids);
            })
    });
};


/**
 * Add to Cache
 * @param postId
 * @param data
 */
LikeSchema.statics.addToCache=function(postId,data){
    var _cache_key = LikeConfig.CACHE_PREFIX+postId;
    CacheEngine.addBottomToList(_cache_key,data,function(outData){
    });

};


LikeSchema.statics.deleteCache = function(postId, callback){
    var _cache_key = LikeConfig.CACHE_PREFIX+postId;
    CacheEngine.deleteCache(_cache_key,function(outData){
        callback(null)
    });
};

/**
 * delete all likes from selected post
 * @param likes
 * @param callBack
 */
LikeSchema.statics.deleteLike = function(criteria,callBack){
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

    })
};

/**
 * Add Like to selected post
 * @param likes
 * @param callBack
 */
LikeSchema.statics.isAlreadyLiked = function(postId, userId, callBack){

    var _like = new this(),
        _this = this;

    _this.findOne({ "post_id" : postId, "user_id": userId}).exec(function(err, likeResult){
        console.log(likeResult);
        if(err){
            callBack({status:400, error:err});
        } else if (likeResult === null) {
            callBack({status:200, liked: false});
        } else {
            callBack({status:200, liked: true});
        }
    });
}



mongoose.model('Like',LikeSchema);
