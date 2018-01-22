/**
 * Like controller
 */
var NewsChannelController ={

    /**
     * Retrieve News Channel by Category
     * @param req
     * @param res
     */

    getChannelByCategory:function(req,res){
        var _async = require('async'),
            News = require('mongoose').model('News'),
            NewsChannels = require('mongoose').model('NewsChannels');

        var _category_id = req.params.category_id;

        _async.waterfall([
            function isESIndexExists(callBack) {
                News.es_isNewsCategoryExists(_category_id, function (esResultSet) {
                    callBack(null, esResultSet);
                });
            },
            function getESNewsCategories(isExists, callBack) {
                if(isExists) {
                    News.es_getNewsCategories(_category_id, function (esResultSet) {
                        callBack(null, esResultSet.result[0].channel_list);
                    });
                }else{
                    callBack(null, []);
                }
            }
        ],function(err, resultSet){
            if (err) {
                console.log(err);
                return;
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                channels: resultSet
            }
            res.status(200).json(outPut);
        });

    },


    /**
     * Search News Channel - Suggestions {AutoComplete}
     * @param req
     * @param res
     */

    searchChannelForCategory:function(req,res){
        var _async = require('async'),
            News = require('mongoose').model('News'),
            NewsChannels = require('mongoose').model('NewsChannels'),
            _grep = require('grep-from-array'), CurrentSession = Util.getCurrentSession(req),
            _arrIndex = require('array-index-of-property');

        var _category_id = req.params.category_id;
        var _channel_name = req.params.channel_name;

        var formatted_channels = [];

        _async.waterfall([
            function isESIndexExists(callBack) {
                News.es_isNewsCategoryExists(_category_id, function (esResultSet) {
                    callBack(null, esResultSet);
                });
            },
            function getESNewsCategories(isExists, callBack) {
                if(isExists) {
                    News.es_getNewsCategories(_category_id, function (esResultSet) {
                        callBack(null, esResultSet.result[0].channel_list);
                    });
                }else{
                    callBack(null, []);
                }
            },
            function formatSuggestions(channelList, callBack) {
                if(channelList.length > 0){

                    _async.waterfall([
                        function es_getSuggestions(callBack) {
                            var criteria = {
                                category_id: _category_id,
                                q:'name:'+_channel_name+'*'
                            };
                            NewsChannels.es_getNewsChannelsSuggestions(criteria, function (ch_suggestions) {

                                var channelsByCategory = [];

                                for(var inc = 0; inc < channelList.length; inc++){

                                    var grep_channels = _grep(ch_suggestions, function (e) {
                                        return e._id == channelList[inc];
                                    });

                                    if(grep_channels[0] != null) {
                                        channelsByCategory.push(grep_channels[0]);
                                    }
                                }

                                callBack(null, channelsByCategory);
                            });
                        },
                        function getDBChannelsByUser(channels_by_category, callBack) {

                            NewsChannels.getChannelsByUser(CurrentSession.id, function (dbResults) {
                                var db_channels = dbResults.channel_list;

                                for(var inc = 0; inc < db_channels.length; inc++){
                                    var index = channels_by_category.indexOfProperty('_id', db_channels[inc].channel_id.toString());

                                    if(index != -1) {
                                        channels_by_category.splice(index, 1);
                                    }

                                }

                                formatted_channels = channels_by_category;

                                callBack(null);

                            });

                        }
                    ],function(err){
                        callBack(null);
                    });

                }else{
                    callBack(null);
                }
            }
        ],function(err){
            if (err) {
                console.log(err);
                return;
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                channels: formatted_channels
            }
            res.status(200).json(outPut);
        });

    }

};

module.exports = NewsChannelController;