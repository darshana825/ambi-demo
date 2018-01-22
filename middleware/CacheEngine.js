
var CacheEngine ={
	
	_cacheClient:null,
	init:function(){
		var CacheClient = require('redis');
		this._cacheClient = CacheClient.createClient(Config.CACHE_PORT,Config.CACHE_HOST);
        this._cacheClient.on('connect', function() {
            console.log("CONNECTED TO CACHE_HOST ON :",Config.CACHE_HOST,Config.CACHE_PORT);
        });

	},

	/**
	 * Prepare cache key based on the parameter that pass.  
	 * @param object
	 */
	prepareCacheKey:function(_cacheKey){

		return _cacheKey;
		
	},
	/**
	 * Get cache Data based on the cache key
	 * @param cacheKey 
	 * return callBack
	 */
	getCachedDate:function(cacheKey,callBack){
		this._cacheClient.get(cacheKey,function(err,cacheData){
			if( err ){
                console.log(err)
				callBack(null);
			}else{
				callBack(JSON.parse(cacheData));
			}
		});
	},

	/**
	 * Add Data to the cache based on the cache key
	 * @param cacheKey
	 * @data Data set
	 */
	addToCache:function(cacheKey,data,callBack){
        var _cacheData=[];

        _cacheData.push(cacheKey);
        _cacheData.push(JSON.stringify(data));

		this._cacheClient.set(_cacheData,function(err,cacheData){
			if( err ){
				console.log(err);
				callBack(err);
			}else{
				console.log("ADD TO RADIS CACHE -- SUCCESS");
				callBack(cacheData);
			}
		});

	},

    /**
     * Update Cache Data
     * @param cacheKey
     * @param data
     * @param callBack
     */
    updateCache:function(cacheKey,data,callBack){
        var _this = this;

        _this.addToCache(cacheKey,data,function(err){
            _this.getCachedDate(cacheKey,function(cachedData){
                callBack(cachedData);
            })
        });
    },

    /**
     * Delete Items from memcache
     * @param key
     * @param callBack
     */
    deleteCache:function(key,callBack){

        this._cacheClient.del(key, function(err, result){

            if( err ){
                console.log(err);
                callBack(err);
            }else{
                console.log("DELETE FROM THE CACHE -- SUCESS");
                callBack(result);
            }

        });
    },
    /**
     * Add Data to the Top of the List
     * @param key
     * @param data
     */
    addTopToList:function(key,data,callBack){
        var _data = JSON.stringify(data);
        this._cacheClient.lpush(key,_data,function(err, result){
            if( err ){
                console.log(err);
                callBack(err);
            }else{
                console.log("ADD TO LIST");
                callBack(result);
            }

        });
    },
    /**
     * Get Cache List Count
     * @param key
     * @param callBack
     */
    getListCount:function(key,callBack){
        this._cacheClient.llen(key,function(err, result){
            if( err ){
                console.log(err);
                callBack(err);
            }else{
                callBack(result);
            }

        });
    },
    getList:function(key,page,index,callBack){
        var _this = this;
        _this.getListCount(key,function(length){
            var _out_put = {
                result_count:Number(length)
            };

            _this._cacheClient.lrange(key,page,index,function(err,result){
                if( err ){
                    console.log(err);
                    callBack(err);
                }else{
                    _out_put['result'] = [];
                    for(var a =0;a<result.length;a++){
                        _out_put['result'].push(JSON.parse(result[a]));
                    }

                    callBack(_out_put);
                }
            })

        })
    },
    /**
     * Add Data to Bottom of the list
     * @param key
     * @param data
     * @param callBack
     */
    addBottomToList:function(key,data,callBack){
        var _data = JSON.stringify(data);
        this._cacheClient.rpush(key,_data,function(err, result){
            if( err ){
                console.log(err);
                callBack(err);
            }else{
                console.log("ADD TO LIST");
                callBack(result);
            }

        });
    },

    /**
     * Add data to Zadd
     * @param key
     * @param index
     * @param data
     * @param callBack
     */
    zAdd:function(key,index,data,callBack){
        var _data = JSON.stringify(data);
        var timestamp = new Date().getUTCMilliseconds();
        this._cacheClient.zadd(key,timestamp,_data,function(err, result){
            if( err ){
                console.log(err);
                callBack(err);
            }else{
                console.log("ADD TO LIST");
                callBack(result);
            }

        });
    },

    deleteFromList:function(key,data,callback){

        this._cacheClient.lrem(key, 1, data, function(err, result){
            if( err ){
                console.log(err);
                callback(err);
            }else{
                console.log("Delete from LIST");
                callback(result);
            }
        })
    }
};

module.exports = CacheEngine;
