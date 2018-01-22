/**
 * Notebook model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');

GLOBAL.GroupNotebookConfig={
    CACHE_PREFIX :"group_shared_notebooks:",
    ES_INDEX_NAME:"group_idx_notebooks:"
};
GLOBAL.GroupNotebookSharedMode = {
    READ_ONLY: 1,
    READ_WRITE: 2
};
GLOBAL.GroupNotebookSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3
};


var GroupNotebookSchema = new Schema({
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

},{collection:"group_notebooks"});


GroupNotebookSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create New Notebook
 */
GroupNotebookSchema.statics.addNewNotebook = function(_data,callBack){

    var _notebook = new this();
    _notebook.name 	= _data.name;
    _notebook.color = _data.color;
    _notebook.isDefault = _data.isDefault;
    _notebook.group_id = _data.group_id;
    _notebook.shared_users = _data.shared_users;

    _notebook.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                notebook:resultSet
            });
        }else{
            console.log("Notebook Save Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};



/**
 * Get Notebooks
 */
GroupNotebookSchema.statics.getNotebooks = function(criteria,callBack){

    var _this = this;
    _this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                notebooks:resultSet
            });
        }else{
            console.log("Server Error while getting Notebooks--------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Notebook By Id
 */
GroupNotebookSchema.statics.getNotebookById = function(id,callBack){

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
 * Get Notebook | Get shared notebook to user
 */
GroupNotebookSchema.statics.ch_getSharedNotebooks = function(userId,payload,callBack){

    var _this = this;
    var _cache_key = "idx_user:"+NotebookConfig.CACHE_PREFIX+userId;

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
 * This is to update notebook
 * @param criteria
 * @param data
 * @param callBack
 */
GroupNotebookSchema.statics.updateNotebook = function(criteria, data, callBack){

    var _this = this;

    _this.update(criteria, data, {multi:true}, function(err,resultSet){
        if(!err){
            callBack({
                status:200
            });
        }else{
            console.log("Server Error while updating Notebook--------")
            console.log(err)
            callBack({status:400,error:err});
        }
    });
};


mongoose.model('GroupNotebooks',GroupNotebookSchema);
