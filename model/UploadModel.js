/**
 * Upload module handle all upload related operation with the database.
 **/
'use strict'


GLOBAL.UploadMeta ={
    PROFILE_IMAGE:"profile_image",
    COVER_IMAGE:"cover_image",
    TIME_LINE_IMAGE:"time_line_image",
    TIME_LINE_VIDEO:"post_video",
    COMMENT_IMAGE:"comment_image",
    TIME_LINE_VIDEO_IMAGE:"post_video_image",
    FOLDER_DOCUMENT:"folder_document",
    FOLDER_DOCUMENT_THUMB:"folder_document_thumb",
    GROUP_IMAGE:"group_image"
}




var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema ;



var UploadSchema = new Schema({
    entity_id:{
        type: Schema.ObjectId, //Exact document id
        default:null
    },
    title:{
        type:String, //Upload title i.e Profile Image,Post Images
        trim:true
    },
    entity_tag:{
        type:String, //profile_image,post_image,post_video
        trim:true
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    },
    file_name:{
        type:String,//physical file name
        trim:true
    },
    file_type:{
        type:String,//image/jpg,image/png
        trim:true,
        default:null
    },
    thumb_name:{
        type:String,//physical file name
        trim:true
    },
    thumb_type:{
        type:String,//image/jpg,image/png
        trim:true,
        default:null
    },
    is_default:{
        type:Number,
        default:0
    }

},{collection:"uploads"});


UploadSchema.pre('update', function(next){

    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }

    next();
});


/**
 * Create new upload record in data based on the upload type
 * with in this function, new upload document  will create for new user.
 * also with in this function new content record will create
 * @param userId
 * @param data
 * @param callBack
 */

UploadSchema.statics.saveOnDb = function(payLoad,callBack){
    console.log("UploadSchema.statics.saveOnDb ")
    var _upload = this,
        content = new this();


    content.file_name    = payLoad.file_name;
    content.file_type    = payLoad.file_type;
    content.is_default   = payLoad.is_default;
    content.entity_id    = payLoad.entity_id;
    content.entity_tag   = payLoad.entity_tag;
    content.title        = payLoad.content_title;
    content.created_at   = this.created_at;
    content.updated_at   = this.updated_at;
    content.thumb_name = payLoad.thumb_file_name;
    content.thumb_type = payLoad.thumb_file_type;


    _upload.update({
        entity_id:payLoad.entity_id,
        entity_tag:payLoad.entity_tag
        },
        {
            $set:{

                is_default:0

            }
        },{multi:false},function(err,update){

            if(!err){
                content.save(function(err,resultSet){
                    if(!err){
                        callBack({
                            status:200,
                            image:resultSet
                        });
                    }else{
                        console.log("Server Error --------")
                        console.log(err)
                        callBack({status:400,error:err});
                    }

                });

            }else{
                console.log("Server Error --------")
                console.log(err)
                callBack({status:400,error:err});
            }

        });




}



/**
 * Get Profile image and Cover image
 * @param userId
 * @param callBack
 */

UploadSchema.statics.getProfileImage=function(userId,callBack){

    var _this = this;

    _this.find({
        entity_id:Util.toObjectId(userId),
        entity_tag:{$in:['profile_image','cover_image']},
        is_default:1
    }).exec(function(err,resultSet){
        if(!err && resultSet.length > 0){
            var _image ={};
            for(var i=0;i<resultSet.length;i++){
                var _tmp_rs = resultSet[i],
                    _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+userId+"/"+_tmp_rs.file_name;
                _image[_tmp_rs['entity_tag']] ={
                    id:_tmp_rs._id,
                    file_name:_tmp_rs.file_name,
                    file_type:_tmp_rs.file_type,
                    http_url:_http_url
                }
            }

            callBack({
                status:200,
                image:_image

            });
        }else{
            console.log("Server Error --------")
            callBack({status:400,error:err});
        }

    });
}

/**
 * Update a Group
 * @param filter
 * @param value
 * @param callBack
 */
UploadSchema.statics.updateUpload = function(filter, value, callBack){

    var _this = this;
    var options = {multi: true};

    this.update(filter, value, options, function(err, update) {
        if(err){
            console.log(err);
            console.log("Error - An Error occured in updating the upload document");
            callBack({status:400,error:err});
        } else {
            console.log(update);
            console.log("Success - The upload document updating is success.");
            callBack({status:200, upload:update});
        }
    });
}

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};

mongoose.model('Upload',UploadSchema);
