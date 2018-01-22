/**
 * SubscribedNews Model will communicate with subscribed_news collection
 */

'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

GLOBAL.SubscribedNewsConfig = {
    CACHE_PREFIX :"subscribed_channels:"
};

var SubscribedNewsSchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    news_category_id: {
        type: Schema.ObjectId,
        ref: 'News',
        default:null
    },
    news_channels:[],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"subscribed_news"});

SubscribedNewsSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

SubscribedNewsSchema.statics.addTopicsByUser = function(topicData,callBack){
    this.collection.insert(topicData, function(err){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }

    });
};

SubscribedNewsSchema.statics.removeNewsTopic = function(criteria, callBack){
    this.remove(criteria, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error --------", err);
            callBack({status:400,error:err});
        }
    });
};

SubscribedNewsSchema.statics.addNewsChannels = function(criteria, channelData, callBack){
    this.update(criteria, {$push: channelData}, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });

            console.log(resultSet);

        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }
    });
};

SubscribedNewsSchema.statics.cache_addNewsChannels = function(criteria, channelData, callBack){
    var _cache_key = "idx_user:" + criteria.user_id + "_" + SubscribedNewsConfig.CACHE_PREFIX + "" + criteria.topic_id;

    console.log("criteria", criteria);

    var payLoad={
        index: _cache_key,
        id: channelData.channel_id,
        type: 'subscribed_news_channels',
        data: channelData
    };

    ES.createIndex(payLoad,function(resultSet){
        callBack(resultSet);
    });
};

SubscribedNewsSchema.statics.cache_getNewsChannels = function(criteria, q, callBack){
    var _cache_key = "idx_user:" + criteria.user_id + "_" + SubscribedNewsConfig.CACHE_PREFIX + "" + criteria.topic_id;
    var payLoad={
        index: _cache_key
    };

    if(typeof q != "undefined" && q != null){
        payLoad['q'] = q;
    }

    ES.search(payLoad,function(r){
        callBack(r);
    });
};

SubscribedNewsSchema.statics.removeNewsChannels = function(criteria, channelData, callBack){
    this.update(criteria, {$pull: channelData}, {multi: true},function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error --------", err);
            callBack({status:400,error:err});
        }
    });
};

SubscribedNewsSchema.statics.cache_removeNewsChannel = function(criteria, callBack){
    var _cache_key = "idx_user:" + criteria.user_id + "_" + SubscribedNewsConfig.CACHE_PREFIX + "" + criteria.topic_id;
    var payLoad={
        index: _cache_key,
        id: criteria.channel_id,
        type: 'subscribed_news_channels'
    };


    console.log("payload", payLoad);

    ES.delete(payLoad,function(r){
        callBack(r);
    });
};

SubscribedNewsSchema.statics.getTopicsByUser = function(criteria,callBack){
    this.aggregate([
        { $match:criteria},
        {
            $lookup:{
                from:"news",
                localField:"news_category_id",
                foreignField:"_id",
                as:"topicData"
            }
        },
        { $unwind: '$topicData'},
        {
            $project: {
                _id:"$_id",
                user_id:"$user_id",
                category_id:"$topicData._id",
                category:"$topicData.category",
                category_image:"$topicData.categoryImage",
                category_name:"$topicData.categoryImage",
                channels: '$topicData.channels'
            }
        }
    ], function(err, resultSet){
        if(!err){
            callBack({status: 200, topics: resultSet});
        }else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });
};

mongoose.model('SubscribedNews',SubscribedNewsSchema);