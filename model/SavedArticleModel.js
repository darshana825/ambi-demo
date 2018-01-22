/**
 * Handle Saved Articles
 */
'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var SavedArticleSchema = new Schema({
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
    },
    url:{
        type:String,
        trim:true,
        default:null
    },
    created_at:{
        type:Date
    },
    channel:{
        type:String,
        trim:true,
        default:null
    }
},{collection:"saved_articles"});



SavedArticleSchema.pre('save', function(next){
    var now = new Date();
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
SavedArticleSchema.statics.saveArticle =function(articel,callBack){
    var _article =  new this();
    _article.heading = articel.heading;
    _article.article_image=articel.article_image;
    _article.content=articel.content;
    _article.article_date=articel.article_date;
    _article.channel = articel.channel;
    _article.url = articel.url;
    _article.save(function(err,resultSet){
        console
        if(!err){
            callBack({
                status:200,
                article:resultSet
            });
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
SavedArticleSchema.statics.findSavedArticle = function(criteria,callBack){

    this.find(criteria).exec(function(err,resultSet){
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
SavedArticleSchema.statics.deleteSavedArticle=function(criteria, callBack){

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

mongoose.model('SavedArticle',SavedArticleSchema);
