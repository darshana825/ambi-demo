/**
 * This is Elastic Search Full Stack JS class that help to handle  all the Indexing operations
 */

var ES = {
    esClient: null,
    init: function () {
        var _es = require('elasticsearch');
        this.esClient = new _es.Client({
            host: Config.ES_HOST + ":" + Config.ES_PORT,

        });
        this.esClient.ping({
            requestTimeout: Infinity,
            hello: "PRO!"
        }, function (error) {
            if (error) {
                console.trace('ProGlobe ES cluster is down!');
            } else {
                console.log('ProGlobe ES Up and Runing');
            }
        });
    },
    /**
     *
     * @param callBack
     */
    createIndex: function (payLoad, callBack) {
        var _esData = {
            index: payLoad.index,
            type: payLoad.type,
            id: payLoad.id
        };

        if (typeof payLoad.tag_fields != 'undefined') {
            _esData['tags'] = [];
            for (var i = 0; i < payLoad.tag_fields.length; i++) {
                _esData['tags'].push(payLoad.data[payLoad.tag_fields[i]]);
            }
        }

        _esData['body'] = payLoad.data;
        this.esClient.index(_esData, function (error, response) {
            if (error)
                console.log('===============================================');
                console.log(error);
                console.log('response',response);

            callBack(response);
        });
    },
    /**
     *
     * @param callBack
     */
    update: function (payLoad, callBack) {

        var _esData = {
            index: payLoad.index,
            type: payLoad.type,
            id: payLoad.id
        };

        if (typeof payLoad.tag_fields != 'undefined') {
            _esData['tags'] = [];
            for (var i = 0; i < payLoad.tag_fields.length; i++) {

                _esData['tags'].push(payLoad.data[payLoad.tag_fields[i]]);
            }
        }

        _esData['body'] = {doc: payLoad.data};
        this.esClient.update(_esData, function (error, response) {
            if (error)
                console.log(error);


            callBack(response);


        });
    },
    /***
     *
     * @param payLoad
     * @param callBack
     */
    search: function (payLoad, callBack) {
        var search_param = {
                size: 1000
            },
            _this = this;

        if (typeof payLoad.index != "undefined") {
            search_param['index'] = payLoad.index
        }

        if (typeof payLoad.id != "undefined") {
            search_param['id'] = payLoad.id
        }

        if (typeof payLoad.q != "undefined") {
            search_param['q'] = payLoad.q
        }

        if (typeof payLoad.sort != "undefined") {
            search_param['sort'] = payLoad.sort
        }
        if (typeof payLoad.type != "undefined") {
            search_param['type'] = payLoad.type
        }

        this.esClient.search(search_param).then(function (resp) {
            callBack(_this.formatSearchResult(resp));
        }, function (err) {
            //console.log("ES search error")
            //console.trace(err.message);
            callBack(null)
        });

    },
    formatSearchResult: function (result) {
        //console.log("==============formatSearchResult================")
        var _tmp = {
            result_count: Number(result.hits.total)
        }
        _tmp['result'] = [];
        for (var a = 0; a < result.hits.hits.length; a++) {
            //console.log("=============="+a+"================")
            _tmp['result'].push(result.hits.hits[a]._source);
        }

        return _tmp;
    },
    delete: function (payload, callback) {

        var _esData = {
            index: payload.index,
            type: payload.type,
            id: payload.id
        };

        this.esClient.delete(_esData).then(function (resp) {
            callback(null);
        }, function (err) {
            console.trace(err.message);
            callback(null)
        });

    },
    isIndexExists: function (payload, callback) {
        var _esData = {
            index: payload.index,
            type: payload.type,
            id: payload.id
        }

        this.esClient.exists(_esData, function (error, exists) {
            if (exists === true) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }
};

module.exports = ES;