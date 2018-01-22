/**
 * This is like model that communicate with likes
 */


'use strict';

var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


//GLOBAL.LikeConfig ={
//    CACHE_PREFIX:"post:like:",
//    RESULT_PER_PAGE:100
//};


var WorkModeSchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    is_work_mode_active:{
        type:Boolean,
        default:false
    },
    news_feed: {
        is_active: {
            type: Boolean,
            default: false
        },
        scheduler: {
            type: String,
            trim: true,
            default: ""
        },
        start_time: {
            type: Date,
            default: null
        },
        end_time: {
            type: Date,
            default: null
        }
    },
    calls:{
        type:Boolean,
        default:false
    },
    messages:{
        type:Boolean,
        default:false
    },
    social_notifications:{
        type:Boolean,
        default:false
    },
    all_notifications:{
        type:Boolean,
        default:false
    },
    selected_option: {
        type:String,
        default:null
    },
    start_time: {
        type:Date,
        default:null
    },
    end_time: {
        type:Date,
        default:null
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }
},{collection:"work_mode"});


WorkModeSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});
/**
 * Add work mode for user
 * @param likes
 * @param callBack
 */
WorkModeSchema.statics.addWorkMode = function(workModeData,callBack){

    var _workMode = new this();
    _workMode.user_id = workModeData.user_id;
    _workMode.is_work_mode_active = workModeData.is_work_mode_active;
    _workMode.news_feed = workModeData.news_feed;
    _workMode.calls = workModeData.calls;
    _workMode.messages = workModeData.messages;
    _workMode.social_notifications = workModeData.social_notifications;
    _workMode.all_notifications = workModeData.all_notifications;
    _workMode.selected_option = workModeData.selected_option;
    _workMode.start_time = workModeData.start_time;
    _workMode.end_time = workModeData.end_time;


    _workMode.save({lean:true},function(err,result){

        if(!err){
            callBack({
                status:200,
                result:result
            });
        }else{
            callBack({status:400,error:err});
        }
    });


};

/**
 * Get Work mode By a given criteria
 * @param criteria
 * @param callBack
 */

WorkModeSchema.statics.getWorkModeByCategory = function(criteria,callBack){

    var _this = this;
    _this.find(criteria).sort({created_at:1}).exec(function (err, resultSet) {
        if (!err) {

            callBack({status: 200, work_mode: resultSet});
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

WorkModeSchema.statics.updateWorkMode = function(criteria,updateData,callBack){

    var _this = this;

    _this.update(criteria,
        {$set:updateData},function(err, resultSet){

            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400, error:err});
            }
        });

};


mongoose.model('WorkMode',WorkModeSchema);
