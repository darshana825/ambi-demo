/**
 * News Model will communicate with news collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

GLOBAL.NewsCategoryConfig ={
    ES_INDEX_NAME:"idx_news_categories:"
};

/**
 * Article Information
 */
var ArticleSchema = new Schema({
    heading:{
        type:String,
        trim:true,
        default:null
    },
    article_image:{
        type:String,
        trim:true,
        default:null
    },
    content:{
        type:String,
        trim:true,
        default:null
    },
    article_date:{
        type:String,
        trim:true,
        default:null
    }
});

/**
 * Channel Information
 */
var ChannelSchema = new Schema({
    name:{
        type:String,
        trim:true,
        default:null
    },
    channel_image:{
        type:String,
        trim:true,
        default:null
    },
    url:{
        type:String,    //may be api url for later use
        trim:true,
        default:null
    },
    //articles:[ArticleSchema]
});

/**
 * News Categories
 */
var NewsSchema = new Schema({
    category:{
        type:String,
        trim:true,
        default:null
    },
    categoryImage:{
        type:String,
        trim:true,
        default:null
    },
    channels:[ChannelSchema]

},{collection:"news"});


/**
 * Add new News Category
 * @param category
 * @param callBack
 */
NewsSchema.statics.addNewsCategory = function(category, callBack){
    var newsCategory = new this();
    newsCategory.category = category.name;
    newsCategory.categoryImage = category.image;
    newsCategory.save(function(err, result){
        if(!err){
            callBack({
                status:200,
                result:result
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }
    });
};


/**
 * Get requested fields By Search Criteria
 * @param criteria
 * @param callBack
 */
NewsSchema.statics.findNews = function(criteria,callBack){
    var _this = this;

    _this.find(criteria.search).lean().exec(function(err,resultSet){

        if(!err){

            callBack({
                status:200,
                news_list:resultSet

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};

/**
 * delete a News Category
 * @param categoryId
 * @param callBack
 */
NewsSchema.statics.deleteNewsCategory=function(categoryId, callBack){

    var _this = this;

    _this.findOneAndRemove({_id:categoryId},function(err,resultSet){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    });

};


/**
 * Add record to sub document such as Channel / Articles
 * @param criteria
 * @param data
 * @param callBack
 */
NewsSchema.statics.addRecordToSubDocument = function(criteria, data, callBack){

    var _this = this;

    _this.update(
        criteria,
        {$push:data},function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                console.log(err)
                callBack({status:400,error:err});
            }
        });

};


/**
 * Remove record from sub document such as Channel / Articles
 * @param criteria
 * @param pullData
 * @param callBack
 */
NewsSchema.statics.removeRecordFromSubDocument = function(criteria, pullData, callBack){

    var _this = this;

    _this.update(criteria,
        { $pull: pullData},function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};

NewsSchema.statics.es_isNewsCategoryExists = function(categoryId, callBack) {

    var payLoad={
        index: NewsCategoryConfig.ES_INDEX_NAME+categoryId,
        id: categoryId.toString(),
        type: 'news_categories'
    }

    ES.isIndexExists(payLoad,function(resultSet){
        callBack(resultSet)
        return 0;
    });
};

NewsSchema.statics.es_getNewsCategories = function(category_id, callBack) {

    var payLoad={
        index: NewsCategoryConfig.ES_INDEX_NAME+category_id.toString(),
        id: category_id.toString()
    };

    ES.search(payLoad,function(csResultSet){
        callBack(csResultSet);
    });
};

/**
 * Create ES index for News Category
 * {Create Index}
 */
NewsSchema.statics.ch_newsCategoryCreateIndex = function(payload,callBack){

    var _cache_key = NewsCategoryConfig.ES_INDEX_NAME+payload.category_id.toString();
    var payLoad={
        index:_cache_key,
        id:payload.category_id.toString(),
        type: 'news_categories',
        data:payload.data
    }

    ES.createIndex(payLoad,function(resultSet){
        callBack(resultSet)
    });

};

/**
 * Share Notebook | Cache based on User
 * {Update Notebook List}
 */
NewsSchema.statics.ch_newsCategoryUpdateIndex = function(payload,callBack){

    var _cache_key = NewsCategoryConfig.ES_INDEX_NAME+payload.category_id.toString();
    var payLoad={
        index:_cache_key,
        id:payload.category_id.toString(),
        type: 'news_categories',
        data:payload.data
    }

    ES.update(payLoad,function(resultSet){
        callBack(resultSet)
    });

};

mongoose.model('News',NewsSchema);
