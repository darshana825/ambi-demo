/**
 * Upload controller will handle all Uploads for content upload for the system
 * TODO : This service should be separate from the main thread if this is dealing with larg user base
 */

    'use strict';


var UploadController = {

    uploadImage:function(req,res) {
        var data = {
            image_name: req.body.img_name,
            image: req.body.img, 
        }

        var outPut = {};
        ContentUploader.uploadImage(data, function(response, err) { 
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['response']   = response
            res.status(200).json(outPut);
        });
    },

    uploadTimeLinePhoto:function(req,res){
        var outPut ={};
        if(typeof req.body.image_name == 'undefined' || typeof req.body.image_name == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var uuid = require('node-uuid');

        var data ={
            content_title:"Post Image",
            file_name:req.body.image_name,
            entity_id:req.body.upload_id,
            entity_tag:UploadMeta.TIME_LINE_IMAGE,
            upload_index:req.body.upload_index
        }

        ContentUploader.tempUpload(data,function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['upload']   = resultSet
            res.status(200).json(outPut);
        })
    },

    uploadTimeLineVideo:function(req,res){

        var outPut ={};
        if(typeof req.body.file_name == 'undefined' || typeof req.body.file_name == ""){
            outPut['status']    = ApiHelper.getMessage(400, Alert.POST_CONTENT_EMPTY, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }

        var uuid = require('node-uuid');

        var data ={
            entity_id: req.body.entity_id,
            entity_tag: UploadMeta.TIME_LINE_IMAGE,
            upload_index: req.body.upload_index,
            file_id: req.body.file_id,
            file_name: req.body.file_name,
            file_type: req.body.file_type,
            content_title: 'Post Video',
            http_url: req.body.http_url,
            thumb_file_name: req.body.thumb_file_name,
            thumb_file_type: req.body.thumb_file_type,
            thumb_http_url: req.body.thumb_http_url
        }

        var _async = require('async'),
            Upload = require('mongoose').model('Upload'),
            _this = this;

        var _cacheKey = data.entity_tag+data.entity_id;

        CacheEngine.addBottomToList(_cacheKey,data,function(csResultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).json(outPut);
        });

    },

    uploadFolderDocument:function(req,res){

        console.log("came to uploadFolderDocument");
        var outPut = {},
            _async = require('async'),
            document = {},
            saved_document = {},
            _imageFiles = {},
            CurrentSession = Util.getCurrentSession(req),
            x = 0,
            FolderDocs = require('mongoose').model('FolderDocs'),
            Folders =  require('mongoose').model('Folders'),
            n = req.body.name;

        var fs = require('fs');

        _imageFiles[n] = {
            upload_id : req.body.upload_id,
            upload_index : req.body.upload_index,
            content : req.body.content,
            type : req.body.type
        };

        var binaryData = Util.decodeBase64Image(_imageFiles[n]['content']);
        var extension = binaryData.extension;
        var ext = '', name = n;

        if(typeof extension != "string"){
            for(var e = 0; e < extension.length; e++){
                if(n.indexOf(extension[e]) != -1){
                    ext = extension[e];
                }
            }
            extension = ext;
        }

        if(n.indexOf(extension) != -1){
            var nameArr = n.split(extension);
            name = nameArr[0];
        }
        _imageFiles[n]['name'] = name;
        _imageFiles[n]['binaryData'] = binaryData;
        _imageFiles[n]['extension'] = extension;
        _imageFiles[n]['content_type'] = extension.substr(1);
        _imageFiles[n]['user_id'] = Util.toObjectId(CurrentSession.id);
        _imageFiles[n]['folder_id'] = Util.toObjectId(_imageFiles[n]['upload_id']);

        _async.waterfall([

            function uploadOtherFiles(callback) {
                console.log("came to uploadOtherFiles");
                x = 1;
                var fileName = n;
                if(_imageFiles[fileName]['type'].indexOf("image/") == -1){
                    //console.log(x+" ==> "+fileName)
                    var data ={
                        content_title:"Folder Document",
                        file_name:_imageFiles[fileName]['content'],
                        entity_id:_imageFiles[fileName]['upload_id'],
                        entity_tag:UploadMeta.FOLDER_DOCUMENT,
                        upload_index:_imageFiles[fileName]['upload_index']
                    };
                    ContentUploader.uploadToCDN(data,function(resultSet){
                        //console.log(resultSet);
                        if(resultSet.status == 200){
                            _imageFiles[fileName]['file_path'] = resultSet.upload_meta.http_url;
                            callback(null,fileName);
                        } else{
                            callback(null,fileName);
                        }
                    });
                } else{
                    callback(null,fileName);
                }
            },
            function uploadImageFiles(fileName, callback){
                console.log("came to uploadImageFiles");

                //console.log("******uploadImageFiles******* ====>>>>>"+fileName);

                x = 2;
                var n = fileName;
                var err = true;
                if(_imageFiles[n]['type'].indexOf("image/") != -1){
                    _async.waterfall([
                        function(callback){
                            var origFile = n;
                            var origErr = err;
                            //console.log("******uploadOrigFile******* ====>>>>>"+origFile);
                            fs.writeFile('temp/orig/'+origFile, _imageFiles[origFile]['binaryData']['data'], function(err) {
                                if(!err){
                                    //console.log(origFile+" ==> original file uploaded to orig folder");
                                    origErr = false;
                                    callback(null,origErr,origFile)
                                } else{
                                    //console.log(origFile+" ==> original file uploaded failed--");
                                    callback(null,origErr,origFile);
                                }
                            });
                        },
                        function(err, fileName, callback2){
                            var thumbErr = err;
                            var thumbFile = fileName;
                            var im = require('imagemagick');

                            //console.log("******Create Thumbnail******* ====>>>>>"+thumbFile);

                            if(!thumbErr){
                                im.resize({
                                    srcPath: 'temp/orig/'+thumbFile,
                                    dstPath: 'temp/thumb/'+thumbFile,
                                    width:196,
                                    height:204,
                                }, function(err, stdout, stderr){
                                    if (err) {
                                        thumbErr = true;
                                        callback2(null,thumbErr,thumbFile);
                                    } else{
                                        thumbErr = false;
                                        //console.log('resized '+thumbFile);
                                        callback2(null,thumbErr,thumbFile);
                                    }
                                });
                            } else{
                                callback2(null,thumbErr,thumbFile);
                            }
                        },
                        function(err, fileName,callback){
                            var upErr = err;
                            var upFile = fileName;
                            //console.log("******uploadImageFiles to CDN******* ====>>>>>");
                            //console.log(upFile);
                            if(!upErr){
                                fs.readFile('temp/thumb/'+upFile, function(err, fileBody){
                                    if(!err){
                                        //console.log(upFile+" ==> thumbnail read");
                                        var _data = {
                                            fileName : upFile,
                                            orig_file : _imageFiles[upFile]['binaryData']['data'],
                                            thumb_file : fileBody,
                                            ext : _imageFiles[upFile]['extension'],
                                            entity_id:_imageFiles[upFile]['upload_id'],
                                            orig_entity_tag:UploadMeta.FOLDER_DOCUMENT,
                                            thumb_entity_tag:UploadMeta.FOLDER_DOCUMENT_THUMB
                                        };
                                        ContentUploader.uploadFolderImageDocumentToCDN(_data, function(resultSet){
                                            //console.log(resultSet);
                                            if(resultSet.status == 200){
                                                _imageFiles[upFile]['file_path'] = resultSet.upload_meta.file_path;
                                                _imageFiles[upFile]['thumb_path'] = resultSet.upload_meta.thumb_path;
                                                callback(null,upFile);
                                            } else{
                                                callback(null,upFile);
                                            }
                                        });
                                    }
                                });
                            } else{
                                callback(null,upFile);
                            }
                        }
                    ],function(err,fileName){
                        callback(null,fileName);
                    });
                } else{
                    callback(null,n);
                }
            },
            function saveDocumentToDB(fileName, callback){
                console.log("came to saveDocumentToDB");
                var n = fileName;
                if(_imageFiles[n]['type'].indexOf("image/") != -1){
                    fs.unlink('temp/thumb/'+n, function(err){
                        if (err) console.log(err);
                        console.log('successfully deleted '+'temp/thumb/'+n);
                    });
                    fs.unlink('temp/orig/'+n, function(err){
                        if (err) console.log(err);
                        console.log('successfully deleted '+'temp/orig/'+n);
                    });
                }

                if(typeof _imageFiles[n]['file_path'] != 'undefined'){
                    x = 3;

                    document.name = _imageFiles[n]['name'];
                    document.content_type = _imageFiles[n]['content_type'];
                    document.user_id = _imageFiles[n]['user_id'];
                    document.folder_id = _imageFiles[n]['folder_id'];
                    document.upload_index = _imageFiles[n]['upload_index'];
                    document.file_path = _imageFiles[n]['file_path'];
                    document.thumb_path = _imageFiles[n]['thumb_path'];

                    FolderDocs.addNewDocument(document, function(res){
                        if(res.status == 200){
                            saved_document = {
                                document_id:res.document._id,
                                document_name:res.document.name,
                                document_type:res.document.content_type,
                                document_user:res.document.user_id,
                                document_path:res.document.file_path,
                                document_thumb_path:res.document.thumb_path,
                                document_updated_at:DateTime.noteCreatedDate(res.document.updated_at)
                            };
                            callback(null,n);
                        } else{
                            callback(null,n);
                        }
                    })
                } else{
                    callback(null,n);
                }
            },
            function saveDocumentToES(fileName, callback){
                console.log("came to saveDocumentToES");
                var n = fileName;

                if(typeof document.file_path != 'undefined' && typeof saved_document.document_id != 'undefined'){
                    x = 4;

                    Folders.getFolderById(Util.toObjectId(document.folder_id), function(result){

                        var _sharedUsers = result.shared_users;
                        var _folderOwner = result.user_id;

                        var _index = "";
                        var _type = "";

                        console.log("typeof _folderOwner ==> "+typeof _folderOwner);
                        console.log("typeof saved_document.document_user ==> "+typeof saved_document.document_user);

                        //check folder owner and document user same
                        if (_folderOwner.toString() == saved_document.document_user.toString()){
                            if(result.type == FolderType.PERSONAL_FOLDER){
                                _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                                _type = "own_document";
                            }else {
                                _index = FolderDocsConfig.ES_INDEX_OWN_GROUP_DOC;
                                _type = "own_group_document";
                            }
                        } else{
                            if(result.type == FolderType.PERSONAL_FOLDER) {
                                _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                                _type = "shared_document";
                            }else {
                                _index = FolderDocsConfig.ES_INDEX_SHARED_GROUP_DOC;
                                _type = "shared_group_document";
                            }
                        }
                        console.log(_index);console.log(_type);

                        var _esDocument = {
                            cache_key:_index+_folderOwner.toString(),
                            type:_type,
                            document_id:saved_document.document_id,
                            document_name:saved_document.document_name,
                            content_type:saved_document.document_type,
                            document_owner:saved_document.document_user,
                            document_user:_folderOwner,
                            file_path:saved_document.document_path,
                            thumb_path:saved_document.document_thumb_path,
                            folder_id:result._id,
                            folder_name:result.name
                        };

                        if(typeof result.group_id != "undefined" && result.group_id != null){
                            _esDocument['group_id'] = result.group_id.toString();
                        }

                        FolderDocs.addDocToCache(_esDocument, function(res){

                            _async.eachSeries(_sharedUsers, function(_sharedUser, callback){

                                if(_sharedUser.status == FolderSharedRequest.REQUEST_ACCEPTED){
                                    var _documentUser = _sharedUser.user_id;

                                    console.log("typeof _documentUser ==> "+typeof _documentUser);
                                    console.log("typeof saved_document.document_user ==> "+typeof saved_document.document_user);

                                    if (_documentUser.toString() == saved_document.document_user.toString()){
                                        if(result.type == FolderType.PERSONAL_FOLDER){
                                            _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                                            _type = "own_document";
                                        }else {
                                            _index = FolderDocsConfig.ES_INDEX_OWN_GROUP_DOC;
                                            _type = "own_group_document";
                                        }
                                    } else{
                                        if(result.type == FolderType.PERSONAL_FOLDER) {
                                            _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                                            _type = "shared_document";
                                        }else {
                                            _index = FolderDocsConfig.ES_INDEX_SHARED_GROUP_DOC;
                                            _type = "shared_group_document";
                                        }
                                    }
                                    console.log(_index);console.log(_type);

                                    _esDocument.cache_key = _index+_documentUser.toString();
                                    _esDocument.type = _type;
                                    _esDocument.document_user = _documentUser;

                                    FolderDocs.addDocToCache(_esDocument, function(res){
                                        callback(null)
                                    });
                                } else {
                                    callback(null)
                                }

                            }, function(err){
                                callback(null,n)
                            });
                        });
                    });

                } else{
                    callback(null,n);
                }
            },
            function flushData(fileName, callback){
                if(fileName != 'undefined' && _imageFiles.hasOwnProperty(fileName)) {
                    console.log("going to delete _imageFiles");
                    delete _imageFiles[fileName];
                }

                callback(null);
            }
        ], function(err){

            if(x == 4){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['upload_index']   = document.upload_index;
                outPut['document'] = saved_document;
                res.status(200).json(outPut);
            } else{
                outPut['status']    = ApiHelper.getMessage(200, Alert.ERROR, Alert.ERROR);
                res.status(400).json(outPut);
            }
        });
    }
};

module.exports = UploadController;