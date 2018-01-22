'use strict';

/**
 * Handle All Folder related functions
 */

var GroupFolderController ={

    /**
     * Adding New Folder
     * @param req
     * @param res
     */
    addNewFolder:function(req,res){


        var Folders = require('mongoose').model('Folders'),
            Groups = require('mongoose').model('Groups'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            group_id = req.body.group_id,
            folder_name = req.body.folder_name,
            folder_color = req.body.folder_color;
        var randColor = require('randomcolor');

        var sharedUsers = [], userId = CurrentSession.id;

        _async.waterfall([
            function getGroupDetails(callBack){
                Groups.getGroupById(group_id, function(groupData){
                    callBack(null, groupData);
                });
            },
            function createFolder(groupData, callBack){
                var _shared_users = [];
                var _accepted_shared_users = [];

                for(var i = 0; i < groupData.members.length; i++){
                    var color = randColor.randomColor({
                        luminosity: 'light',
                        hue: 'random'
                    });
                    if(groupData.members[i].user_id != userId){
                        var member_status = groupData.members[i].status;
                        var req_status = member_status == GroupSharedRequest.REQUEST_PENDING ? FolderSharedRequest.REQUEST_PENDING : member_status == GroupSharedRequest.REQUEST_ACCEPTED ? FolderSharedRequest.REQUEST_ACCEPTED : FolderSharedRequest.REQUEST_REJECTED;
                        var _obj = {
                            user_id : groupData.members[i].user_id,
                            user_note_color: color,
                            shared_type : FolderSharedMode.VIEW_UPLOAD,
                            status : req_status
                        }
                        _shared_users.push(_obj);
                        if(member_status == FolderSharedRequest.REQUEST_ACCEPTED) {
                            _accepted_shared_users.push(_obj);
                        }
                    }
                }

                var _folderData = {
                    name: folder_name,
                    color: folder_color,
                    user_id: userId,
                    group_id: groupData._id,
                    shared_users: _shared_users,
                    isDefault: false,
                    folder_type: FolderType.GROUP_FOLDER
                };

                Folders.addNewFolder(_folderData, function (resultSet) {

                    _async.eachSeries(_accepted_shared_users, function (member, membersCallBack) {

                        var memberData = {
                            folder_id: resultSet.folder._id,
                            folder_name: resultSet.folder.name,
                            folder_color: resultSet.folder.color,
                            folder_owner: resultSet.folder.user_id,
                            folder_updated_at: resultSet.folder.updated_at,
                            folder_shared_mode: FolderSharedMode.VIEW_UPLOAD,
                            folder_user: member.user_id.toString(),
                            folder_type: FolderType.GROUP_FOLDER,
                            group_id: resultSet.folder.group_id.toString(),
                            isDefault: resultSet.isDefault,
                            cache_key: FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER+member.user_id.toString()
                        }

                        Folders.addFolderToCache(memberData, function(r){
                            membersCallBack(null);
                        });

                    }, function (err) {
                        callBack(null);
                    });

                });
            }
        ],function(err){
            if(!err){
                console.log("response");
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            }else {
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }

        })

    },

/**
     * Get all group folders
     * @param req
     * @param res
     */
    getFolders: function (req, res) {
        var GroupsSchema = require('mongoose').model('Groups'),
            Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs');

        var user_id = CurrentSession.id;
        var group_id = req.params.group_id;

        var allFolders = [];

        _async.waterfall([
            function getOwnFolders(callBack) {
                var es_criteria= {
                    _index: FolderConfig.ES_INDEX_OWN_GROUP_FOLDER + user_id.toString(),
                    q: 'folder_type:' + FolderType.GROUP_FOLDER + ' AND folder_group_id:' + group_id.toString()
                };

                Folders.getSharedFolders(es_criteria, function (resultSet) {
                    callBack(null, resultSet.folders);
                });
            },
            function getSharedFolders(ownFolders, callBack) {
                var es_criteria= {
                    _index: FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER + user_id.toString(),
                    q: 'folder_type:' + FolderType.GROUP_FOLDER + ' AND folder_group_id:' + group_id.toString()
                };

                Folders.getSharedFolders(es_criteria, function (resultSet) {
                    var allFolders = ownFolders.concat(resultSet.folders);
                    callBack(null, allFolders);
                });
            },
            function getFolderAndDocuments(folders, callBack) {

                _async.eachSeries(folders, function (folder, callBackFolder) {
                    var _folder = {
                        folder_id: folder.folder_id,
                        folder_name: folder.folder_name,
                        folder_color: folder.folder_color,
                        folder_user: {
                            first_name: "",
                            profile_image: ""
                        },
                        folder_shared_users: [],
                        folder_updated_at: folder.folder_updated_at,
                        owned_by: (folder.folder_owner.toString() == user_id.toString() ? 'me' : 'other'),
                        is_shared: true,
                        isDefault: (folder.folder_is_default != undefined ? folder.folder_is_default : 0),
                        shared_mode: (folder.folder_owner.toString() == user_id.toString() ? 2 : folder.folder_shared_mode),
                        documents: []
                    };

                    _async.parallel([
                        function getFolderOwner(callback) {
                            var query = {
                                q: folder.folder_owner.toString(),
                                index: 'idx_usr'
                            };
                            ES.search(query, function (esResultSet) {
                                if (typeof esResultSet.result[0] == "undefined") {
                                    callback(null);
                                } else {
                                    if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].first_name != 'undefined') {
                                        _folder.folder_user.first_name = esResultSet.result[0].first_name;
                                    }
                                    if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].images != 'undefined'
                                        && typeof esResultSet.result[0].images.profile_image != 'undefined' && typeof esResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                        _folder.folder_user.profile_image = esResultSet.result[0].images.profile_image.http_url;
                                    }
                                    callback(null);
                                }
                            });
                        },
                        function getFolderDocuments(callback) {
                            var documents_criteria = {
                                folder_id: Util.toObjectId(folder.folder_id)
                            };

                            FolderDocs.getDocuments(documents_criteria, function (resultSet) {
                                var _documents = [];
                                _async.eachSeries(resultSet.documents, function (doc, callBackDocument) {
                                    var _doc = {
                                        document_id: doc._id,
                                        document_name: doc.name,
                                        document_type: doc.content_type,
                                        document_user: doc.user_id,
                                        document_user_name: "",
                                        document_user_pic: "",
                                        document_path: doc.file_path,
                                        document_thumb_path: doc.thumb_path,
                                        updated_at: doc.updated_at,
                                        document_updated_at: DateTime.noteCreatedDate(doc.updated_at)
                                    };

                                    var query = {
                                        q: doc.user_id.toString(),
                                        index: 'idx_usr'
                                    };
                                    ES.search(query, function (esResultSet) {
                                        if (typeof esResultSet.result[0] == "undefined") {
                                            _documents.push(_doc);
                                            callBackDocument(null);
                                        } else {
                                            if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].first_name != 'undefined') {
                                                _doc.document_user_name = esResultSet.result[0].first_name + " " + esResultSet.result[0].last_name;
                                            }
                                            if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].images != 'undefined'
                                                && typeof esResultSet.result[0].images.profile_image != 'undefined' && typeof esResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                                _doc.document_user_pic = esResultSet.result[0].images.profile_image.http_url;
                                            }
                                            _documents.push(_doc);
                                            callBackDocument(null);
                                        }
                                    });

                                }, function (err) {
                                    _folder.documents = _documents;
                                    callback(null)
                                });
                            });
                        }
                    ], function (err) {
                        allFolders.push(_folder);
                        callBackFolder(null);
                    })
                }, function (err) {
                    Util.sortByKeyASC(allFolders, 'folder_updated_at');
                    callBack(null);
                });
            }
        ], function (err) {
            if (err) {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }

            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folders: allFolders
            };
            res.status(200).json(outPut);
        });
    },

    /**
     * Get group folders
     * @param req
     * @param res
     */
    getFolder: function (req, res) {

        var GroupFolders = require('mongoose').model('GroupFolders');

        var folder_id = req.params.folder_id;
        var criteria = {_id: Util.toObjectId(folder_id)};

        GroupFolders.getFolder(criteria, function (resultSet) {
            if (resultSet.status == 200) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    folder: resultSet.folder
                }
                res.status(200).json(outPut);
            } else {
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }
        });

    },

    /**
     * get owned group folder count
     * @param req
     * @param res
     */
    getGroupFolderCount:function(req,res){

        var Folders = require('mongoose').model('Folders'),
            CurrentSession = Util.getCurrentSession(req);
        var user_id = CurrentSession.id;
        var criteria = {user_id:Util.toObjectId(user_id), group_id:req.params.group_id, type: 1};

        Folders.getCount(criteria,function(resultSet){
            if(resultSet.status == 200){
                var outPut ={
                    status:ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    count:resultSet.result
                };
                res.status(200).json(outPut);
            } else{
                var outPut ={
                    status:ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }
        });

    },


    /**
     * Get all group folders including own group folders and shared group folders
     * @param req
     * @param res
     */
    getAllGroupFolders:function(req,res){

        var GroupsSchema = require('mongoose').model('Groups'),
            Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs');

        var user_id = CurrentSession.id;

        var allFolders = [];

        _async.waterfall([
            function getOwnFolders(callBack) {
                var es_criteria= {
                    _index: FolderConfig.ES_INDEX_OWN_GROUP_FOLDER + user_id.toString(),
                    q: 'folder_type:' + FolderType.GROUP_FOLDER
                };

                Folders.getSharedFolders(es_criteria, function (resultSet) {
                    callBack(null, resultSet.folders);
                });
            },
            function getSharedFolders(ownFolders, callBack) {
                var es_criteria= {
                    _index: FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER + user_id.toString(),
                    q: 'folder_type:' + FolderType.GROUP_FOLDER
                };

                Folders.getSharedFolders(es_criteria, function (resultSet) {
                    var allFolders = ownFolders.concat(resultSet.folders);
                    callBack(null, allFolders);
                });
            },
            function getFolderAndDocuments(folders, callBack) {
                _async.eachSeries(folders, function (folder, callBackFolder) {

                    var _folder = {
                        folder_id: folder.folder_id,
                        folder_name: folder.folder_name,
                        folder_color: folder.folder_color,
                        folder_user: {
                            first_name: "",
                            profile_image: ""
                        },
                        folder_shared_users: [],
                        folder_updated_at: folder.folder_updated_at,
                        owned_by: (folder.folder_owner.toString() == user_id.toString() ? 'me' : 'other'),
                        is_shared: true,
                        isDefault: (folder.folder_is_default != undefined ? folder.folder_is_default : 0),
                        shared_mode: (folder.folder_owner.toString() == user_id.toString() ? 2 : folder.folder_shared_mode),
                        documents: []
                    };

                    _async.parallel([
                        function getFolderOwner(callback) {
                            var query = {
                                q: folder.folder_owner.toString(),
                                index: 'idx_usr'
                            };
                            ES.search(query, function (esResultSet) {
                                if (typeof esResultSet.result[0] == "undefined") {
                                    callback(null);
                                } else {
                                    if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].first_name != 'undefined') {
                                        _folder.folder_user.first_name = esResultSet.result[0].first_name;
                                    }
                                    if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].images != 'undefined'
                                        && typeof esResultSet.result[0].images.profile_image != 'undefined' && typeof esResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                        _folder.folder_user.profile_image = esResultSet.result[0].images.profile_image.http_url;
                                    }
                                    callback(null);
                                }
                            });
                        },
                        function getFolderDocuments(callback) {
                            var documents_criteria = {
                                folder_id: Util.toObjectId(folder.folder_id)
                            };

                            FolderDocs.getDocuments(documents_criteria, function (resultSet) {
                                var _documents = [];
                                _async.eachSeries(resultSet.documents, function (doc, callBackDocument) {
                                    var _doc = {
                                        document_id: doc._id,
                                        document_name: doc.name,
                                        document_type: doc.content_type,
                                        document_user: doc.user_id,
                                        document_user_name: "",
                                        document_user_pic: "",
                                        document_path: doc.file_path,
                                        document_thumb_path: doc.thumb_path,
                                        updated_at: doc.updated_at,
                                        document_updated_at: DateTime.noteCreatedDate(doc.updated_at)
                                    };

                                    var query = {
                                        q: doc.user_id.toString(),
                                        index: 'idx_usr'
                                    };
                                    ES.search(query, function (esResultSet) {
                                        if (typeof esResultSet.result[0] == "undefined") {
                                            _documents.push(_doc);
                                            callBackDocument(null);
                                        } else {
                                            if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].first_name != 'undefined') {
                                                _doc.document_user_name = esResultSet.result[0].first_name + " " + esResultSet.result[0].last_name;
                                            }
                                            if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].images != 'undefined'
                                                && typeof esResultSet.result[0].images.profile_image != 'undefined' && typeof esResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                                _doc.document_user_pic = esResultSet.result[0].images.profile_image.http_url;
                                            }
                                            _documents.push(_doc);
                                            callBackDocument(null);
                                        }
                                    });

                                }, function (err) {
                                    _folder.documents = _documents;
                                    callback(null)
                                });
                            });
                        }
                    ], function (err) {
                        allFolders.push(_folder);
                        callBackFolder(null);
                    })
                }, function (err) {
                    Util.sortByKeyASC(allFolders, 'folder_updated_at');
                    callBack(null);
                });
            }
        ], function (err) {
            if (err) {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }

            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folders: allFolders
            };
            res.status(200).json(outPut);
        });
    }
};

module.exports = GroupFolderController;
