/**
 * This is Documents Model
 */


'use strict';
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    uuid = require('node-uuid');


var GroupFolderDocsSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    content_type:{
        type:String,
        trim:true
    },
    group_id:{
        type: Schema.ObjectId,
        ref: 'Group',
        default:null
    },
    group_folder_id:{
        type: Schema.ObjectId,
        ref: 'GroupFolders',
        default:null
    },
    shared_users:[],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"group_folder_docs"});


GroupFolderDocsSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


/**
 * Create Document
 */
GroupFolderDocsSchema.statics.addNewDocument = function(DocumentData,callBack){

    var newDocument = new this();
    newDocument.name 	= DocumentData.name;
    newDocument.content  	= DocumentData.content;
    newDocument.user_id		= DocumentData.group_id;
    newDocument.group_folder_id		= DocumentData.group_folder_id;

    newDocument.save(function(err,resultSet){

        if(!err){
            callBack({
                status:200,
                document:resultSet
            });
        }else{
            console.log("Server Error --------")
            console.log(err)
            callBack({status:400,error:err});
        }

    });

};


/**
 * Get Documents
 */
GroupFolderDocsSchema.statics.getDocuments = function(criteria,callBack){
    var _this = this;

    _this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                documents:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};


/**
 * Get Document
 */
GroupFolderDocsSchema.statics.getDocument = function(criteria,callBack){
    var _this = this;
    _this.findOne(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                document:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};

/**
 * Get Folder Document
 */
GroupFolderDocsSchema.statics.getFolderDocument = function(criteria,callBack){
    var _this = this;
    _this.find(criteria).exec(function(err,resultSet){
        if(!err){
            callBack({
                status:200,
                document:resultSet
            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }
    })

};

mongoose.model('GroupFolderDocs',GroupFolderDocsSchema);