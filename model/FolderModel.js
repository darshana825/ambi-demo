/**
 * Folder model
 */


'use strict';
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.FolderConfig = {
    ES_INDEX_SHARED_FOLDER :"shared_folders:",
    ES_INDEX_SHARED_GROUP_FOLDER :"shared_group_folders:",
    ES_INDEX_OWN_FOLDER : "own_folders:",
    ES_INDEX_OWN_GROUP_FOLDER : "own_group_folders:"
};
GLOBAL.FolderSharedMode = {
    VIEW_ONLY: 1,
    VIEW_UPLOAD: 2
};
GLOBAL.FolderSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3,
    MEMBER_REMOVED: 4
};

GLOBAL.FolderType = {
    PERSONAL_FOLDER: 0,
    GROUP_FOLDER: 1
};


var FolderSchema = new Schema({
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
    type:{
        type:Number,
        default: 0 /* 0 - PERSONAL_FOLDER, 1 - GROUP_FOLDER */
    },
    group_id:{
        type: Schema.ObjectId,
        ref: 'Groups',
        default:null
    },
    user_id:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    shared_users:[],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"folders"});


FolderSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Get folder count based on criteria
 * @param criteria
 * @param callBack
 */
FolderSchema.statics.getCount = function(criteria,callBack){

    this.count(criteria).exec(function(err,resultSet){

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

/**
 * Create New Folder to DB
 */
FolderSchema.statics.addNewFolder = function(_data,callBack){

    var _this = this;
    var _folder = new this();
    _folder.name 	= _data.name;
    _folder.color  	= _data.color;
    _folder.isDefault  	= _data.isDefault;
    _folder.user_id		= _data.user_id;
    _folder.shared_users = _data.shared_users;
    _folder.type = (_data.folder_type ? _data.folder_type : 0);
    _folder.group_id = (_data.group_id ? _data.group_id : null);

    _folder.save(function(err,resultSet){

        if(!err){

            var _cacheKey = (_data.group_id ?
            FolderConfig.ES_INDEX_OWN_GROUP_FOLDER+resultSet.user_id.toString(): FolderConfig.ES_INDEX_OWN_FOLDER+resultSet.user_id.toString());
            var _esFolder = {
                cache_key:_cacheKey,
                folder_id:resultSet._id,
                folder_name:resultSet.name,
                folder_color:resultSet.color,
                folder_owner:resultSet.user_id,
                folder_user:resultSet.user_id,
                folder_updated_at:resultSet.updated_at,
                folder_type:resultSet.type,
                group_id:(resultSet.group_id ? resultSet.group_id.toString() : null),
                isDefault:resultSet.isDefault,
                folder_shared_mode: FolderSharedMode.VIEW_UPLOAD
            };

            _this.addFolderToCache(_esFolder, function(err){
                callBack({
                    status:200,
                    folder:resultSet
                });
            });

        }else{
            console.log("Folder Save Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};


/**
 * Add folder to CACHE
 */
FolderSchema.statics.addFolderToCache = function(data, callBack){

    console.log(data.folder_name + " adding to cache: " + data.folder_user + " @ " + data.folder_type);

    var _esFolder = {
        folder_id:data.folder_id,
        folder_name:data.folder_name,
        folder_color:data.folder_color,
        folder_owner:data.folder_owner,
        folder_user:data.folder_user,
        folder_updated_at:data.folder_updated_at,
        folder_shared_mode:data.folder_shared_mode,
        folder_type:data.folder_type,
        folder_group_id:data.group_id,
        folder_is_default:data.isDefault
    };
    var _type = "";

    if(data.folder_owner == data.folder_user){
        _type = "own_folder"
    } else{
        _type = "shared_folder"
    }

    var payLoad={
        index:data.cache_key,
        id:data.folder_id.toString(),
        type: _type,
        data:_esFolder,
        tag_fields:['folder_name']
    }

    ES.createIndex(payLoad,function(resultSet){
        callBack(resultSet);
    });
}


/**
 * Get Folders
 */
FolderSchema.statics.getFolders = function(criteria,callBack){

    var _this = this;
    _this.find(criteria).sort({created_at:1}).exec(function(err,resultSet){
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
 * Get Folders
 */
FolderSchema.statics.getSharedFolders = function(criteria,callBack){

    var query={
        index:criteria._index,
        q: criteria.q
    };
    ES.search(query,function(esResultSet){
        //console.log(esResultSet)
        if(esResultSet == null || typeof esResultSet.result == "undefined"){
            callBack({status:400,folders:[]});
        }else{
            callBack({status:200, folders:esResultSet.result});
        }
    });

};


/**
 * Get Folder By Id
 */
FolderSchema.statics.getFolderById = function(id,callBack){

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
 * This is to update folder
 * @param criteria
 * @param data
 * @param callBack
 */
FolderSchema.statics.updateFolder = function(criteria, data, callBack){

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

/**
 * Share Folder | DB
 */
FolderSchema.statics.shareFolder = function(folderId,sharedCriteria,callBack){

    var _this = this;

    _this.update({_id:folderId},
        {$push:sharedCriteria},function(err,resultSet){

            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};

/**
 * Remove Shared user | DB
 */
FolderSchema.statics.removeSharedUser = function(folderId,sharedCriteria,callBack){

    var _this = this;

    _this.update({_id:folderId},
        { $pull: sharedCriteria},function(err,resultSet){
            if(!err){
                callBack({
                    status:200
                });
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};
/**
 * Remove Folder
 */
FolderSchema.statics.removeFolder = function(criteria,callBack){

    var _this = this;

    this.remove(criteria).exec(function (err, resultSet) {

        if (!err) {
            callBack({
                status: 200
            });
        } else {
            console.log("Server Error --------")
            console.log(err)
            callBack({status: 400, error: err});
        }

    });

};

/**
 * Update Shared folder
 * @param criteria
 * @param data
 * @param callBack
 */
FolderSchema.statics.updateSharedFolder = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }
    });
};


/**
 * Delete Folder From Cache based on Folder Id
 * @param payload
 * @param callBack
 */
FolderSchema.statics.deleteFolderFromCache= function(payload,callBack){

    var query={
        id:payload.id,
        type: payload.type,
        index:payload.cache_key
    };

    ES.delete(query,function(csResultSet){
        callBack(null);
    });

}


/**
 * This is to get the folder name of given folder_id
 * @param criteria
 * @param data
 * @param callBack
 */
FolderSchema.statics.bindNotificationData = function(notificationObj, callBack){

    this.getFolderById(notificationObj.folder_id,function(folderData){

        notificationObj['folder_name'] = folderData.name;

        callBack(notificationObj);
    });

};


/**
 * Search Folders
 */
FolderSchema.statics.searchFolders = function(payload,callBack){

    var query={
        index:payload.index,
        q:payload.q
    };
    ES.search(query,function(esResultSet){
        //console.log(esResultSet)
        if(esResultSet == null || typeof esResultSet.result == "undefined"){
            callBack({status:400,folders:[]});
        }else{
            callBack({status:200, folders:esResultSet.result});
        }
    });
};


/**
 * Returns the set of folders which are related to a given group
 */
FolderSchema.statics.getFoldersByGroupId = function(groupId,callBack){
    
    var arrFolders = [];

    if(typeof(groupId) === "undefined" ) {
        callBack(arrFolders);
    } else {
        var _this = this;
        _this.find({group_id: Util.toObjectId(groupId)}).lean().exec(function (err, resultSet) {
            if (!err) {
                if (resultSet == null) {
                    callBack({status: 400, data: arrFolders});
                    return;
                }
                callBack({status: 200, data: resultSet});
            } else {
                callBack({status: 400, error: err});
            }
        });
    }
};




mongoose.model('Folders',FolderSchema);
