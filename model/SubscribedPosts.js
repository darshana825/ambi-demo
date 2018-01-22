/**
 * Notification Model will communicate with notifications collection
 */

'use strict'
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Notification
 */
var SubscribedPostSchema = new Schema({
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    post_id:{ // the post that origin user comment / share / like ...
        type: Schema.ObjectId,
        ref: 'Post',
        default:null
    },

},{collection:"subscribed_posts"});

/**
 * Save subscription
 * @param callBack
 */
SubscribedPostSchema.statics.saveSubscribe = function(new_subscription,callBack){

    var subscription = new this();
    subscription.user_id = Util.toObjectId(new_subscription.user_id);
    subscription.post_id = Util.toObjectId(new_subscription.post_id);

    var criteria = {
        user_id:Util.toObjectId(new_subscription.user_id),
        post_id:Util.toObjectId(new_subscription.post_id)
    }
    this.find(criteria).exec(function(err,resultSet){
        
        if(err) {
            callBack({status:400,error:err}); 
        }

        if(resultSet.length == 0){
            subscription.save(function(err, result){
                if(err){
                    console.log("Error occured while creating the subscription.");
                    console.log(err);
                    callBack({status:400,error:err});
                }
                console.log("Success - creating the subscription for user - " + new_subscription.user_id + "; post - " + new_subscription.post_id);
                callBack({
                    status:200,
                    result:result
                });
            });
        }else{
            console.log("Already have a subscription.");
            callBack({
                status:200, 
                result: resultSet[0]
            });
        }
    })




};

/**
 * Get subscribed users based on criteria
 * @param criteria
 * @param callBack
 */
SubscribedPostSchema.statics.getSubscribedUsers = function(criteria,callBack){

    this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                users:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * delete subscribed users based on criteria
 * @param criteria
 * @param callBack
 */
SubscribedPostSchema.statics.deleteSubscribedUsers = function(criteria,callBack){
    console.log("SubscribedPostSchema.statics.deleteSubscribedUsers")

    //var _this = this;
    //
    //_this.findOneAndRemove(criteria,function(err,resultSet){
    //    if(!err){
    //        callBack({status:200});
    //    }else{
    //        console.log("Server Error --------");
    //        callBack({status:400,error:err});
    //    }
    //});

    this.remove(criteria).exec(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                result:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    })

};




mongoose.model('SubscribedPost',SubscribedPostSchema);
