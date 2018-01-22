/**
 * This is Life event Model
 */


'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


var LifeEventSchema = new Schema({
    cat_id:{
        type: Schema.ObjectId,
        ref: 'LifeEventCategory',
        default:null
    },
    name:{
        type:String,
        trim:true
    },
    status:{
        type:Number,
        default:1
    }

},{collection:"life_events"});


LifeEventSchema.statics.getLifeEventsByCategory = function(categoryId,callBack){

    var criteria = {
        status:1
    }
    if(typeof categoryId != 'undefined'){
        criteria['cat_id'] = Util.toObjectId(categoryId)
    }

    this.find(criteria,{name:1,_id:1,cat_id:1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                life_events:resultSet
            });
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    })

}


mongoose.model('LifeEvent',LifeEventSchema);