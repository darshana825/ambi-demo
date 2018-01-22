'use strict';

/**
 * TODO: This class is for temporary usage only. This is just for  take  hard coded news  articles. Entire class need to be re do based on the requirment
 *
 */
var SubscribedNewsController = {
    /**
     * Get new topics subscribed by the user
     * @param req
     * @param res
     */
    subscribeToNewsTopics:function(req,res){

        var SubscribedNews = require('mongoose').model('SubscribedNews'),
            _async = require('async');

        var userLoggedIn = Util.getCurrentSession(req),
            _topicIds = req.body._topic_ids;

        var __subscribed_topics = [], now = new Date();

        for(var i = 0; i < _topicIds.length; i++){
            __subscribed_topics.push({
                user_id: Util.toObjectId(userLoggedIn.id),
                news_category_id: Util.toObjectId(_topicIds[i]),
                news_channels: [],
                created_at: now,
                updated_at: now
            });
        }

        SubscribedNews.addTopicsByUser(__subscribed_topics, function (resultSet) {
            var outPut ={};
            if(resultSet.status == 200){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else {
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).send(outPut);
            }
        });

    },

    /**
     * Get new topics subscribed by the user
     * @param req
     * @param res
     */
    unsubscribeNewsTopic: function(req,res){

        var SubscribedNews = require('mongoose').model('SubscribedNews'),
            _async = require('async');

        var userLoggedIn = Util.getCurrentSession(req),
            _topicIds = req.body._topic_ids;

        var __unsubscribed_topics = [], now = new Date();

        for(var i = 0; i < _topicIds.length; i++){
            __unsubscribed_topics.push(Util.toObjectId(_topicIds[i]));
        }

        var __criteria = {
            user_id: userLoggedIn.id,
            news_category_id: {$in: __unsubscribed_topics}
        }

        _async.waterfall([
            function updateDB(callBack){
                SubscribedNews.removeNewsTopic(__criteria, function (resultSet) {
                    callBack(null);
                });
            },
            function removeAllChannelsByTopicES(callBack){
                _async.eachSeries(_topicIds, function(topic_id, topicsCallBack){
                    var criteria = {
                        user_id: userLoggedIn.id,
                        topic_id: topic_id
                    };

                    _async.waterfall([
                        function getSubscribedChannels(callBack){
                            var _es_criteria = {
                                    user_id: Util.toObjectId(userLoggedIn.id),
                                    topic_id: topic_id
                                };
                            SubscribedNews.cache_getNewsChannels(_es_criteria, null, function (esResult) {
                                var _subscribedChannels = (typeof esResult != "undefined" && esResult != null) ? esResult.result : [];
                                callBack(null, _subscribedChannels);
                            });
                        },
                        function unsubscribeChannels(subscribedChannels, callBack){
                            _async.eachSeries(subscribedChannels, function(_channel, channelsCallBack){
                                var criteria = {
                                    user_id: userLoggedIn.id,
                                    topic_id: topic_id,
                                    channel_id: _channel.channel_id
                                };

                                SubscribedNews.cache_removeNewsChannel(criteria, function (r) {
                                    channelsCallBack(null);
                                });

                            }, function(err){
                                callBack(null);
                            });
                        }
                    ], function (err) {
                        topicsCallBack(null);
                    });

                }, function(err){
                    callBack(null);
                });
            }
        ], function (err) {
            var outPut ={};
            if(!err){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else {
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).send(outPut);
            }
        });

    },

    /**
     * Get new topics subscribed by the user
     * @param req
     * @param res
     */
    getSubscribedNewsTopics:function(req,res){

        var userLoggedIn = Util.getCurrentSession(req);
        var SubscribedNews = require('mongoose').model('SubscribedNews'),
            _async = require('async');

        var criteria = {
            user_id: Util.toObjectId(userLoggedIn.id)
        };

        _async.waterfall([
            function getSubscribedNews(callBack){
                SubscribedNews.getTopicsByUser(criteria, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function getSubscribedChannels(resultSet, callBack){
                var __topics = (typeof resultSet.topics != "undefined") ? resultSet.topics : [];
                var _formattedTopics = [];
                _async.eachSeries(__topics, function(topic, topicsCallBack){
                    var _topicData = topic,
                        _es_criteria = {
                        user_id: Util.toObjectId(userLoggedIn.id),
                        topic_id: topic.category_id
                    };
                    SubscribedNews.cache_getNewsChannels(_es_criteria, null, function (esResult) {
                        _topicData['subscribed_channels'] = (typeof esResult != "undefined" && esResult != null) ? esResult.result : [];
                        _formattedTopics.push(_topicData);
                        topicsCallBack(null);
                    });
                }, function(err){
                    callBack(null, _formattedTopics);
                });
            }
        ], function (err, resultSet) {
            var outPut ={};
            if(!err){
                outPut['topics'] = resultSet;
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).send(outPut);
            }
        });
    },

    /**
     * Add news channel to a subscribed topic
     * @param req
     * @param res
     */
    addNewsChannels:function(req,res){

        var SubscribedNews = require('mongoose').model('SubscribedNews'),
            News = require('mongoose').model('News'),
            _async = require('async'), _grep = require('grep-from-array');

        var userLoggedIn = Util.getCurrentSession(req),
            _topicId = req.body._topic_id, _newChannelIds = req.body._news_channels;

        var __criteria = {
            news_category_id: Util.toObjectId(_topicId),
        },__news_channels = [];

        for(var i = 0; i < _newChannelIds.length; i++){
            __news_channels.push(_newChannelIds[i]);
        }

        _async.waterfall([
            function updateDB(callBack){
               SubscribedNews.addNewsChannels(__criteria, {news_channels: {$each: __news_channels}}, function (resultSet) {
                    callBack(null);
                });
            },
            function updateES(callBack){
                _async.eachSeries(__news_channels, function(channel_id, channelsCallBack){

                    _async.waterfall([
                        function getTopicDataByChannel(callBack){
                            var criteria = {
                                search: {
                                    channels: {$elemMatch: { _id: channel_id }}
                                }
                            };

                            News.findNews(criteria, function (resultSet) {
                                callBack(null, resultSet.news_list[0]);
                            });
                        },
                        function cache_updateUserChannel(topicData, callBack){
                            var criteria = {
                                user_id: userLoggedIn.id.toString(),
                                topic_id: _topicId
                            }, es_channelData = {
                                topic_id: topicData._id,
                                topic_name: topicData.category
                            };

                            var _readingChannel = _grep(topicData.channels, function (e) {
                                return e._id.toString() == channel_id.toString();
                            });

                            if (_readingChannel[0] != null) {
                                es_channelData['channel_id'] = _readingChannel[0]._id.toString();
                                es_channelData['channel_name'] = _readingChannel[0].name;
                                es_channelData['url'] = _readingChannel[0].url;
                                es_channelData['channel_image'] = _readingChannel[0].channel_image;
                            }

                            SubscribedNews.cache_addNewsChannels(criteria, es_channelData, function (resultSet) {
                                callBack(null);
                            });
                        }
                    ], function (err) {
                        channelsCallBack(null);
                    });

                }, function(err){
                    callBack(null);
                });
            }
        ], function (err) {
            var outPut ={};
            if(!err){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else {
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).send(outPut);
            }
        });
    },

    /**
     * Add news channel to a subscribed topic
     * @param req
     * @param res
     */
    getSubscribedNewsChannel:function(req,res){

        var SubscribedNews = require('mongoose').model('SubscribedNews'),
            News = require('mongoose').model('News'),
            _async = require('async'), _grep = require('grep-from-array');

        var userLoggedIn = Util.getCurrentSession(req), _topicId = req.query['_topic_id'];

        var criteria = {
            user_id: userLoggedIn.id.toString(),
            topic_id: _topicId
        };

        SubscribedNews.cache_getNewsChannels(criteria, null, function (r) {
            var outPut ={};
            if(r != null){
                outPut['channels'] = r.result;
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).send(outPut);
            }
        });
    },

    /**
     * Add news channel to a subscribed topic
     * @param req
     * @param res
     */
    removeNewsChannels:function(req,res){

        var SubscribedNews = require('mongoose').model('SubscribedNews'),
            _async = require('async');

        var userLoggedIn = Util.getCurrentSession(req),
            _topicId = req.body._topic_id, _newChannelIds = req.body._news_channels;

        var __criteria = {
            user_id: Util.toObjectId(userLoggedIn.id),
            news_category_id: Util.toObjectId(_topicId),
        };

        _async.waterfall([
            function updateDB(callBack){
                SubscribedNews.removeNewsChannels(__criteria, {news_channels: {$in: _newChannelIds}}, function (resultSet) {
                    callBack(null);
                });
            },
            function updateES(callBack) {
                _async.eachSeries(_newChannelIds, function(_channel, channelsCallBack){
                    var criteria = {
                        user_id: userLoggedIn.id,
                        topic_id: _topicId,
                        channel_id: _channel
                    };

                    SubscribedNews.cache_removeNewsChannel(criteria, function (r) {
                        channelsCallBack(null);
                    });

                }, function(err){
                    callBack(null);
                });
            }
        ], function (err) {
            var outPut ={};
            if(!err){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else {
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(400).send(outPut);
            }
        });

    },
};

module.exports = SubscribedNewsController;