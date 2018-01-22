/**
 * Folder model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.GroupFolderConfig={
    CACHE_PREFIX :"group_shared_folders:",
    ES_INDEX_NAME:"group_idx_folders:"
};
GLOBAL.GroupFolderSharedMode = {
    READ_ONLY: 1,
    READ_WRITE: 2
};
GLOBAL.GroupFolderSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3
};


var GroupFolderSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    color:{
        type:String,
        trim:true
    },
    isDefault:{
        type:Number,
        default:0
    },
    group_id:{
        type: Schema.ObjectId,
        ref: 'Group',
        default:null
    },
    shared_users:[],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"group_folders"});


GroupFolderSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create New Folder
 */
GroupFolderSchema.statics.addNewFolder = function(_data,callBack){

    var _folder = new this();
    _folder.name 	= _data.name;
    _folder.color  	= _data.color;
    _folder.isDefault  	= _data.isDefault;
    _folder.group_id		= _data.group_id;

    _folder.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                folder:resultSet
            });
        }else{
            console.log("Folder Save Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};



/**
 * Get Folders
 */
GroupFolderSchema.statics.getFolders = function(criteria,callBack){

    var _this = this;
    _this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                folders:resultSet
            });
        }else{
            console.log("Server Error while getting folders--------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Folder By Id
 */
GroupFolderSchema.statics.getFolderById = function(id,callBack){

    var _this = this;

    _this.findOne({_id: id}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }

            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get Folder | Get shared folder to user
 */
GroupFolderSchema.statics.ch_getSharedFolders = function(userId,payload,callBack){

    var _this = this;
    var _cache_key = "idx_user:"+FolderConfig.CACHE_PREFIX+userId;

    var query={
        q:payload.q,
        index:_cache_key
    };

    //Find User from Elastic search
    ES.search(query,function(csResultSet){
        if(csResultSet == null){
            callBack(null);
        }else{
            callBack(csResultSet);
        }

    });

};


/**
 * This is to update folder
 * @param criteria
 * @param data
 * @param callBack
 */
GroupFolderSchema.statics.updateFolder = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error while updating folder--------")
            console.log(err)
            callBack({status:400,error:err});
        }
    });
};


mongoose.model('GroupFolders',GroupFolderSchema);
