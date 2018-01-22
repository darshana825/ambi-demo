/**
 * This is Life Event Category model
 */


'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


var LifeEventCategorySchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    status:{
        type:Number,
        default:1
    }

},{collection:"life_event_categories"});


LifeEventCategorySchema.statics.getLifeEventCategories = function(callBack){

    this.find({status:1},{name:1,_id:1}).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                life_event_categories:resultSet
            });
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    })

}

mongoose.model('LifeEventCategory',LifeEventCategorySchema);