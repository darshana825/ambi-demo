'use strict';

/**
 * TODO: This class is for temporary usage only. This is just for  take  hard coded news  articles. Entire class need to be re do based on the requirment
 *
 */
var NewsController ={

    /**
     * Add new News Category
     * @param req
     * @param res
     */
    addNewsCategory:function(req,res){

        var News = require('mongoose').model('News');

        var categoryImage = req.body.categoryImg;
        var categoryName = req.body.categoryName;

        //TODO: Category Image Upload part

        var _category = {
            name:categoryName,
            image:categoryImage
        };

        News.addNewsCategory(_category,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    /**
     * Get all News Categories
     * @param req
     * @param res
     */
    getNewsCategories:function(req,res){

        var News = require('mongoose').model('News'),
            _async = require('async'),
            FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory'),
            NewsChannels = require('mongoose').model('NewsChannels'),
            CurrentSession = Util.getCurrentSession(req);


        var user_id=CurrentSession.id;
        var channels = [];

        _async.waterfall([
            function getUserChannels(callBack){

                NewsChannels.getChannelsByUser(user_id, function(resultSet) {
                    if(resultSet.status == 200) {
                        channels = resultSet.channel_list;
                        callBack(null);
                    }
                });
            },
            function getFavouriteNewsCategories(callBack){

                FavouriteNewsCategory.getNewsCategoriesByUserId(user_id,function(resultSet){

                    callBack(null,resultSet.news_categories);
                });

            },
            function getAllNewsCategories(newsCategories,callBack){
                var criteria = {
                    search:{},
                    return_fields:{category:1, categoryImage:1,articles:1}
                }
                News.findNews(criteria,function(resultSet){
                    var _tmpOutPut = [];
                    for(var a=0;a<resultSet.news_list.length;a++){
                        var _tmpData = resultSet.news_list[a];
                        _tmpData.is_favorite = 0;
                        for(var i = 0; i< newsCategories.length;i++ ) {

                            if(newsCategories[i].category.toString() == _tmpData._id.toString()){
                                _tmpData.is_favorite = 1;
                                break;
                            }

                        }

                        _tmpOutPut.push(_tmpData)

                    }
                    callBack(null,_tmpOutPut);
                });

            },
            function reCategorizeChannels(news,callBack){

                var _this = this;

                for(var a=0;a<news.length;a++){
                    var categoryChannelList = news[a].channels;
                    news[a].channels = NewsChannels.formatNewsChannels(categoryChannelList, channels);
                }
                callBack(null,news);
            }

        ],function(err,resultSet){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                news:resultSet
            }
            res.status(200).json(outPut);
        })


    },

    /**
     * Get all news Cats. Including user favourites
     * @param req
     * @param res
     */
    allNewsCategories:function(req,res){
        var News = require('mongoose').model('News'),
            userFavNews = require('mongoose').model('favourite_news_categories');

        var userId = CurrentSession.id;


    },

    /**
     * Delete a News Category
     * @param req
     * @param res
     */
    deleteNewsCategory:function(req,res){

        var News = require('mongoose').model('News');

        var _categoryId = req.body.categoryId;

        //TODO: Category Image Delete from folder part

        News.deleteNewsCategory(_categoryId,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addNewsChannel:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.body.categoryId;
        var channelName = req.body.channelName;
        var channelUrl = req.body.channelUrl;
        var channelImage = req.body.channelImage;

        //TODO: Channel Image Upload part

        var channel = {
            name:channelName,
            channel_image:channelImage,
            url:channelUrl
        };

        News.addRecordToSubDocument({_id:categoryId},{channels:channel},function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    getNewsChannels:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.params.category;

        var criteria = {
            search:{_id:categoryId},
            return_fields:{channels:1} // for now only getting channels
        };


        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    deleteNewsChannel:function(req,res){

        var News = require('mongoose').model('News');

        var _categoryId = req.body.categoryId;
        var _channelId = req.body.channelId;

        //TODO: Channel Image Delete from folder part

        var criteria = {
            _id:_categoryId
        };

        var pullData = {
            channels:{_id:_channelId}
        };

        News.removeRecordFromSubDocument(criteria, pullData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addNews:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.body.categoryId;
        var channelId = req.body.channelId;
        var articleHeading = req.body.articleHeading;
        var articleContent = req.body.articleContent;
        var articleImage = req.body.articleImage;
        var articleDate = req.body.articleDate;


        var article = {
            heading:articleHeading,
            article_image:articleImage,
            content:articleContent,
            article_date:articleDate
        };

        var criteria = {
            "_id":categoryId,
            "channels._id": channelId
        };
        News.addRecordToSubDocument(criteria,{"channels.$.articles":article},function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    getNews:function(req,res){

        var News = require('mongoose').model('News');

        var categoryId = req.params.category;
        var channelId = req.params.channel;

        var criteria = {
            search:{
                _id:categoryId,
                channels: { $elemMatch: { _id: channelId }}
            },
            return_fields:{"channels.$.articles":1} // for now only getting channels
        };


        News.findNews(criteria,function(resultSet){
            res.status(200).json(resultSet);
        });

    },

    deleteNews:function(req,res){

        var News = require('mongoose').model('News');

        //var _categoryId = req.body.categoryId;
        //var _channelId = req.body.channelId;
        //var _articleId = req.body.articleId;

        var _categoryId = "56cbeb3d703431a80ab2e1c4";
        var _channelId = "56cbf9643f65367f0e8f19f2";
        var _articleId = "56cc2e8fbefd3610158776eb";

        //TODO: Article Image Delete from folder part

        var criteria = {
            _id:_categoryId,
            "channels._id": _channelId
        };

        var pullData = {
            "channels.$.articles":{_id:_articleId}
        };

        News.removeRecordFromSubDocument(criteria, pullData,function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    addToFavourite:function(req,res){

        var FavouriteNewsCategory = require('mongoose').model('FavouriteNewsCategory'),
            news_categories = [],
            now = new Date(),
          CurrentSession = Util.getCurrentSession(req);

        //REMOVE IF ALREADY DID FAVOURITE
        if(req.body.fav == 1){

            var param ={
                user_id: Util.toObjectId(CurrentSession.id),
                category: Util.toObjectId(req.body.nw_cat_id),
            }
            FavouriteNewsCategory.unFavourite(param,function(resultSet){
                var outPut = {};
                if (resultSet.status !== 200) {
                    outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                    res.status(400).send(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).json(outPut);
            });
        }else{
            news_categories.push(req.body.nw_cat_id);
            FavouriteNewsCategory.addUserNewsCategory(CurrentSession.id,news_categories,[],function(resultSet){
                var outPut = {};
                if (resultSet.status !== 200) {
                    outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                    res.status(400).send(outPut);
                    return 0;
                }

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).json(outPut);
                return 0;
            });
        }


    },

    /**
     * Get users saved articles from the database
     * @param req
     * @param res
     */
    getMyNews:function(req,res){
        var News = require('mongoose').model('News'),
            _async = require('async'),
            SubscribedNews = require('mongoose').model('SubscribedNews'),
            UsersSavedArticle = require('mongoose').model('UsersSavedArticle'),
            CurrentSession = Util.getCurrentSession(req);

        var user_id=CurrentSession.id;

        var dateArr = DateTime.oneWeekDate();

        _async.waterfall([
            function getMySavedArticles(callBack){

                var criteria ={
                    user_id:user_id,
                    created_at:{
                        $gte:dateArr.weekAgo,
                        $lte:dateArr.today
                    }
                };
                UsersSavedArticle.findSavedArticle(criteria,function(resultSet){
                    callBack(null,resultSet.news_list);
                })

            },
            function getSubscribedNewsCategories(saved_articles, callBack){
                var criteria = {
                    user_id: Util.toObjectId(user_id)
                };

                SubscribedNews.getTopicsByUser(criteria, function (resultSet) {
                    var __topics = (typeof resultSet.topics != "undefined") ? resultSet.topics : [];
                    callBack(null, saved_articles, __topics);
                });

            },
            function getSubscribedNewsChannels(saved_articles,newsCategories,callBack){
                var subscribedChannels = [];
                _async.eachSeries(newsCategories, function(_topic, topicsCallBack){

                    var criteria = {
                        user_id: CurrentSession.id.toString(),
                        topic_id: _topic.category_id.toString()
                    };

                    SubscribedNews.cache_getNewsChannels(criteria, null, function (r) {
                        if(typeof r.result != "undefined" && r.result != null && r.result.length > 0){
                            var tempChannels = subscribedChannels.concat(r.result);
                            subscribedChannels = tempChannels;
                        }
                        topicsCallBack(null);
                    });

                }, function(err){
                    callBack(null, saved_articles, subscribedChannels);
                });
            },
            function formatSubscribedChannels(saved_articles,subscribedChannels,callBack){
                var _formattedChannels = [];

                for(var x = 0;x < subscribedChannels.length; x++){
                    var _channel = subscribedChannels[x];

                    if(_channel.url != ""){
                        var _channelObj = {
                            id: _channel.channel_id,
                            name: _channel.channel_name,
                            url: _channel.url
                        };
                        var articles = [];
                        for(var y = 0; y < saved_articles.length; y++){
                            if(saved_articles[y].article.channel == _channel.channel_name){
                                var _article = {
                                    heading:saved_articles[y].article.heading,
                                    article_date:saved_articles[y].article.article_date
                                };
                                articles.push(_article);
                            }
                        }
                        _channelObj.articles = articles;
                        _formattedChannels.push(_channelObj)
                    }
                }
                callBack(null,_formattedChannels);
            }
        ],function(err,resultSet){

            NewsFeed.getNewsFeed(resultSet, function(data){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    news:data
                };
                res.status(200).json(outPut);
            });
        })
    },

    /**
     * Save news Articles
     * @param req
     * @param res
     */
    saveMyNews:function(req,res){

        var SavedArticle = require('mongoose').model('SavedArticle'),
            UsersSavedArticle = require('mongoose').model('UsersSavedArticle'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req);

        var criteria ={
            heading:req.body.heading,
            article_date:req.body.article_date,
            channel:req.body.channel
        };

        var checkForAvailability = false;

        _async.waterfall([
            function saveArticle(callBack){
                SavedArticle.findSavedArticle(criteria,function(resultSet){
                    if(resultSet.news_list.length>0){
                        checkForAvailability = true;
                        callBack(null, resultSet.news_list[0]._id);
                    }else{
                        SavedArticle.saveArticle(req.body,function(resultSet){
                            callBack(null, resultSet.article._id);
                        });
                    }
                });
            },
            function saveUsersArticle(article_id,callBack){
                var data = {
                    user_id:CurrentSession.id,
                    article:article_id
                };
                if(checkForAvailability){

                    UsersSavedArticle.checkSavedArticle(data, function(resultSet){

                        if(resultSet.result == 0){
                            UsersSavedArticle.saveArticle(data, function(resultSet){
                                callBack(null);
                            });
                        }else{
                            callBack(null);
                        }

                    })
                }else{
                    UsersSavedArticle.saveArticle(data, function(resultSet){
                        callBack(null);
                    });
                }
            }

        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });

    },
    /**
     * Get saved Articles
     * @param req
     * @param res
     */

    getSavedArticles:function(req,res){
        var UsersSavedArticle = require('mongoose').model('UsersSavedArticle'), CurrentSession = Util.getCurrentSession(req);

        var criteria ={
            user_id:CurrentSession.id
        }
        UsersSavedArticle.findSavedArticle(criteria,function(resultSet){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                news_list:resultSet.news_list
            }
            res.status(200).json(outPut);
        })
    },

    /**
     * Save News Channel to User
     * @param req
     * @param res
     */

    addChannelByUser:function(req,res){
        var NewsChannels = require('mongoose').model('NewsChannels'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req);

        var _newsChannel = {
            channel_id:req.body.__channel_id,
            category_id:Util.toObjectId(req.body.__category_id),
            user_id:Util.getCurrentSession(req).id,
            created_at: new Date()
        };

        _async.waterfall([

            function isAlreadyAddedChannel(callBack) {
                NewsChannels.isChannelExistsForUser(_newsChannel, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function (isAdded, callBack) {
                if(!isAdded){
                    NewsChannels.addChannelByUser(_newsChannel,function(resultSet){
                        callBack(null);
                    });
                }else {
                    callBack(null);
                }
            }

        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });
    },

    /**
     * Remove News Channel to User
     * @param req
     * @param res
     */

    removeChannelByUser:function(req,res){
        var NewsChannels = require('mongoose').model('NewsChannels'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req);

        var _newsChannel = {
            channel_id:req.body.__channel_id,
            user_id:Util.getCurrentSession(req).id
        };

        _async.waterfall([

            function isAlreadyAddedChannel(callBack) {
                NewsChannels.isChannelExistsForUser(_newsChannel, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function (isAdded, callBack) {
                if(isAdded){
                    NewsChannels.removeChannelByUser(_newsChannel,function(resultSet){
                        callBack(null);
                    });
                }else {
                    callBack(null);
                }
            }

        ],function(err){
            var outPut ={
                status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });
    }

};

module.exports = NewsController;
