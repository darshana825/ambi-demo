/**
 * Handle Comments
 */

'use strict';

var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


GLOBAL.CommentConfig ={
    CACHE_PREFIX:"post:comment:"
};

var CommentSchema = new Schema({
    post_id:{
        type: Schema.ObjectId,
        ref: 'Post'
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    comment:{
        type:String,
        default:null,
        trim:true
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"comments"});

CommentSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});



/**
 * Add Comment to the system
 * this will add to the cache too
 * @param comment
 * @param callBack
 */
CommentSchema.statics.addComment = function (comment,callBack) {

    var _comment = new this(),
        _this = this;

    _comment.post_id = Util.toObjectId(comment.post_id);
    _comment.user_id = Util.toObjectId(comment.user_id);
    _comment.comment = comment.comment;

    //ADD TO THE DATA BASE
    _comment.save(function(err,resultSet){

        if(!err){

            callBack({status:200,comment:resultSet});

        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Comments by Post Id
 * @param postId
 * @param callBack
 */
CommentSchema.statics.getComments = function(postId,page,callBack){
    var _this = this;
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;

    var _page = (page <= 1)?0 :parseInt(page)  - 1;
    var _start_index    = Config.RESULT_PER_PAGE*_page;
    var _end_index      =  (Config.RESULT_PER_PAGE*(_page+1) -1);

    CacheEngine.getList(_cache_key,_start_index,_end_index,function(chResultSet){
        //console.log(JSON.stringify(chResultSet.result))

        _this.formatCommentList(chResultSet.result, function(lpData){
            var _res = {
                formattedResult: lpData,
                unformattedResult:chResultSet.result
            };
            callBack(_res);
        });
    });
};
/**
 * Get Comments count
 * @param postId
 * @param callBack
 */
CommentSchema.statics.getCommentCount = function(postId,callBack){
    var _this = this;
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;
    CacheEngine.getListCount(_cache_key,function(chResultCount){
        callBack(chResultCount);
    });
};

/**
 * Add to Cache
 * @param postId
 * @param data
 */
CommentSchema.statics.addToCache=function(postId,data){
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;
    CacheEngine.addBottomToList(_cache_key,data,function(outData){

    });
};

CommentSchema.statics.formatCommentList = function(comments, callBack){

    var _async = require('async');
    var temp =[];

    _async.each(comments, function(comment, callBackLoop){

        _async.waterfall([
            function getCommentOwner(callBackMiddle) {
                if (comment.commented_by !== undefined && comment.commented_by.hasOwnProperty('user_id')) {
                    var query = {
                        q: "user_id:" + comment.commented_by.user_id.toString(),
                        index: 'idx_usr'
                    };
                    ES.search(query, function (csResultSet) {
                        callBackMiddle(null, csResultSet.result[0]);
                    });

                } else {
                    callBackMiddle(null, null);
                }
            },
            function processComment(_created, callBackMiddle) {
                temp.push({
                    comment_id:comment.comment_id,
                    post_id:comment.post_id,
                    comment:comment.comment,
                    commented_by:(_created != null && _created != undefined) ?_created : comment.commented_by,
                    date:DateTime.explainDate(comment.created_at),
                    attachment:comment.attachment
                })
                callBackMiddle(null);
            }
        ], function (err) {
            callBackLoop(null);
        });
    }, function(err){
        callBack(temp)
    });
};


/**
 * delete comment from db
 * @param comments
 */
CommentSchema.statics.deleteComment = function(criteria, callBack){
    console.log("CommentSchema.statics.deleteComment")

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
 * delete a comment from cache
 * @param postId
 * @param data
 */
CommentSchema.statics.deleteFromCache = function(postId,data,callback){
    console.log("CommentSchema.statics.deleteFromCache")
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;
    CacheEngine.deleteFromList(_cache_key,data,function(outData){
        callback(outData)
    });

};


/**
 * get a comment from db
 * @param comments
 */
CommentSchema.statics.getCommentCountDB = function(criteria, callBack){
    console.log("CommentSchema.statics.getCommentCountDB")

    this.count(criteria).exec(function(err,resultSet){

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

CommentSchema.statics.deleteCache = function(postId, callback){
    var _cache_key = CommentConfig.CACHE_PREFIX+postId;
    CacheEngine.deleteCache(_cache_key,function(outData){
        callback(null);
    });
};





mongoose.model('Comment',CommentSchema);