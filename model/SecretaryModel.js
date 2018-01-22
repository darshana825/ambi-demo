/**
 * Secretary Model will communicate with secretaries collection
 */

 'use strict'
var  mongoose = require('mongoose'),
     Schema   = mongoose.Schema;


var SecretarySchema = new Schema({
	full_name:{
		type:String,
	},
	gender:{
		type:String //M - Male | F- Female
	},
	image_name:{
		type:String 
	},
	created_at:{
		type:Date
	},
	upadted_at:{
		type:Date
	}

},{collection:"secretaries"});

SecretarySchema.pre('save', function(next){
  var now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});


SecretarySchema.statics.getSecreties =function(callBack){
	var _this = this;
	_this.find({})
		.exec(function(err,resultSet){
			if(! err){

				var secrataries = [];

				for(var i =0; i < resultSet.length;i++ ){
					secrataries.push({
						id:resultSet[i]._id,
						full_name:resultSet[i].full_name,
						gender:resultSet[i].gender,
						image_name:Config.CDN_URL+"static/"+resultSet[i].image_name
					});
				}

				callBack(secrataries);
			}else{
				console.log(err)
				callBack({status:400,error:err})
			}
		});
}

/**
 * Get Secretary by Id
 * @param id
 * @param callBack
 */
SecretarySchema.statics.getSecretaryById=function(id,callBack){

    this.findOne({_id:id}).
        exec(function(err,resultSet){
        if(! err){

            var secrataries = {
                id:resultSet._id,
                full_name:resultSet.full_name,
                gender:resultSet.gender,
                image_name:Config.CDN_URL+"static/"+resultSet.image_name
            };


            callBack(secrataries);
        }else{
            console.log(err)
            callBack({status:400,error:err})
        }
    });
}


mongoose.model('Secretary',SecretarySchema);