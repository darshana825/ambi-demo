
'use strict'

var SecretaryController ={

	getSeretaries:function(req,res){
		var Secretary = require('mongoose').model('Secretary');

		Secretary.getSecreties(function(dataSet){
			res.status(200).json(dataSet);
		})
	},

    cacheCheck:function(req,res){

        var _cache_key = CacheEngine.prepareCacheKey(req.param.key);

        CacheEngine.getCachedDate(_cache_key,function(cachedData){
            res.status(200).json(cachedData);
            return 0;
        });

        /**
         * [
         {"value": "New", "onclick": "CreateNewDoc()"},
         {"value": "Open", "onclick": "OpenDoc()"},
         {"value": "Close", "onclick": "CloseDoc()"}
         ];



        CacheEngine.addToCache(_cache_key,menuitem,function(cached){
            console.log(cached);


        }); */

    }

}
module.exports = SecretaryController; 