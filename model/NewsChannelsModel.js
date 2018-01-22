/**
 * This is Life event Model
 */


'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


GLOBAL.ChannelConfig ={
    ES_INDEX_NAME:"idx_channels:"
};


var NewsChannelsSchema = new Schema({

    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    category_id:{
        type: Schema.ObjectId,
        ref: 'news',
        default:null
    },
    channel_id:{
        type: Schema.ObjectId,
        ref: 'news:channels',
        default:null
    },
    created_at:{
        type:Date
    }

},{collection:"news_channels"});


/**
 * Get requested fields By Search Criteria
 * @param criteria
 * @param callBack
 */
NewsChannelsSchema.statics.findNewsChannel = function(criteria,callBack){
    var _this = this;

    _this.find(criteria.search).lean().exec(function(err,resultSet){

        if(!err){

            callBack({
                status:200,
                channel_list:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};

NewsChannelsSchema.statics.isChannelExistsForUser = function(payload,callBack){

    var _this = this;
    var criteria = {
        user_id: payload.user_id,
        channel_id: payload.channel_id
    };

    _this.findOne(criteria).exec(function (err, resultSet) {
        if (!err) {
            if(resultSet){
                callBack(true);
            }else{
                callBack(false);
            }
        } else {
            console.log(err);
            callBack({status: 400, error: err});
        }
    });

};

NewsChannelsSchema.statics.addChannelByUser = function(channelData,callBack){

    var newChannel = new this();
    newChannel.user_id 	= channelData.user_id;
    newChannel.category_id = channelData.category_id;
    newChannel.channel_id = channelData.channel_id;
    newChannel.created_at = channelData.created_at;

    newChannel.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                newChannel:resultSet
            });
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }

    });

};

NewsChannelsSchema.statics.removeChannelByUser = function(payload,callBack){

    var _this = this;
    var criteria = {
        user_id: payload.user_id,
        channel_id: payload.channel_id
    };

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

};

NewsChannelsSchema.statics.getChannelsByUser = function(user_id,callBack){

    var _this = this;

    var criteria = {user_id:user_id};

    _this.find(criteria.search).lean().exec(function(err,resultSet){

        if(!err){

            callBack({
                status:200,
                channel_list:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};

NewsChannelsSchema.statics.es_isChannelExists = function(payload, callBack) {

    var payLoad={
        index: ChannelConfig.ES_INDEX_NAME,
        id: payload.category_id.toString() + '_' + payload.channel_name.toLowerCase(),
        type: 'channels'
    }

    ES.isIndexExists(payLoad,function(resultSet){
        callBack(resultSet)
        return 0;
    });
};

NewsChannelsSchema.statics.es_createNewsChannelsByCategory = function(payload, callBack) {

    var payLoad={
        index: ChannelConfig.ES_INDEX_NAME,
        id: payload.channel_id.toString(),
        type: 'channels',
        data:payload.data,
        tag_fields: ['name']
    }

    ES.createIndex(payLoad,function(resultSet){
        callBack(resultSet)
        return 0;
    });
};

NewsChannelsSchema.statics.es_updateNewsChannelsByCategory = function(payload, callBack) {

    var payLoad={
        index: ChannelConfig.ES_INDEX_NAME,
        id: payload.channel_id.toString(),
        type: 'channels',
        data:payload.data
    }

    ES.update(payLoad,function(resultSet){
        callBack(resultSet)
        return 0;
    });
};

NewsChannelsSchema.statics.es_getNewsChannelsByCategory = function(payload, callBack) {

    var payLoad={
        index: ChannelConfig.ES_INDEX_NAME,
        id: payload.channel_id.toString()
    };

    ES.search(payLoad,function(csResultSet){
        callBack(csResultSet);
    });
};

NewsChannelsSchema.statics.es_getNewsChannelsSuggestions = function(criteria, callBack) {

    var payLoad={
        q:criteria.q,
        index: ChannelConfig.ES_INDEX_NAME
    };

    ES.search(payLoad,function(esResultSet){
        callBack(esResultSet.result);
    });
};


NewsChannelsSchema.statics.formatNewsChannels = function(categoryChannels, userChannels) {

    var updatedChannelsList = [];

    for(var b=0;b<categoryChannels.length;b++){

        var obj = userChannels.filter(function ( obj ) {
            return obj.channel_id.toString() == categoryChannels[b]._id.toString();
        })[0];

        if(obj) {
            categoryChannels[b]['date'] = DateTime.explainDateShortForm(obj.created_at);
            updatedChannelsList.push(categoryChannels[b]);
        }
    }
    return updatedChannelsList;
};


mongoose.model('NewsChannels',NewsChannelsSchema);