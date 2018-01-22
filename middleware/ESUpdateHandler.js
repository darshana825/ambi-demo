/**
 * Created by phizuupc on 10/5/2016.
 */

var ES = require('./ES');

var ESUpdateHandler = {

    init: function () {
        this.updateConnectedTime(function (payload) {
        });
        // this.updateChannelList(function (payload) {
        // });
    },

    updateConnectedTime: function (callBack) {
        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User');

        _async.waterfall([

            function getAllUsers(callBack) {
                var q = '*';

                User.getAllUsers(q, '', function (resultSet) {
                    callBack(null, resultSet.users);
                });
            },
            function (allUsers, callBack) {

                _async.eachSeries(allUsers, function (user, callBack) {
                    _async.waterfall([
                        function isConnected(callBack) {
                            var status = ConnectionStatus.REQUEST_ACCEPTED;
                            Connection.getFriends(user.user_id, status, function (myFriendIds) {
                                callBack(null, myFriendIds);
                            });
                        },
                        function updateESIndex(connectionStatus, callBack) {
                            var friends = connectionStatus.friends,
                                friends_ids = connectionStatus.friends_ids;
                            if (friends_ids.length > 0) {
                                var _cache_key = ConnectionConfig.ES_INDEX_NAME + user.user_id;
                                var query = {
                                    index: _cache_key
                                };
                                ES.search(query, function (esConnections) {
                                    var esResult = esConnections.result;
                                    _async.eachSeries(esResult, function (esUser, callBack) {
                                        if (typeof esUser.connected_at == 'undefined') {
                                            if (typeof friends[esUser.user_id] != 'undefined' &&
                                                typeof friends[esUser.user_id].updated_at != 'undefined') {
                                                esUser['connected_at'] = friends[esUser.user_id].updated_at;

                                                var payLoad = {
                                                    index: _cache_key,
                                                    id: esUser.user_id,
                                                    type: 'connections',
                                                    data: esUser
                                                }

                                                ES.update(payLoad, function (resultSet) {
                                                    callBack(null);
                                                });
                                            } else {
                                                callBack(null);
                                            }
                                        } else {
                                            callBack(null);
                                        }
                                    }, function (err) {
                                        callBack(null);
                                    });
                                });
                            } else {
                                callBack(null);
                            }
                        }
                    ], function (err) {
                        callBack(null);
                    });
                }, function (err) {
                    callBack(null);
                });
            }
        ], function (err) {
            callBack(null);
        });
    },

    updateChannelList: function (callBack) {
        var _async = require('async'),
            News = require('mongoose').model('News'),
            NewsChannels = require('mongoose').model('NewsChannels');

        _async.waterfall([
            function getAllCategories(callBack) {
                var criteria = {};

                News.findNews(criteria, function (resultSet) {
                    callBack(null, resultSet.news_list);
                });
            },
            function getESChannels(categories, callBack) {
                _async.eachSeries(categories, function (category, callBack) {
                    //console.log("======Category======")
                    //console.log(category)
                    _async.waterfall([
                        function isESIndexExists(callBack) {
                            News.es_isNewsCategoryExists(category._id, function (esResultSet) {
                                callBack(null, esResultSet);
                            });
                        },
                        function createOrUpdateESCategories(isExists, callBack) {
                            var formatted_channel_list = [];

                            for (var i = 0; i < category.channels.length; i++) {
                                formatted_channel_list.push(category.channels[i]._id);
                            }

                            var payLoad = {
                                category_id: category._id,
                                data: {
                                    channel_list: formatted_channel_list
                                }
                            };

                            if (!isExists) {
                                News.ch_newsCategoryCreateIndex(payLoad, function (esResultSet) {
                                    callBack(null);
                                });
                            } else {
                                News.ch_newsCategoryUpdateIndex(payLoad, function (esResultSet) {
                                    callBack(null);
                                });
                            }
                        },
                        function createOrUpdateESChannels(callBack) {

                            _async.eachSeries(category.channels, function (channel, callBack) {
                                //console.log("======Channel======")
                                //console.log(channel)

                                _async.waterfall([

                                    function isESIndexExists(callBack) {

                                        var payLoad = {
                                            category_id: category._id,
                                            channel_name: channel.name
                                        };

                                        NewsChannels.es_isChannelExists(payLoad, function (esResultSet) {
                                            callBack(null, esResultSet);
                                        });
                                    },
                                    function (isExists, callBack) {

                                        var payLoad = {
                                            channel_id: channel._id,
                                            data: channel
                                        };

                                        if (isExists) {
                                            NewsChannels.es_getNewsChannelsByCategory(payLoad, function (esResultSet) {
                                                //console.log(esResultSet);
                                                callBack(null, esResultSet);
                                            });
                                        } else {
                                            NewsChannels.es_createNewsChannelsByCategory(payLoad, function (esResultSet) {
                                                callBack(null, esResultSet);
                                            });
                                        }

                                        callBack(null);
                                    }

                                ], function (err) {
                                    callBack(null);
                                });

                            }, function (err) {
                                callBack(null);
                            });

                        }
                    ], function (err) {
                        callBack(null);
                    });

                }, function (err) {
                    callBack(null);
                });


            }
        ], function (err) {
            callBack(null);
        });
    },

    updateUserOnlineMode: function (payLoad, callBack) {
        ES.update(payLoad, function (resultSet) {
            callBack(resultSet);
        });
    }

};

module.exports = ESUpdateHandler;