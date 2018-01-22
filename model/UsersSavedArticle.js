/**
 * Handle Saved Articles of a user
 */
'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;



var UsersSavedArticleSchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    article:{
        type: Schema.ObjectId,
        ref: 'SavedArticle',
        default:null
    },
    created_at:{
        type:Date
    }

},{collection:"users_saved_articles"});

UsersSavedArticleSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Save article to a user
 * @param userId
 * @param criteria
 * @param callBack
 */
UsersSavedArticleSchema.statics.saveArticle =function(articel,callBack){
    var _article =  new this();
    _article.user_id = articel.user_id;
    _article.article = articel.article;
    _article.save(function(err,success){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }
    });

};


/**
 * Get saved articles to a user
 * @param criteria
 * @param callBack
 */
UsersSavedArticleSchema.statics.findSavedArticle = function(criteria,callBack){

    this.find(criteria).populate("article").exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                news_list:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })
};


/**
 * delete a News Category
 * @param categoryId
 * @param callBack
 */
UsersSavedArticleSchema.statics.deleteSavedArticle=function(criteria, callBack){

    var _this = this;

    _this.findOneAndRemove(criteria,function(err,resultSet){
        if(!err){
            callBack({status:200});
        }else{
            console.log("Server Error --------");
            callBack({status:400,error:err});
        }
    });

};


/**
 * check user already saved the article
 * @param criteria
 * @param callBack
 */
UsersSavedArticleSchema.statics.checkSavedArticle = function(criteria,callBack){

    this.count(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })
};



mongoose.model('UsersSavedArticle',UsersSavedArticleSchema);
