'use strict';

/**
 * Handle All Folder related functions
 */

var FolderController = {

    /**
     * get owned folder count
     * @param req
     * @param res
     */

    getCount: function (req, res) {

        var Folders = require('mongoose').model('Folders'),
            CurrentSession = Util.getCurrentSession(req);
        var user_id = CurrentSession.id;
        var criteria = {
            user_id: Util.toObjectId(user_id),
            type: FolderType.PERSONAL_FOLDER
        };

        Folders.getCount(criteria, function (resultSet) {
            if (resultSet.status == 200) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    count: resultSet.result
                };
                res.status(200).json(outPut);
            } else {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }
        });

    },

    /**
     * Adding New Folder
     * @param req
     * @param res
     */
    addNewFolder: function (req, res) {

        var Folders = require('mongoose').model('Folders'),
            _shared_with = (typeof req.body.shared_with != 'undefined' && req.body.shared_with.length > 0) ? req.body.shared_with : [],
            _randColor = require('randomcolor'),
            sharedUsers = [],
            _async = require('async'),
            _folder_id = 0,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            canAdd = true,
            _folder = {};

        _async.waterfall([

            function checkIfDefaultExist(callBack) {

                if (typeof req.body.isDefault != 'undefined' && req.body.isDefault == 1) { //default folder
                    var criteria = {
                        user_id: Util.toObjectId(Util.getCurrentSession(req).id),
                        type: FolderType.PERSONAL_FOLDER
                    };
                    Folders.getFolders(criteria, function (resultSet) {
                        if (resultSet.folders.length > 0) { //but default folder already exist, don't need to go further
                            canAdd = false;
                            _folder = {
                                folder_id: resultSet.folders[0]._id,
                                folder_name: resultSet.folders[0].name,
                                folder_color: resultSet.folders[0].color,
                                folder_user: resultSet.folders[0].user_id,
                                folder_shared_users: resultSet.folders[0].shared_users,
                                folder_updated_at: resultSet.folders[0].updated_at,
                                folder_type: resultSet.folders[0].folder_type,
                                folder_group_id: resultSet.folders[0].folder_group_id,
                                owned_by: 'me',
                                documents: []
                            };
                            var outPut = {
                                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                                folder: _folder
                            };
                            res.status(200).json(outPut);
                        } else {
                            callBack(null);
                        }
                    });
                } else {
                    callBack(null);
                }

            },

            function addFolderToDB(callBack) {

                //console.log("addFolderToDB")

                for (var i = 0; i < _shared_with.length; i++) {
                    //console.log("_shared_with = "+i)
                    var randColor = _randColor.randomColor({
                        luminosity: 'light',
                        hue: 'random'
                    });

                    var _sharingUser = {
                        user_id: _shared_with[i],
                        user_note_color: randColor,
                        shared_type: FolderSharedMode.VIEW_ONLY,
                        status: FolderSharedRequest.REQUEST_PENDING
                    };

                    sharedUsers.push(_sharingUser);
                }

                if (canAdd) {

                    var _folderrr = {
                        name: req.body.folder_name,
                        color: req.body.folder_color,
                        isDefault: req.body.isDefault,
                        user_id: Util.getCurrentSession(req).id,
                        shared_users: sharedUsers,
                        folder_type: req.body.folder_type,
                        group_id: req.body.group_id
                    };

                    Folders.addNewFolder(_folderrr, function (resultSet) {
                        _folder_id = resultSet.folder._id;
                        if (typeof req.body.isDefault != 'undefined' && req.body.isDefault == 1) {
                            _folder = {
                                folder_id: resultSet.folder._id,
                                folder_name: resultSet.folder.name,
                                folder_color: resultSet.folder.color,
                                folder_user: resultSet.folder.user_id,
                                folder_shared_users: resultSet.folder.shared_users,
                                folder_updated_at: resultSet.folder.updated_at,
                                folder_type: resultSet.folder_type,
                                folder_group_id: resultSet.folder_group_id,
                                owned_by: 'me',
                                documents: []
                            };
                            var outPut = {
                                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                                folder: _folder
                            };
                            res.status(200).json(outPut);
                        } else {
                            callBack(null);
                        }
                    });

                } else {
                    callBack(null);
                }

            },
            function addNotification(callBack) {
                //console.log("addNotification");

                if (_shared_with.length > 0 && _folder_id != 0) {
                    var _data = {
                        sender: Util.getCurrentSession(req).id,
                        notification_type: Notifications.SHARE_FOLDER,
                        notified_folder: _folder_id
                    }
                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id);
                        }
                    });
                } else {
                    callBack(null, null);
                }
            },
            function notifyingUsers(notification_id, callBack) {
                //console.log("notifyingUsers");

                if (typeof notification_id != 'undefined' && _shared_with.length > 0) {

                    var _data = {
                        notification_id: notification_id,
                        recipients: _shared_with
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }
            }

        ], function (err) {
            //console.log("async waterfall callback");

            if (err) {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folder_id: _folder_id
            };
            res.status(200).json(outPut);
        });

    },

    getFolders: function (req, res) {

        //console.log("getFolders");

        var Folders = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            grep = require('grep-from-array'),
            FolderDocs = require('mongoose').model('FolderDocs');

        var user_id = CurrentSession.id;
        var criteria = {
            user_id: Util.toObjectId(user_id),
            type: FolderType.PERSONAL_FOLDER
        };
        var myFolder = [],
            ownFolders = [],
            sharedFolders = [];

        _async.parallel([

            function getOwnFolders(callback) {
                console.log("getOwnFolders");
                _async.waterfall([
                    function getFolders(callBack) {
                        console.log("getOwnFolders - getFolders");
                        Folders.getFolders(criteria, function (resultSet) {
                            callBack(null, resultSet.folders);
                        });
                    },
                    function getDocumentsDB(folders, callBack) {
                        console.log("getOwnFolders - getDocumentsDB");
                        _async.eachSeries(folders, function (folder, callBackFolder) {
                            if (typeof folder.type != 'undefined' && folder.type == FolderType.GROUP_FOLDER) { //get only personal folders not group folders
                                callBackFolder(null);
                            } else {
                                var _isShared = false;
                                var _sharedUsers = folder.shared_users;
                                for (var su = 0; su < _sharedUsers.length; su++) {
                                    if (_sharedUsers[su].status == FolderSharedRequest.REQUEST_ACCEPTED) {
                                        _isShared = true;
                                    }
                                }
                                var _folder = {
                                    folder_id: folder._id,
                                    folder_name: folder.name,
                                    folder_color: folder.color,
                                    folder_user: folder.user_id,
                                    folder_shared_users: folder.shared_users,
                                    folder_updated_at: folder.updated_at,
                                    owned_by: 'me',
                                    is_shared: _isShared,
                                    shared_mode: FolderSharedMode.VIEW_UPLOAD,
                                    documents: []
                                }, documents_criteria = {
                                    folder_id: Util.toObjectId(folder._id)
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
                                                //console.log(esResultSet.result[0]);
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
                                        if (_folder.folder_name == "My Folder") {
                                            myFolder.push(_folder);
                                        } else {
                                            ownFolders.push(_folder);
                                        }
                                        callBackFolder(null);
                                    });
                                });
                            }
                        }, function (err) {
                            console.log("async eachseries callback")
                            callBack(null);
                        });
                    }
                ], function (err) {
                    callback(null);
                });
            },

            function getSharedFolders(callback) {
                //console.log("getSharedFolders");
                _async.waterfall([
                    function getFolders(callBack) {
                        //console.log("getSharedFolders - getFolders");
                        var es_criteria= {
                            _index: FolderConfig.ES_INDEX_SHARED_FOLDER + user_id.toString()
                        };

                        Folders.getSharedFolders(es_criteria, function (resultSet) {
                            // console.log("=== Shared Folder Results ===");
                            // console.log(resultSet);
                            callBack(null, resultSet.folders);
                        });
                    },
                    function getFolderAndDocuments(folders, callBack) {
                        //console.log("getSharedFolders - getFolderAndDocuments");
                        _async.eachSeries(folders, function (folder, callBackFolder) {
                            //console.log("==================================")
                            //console.log(folder);
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
                                owned_by: 'other',
                                is_shared: false,
                                shared_mode: folder.folder_shared_mode,
                                documents: []
                            };

                            _async.parallel([
                                function getFolderOwner(callback) {
                                    //console.log("================getFolderOwner==================")
                                    //console.log(_folder);
                                    var query = {
                                        q: folder.folder_owner.toString(),
                                        index: 'idx_usr'
                                    };
                                    ES.search(query, function (esResultSet) {
                                        if (typeof esResultSet.result[0] == "undefined") {
                                            callback();
                                        } else {
                                            //console.log(esResultSet.result[0]);
                                            if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].first_name != 'undefined') {
                                                _folder.folder_user.first_name = esResultSet.result[0].first_name;
                                            }
                                            if (typeof esResultSet.result[0] != 'undefined' && typeof esResultSet.result[0].images != 'undefined'
                                                && typeof esResultSet.result[0].images.profile_image != 'undefined' && typeof esResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                                _folder.folder_user.profile_image = esResultSet.result[0].images.profile_image.http_url;
                                            }
                                            callback();
                                        }
                                    });
                                },
                                function getFolderDetails(callback) {
                                    //console.log("================getFolderDetails==================")
                                    //console.log(_folder);
                                    Folders.getFolderById(Util.toObjectId(folder.folder_id), function (result) {
                                        //console.log("folder info");
                                        //console.log(result);

                                        var _isShared = _folder.is_shared;
                                        var _sharedUsers = result.shared_users;
                                        for (var su = 0; su < _sharedUsers.length; su++) {
                                            if (_sharedUsers[su].status == FolderSharedRequest.REQUEST_ACCEPTED) {
                                                _isShared = true;
                                            }
                                        }

                                        _folder.folder_shared_users = _sharedUsers;
                                        _folder.is_shared = _isShared;
                                        _folder.folder_updated_at = result.updated_at;
                                        callback(null)
                                    });

                                },
                                function getFolderDocuments(callback) {
                                    //console.log("================getFolderDocuments==================")
                                    //console.log(_folder);
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
                                                    //console.log(esResultSet.result[0]);
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
                                sharedFolders.push(_folder);
                                callBackFolder(null);
                            })
                        }, function (err) {
                            //console.log("async eachseries callback")
                            callBack(null);
                        });
                    }
                ], function (err) {
                    callback(null);
                });
            }
        ], function (err) {
            //console.log("loadFolders ..sending response")
            if (err) {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR),
                };
                res.status(400).json(outPut);
            }

            var allFolders = [];
            for (var my = 0; my < myFolder.length; my++) {
                allFolders.push(myFolder[my]);
            }
            for (var s = 0; s < sharedFolders.length; s++) {
                allFolders.push(sharedFolders[s]);
            }
            for (var own = 0; own < ownFolders.length; own++) {
                allFolders.push(ownFolders[own]);
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folders: allFolders
            };
            res.status(200).json(outPut);
        });
    },

    getSharedUsers: function (req, res) {

        //console.log("Folder - getSharedUsers");

        var _async = require('async'),
            Folder = require('mongoose').model('Folders'),
            User = require('mongoose').model('User'),
            folderId = req.body.folder_id;

        var dataArray = [],
            owner = {
                first_name: "",
                last_name: "",
                profile_image: "",
                country: "",
                school: "",
                degree: "",
                company_name: "",
                company_location: ""
            };

        _async.waterfall([
            function getFolder(callBack) {
                //console.log("Folder - getFolder");
                Folder.getFolderById(folderId, function (resultSet) {
                    callBack(null, resultSet);
                });
            },
            function getOwnerAndSharedUsers(resultSet, callBack) {
                //console.log("====== getOwnerAndSharedUsers =====");
                var folderData = resultSet;
                //console.log("====== FOLDER DATA =====");
                //console.log(JSON.stringify(folderData));

                _async.parallel([

                    function getEsOwner(callBack) {

                        //console.log("====== getEsOwner =====");

                        var query = {
                            q: "user_id:" + folderData.user_id.toString(),
                            index: 'idx_usr'
                        };
                        //Find User from Elastic search
                        ES.search(query, function (csResultSet) {

                            if (typeof csResultSet.result[0] != "undefined") {

                                //console.log("====== OWNER DATA =====");
                                //console.log(JSON.stringify(csResultSet.result[0]));

                                if (typeof csResultSet.result[0].first_name != 'undefined') {
                                    owner.first_name = csResultSet.result[0].first_name;
                                }
                                if (typeof csResultSet.result[0].last_name != 'undefined') {
                                    owner.last_name = csResultSet.result[0].last_name;
                                }
                                if (typeof csResultSet.result[0].images != 'undefined' && typeof csResultSet.result[0].images.profile_image != 'undefined' &&
                                    typeof csResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                    owner.profile_image = csResultSet.result[0].images.profile_image.http_url;
                                }

                                callBack(null);

                            } else {
                                callBack(null);
                            }
                        });

                    },

                    function getOwnerMoreDetails(callBack) {

                        //console.log("====== getOwnerMoreDetails =====")

                        var criteria = {_id: folderData.user_id.toString()},
                            showOptions = {
                                w_exp: true,
                                edu: true
                            };

                        User.getUser(criteria, showOptions, function (resultSet) {

                            //console.log("====== OWNER MORE DATA =====");
                            //console.log(JSON.stringify(resultSet.user));

                            owner.country = resultSet.user.country;
                            owner.school = resultSet.user.education_details[0].school;
                            owner.degree = resultSet.user.education_details[0].degree;
                            owner.company_name = resultSet.user.working_experiences[0].company_name;
                            owner.company_location = resultSet.user.working_experiences[0].location;
                            callBack(null);
                        });

                    },

                    function getSharedUsers(callBack) {

                        //console.log("====== getSharedUsers =====");
                        var sharedUsers = resultSet.shared_users;

                        _async.eachSeries(sharedUsers, function (sharedUser, callBack) {
                            //console.log("###########################");
                            //console.log(sharedUser);

                            if (sharedUser.status == FolderSharedRequest.REQUEST_ACCEPTED || sharedUser.status == FolderSharedRequest.REQUEST_PENDING) {
                                var usrObj = {
                                    first_name: "",
                                    last_name: "",
                                    profile_image: "",
                                    country: "",
                                    school: "",
                                    degree: "",
                                    company_name: "",
                                    company_location: ""
                                };

                                _async.parallel([

                                    function getEsSharedUsers(callBack) {

                                        //console.log("====== getEsSharedUsers =====");

                                        var query = {
                                            q: "user_id:" + sharedUser.user_id.toString(),
                                            index: 'idx_usr'
                                        };
                                        //Find User from Elastic search
                                        ES.search(query, function (csResultSet) {

                                            //console.log("********************************************************");
                                            //console.log(JSON.stringify(csResultSet.result[0]));
                                            //console.log("********************************************************");

                                            if (typeof csResultSet.result[0] != "undefined") {

                                                if (typeof csResultSet.result[0].first_name != 'undefined') {
                                                    usrObj.first_name = csResultSet.result[0].first_name;
                                                }
                                                if (typeof csResultSet.result[0].last_name != 'undefined') {
                                                    usrObj.last_name = csResultSet.result[0].last_name;
                                                }
                                                if (typeof csResultSet.result[0].images != 'undefined' && typeof csResultSet.result[0].images.profile_image != 'undefined' &&
                                                    typeof csResultSet.result[0].images.profile_image.http_url != 'undefined') {
                                                    usrObj.profile_image = csResultSet.result[0].images.profile_image.http_url;
                                                }
                                                callBack(null);

                                            } else {
                                                callBack(null);
                                            }

                                        });

                                    },

                                    function getSharedUserMoreDetails(callBack) {

                                        //console.log("====== getSharedUserMoreDetails =====")

                                        var criteria = {_id: sharedUser.user_id.toString()},
                                            showOptions = {
                                                w_exp: true,
                                                edu: true
                                            };

                                        User.getUser(criteria, showOptions, function (resultSet) {
                                            //console.log("********************************************************");
                                            //console.log(JSON.stringify(resultSet));
                                            //console.log("********************************************************");

                                            usrObj.country = resultSet.user.country;
                                            usrObj.school = resultSet.user.education_details[0].school;
                                            usrObj.degree = resultSet.user.education_details[0].degree;
                                            usrObj.company_name = resultSet.user.working_experiences[0].company_name;
                                            usrObj.company_location = resultSet.user.working_experiences[0].location;
                                            callBack(null);
                                        })
                                    }

                                ], function (err) {
                                    //console.log("CALLBACK ==> 541")
                                    usrObj.user_id = sharedUser.user_id;
                                    usrObj.folder_id = folderId;
                                    usrObj.shared_type = sharedUser.shared_type;
                                    usrObj.shared_status = sharedUser.status;

                                    dataArray.push(usrObj);
                                    callBack(null);
                                });
                            } else {
                                callBack(null);
                            }
                        }, function (err) {
                            //console.log("CALLBACK ==> 525")
                            callBack(null);
                        });

                    }

                ], function (err) {
                    //console.log("CALLBACK ==> 468")
                    owner.user_id = folderData.user_id;
                    owner.folder_id = folderId;
                    callBack(null);
                });

            }
        ], function (err) {
            //console.log("CALLBACK ==> 457")
            //console.log("=========++++++++++++++++OWNER++++++++++++++++++++=============");
            //console.log(JSON.stringify(owner));
            //console.log("=========++++++++++++++++SHARED USER++++++++++++++++++++=============");
            //console.log(JSON.stringify(dataArray));
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                owner: owner,
                sharedWith: dataArray
            };
            res.status(200).json(outPut);
        })

    },

    shareFolder: function (req, res) {
        //console.log("shareFolder")

        var Folders = require('mongoose').model('Folders'),
            shared_with = [req.body.userId],
            folder_id = req.body.folderId,
            _randColor = require('randomcolor'),
            sharedUsers = [],
            _async = require('async'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        //console.log("folder_id ==> "+folder_id);
        //console.log("shared_with ==> ",shared_with);

        _async.waterfall([

            function addSharedUserToFolder(callBack) {

                //console.log("addFolderToDB");

                for (var i = 0; i < shared_with.length; i++) {

                    var randColor = _randColor.randomColor({
                        luminosity: 'light',
                        hue: 'random'
                    });

                    var _sharingUser = {
                        user_id: shared_with[i],
                        user_note_color: randColor,
                        shared_type: FolderSharedMode.VIEW_ONLY,
                        status: FolderSharedRequest.REQUEST_PENDING
                    };

                    sharedUsers.push(_sharingUser);

                }

                //console.log(sharedUsers);

                var _sharedUsers = {
                    shared_users: {$each: sharedUsers}
                };

                Folders.shareFolder(folder_id, _sharedUsers, function (resultSet) {
                    callBack(null);
                });

            },
            function addNotification(callBack) {
                //console.log("addNotification");

                if (shared_with.length > 0 && typeof folder_id != 'undefined') {
                    var _data = {
                        sender: Util.getCurrentSession(req).id,
                        notification_type: Notifications.SHARE_FOLDER,
                        notified_folder: folder_id
                    }
                    Notification.saveNotification(_data, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.result._id);
                        }
                    });
                } else {
                    callBack(null, null);
                }
            },
            function notifyingUsers(notification_id, callBack) {
                //console.log("notifyingUsers");

                if (typeof notification_id != 'undefined' && shared_with.length > 0) {

                    var _data = {
                        notification_id: notification_id,
                        recipients: shared_with
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }
            }

        ], function (err) {
            //console.log("async waterfall callback");

            if (err) {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });
    },

    getFolder: function (req, res) {

        var Folders = require('mongoose').model('Folders');

        var folder_id = req.params.folder_id;
        var criteria = {_id: Util.toObjectId(folder_id)};

        Folders.getFolder(criteria, function (resultSet) {
            if (resultSet.status == 200) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    folder: resultSet.folder
                }
                res.status(200).json(outPut);
            } else {
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    },

    deleteFolder: function (req, res){
        var Folder = require('mongoose').model('Folders');
        var FolderDoc = require('mongoose').model('FolderDocs');
        var Notification = require('mongoose').model('Notification');
        var NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var folder_id = req.body.folder_id,
            _async = require('async');
        var owner_id = Util.getCurrentSession(req).id;

        _async.waterfall([

            function getFolderDetails (callBack){
                Folder.getFolderById(folder_id, function(r){
                    callBack(null, r);
                });
            },
            function removeNotificationsAndSharedUsers(folderObj,callBack){

                var folder_id = folderObj._id;
                var sharedUsers = folderObj.shared_users;

                if(folderObj != undefined && sharedUsers.length > 0 && folderObj && folderObj.isDefault != 1 ) {

                    _async.eachSeries(sharedUsers, function (_shared_user, suCallBack) {

                        var shared_user_id = _shared_user.user_id;

                        var _sharedUsers = {
                            shared_users: {user_id: {$in: [shared_user_id]}}
                        };

                        var sharedStatus = _shared_user.status;

                        _async.waterfall([

                            function getNotificaionRequests(callBack) {

                                var criteria = {
                                    notified_folder: folderObj._id,
                                    notification_type: Notifications.SHARE_FOLDER,
                                    sender: folderObj.user_id
                                };

                                var filteredObject = {}

                                Notification.getNotifications(criteria, function (r) {
                                    _async.eachSeries(r.result, function (notifObj, sCallBack) {

                                        var innerCriteria = {
                                            notification_id: notifObj._id,
                                            recipient: shared_user_id
                                        };

                                        NotificationRecipient.getAllRecipientNotification(innerCriteria, function (nrResults) {
                                            if (typeof nrResults.result != 'undefined' && nrResults.result.length > 0
                                                && nrResults.result[0].recipient.toString() == shared_user_id.toString()) {
                                                filteredObject['notificationId'] = notifObj._id;
                                                filteredObject['notificationRecipientId'] = nrResults.result[0]._id;
                                            }

                                            sCallBack(null);
                                        });

                                    }, function (err) {
                                        callBack(null, filteredObject);
                                    });
                                });
                            },
                            function removeNotificationRecipient(filteredObject, callBack) {

                                console.log("removeNotificationRecipient");

                                var criteria = {
                                    _id: filteredObject.notificationRecipientId
                                };

                                NotificationRecipient.deleteNotificationRecipients(criteria, function (r) {
                                    callBack(null, filteredObject);
                                });

                            },
                            function removeNotificationRequest(filteredObject, callBack) {

                                console.log("removeNotificationRequest");

                                var criteria = {
                                    _id: filteredObject.notificationId
                                };

                                Notification.deleteNotification(criteria, function (r) {
                                    callBack(null);
                                });

                            },
                            function getNotificationResponses(callBack) {

                                var criteria = {
                                    notified_folder: folderObj._id,
                                    notification_type: Notifications.SHARE_FOLDER_RESPONSE,
                                    sender: shared_user_id
                                };

                                Notification.getNotifications(criteria, function (r) {
                                    if (typeof r.result != 'undefined' && r.result.length > 0) {
                                        callBack(null, r.result[0]._id);
                                    } else {
                                        callBack(null, null);
                                    }
                                });
                            },
                            function removeNotificationRecipient(notificationId, callBack) {

                                console.log("removeNotificationRecipient");

                                if (notificationId != null) {
                                    var criteria = {
                                        notification_id: notificationId,
                                        recipient: folderObj.user_id
                                    };

                                    NotificationRecipient.deleteNotificationRecipients(criteria, function (r) {
                                        callBack(null, notificationId);
                                    });
                                } else {
                                    callBack(null, null);
                                }

                            },
                            function removeNotificationRequest(notificationId, callBack) {

                                console.log("removeNotificationRequest");

                                if (notificationId != null) {
                                    var criteria = {
                                        _id: notificationId
                                    };

                                    Notification.deleteNotification(criteria, function (r) {
                                        callBack(null);
                                    });
                                } else {
                                    callBack(null);
                                }

                            },
                            function removeSharedUserFromDB(callback) {
                                console.log("removeSharedUserFromDB");

                                console.log(_sharedUsers);
                                Folder.removeSharedUser(folder_id, _sharedUsers, function (result) {
                                    callback(null);
                                });
                            },
                            function removeFolderFromES(callback) {
                                console.log("removeFolderFromES")
                                if(sharedStatus != FolderSharedRequest.REQUEST_PENDING) {
                                    var _groupId = folderObj.group_id;
                                    if(_groupId != undefined && _groupId != '' && _groupId) {
                                        var _payload = {
                                            id: folder_id.toString(),
                                            type: "shared_folder",
                                            cache_key: FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER + shared_user_id.toString()

                                        };
                                        Folder.deleteFolderFromCache(_payload, function (err) {
                                            callback(null);
                                        });
                                    } else {
                                        var _payload = {
                                            id: folder_id.toString(),
                                            type: "shared_folder",
                                            cache_key: FolderConfig.ES_INDEX_SHARED_FOLDER + shared_user_id.toString()

                                        };
                                        Folder.deleteFolderFromCache(_payload, function (err) {
                                            callback(null);
                                        });
                                    }

                                }else{
                                    callback(null);
                                }

                            },
                            function removeFilesFromES(callback) {
                                console.log("removeFilesFromES")
                                if(sharedStatus != FolderSharedRequest.REQUEST_PENDING) {

                                    var _criteria = {folder_id: Util.toObjectId(folder_id)}

                                    FolderDoc.getFolderDocument(_criteria, function (result) {
                                        if (result.status == 200) {
                                            var _docs = result.document;

                                            _async.eachSeries(_docs, function (doc, callback) {

                                                var _payload = {
                                                    id: doc._id.toString(),
                                                    type: "shared_document",
                                                    cache_key: FolderDocsConfig.ES_INDEX_SHARED_DOC + shared_user_id.toString()

                                                };
                                                FolderDoc.deleteDocumentFromCache(_payload, function (err) {
                                                    callback(null);
                                                });

                                            }, function (err) {
                                                callback(null);
                                            });

                                        } else {
                                            callback(null);
                                        }
                                    });
                                }else {
                                    callback(null);
                                }
                            }
                        ], function (err) {
                            suCallBack(null);
                        });

                    }, function (err) {
                        callBack(null, folderObj);
                    });

                }else {
                    callBack(null, folderObj);
                }

            },
            function getFolderDocuments(folderObj, callBack){

                if(folderObj != undefined && folderObj && folderObj.isDefault != 1 ) {
                    var docCriteria = {folder_id: folderObj._id}

                    FolderDoc.getFolderDocument(docCriteria, function (resultDoc) {
                        callBack(null,{
                            folderObj: folderObj,
                            docs: resultDoc.document
                        });
                    });

                } else {
                    callBack(null, null);
                }

            },
            function removeDocuments(results, callBack){

                var _folderObj = results.folderObj;

                if(_folderObj != undefined && results.docs != undefined && _folderObj && _folderObj.isDefault != 1 ) {
                    _async.eachSeries(results.docs, function (doc, docsCallBack) {

                        var file_id = doc._id,
                            theFolder = results.folderObj,
                            theDocument = doc;

                        _async.waterfall([

                            function deleteFilesFromCDN(callback) {
                                console.log("deleteFilesFromCDN");

                                _async.parallel([
                                    function (callback) {
                                        console.log("=====file path=====");
                                        if (typeof theDocument.file_path != 'undefined' && theDocument.file_path != null) {
                                            var _filePath = theDocument.file_path;
                                            var _filePathArray = _filePath.split(theDocument.folder_id.toString() + '/');
                                            var _fileName = _filePathArray[1];
                                            var _file = {
                                                entity_id: theDocument.folder_id.toString(),
                                                file_name: _fileName
                                            };
                                            ContentUploader.deleteFromCDN(_file, function (result) {
                                                callback(null);
                                            })
                                        } else {
                                            callback(null);
                                        }
                                    },
                                    function (callback) {
                                        console.log("=====thumb path=====");
                                        if (typeof theDocument.thumb_path != 'undefined' && theDocument.thumb_path != null) {
                                            var _filePath = theDocument.thumb_path;
                                            var _filePathArray = _filePath.split(theDocument.folder_id.toString() + '/');
                                            var _fileName = _filePathArray[1];
                                            var _file = {
                                                entity_id: theDocument.folder_id.toString(),
                                                file_name: _fileName
                                            };
                                            console.log(_file);
                                            ContentUploader.deleteFromCDN(_file, function (result) {
                                                callback(null);
                                            })
                                        } else {
                                            callback(null);
                                        }
                                    }
                                ], function (err) {
                                    callback(null);
                                });
                            },

                            function deleteFromDB(callback) {
                                console.log("deleteFromDB");
                                var docCriteria = {_id: Util.toObjectId(file_id)};
                                FolderDoc.deleteDocument(docCriteria, function (resultDoc) {
                                    callback(null);
                                });
                            },

                            function deleteFromES(callback) {
                                console.log("deleteFromES");

                                _async.parallel([
                                    function (callback) {

                                        var _folderOwner = theFolder.user_id;

                                        var _index = "";
                                        var _type = "";

                                        console.log("_folderOwner == " + typeof _folderOwner);
                                        console.log("theDocument.user_id == " + typeof theDocument.user_id)

                                        if (_folderOwner.toString() == theDocument.user_id.toString()) {
                                            _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                                            _type = "own_document";
                                        } else {
                                            _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                                            _type = "shared_document";
                                        }

                                        var _payload = {
                                            id: theDocument._id.toString(),
                                            type: _type,
                                            cache_key: _index + _folderOwner.toString()
                                        };
                                        FolderDoc.deleteDocumentFromCache(_payload, function (err) {
                                            callback(null);
                                        });

                                    },
                                    function (callback) {

                                        var _sharedUsers = theFolder.shared_users;
                                        _async.eachSeries(_sharedUsers, function (_sharedUser, callback) {

                                            if (_sharedUser.status == FolderSharedRequest.REQUEST_ACCEPTED) {
                                                var _documentUser = _sharedUser.user_id;

                                                var _index = "";
                                                var _type = "";

                                                if (_documentUser == theDocument.user_id.toString()) {
                                                    _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                                                    _type = "own_document";
                                                } else {
                                                    _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                                                    _type = "shared_document";
                                                }
                                                console.log(_index);
                                                var _payload = {
                                                    id: theDocument._id.toString(),
                                                    type: _type,
                                                    cache_key: _index + _documentUser.toString()
                                                };
                                                FolderDoc.deleteDocumentFromCache(_payload, function (err) {
                                                    callback(null);
                                                });

                                            } else {
                                                callback(null);
                                            }

                                        }, function (err) {
                                            callback(null)
                                        });

                                    }
                                ], function (err) {
                                    callback(null);
                                });
                            }
                        ], function (err) {

                            console.log("Deleted: " + doc.name);

                            docsCallBack(null);
                        });

                    }, function (err) {
                        callBack(null, results);
                    });
                } else {
                    callBack(null, results);
                }
            },
            /**
             * This will remove folder owner ES index
             * @param _results
             * @param callBack
             */
            function removeOwnerESFolderIndex(_results, callBack){
                console.log("removeOwnerESFolderIndex called");

                var folderObj = _results.folderObj;

                if(folderObj != undefined && folderObj && folderObj.isDefault != 1 ) {
                    var _groupId = folderObj.group_id;
                    if(_groupId != undefined && _groupId != '' && _groupId) {
                        var _payload = {
                            id: folder_id.toString(),
                            type: "own_folder",
                            cache_key: FolderConfig.ES_INDEX_OWN_GROUP_FOLDER + owner_id.toString()

                        };
                        Folder.deleteFolderFromCache(_payload, function (_res) {
                            callBack(null, _results);
                        });
                    } else {
                        var _payload = {
                            id: folder_id.toString(),
                            type: "own_folder",
                            cache_key: FolderConfig.ES_INDEX_OWN_FOLDER + owner_id.toString()

                        };
                        Folder.deleteFolderFromCache(_payload, function (err) {
                            callBack(null, _results);
                        });
                    }
                } else {
                    callBack(null, _results);
                }
            },
            /**
             * Remove folder from db finally
             * @param results
             * @param callBack
             */
            function removeFolder(results, callBack){

                var folderObj = results.folderObj;

                if(folderObj != undefined && folderObj && folderObj.isDefault != 1 ) {
                    var folder_id = results.folderObj._id;

                    var criteria = {
                        _id: folder_id
                    }

                    Folder.removeFolder(criteria, function (r){
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }
            }

        ], function (err) {

            if (!err) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            } else {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }

        });
    },

    /**
     * folder owner can remove shared users from db and ES
     * @param req
     * @param res
     */
    removeSharedFolderUser: function (req, res) {

        //console.log("removeSharedFolderUser")

        var Folder = require('mongoose').model('Folders');
        var FolderDoc = require('mongoose').model('FolderDocs');
        var Notification = require('mongoose').model('Notification');
        var NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var folder_id = req.body.folder_id,
            shared_user_id = [req.body.user_id],
            _async = require('async');

        //console.log("typeof folder_id == "+typeof folder_id);
        //console.log("typeof shared_user_id == "+typeof shared_user_id);

        var _sharedUsers = {
            shared_users: {user_id: {$in: shared_user_id}}
        };

        var folderObj = {};

        var sharedStatus = '';

        _async.waterfall([

            function getFolderDetails (callBack){
                Folder.getFolderById(folder_id, function(r){

                    folderObj = r;
                    sharedStatus = r.shared_users[0].status;

                    console.log(folderObj);

                    callBack(null, r);
                });
            },
            function removeNotification (folderObj, callBack){
                _async.waterfall([
                    function getNotificaionRequests (callBack){

                        var criteria = {
                            notified_folder: folderObj._id,
                            notification_type: Notifications.SHARE_FOLDER,
                            sender: folderObj.user_id
                        };

                        var filteredObject = {}

                        Notification.getNotifications(criteria, function(r){
                            _async.eachSeries(r.result, function (notifObj, sCallBack) {

                                var innerCriteria = {
                                    notification_id: notifObj._id,
                                    recipient: shared_user_id
                                };

                                NotificationRecipient.getAllRecipientNotification(innerCriteria, function(nrResults){
                                    if (typeof nrResults.result != 'undefined' && nrResults.result.length > 0
                                        && nrResults.result[0].recipient.toString() == shared_user_id.toString()){
                                        filteredObject['notificationId'] = notifObj._id;
                                        filteredObject['notificationRecipientId'] = nrResults.result[0]._id;
                                    }

                                    sCallBack(null);
                                });

                            }, function (err) {
                                callBack(null, filteredObject);
                            });
                        });
                    },
                    function removeNotificationRecipient(filteredObject , callBack){

                        var criteria = {
                            _id: filteredObject.notificationRecipientId
                        };

                        NotificationRecipient.deleteNotificationRecipients(criteria, function (r){
                            callBack(null, filteredObject);
                        });

                    },
                    function removeNotificationRequest(filteredObject , callBack){

                        var criteria = {
                            _id: filteredObject.notificationId
                        };

                        Notification.deleteNotification(criteria, function (r){
                            callBack(null);
                        });

                    },
                    function getNotificationResponses (callBack){

                        var criteria = {
                            notified_folder: folderObj._id,
                            notification_type: Notifications.SHARE_FOLDER_RESPONSE,
                            sender: shared_user_id
                        };

                        Notification.getNotifications(criteria, function(r){
                            if (typeof r.result != 'undefined' && r.result.length > 0){
                                callBack(null, r.result[0]._id);
                            }else {
                                callBack(null, null);
                            }
                        });
                    },
                    function removeNotificationRecipient(notificationId , callBack){

                        if(notificationId !=null) {
                            var criteria = {
                                notification_id: notificationId,
                                recipient: folderObj.user_id
                            };

                            NotificationRecipient.deleteNotificationRecipients(criteria, function (r) {
                                callBack(null, notificationId);
                            });
                        } else {
                            callBack(null, null);
                        }

                    },
                    function removeNotificationRequest(notificationId , callBack){

                        if(notificationId !=null) {
                            var criteria = {
                                _id: notificationId
                            };

                            Notification.deleteNotification(criteria, function (r){
                                callBack(null);
                            });
                        } else {
                            callBack(null);
                        }

                    },
                ], function (err) {
                    callBack(null);
                });
            },
            function removeSharedUserFromDB(callback) {
                //console.log("removeSharedUserFromDB")
                Folder.removeSharedUser(folder_id, _sharedUsers, function (result) {
                    callback(null);
                });
            },
            function removeFolderFromES(callback) {
                // console.log("removeFolderFromES")
                if(sharedStatus != FolderSharedRequest.REQUEST_PENDING) {
                    var _payload = {
                        id: folder_id.toString(),
                        type: "shared_folder",
                        cache_key: FolderConfig.ES_INDEX_SHARED_FOLDER + shared_user_id.toString()

                    };
                    Folder.deleteFolderFromCache(_payload, function (err) {
                        callback(null);
                    });
                }else{
                    callback(null);
                }

            },
            function removeFilesFromES(callback) {
                // console.log("removeFilesFromES")
                if(sharedStatus != FolderSharedRequest.REQUEST_PENDING) {

                    var _criteria = {folder_id: Util.toObjectId(folder_id)}

                    FolderDoc.getFolderDocument(_criteria, function (result) {
                        if (result.status == 200) {
                            var _docs = result.document;

                            _async.eachSeries(_docs, function (doc, callback) {

                                //console.log("=====================")
                                //console.log(doc);

                                var _payload = {
                                    id: doc._id.toString(),
                                    type: "shared_document",
                                    cache_key: FolderDocsConfig.ES_INDEX_SHARED_DOC + shared_user_id.toString()

                                };
                                FolderDoc.deleteDocumentFromCache(_payload, function (err) {
                                    callback(null);
                                });

                            }, function (err) {
                                callback(null);
                            });

                        } else {
                            callback(null);
                        }
                    });
                }else {
                    callback(null);
                }
            }

        ], function (err) {

            if (!err) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                res.status(200).json(outPut);
            } else {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR)
                };
                res.status(400).json(outPut);
            }

        });


    },

    /**
     * change shared permission
     * @param req
     * @param res
     */
    updateFolderSharedPermission: function (req, res) {
        var Folder = require('mongoose').model('Folders'),
            own_user_id = Util.getCurrentSession(req).id,
            _async = require('async');

        var shared_type = req.body.shared_type == 2 ? FolderSharedMode.VIEW_UPLOAD : FolderSharedMode.VIEW_ONLY,
            shared_user_id = req.body.user_id;

        _async.waterfall([
            function updateDB(callback) {
                var _udata = {
                    'shared_users.$.shared_type': shared_type
                };

                var criteria = {
                    _id: Util.toObjectId(req.body.folder_id),
                    user_id: Util.toObjectId(own_user_id),
                    'shared_users.user_id': shared_user_id
                };

                Folder.updateSharedFolder(criteria, _udata, function (result) {
                    callback(null);
                });
            },
            function updateES(callback) {

                Folder.getFolderById(Util.toObjectId(req.body.folder_id), function (result) {

                    var _esFolder = {
                        cache_key: FolderConfig.ES_INDEX_SHARED_FOLDER + shared_user_id.toString(),
                        folder_id: result._id,
                        folder_name: result.name,
                        folder_color: result.color,
                        folder_owner: result.user_id,
                        folder_user: shared_user_id,
                        folder_updated_at: result.updated_at,
                        folder_shared_mode: shared_type
                    };

                    Folder.addFolderToCache(_esFolder, function (res) {
                        callback(null);
                    });
                });

            }

        ], function (err) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });

    },

    /**
     * delete a document
     * @param req
     * @param res
     */
    deleteDocument: function (req, res) {
        console.log("deleteDocument");
        console.log(req.body.file_id);

        var _async = require('async'),
            Folder = require('mongoose').model('Folders'),
            FolderDoc = require('mongoose').model('FolderDocs'),
            file_id = req.body.file_id,
            theFolder = {},
            theDocument = {};

        _async.waterfall([

            function getDetailsFromDB(callback) {
                console.log("getDetailsFromDB");
                var docCriteria = {_id: Util.toObjectId(file_id)}
                FolderDoc.getDocument(docCriteria, function (resultDoc) {
                    theDocument = resultDoc.document;
                    Folder.getFolderById(theDocument.folder_id, function (resultFolder) {
                        theFolder = resultFolder;
                        callback(null);
                    });
                });
            },

            function deleteFilesFromCDN(callback) {
                console.log("deleteFilesFromCDN");
                console.log("The Document ==>");
                console.log(JSON.stringify(theDocument));
                console.log("The Folder ==>");
                console.log(JSON.stringify(theFolder));

                _async.parallel([
                    function (callback) {
                        console.log("=====file path=====");
                        if (typeof theDocument.file_path != 'undefined' && theDocument.file_path != null) {
                            var _filePath = theDocument.file_path;
                            var _filePathArray = _filePath.split(theDocument.folder_id.toString() + '/');
                            var _fileName = _filePathArray[1];
                            var _file = {
                                entity_id: theDocument.folder_id.toString(),
                                file_name: _fileName
                            };
                            console.log(_file);
                            ContentUploader.deleteFromCDN(_file, function (result) {
                                callback(null);
                            })
                        } else {
                            callback(null);
                        }
                    },
                    function (callback) {
                        console.log("=====thumb path=====");
                        if (typeof theDocument.thumb_path != 'undefined' && theDocument.thumb_path != null) {
                            var _filePath = theDocument.thumb_path;
                            var _filePathArray = _filePath.split(theDocument.folder_id.toString() + '/');
                            var _fileName = _filePathArray[1];
                            var _file = {
                                entity_id: theDocument.folder_id.toString(),
                                file_name: _fileName
                            };
                            console.log(_file);
                            ContentUploader.deleteFromCDN(_file, function (result) {
                                callback(null);
                            })
                        } else {
                            callback(null);
                        }
                    }
                ], function (err) {
                    callback(null);
                });
            },

            function deleteFromDB(callback) {
                console.log("deleteFromDB");
                var docCriteria = {_id: Util.toObjectId(file_id)};
                FolderDoc.deleteDocument(docCriteria, function (resultDoc) {
                    callback(null);
                });
            },

            function deleteFromES(callback) {
                console.log("deleteFromES");

                _async.parallel([
                    function (callback) {

                        var _folderOwner = theFolder.user_id;

                        var _index = "";
                        var _type = "";

                        console.log("_folderOwner == " + typeof _folderOwner);
                        console.log("theDocument.user_id == " + typeof theDocument.user_id)

                        if (_folderOwner.toString() == theDocument.user_id.toString()) {
                            _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                            _type = "own_document";
                        } else {
                            _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                            _type = "shared_document";
                        }
                        console.log(_index);

                        var _payload = {
                            id: theDocument._id.toString(),
                            type: _type,
                            cache_key: _index + _folderOwner.toString()
                        };
                        console.log("=====================")
                        console.log(_payload)
                        FolderDoc.deleteDocumentFromCache(_payload, function (err) {
                            callback(null);
                        });

                    },
                    function (callback) {

                        var _sharedUsers = theFolder.shared_users;
                        _async.eachSeries(_sharedUsers, function (_sharedUser, callback) {

                            if (_sharedUser.status == FolderSharedRequest.REQUEST_ACCEPTED) {
                                var _documentUser = _sharedUser.user_id;

                                var _index = "";
                                var _type = "";

                                console.log("_documentUser == " + typeof _documentUser);
                                console.log("theDocument.user_id == " + typeof theDocument.user_id)

                                if (_documentUser == theDocument.user_id.toString()) {
                                    _index = FolderDocsConfig.ES_INDEX_OWN_DOC;
                                    _type = "own_document";
                                } else {
                                    _index = FolderDocsConfig.ES_INDEX_SHARED_DOC;
                                    _type = "shared_document";
                                }
                                console.log(_index);
                                var _payload = {
                                    id: theDocument._id.toString(),
                                    type: _type,
                                    cache_key: _index + _documentUser.toString()
                                };
                                console.log("=====================")
                                console.log(_payload)
                                FolderDoc.deleteDocumentFromCache(_payload, function (err) {
                                    callback(null);
                                });

                            } else {
                                callback(null);
                            }

                        }, function (err) {
                            callback(null)
                        });

                    }
                ], function (err) {
                    callback(null);
                });
            }
        ], function (err) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).json(outPut);
        });
    },

    /**
     * Search Folder
     * @param req
     * @param res
     */
    searchFolder: function (req, res) {
        //console.log("searchFolder")
        var Folder = require('mongoose').model('Folders'),
            FolderDoc = require('mongoose').model('FolderDocs'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async');

        var _user_id = CurrentSession.id,
            is_group = req.params['is_group'],
            _search = req.params['q'],
            _names = [],
            _data_by_name = {},
            folders = [];

        _async.parallel([

            function searchMyOwnFolder(callback) {
                var _index = is_group != undefined && is_group == 'Y'  ? FolderConfig.ES_INDEX_OWN_GROUP_FOLDER : FolderConfig.ES_INDEX_OWN_FOLDER;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'folder_name:' + _search + '* '
                };
                Folder.searchFolders(criteria, function (result) {
                    var _tempFolders = result.folders;
                    for (var i = 0; i < _tempFolders.length; i++) {
                        if (_names.indexOf(_tempFolders[i].folder_name) == -1) {
                            _names.push(_tempFolders[i].folder_name);
                        }
                        if (typeof _data_by_name[_tempFolders[i].folder_name] == 'undefined') {
                            _data_by_name[_tempFolders[i].folder_name] = [];
                        }
                        var _folder = {
                            folder_id: _tempFolders[i].folder_id,
                            name: _tempFolders[i].folder_name,
                            type: "folder"
                        };
                        _data_by_name[_tempFolders[i].folder_name].push(_folder);
                    }
                    callback(null);
                });
            },
            function searchSharedFolder(callback) {
                var _index = is_group != undefined && is_group == 'Y'  ? FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER : FolderConfig.ES_INDEX_SHARED_FOLDER;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'folder_name:' + _search + '* '
                };
                Folder.searchFolders(criteria, function (result) {
                    var _tempFolders = result.folders;
                    for (var i = 0; i < _tempFolders.length; i++) {
                        if (_names.indexOf(_tempFolders[i].folder_name) == -1) {
                            _names.push(_tempFolders[i].folder_name);
                        }
                        if (typeof _data_by_name[_tempFolders[i].folder_name] == 'undefined') {
                            _data_by_name[_tempFolders[i].folder_name] = [];
                        }
                        var _folder = {
                            folder_id: _tempFolders[i].folder_id,
                            name: _tempFolders[i].folder_name,
                            type: "folder"
                        };
                        _data_by_name[_tempFolders[i].folder_name].push(_folder);
                    }
                    callback(null);
                });
            },
            function searchMyOwnDocuments(callback) {
                var _index = is_group != undefined && is_group == 'Y'  ? FolderDocsConfig.ES_INDEX_OWN_GROUP_DOC : FolderDocsConfig.ES_INDEX_OWN_DOC;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'document_name:' + _search + '* '
                };
                FolderDoc.searchFolderDocument(criteria, function (result) {
                    var _tempDocuments = result.documents;
                    for (var i = 0; i < _tempDocuments.length; i++) {
                        if (_names.indexOf(_tempDocuments[i].document_name) == -1) {
                            _names.push(_tempDocuments[i].document_name);
                        }
                        if (typeof _data_by_name[_tempDocuments[i].document_name] == 'undefined') {
                            _data_by_name[_tempDocuments[i].document_name] = [];
                        }
                        var _document = {
                            document_id: _tempDocuments[i].document_id,
                            folder_id: _tempDocuments[i].folder_id,
                            folder_name: _tempDocuments[i].folder_name,
                            name: _tempDocuments[i].document_name,
                            type: "document"
                        };
                        _data_by_name[_tempDocuments[i].document_name].push(_document);
                    }
                    callback(null);
                });
            },
            function searchSharedDocuments(callback) {
                var _index = is_group != undefined && is_group == 'Y'  ? FolderDocsConfig.ES_INDEX_SHARED_GROUP_DOC : FolderDocsConfig.ES_INDEX_SHARED_DOC;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'document_name:' + _search + '* '
                };
                FolderDoc.searchFolderDocument(criteria, function (result) {
                    var _tempDocuments = result.documents;
                    for (var i = 0; i < _tempDocuments.length; i++) {
                        if (_names.indexOf(_tempDocuments[i].document_name) == -1) {
                            _names.push(_tempDocuments[i].document_name);
                        }
                        if (typeof _data_by_name[_tempDocuments[i].document_name] == 'undefined') {
                            _data_by_name[_tempDocuments[i].document_name] = [];
                        }
                        var _document = {
                            document_id: _tempDocuments[i].document_id,
                            folder_id: _tempDocuments[i].folder_id,
                            folder_name: _tempDocuments[i].folder_name,
                            name: _tempDocuments[i].document_name,
                            type: "document"
                        };
                        _data_by_name[_tempDocuments[i].document_name].push(_document);
                    }
                    callback(null);
                });
            }

        ], function (err) {

            //console.log("callback")
            _names.sort(function (a, b) {
                return b - a;
            });

            for (var i = 0; i < _names.length; i++) {
                var _name = _names[i];
                for (var a = 0; a < _data_by_name[_name].length; a++) {
                    folders.push(_data_by_name[_name][a]);
                }
            }

            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                suggested_folders: folders
            };
            res.status(200).json(outPut);

        });
    },

    /**
     * Search Group Folder
     * @param req
     * @param res
     */
    searchGroupFolder: function (req, res) {
        //console.log("searchFolder")
        var Folder = require('mongoose').model('Folders'),
            FolderDoc = require('mongoose').model('FolderDocs'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async');

        var _user_id = CurrentSession.id,
            _group_id = req.params['group_id'],
            _search = req.params['q'],
            _names = [],
            _data_by_name = {},
            folders = [];

        _async.parallel([

            function searchMyOwnFolder(callback) {
                var _index = FolderConfig.ES_INDEX_OWN_GROUP_FOLDER;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'folder_group_id:' + _group_id.toString() +' AND folder_name:' + _search + '* '
                };
                Folder.searchFolders(criteria, function (result) {
                    var _tempFolders = result.folders;
                    for (var i = 0; i < _tempFolders.length; i++) {
                        if (_names.indexOf(_tempFolders[i].folder_name) == -1) {
                            _names.push(_tempFolders[i].folder_name);
                        }
                        if (typeof _data_by_name[_tempFolders[i].folder_name] == 'undefined') {
                            _data_by_name[_tempFolders[i].folder_name] = [];
                        }
                        var _folder = {
                            folder_id: _tempFolders[i].folder_id,
                            name: _tempFolders[i].folder_name,
                            type: "folder"
                        };
                        _data_by_name[_tempFolders[i].folder_name].push(_folder);
                    }
                    callback(null);
                });
            },
            function searchSharedFolder(callback) {
                var _index = FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'folder_group_id:' + _group_id.toString() +' AND folder_name:' + _search + '* '
                };
                Folder.searchFolders(criteria, function (result) {
                    var _tempFolders = result.folders;
                    for (var i = 0; i < _tempFolders.length; i++) {
                        if (_names.indexOf(_tempFolders[i].folder_name) == -1) {
                            _names.push(_tempFolders[i].folder_name);
                        }
                        if (typeof _data_by_name[_tempFolders[i].folder_name] == 'undefined') {
                            _data_by_name[_tempFolders[i].folder_name] = [];
                        }
                        var _folder = {
                            folder_id: _tempFolders[i].folder_id,
                            name: _tempFolders[i].folder_name,
                            type: "folder"
                        };
                        _data_by_name[_tempFolders[i].folder_name].push(_folder);
                    }
                    callback(null);
                });
            },
            function searchMyOwnDocuments(callback) {
                var _index = FolderDocsConfig.ES_INDEX_OWN_GROUP_DOC;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'folder_group_id:' + _group_id.toString() +' AND document_name:' + _search + '* '
                };
                FolderDoc.searchFolderDocument(criteria, function (result) {
                    var _tempDocuments = result.documents;
                    for (var i = 0; i < _tempDocuments.length; i++) {
                        if (_names.indexOf(_tempDocuments[i].document_name) == -1) {
                            _names.push(_tempDocuments[i].document_name);
                        }
                        if (typeof _data_by_name[_tempDocuments[i].document_name] == 'undefined') {
                            _data_by_name[_tempDocuments[i].document_name] = [];
                        }
                        var _document = {
                            document_id: _tempDocuments[i].document_id,
                            folder_id: _tempDocuments[i].folder_id,
                            folder_name: _tempDocuments[i].folder_name,
                            name: _tempDocuments[i].document_name,
                            type: "document"
                        };
                        _data_by_name[_tempDocuments[i].document_name].push(_document);
                    }
                    callback(null);
                });
            },
            function searchSharedDocuments(callback) {
                var _index = FolderDocsConfig.ES_INDEX_SHARED_GROUP_DOC;
                var criteria = {
                    index: _index + _user_id.toString(),
                    q: 'folder_group_id:' + _group_id.toString() +' AND document_name:' + _search + '* '
                };
                FolderDoc.searchFolderDocument(criteria, function (result) {
                    var _tempDocuments = result.documents;
                    for (var i = 0; i < _tempDocuments.length; i++) {
                        if (_names.indexOf(_tempDocuments[i].document_name) == -1) {
                            _names.push(_tempDocuments[i].document_name);
                        }
                        if (typeof _data_by_name[_tempDocuments[i].document_name] == 'undefined') {
                            _data_by_name[_tempDocuments[i].document_name] = [];
                        }
                        var _document = {
                            document_id: _tempDocuments[i].document_id,
                            folder_id: _tempDocuments[i].folder_id,
                            folder_name: _tempDocuments[i].folder_name,
                            name: _tempDocuments[i].document_name,
                            type: "document"
                        };
                        _data_by_name[_tempDocuments[i].document_name].push(_document);
                    }
                    callback(null);
                });
            }

        ], function (err) {

            //console.log("callback")
            _names.sort(function (a, b) {
                return b - a;
            });

            for (var i = 0; i < _names.length; i++) {
                var _name = _names[i];
                for (var a = 0; a < _data_by_name[_name].length; a++) {
                    folders.push(_data_by_name[_name][a]);
                }
            }

            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                suggested_folders: folders
            };
            res.status(200).json(outPut);

        });
    },


    /**
     * get a Folder
     * @param req
     * @param res
     */
    getAFolder: function (req, res) {
        //console.log("getAFolder")
        var Folder = require('mongoose').model('Folders'),
            FolderDoc = require('mongoose').model('FolderDocs'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async');

        var _user_id = CurrentSession.id,
            folder_id = req.params['folder_id'],
            document_id = req.params['document_id'],
            _folder = {};

        //console.log("folder_id ===> "+folder_id)
        //console.log("document_id ===>"+document_id)

        _async.waterfall([

            function getFolderDetails(callback) {
                //console.log("getFolderDetails")
                Folder.getFolderById(Util.toObjectId(folder_id), function (result) {

                    //console.log("folder info");
                    //console.log(JSON.stringify(result));

                    var ownedBy = "";
                    if (result.user_id.toString() == _user_id.toString()) {
                        ownedBy = "me";
                    } else {
                        ownedBy = "other";
                    }

                    var sharedMode = 0;

                    var _isShared = false;
                    var _sharedUsers = result.shared_users;
                    for (var su = 0; su < _sharedUsers.length; su++) {
                        if (_sharedUsers[su].status == FolderSharedRequest.REQUEST_ACCEPTED) {
                            _isShared = true;
                        }
                        if (ownedBy == "other" && _sharedUsers[su].user_id.toString() == _user_id.toString()) {
                            sharedMode = _sharedUsers[su].shared_type
                        }
                    }

                    _folder = {
                        folder_id: result._id,
                        folder_name: result.name,
                        folder_color: result.color,
                        folder_user: {
                            first_name: "",
                            profile_image: ""
                        },
                        folder_shared_users: _sharedUsers,
                        folder_updated_at: result.updated_at,
                        owned_by: ownedBy,
                        is_shared: _isShared,
                        shared_mode: sharedMode,
                        documents: []
                    };


                    if (ownedBy == "other") {

                        var query = {
                            q: result.user_id.toString(),
                            index: 'idx_usr'
                        };
                        ES.search(query, function (esResultSet) {
                            //console.log(JSON.stringify(esResultSet));
                            if (typeof esResultSet.result[0] == "undefined") {
                                callback(null);
                            } else {
                                //console.log(esResultSet.result[0]);
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
                    } else {
                        callback(null);
                    }
                });
            },
            function getDocuments(callback) {

                //console.log("getDocuments");
                //console.log(JSON.stringify(_folder));

                var _criteria = {folder_id: Util.toObjectId(folder_id)};
                var _documents = [];

                FolderDoc.getFolderDocument(_criteria, function (result) {
                    if (result.status == 200) {
                        var _docs = result.document;

                        _async.eachSeries(_docs, function (doc, callback) {

                            //console.log("=====================")
                            //console.log(doc);

                            var _document = {
                                document_id: doc._id,
                                document_name: doc.name,
                                document_type: doc.content_type,
                                document_user: doc.user_id,
                                document_path: doc.file_path,
                                document_thumb_path: doc.thumb_path,
                                updated_at: doc.updated_at,
                                document_updated_at: DateTime.noteCreatedDate(doc.updated_at)
                            };

                            _documents.push(_document);
                            callback(null)

                        }, function (err) {
                            _folder.documents = _documents;
                            callback(null);
                        });

                    } else {
                        callback(null);
                    }
                });

            },
            function rearrangeDocs(callback) {
                //console.log("rearrangeDocs");
                //console.log(JSON.stringify(_folder));


                if (typeof document_id != 'undefined') {

                    var _tempDocs = _folder.documents;
                    var _docs = [];

                    for (var i = 0; i < _tempDocs.length; i++) {
                        var _tempDoc = _tempDocs[i];
                        if (_tempDocs[i].document_id.toString() == document_id.toString()) {
                            _tempDoc.isSelected = true;
                            _docs.unshift(_tempDoc)
                        } else {
                            _tempDoc.isSelected = false;
                            _docs.push(_tempDoc)
                        }
                    }

                    _folder.documents = _docs;
                    callback(null);

                } else {
                    callback(null);
                }
            }

        ], function (err) {
            //console.log("callback");
            //console.log(JSON.stringify(_folder));
            var _tempFolder = [_folder];

            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                folder: _tempFolder
            };
            res.status(200).json(outPut);

        });
    }
};

module.exports = FolderController;
