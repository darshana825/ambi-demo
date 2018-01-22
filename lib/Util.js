/**
 * Utill js file
 */

var Util = {
    /**
     * Get image Detaild from base 64 image data
     * @param dataString
     * @returns {*}
     */
    decodeBase64Image:function(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if(matches != null){

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.extension = Mimetypes[response.type.toLocaleLowerCase()];
            response.data = new Buffer(matches[2], 'base64');
        } else{
            var matches = dataString.split(";base64,");
            var mimetype = matches[0].split("data:");

            response.type = mimetype[1];
            response.extension = Mimetypes[response.type.toLocaleLowerCase()];
            response.data = new Buffer(matches[1], 'base64');
        }
        return response;
    },
    /**
     * Convert String to Object Id
     * @param id
     * @returns {*|ObjectID}
     */
    toObjectId:function(id){
        var ObjectId = (require('mongoose').Types.ObjectId);
        return new ObjectId(id.toString());
    },
    /**
     * Random Number Generate based
     * @param length
     * @returns {string}
     * @constructor
     */
    IDGenerator:function(str_lenght) {

        var length = str_lenght,
            timestamp = +new Date,
            ts = timestamp.toString(),
            parts = ts.split( "" ).reverse(),
            id = "";

        for( var i = 0; i < length; ++i ) {
            var max     = parts.length - 1,
                index   = Math.floor( Math.random() * ( max - 0 + 1 ) ) + 0;
            id += parts[index];
        }

        return id;
    },
    /**
     * Get Unique User name
     */
    getUniqueUserName:function(data){
        //console.log(this.formData.fName.replace(/ /g,''));
       return data.first_name.replace(/ /g,'').toLowerCase()+"."+data.last_name.replace(/ /g,'').toLowerCase()+"."+this.IDGenerator(5);

    },
    /**
     * Get Random Numbers given range
     * @param min
     * @param max
     */
    getRandomInt:function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getRandomResults:function(params){
        var _random_numbers = [],
            resultSet =[];

        if(params.result_set.length <= 0){
            return resultSet
        }
        while(_random_numbers.length < params.random_number_count){
            var randomNumber= this.getRandomInt(params.min,params.max)
            var found=false;
            for(var i=0;i<_random_numbers.length;i++){
                if(_random_numbers[i]==randomNumber){found=true;break}
            }
            if(!found){
                _random_numbers[_random_numbers.length]=randomNumber;
                resultSet.push(params.result_set[randomNumber])
            }
        }

        return resultSet;




    },
    addToSession:function(req,data){
        req.session.user = JSON.stringify(data);
    },
    getCurrentSession:function(req){
        return JSON.parse(req.session.user);
    },


    /*
    * Sort Array Object by Key*/
    sortByKeyASC: function (array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    },
    sortByKeyDES: function (array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    },



    /**
     * Get image Detaild from base 64 image data
     * @param dataString
     * @returns {*}
     */
    //decodeBase64Document:function(dataString) {
    //    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    //        response = {};
    //
    //    if (matches.length !== 3) {
    //        return new Error('Invalid input string');
    //    }
    //    var imgExt = {
    //        "image/gif" : ".gif",
    //        "image/jpg" : ".jpg",
    //        "image/png" : ".png",
    //        "image/jpeg" : ".jpeg"
    //    }
    //    response.type = matches[1];
    //    response.extension = imgExt[response.type.toLocaleLowerCase()];
    //    response.data = new Buffer(matches[2], 'base64');
    //
    //    return response;
    //},



}



module.exports = Util;