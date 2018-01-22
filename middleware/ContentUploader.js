/**
 * Image uploader middle ware class will handle impage uploading operations
 */
var ContentUploader ={

    s3:null,
    PROFILE_IMAGE:"profile",
    PROFILE_COVER_IMAGE:"cover_image",
    POST_IMAGE:"posts",
    TEMP_UPLOAD:"temp:",
    io:null,
    /**
     * Initialize AWS sdk and S3 bucket service
     */
    init:function(){
        var aws = require('aws-sdk');
        aws.config.update({accessKeyId: Config.AWS_KEY, secretAccessKey: Config.AWS_SECRET});
        process.env.AWS_ACCESS_KEY_ID = Config.AWS_KEY;
        process.env.AWS_SECRET_ACCESS_KEY = Config.AWS_SECRET;
        this.s3 = new aws.S3();
        console.log("S3 SDN CONNECT...");
    },

    /**
     * Get Profile Image upload path
     * Upload path will prepare based on the function implementation
     * @param section
     * @returns {string}
     */
    getUploadPath:function(section){
        return Config.CDN_BUCKET_NAME + Config.CDN_UPLOAD_PATH + section;
    },

    /**
     * Upload Image to the S3 bucket
     * @param image 
     * @param callBack
     */
    uploadImage:function(payload,callback) {
        var uuid = require('node-uuid');
        var entity_id = 'random';

        var file_id = uuid.v1();
        var bucket = this.getUploadPath(entity_id);

        var newFileName = file_id + "_" + payload.image_name;
        var _http_url = Config.CDN_URL + Config.CDN_UPLOAD_PATH + entity_id + "/" + newFileName;

        var imgBuf = new Buffer(payload.image.replace(/^data:image\/\w+;base64,/, ""),'base64');
        this.s3.putObject({
            Bucket: bucket,
            Key: newFileName,
            Body: imgBuf,
            ACL: 'public-read'
        }, function (err, data) {
            if (!err) {
                _upload_meta = {
                    file_name:newFileName,
                    file_path:_http_url
                };
                callback(_upload_meta, null); 
            }else{
                console.log("UPLOAD ERROR")
                console.log(err)
                callback(null, err); 
            }
        });
    },

    /**
     * Upload Image to the S3 bucket
     * @param source
     * @param section
     * @param callBack
     */
    uploadFile:function(payLoad,callBack){

        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){
                _this.uploadToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveOnDb(cdnReturn,callBack){
                if(cdnReturn != null && cdnReturn.status == 200){
                    Upload.saveOnDb(cdnReturn.upload_meta,function(dbResultSet){
                        if(typeof dbResultSet.image._id != 'undefined' ) {
                            cdnReturn.upload_meta.document_id = dbResultSet.image._id;
                        }
                        callBack(null,cdnReturn.upload_meta);
                    });
                }else{
                    callBack(null,{status:400,error:null});
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){

                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });

    },

    /**
     * Upload Files to S3 bucket
     *
     * @param payLoad.entity_id
     * @param payLoad.entity_tag
     * @param payLoad.content_title
     * @param payLoad.is_default
     * @param callBack
     */
    uploadToCDN:function(payLoad,callBack){

        var binaryData = Util.decodeBase64Image(payLoad.file_name),
            uuid = require('node-uuid');

        var newFileName = uuid.v1() + "_"+payLoad.entity_tag+ binaryData.extension,
            file_id = uuid.v1();


        var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;

        this.s3.putObject({
            Bucket: this.getUploadPath(payLoad.entity_id),
            Key: newFileName,
            Body: binaryData.data,
            ACL: 'public-read'

        }, function (err, data) {
            if (!err) {
                var _upload_meta = {
                    entity_id:payLoad.entity_id,
                    entity_tag:payLoad.entity_tag,
                    upload_index:payLoad.upload_index,
                    file_id:file_id,
                    file_name: newFileName,
                    file_type: binaryData.type,
                    is_default:payLoad.is_default,
                    content_title:payLoad.content_title,
                    http_url:_http_url
                };
                callBack({status:200,upload_meta:_upload_meta});
                return 0;
            }else{
                console.log("UPLOAD ERROR")
                console.log(err)
                callBack({status:400,error:err});
                return 0;
            }
        });
    },

    /**
     * Upload Profile Image
     * @param source
     * @param callBack
     */
    uploadProfileImage:function(payLoad,callBack){
        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){

                _this.uploadToCDN(payLoad,function(cdnReturn){
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveOnDbWithDefaultContent(cdnReturn,callBack){
                if(cdnReturn != null && cdnReturn.status == 200){
                    Upload.saveOnDbWithDefaultContent(cdnReturn.upload_meta,function(dbResultSet){

                        callBack(null,cdnReturn.upload_meta);
                    });
                }else{
                    callBack(null,{status:400,error:null});
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){

                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });


    },


    /**
     * Upload File temporary with caching cluster. this is get file content to CDN before add to the
     * relevant entity and its ID
     * This can be video or Image
     * @param payLoad
     * @param callBack
     */
    tempUpload : function(payLoad,callBack){
        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){

                _this.uploadToCDN(payLoad,function(cdnReturn){
                    console.log(JSON.stringify(cdnReturn))
                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveCache(cdnReturn,callBack){

                console.log("cdn return data");
                console.log(cdnReturn);

                if(cdnReturn != null && cdnReturn.status == 200){

                    var _cacheKey = payLoad.entity_tag+payLoad.entity_id;
                    //console.log(_cacheKey)
                    if(cdnReturn.status ==200){
                        CacheEngine.addBottomToList(_cacheKey,cdnReturn.upload_meta,function(csResultSet){
                            callBack(null,cdnReturn.upload_meta);
                        })
                    }else{
                        callBack(null,null);
                    }

                }else{
                    callBack(null,null);
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){
                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });

    },

    /**
     * Get Uploads from temp location
     * @param payLoad
     * @param callBack
     */
    getUploadFromTemp:function(payLoad,callBack){
        var _cacheKey = payLoad.entity_tag+payLoad.entity_id;

        console.log("=== cache key ===");
        console.log(_cacheKey);

        CacheEngine.getList(_cacheKey,0,-1,function(chData){
            callBack(chData.result)
            console.log("cache key result");
        });
    },



    copyFromTempToDb:function(payLoad,callBack){

        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this,
            upload_data = [],
            toBucket =  _this.getUploadPath(payLoad.post_id),
            fromBucket = _this.getUploadPath(payLoad.entity_id);

        this.getUploadFromTemp(payLoad,function(tmpUploads){

            _async.each(tmpUploads,
                function(upload,callBack){
                    var fileContent = payLoad.file_content,
                        fileId = upload.file_id.toString();

                    var arrIndex = fileContent.indexOf(fileId);

                    //- This condition is used to match file ids in the payload with files ids already uploaded to s3 bucket
                    if(arrIndex != -1) {

                        upload['entity_id'] = Util.toObjectId(payLoad.post_id);

                        _async.waterfall([

                            function copyVideoToActualBucket(callback) {
                                var params = {
                                    Bucket: toBucket,
                                    CopySource: fromBucket + "/" + upload.file_name,
                                    Key: upload.file_name,
                                    ACL: 'public-read'
                                };

                                _this.s3.copyObject(params, function (err, data) {
                                    if (!err) {
                                        callback(null)
                                    }
                                    else {
                                        callback(null);
                                        console.log(err); // successful response
                                    }
                                });

                            },
                            function copyThumbnailToActualBucket(callback) {

                                if (typeof upload.thumb_file_name != 'undefined' && upload.thumb_file_name != null) {
                                    var paramsThumb = {
                                        Bucket: toBucket,
                                        CopySource: fromBucket + "/" + upload.thumb_file_name,
                                        Key: upload.thumb_file_name,
                                        ACL: 'public-read'
                                    };

                                    _this.s3.copyObject(paramsThumb, function (err, data) {
                                        if (!err) {
                                            callback(null);
                                        }
                                        else {
                                            callback(null);
                                            console.log(err); // successful response
                                        }
                                    });
                                } else {
                                    callback(null);
                                }

                            },
                            function saveDataToDB(callback) {

                                //Add to Database
                                Upload.saveOnDb(upload, function (dbResultSet) {
                                    var _http_url = Config.CDN_URL + Config.CDN_UPLOAD_PATH + upload.entity_id + "/" + upload.file_name;
                                    var _thumb_http_url = Config.CDN_URL + Config.CDN_UPLOAD_PATH + upload.entity_id + "/" + upload.thumb_file_name;
                                    upload_data.push({
                                        entity_id: upload.entity_id,
                                        file_name: upload.file_name,
                                        file_type: upload.file_type,
                                        http_url: _http_url,
                                        thumb_file_name: upload.thumb_file_name,
                                        thumb_file_type: upload.thumb_file_type,
                                        thumb_http_url: _thumb_http_url
                                    });
                                    callback();
                                });

                            }

                        ], function (err) {
                            callBack()
                        });
                    }else {
                        callBack(null);
                    }
                },
                function(err){
                    callBack(upload_data)
                }
            )

        });

    },

    deleteFromCDN:function(payload, callback){

        var deleteParam = {
            Bucket: Config.CDN_BUCKET_NAME.slice(0,-1), //this.getUploadPath(payload.entity_id),
            Key: Config.CDN_UPLOAD_PATH+payload.entity_id+"/"+payload.file_name
        };

        this.s3.deleteObject(deleteParam, function(err, data) {
            if (err){
                console.log(err);
                callback(err)
            }
            else {
                console.log('delete', data);
                callback(null);
            }
        });



        //callback();

    },


    /**
     * Upload File temporary with caching cluster. this is get file content to CDN before add to the
     * relevant entity and its ID
     * This can be video or Image
     * @param payLoad
     * @param callBack
     */
    tempVideoUpload : function(payLoad,callBack){

        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        _async.waterfall([
            function uploadFile(callBack){

                _this.uploadVideoToCDN(payLoad,function(cdnReturn){

                    if(cdnReturn.status == 200){
                        callBack(null,cdnReturn);
                    }else{
                        callBack(null,null);
                    }

                });
            },
            function saveCache(cdnReturn,callBack){

                if(cdnReturn != null && cdnReturn.status == 200){

                    var _cacheKey = payLoad.entity_tag+payLoad.entity_id;
                    //console.log(_cacheKey)
                    if(cdnReturn.status ==200){
                        CacheEngine.addBottomToList(_cacheKey,cdnReturn.upload_meta,function(csResultSet){
                            callBack(null,cdnReturn.upload_meta);
                        })
                    }else{
                        callBack(null,null);
                    }

                }else{
                    callBack(null,null);
                }

            }
        ],function(err,resultSet){

            if(resultSet != null){
                callBack(resultSet)
            }else{
                callBack(resultSet)
            }

        });

    },


    /**
     * Upload Files to S3 bucket
     *
     * @param payLoad.entity_id
     * @param payLoad.entity_tag
     * @param payLoad.content_title
     * @param payLoad.is_default
     * @param callBack
     */
    uploadVideoToCDN:function(payLoad,callBack){

        var uuid = require('node-uuid');
        var fs = require('fs');
        var _async = require('async');

        var file_id = uuid.v1();
        var bucket = this.getUploadPath(payLoad.entity_id);
        var _upload_meta = {};
        var _this = this;

        _async.waterfall([

            function uploadVideo(callBack){

                var name = payLoad.file_name;
                var arr = name.split(".");
                var type = arr[arr.length-1];
                var newFileName = file_id + "_"+payLoad.entity_tag+"."+type;
                var videoBody = fs.createReadStream('temp/'+payLoad.file_name);
                var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;


                _this.s3.putObject({
                    Bucket: bucket,
                    Key: newFileName,
                    Body: videoBody,
                    ACL: 'public-read'

                }, function (err, data) {

                    if (!err) {
                        _upload_meta = {
                            entity_id:payLoad.entity_id,
                            entity_tag:payLoad.entity_tag,
                            upload_index:payLoad.upload_index,
                            file_id:file_id,
                            file_name: newFileName,
                            file_type: type,
                            is_default:payLoad.is_default,
                            content_title:payLoad.content_title,
                            http_url:_http_url
                        };
                        callBack(null);
                    }else{
                        console.log("UPLOAD ERROR")
                        console.log(err)
                        callBack(null);
                    }
                });

            },
            function uploadThumbnailImage(callBack){

                var name = payLoad.thumbnail_image;
                var arr = name.split(".");
                var type = arr[arr.length-1];
                var newFileName = file_id + "_"+payLoad.entity_tag+"."+type;
                var videoBody = fs.createReadStream('temp/'+payLoad.thumbnail_image);
                var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;

                _this.s3.putObject({
                    Bucket: bucket,
                    Key: newFileName,
                    Body: videoBody,
                    ACL: 'public-read'

                }, function (err, data) {
                    if (!err) {
                        _upload_meta['thumb_file_name'] = newFileName;
                        _upload_meta['thumb_file_type'] = type;
                        _upload_meta['thumb_http_url'] = _http_url;
                        callBack(null);
                    }else{
                        console.log("UPLOAD ERROR")
                        console.log(err)
                        callBack(null);
                    }
                });

            }

        ], function(err){
            callBack({status:200, upload_meta:_upload_meta});

        })


    },


    /**
     * Upload image folder document to S3 bucket
     * @param callBack
     */
    uploadFolderImageDocumentToCDN:function(payLoad,callBack){

        var uuid = require('node-uuid');
        //var fs = require('fs');
        var _async = require('async');
        var file_id = uuid.v1();
        var bucket = this.getUploadPath(payLoad.entity_id);
        var _upload_meta = {};
        var _this = this;

        _async.waterfall([

            function uploadActualImage(callBack){

                var newFileName = file_id + "_"+payLoad.orig_entity_tag+payLoad.ext;
                var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;

                _this.s3.putObject({
                    Bucket: bucket,
                    Key: newFileName,
                    Body: payLoad.orig_file,
                    ACL: 'public-read'

                }, function (err, data) {
                    if (!err) {
                        _upload_meta = {
                            file_name:payLoad.fileName,
                            file_path:_http_url
                        };
                        callBack(null);
                        return 0;
                    }else{
                        console.log("UPLOAD ERROR")
                        console.log(err)
                        callBack(null);
                        return 0;
                    }
                });

            },
            function uploadThumbnailImage(callBack){

                var newFileName = file_id + "_"+payLoad.thumb_entity_tag+payLoad.ext;
                var _http_url = Config.CDN_URL+Config.CDN_UPLOAD_PATH+payLoad.entity_id+"/"+newFileName;

                _this.s3.putObject({
                    Bucket: bucket,
                    Key: newFileName,
                    Body: payLoad.thumb_file,
                    ACL: 'public-read'

                }, function (err, data) {
                    if (!err) {
                        _upload_meta['thumb_path'] = _http_url;
                        callBack(null);
                    }else{
                        console.log("UPLOAD ERROR")
                        console.log(err)
                        callBack(null);
                    }
                });
            }

        ], function(err){
            callBack({status:200, upload_meta:_upload_meta});

        })


    },


    initSocket:function(io){

        var fs = require('fs');
        this.io = io;
        this.io.sockets.on('connection', function (socket) {

            var files = {};

            socket.on('start', function (data) { //data contains the variables that we passed through in the html file

                var name = data['name'];
                name = name.trim().replace(/\s/g, '');
                files[name] = {  //Create a new Entry in The Files Variable
                    fileSize : data['size'],
                    data     : "",
                    downloaded : 0,
                    upload_id: data['data']['upload_id'],
                    upload_index: data['data']['upload_index']
                };
                var place = 0;
                try{
                    var stat = fs.statSync('temp/' +  name);
                    if(stat.isFile())
                    {
                        files[name]['downloaded'] = stat.size;
                        place = stat.size / 524288;
                    }
                }
                catch(er){} //It's a New File
                fs.open("temp/" + name, "a", '0755', function(err, fd){
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        files[name]['handler'] = fd; //We store the file handler so we can write to it later
                        socket.emit('more_data', { place : place, percent : 0 });
                    }
                });
            });

            socket.on('upload', function (data){

                var name = data['name'];
                name = name.trim().replace(/\s/g, '');
                files[name]['downloaded'] += data['data'].length;
                files[name]['data'] += data['data'];

                if(files[name]['downloaded'] == files[name]['fileSize']) //If File is Fully Uploaded
                {
                    fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', function(err, Writen){
                        var uuid = require('node-uuid');
                        var ffmpeg = require('ffmpeg');
                        var _async = require('async');

                        var arr = name.split(".");
                        var type = arr[arr.length-1];
                        var nameWithoutEx = "";
                        for(var i=0; i<arr.length-1;i++){
                            nameWithoutEx += arr[i];
                        }
                        var finalData = {};

                        _async.waterfall([

                            function convertVideo(callback){

                                try {

                                    var process = new ffmpeg('temp/'+name);
                                    process.then(function (video) {
                                        //Get Thumbnail Here
                                        video.fnExtractFrameToJPG('temp/', {
                                            frame_rate : 1,
                                            number : 1,
                                            file_name : name
                                        }, function (error, files) {
                                            if (!error)
                                                console.log('Frames: ' + files);
                                            console.log(error)
                                        });
                                        if(type != "mp4"){
                                            video.setVideoFormat('mp4').save('temp/'+nameWithoutEx+'.mp4');
                                        }

                                    }, function (err) {
                                        console.log('Error: ' + err);
                                    });
                                } catch (e) {
                                    console.log(e.code);
                                    console.log(e.msg);
                                } finally{
                                    callback(null);
                                }
                            },
                            function uploadVideoToCDN(callback){
                                //Upload video to CDN

                                var data ={
                                    content_title:"Post Video",
                                    file_name:nameWithoutEx+'.mp4',
                                    entity_id:files[name]['upload_id'],
                                    entity_tag:UploadMeta.TIME_LINE_IMAGE,
                                    upload_index:files[name]['upload_index'],
                                    thumbnail_image:nameWithoutEx+'_1.jpg'
                                };
                                ContentUploader.tempVideoUpload(data,function(resultSet){
                                    finalData['video_upload'] = resultSet;
                                    callback(null)
                                });

                            }

                        ],function(err){
                            fs.unlink("temp/" + nameWithoutEx+'.mp4');
                            fs.unlink("temp/" + nameWithoutEx+'_1.jpg');
                            socket.emit('finished', finalData);
                        });
                    });
                }
                else if(files[name]['data'].length > 10485760){ //If the Data Buffer reaches 10MB

                    fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', function(err, Writen){
                        files[name]['data'] = ""; //Reset The Buffer
                        var place = files[name]['downloaded'] / 524288;
                        var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
                        socket.emit('more_data', { place : place, percent :  percent});
                    });
                }
                else
                {
                    var place = files[name]['downloaded'] / 524288;
                    var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
                    socket.emit('more_data', { place : place, percent :  percent});
                }
            });

        });
    }

};
module.exports = ContentUploader;
