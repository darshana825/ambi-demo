'use strict';

/**
 * Handle All Groups related functions
 */

var GroupsController = {

    createGroup: function (req, res) {

        var Groups = require('mongoose').model('Groups');
        var Folders = require('mongoose').model('Folders');
        var NoteBook = require('mongoose').model('Notebook');
        var Upload = require('mongoose').model('Upload');
        var Connection = require('mongoose').model('Connection');
        var CurrentSession = Util.getCurrentSession(req);
        var randColor = require('randomcolor');
        var _async = require('async'),
            userId = Util.getCurrentSession(req).id,
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            User = require('mongoose').model('User'),
            notifyUsers = (typeof req.body._members != 'undefined' ? req.body._members : []); //this should be an array

        // add group owner as a group member
        // status is hard coded due to : no member request accept process
        req.body._members.push({
            user_id: CurrentSession.id,
            name: CurrentSession.first_name + ' ' + CurrentSession.last_name,
            status: 3
        });

        _async.waterfall([
            function getGroup(callBack) {
                var criteria = {"name_prefix": req.body._name};
                Groups.getGroup(criteria, function (result) {
                    if (result.status == 200) {
                        callBack(null, result.group[0]);
                    } else {
                        callBack(null, null);
                    }
                });
            },
            function ProcessGroupCreation(_data,callBack) {
                if(_data != undefined && _data != [] && _data) {
                    callBack(null, _data);
                } else {
                    _async.waterfall([
                        function createGroup(callBack) {

                            var _group = {
                                name: req.body._name,
                                description: req.body._description,
                                color: req.body._color,
                                group_pic_link: req.body._group_pic_link,
                                group_pic_id: req.body._group_pic_id,
                                members: req.body._members,
                                created_by: Util.getCurrentSession(req).id,

                                /*TODO@Eranga : Define group-connection type in elasticsearch also.
                                 This type must reflect connections model in database. */

                                type: (typeof req.body._type != 'undefined' ? req.body._type : 1)
                            };
                            Groups.createGroup(_group, function (resultSet) {
                                if (resultSet.status == 200) {
                                    callBack(null, resultSet.result);
                                }
                            });
                        },
                        function updateImageDocument(groupData, callBack) {

                            if (req.body._group_pic_id) {
                                var filter = {"_id": req.body._group_pic_id};
                                var value = {"entity_id": groupData._id};
                                Upload.updateUpload(filter, value, function (updateResult) {
                                    if (updateResult.error) {
                                        callBack(updateResult.error, null);
                                    }
                                    callBack(null, groupData);
                                });
                            } else {
                                callBack(null, groupData);
                            }
                        },
                        function createDefaultFolder(groupData, callBack) {

                            if (typeof groupData != 'undefined' && Object.keys(groupData).length > 0) {

                                var _shared_users = [];

                                for(var i = 0; i < groupData.members.length; i++){
                                    var color = randColor.randomColor({
                                        luminosity: 'light',
                                        hue: 'random'
                                    });
                                    if(groupData.members[i].user_id != userId){
                                        _shared_users.push(
                                            {
                                                user_id : Util.toObjectId(groupData.members[i].user_id),
                                                user_note_color: color,
                                                shared_type : FolderSharedMode.VIEW_UPLOAD,
                                                status : FolderSharedRequest.REQUEST_PENDING
                                            }
                                        );
                                    }
                                }

                                var _folderData = {
                                    name: groupData.name,
                                    color: groupData.color,
                                    user_id: userId,
                                    group_id: groupData._id,
                                    shared_users: _shared_users,
                                    isDefault: true,
                                    folder_type: FolderType.GROUP_FOLDER
                                };

                                Folders.addNewFolder(_folderData, function (resultSet) {
                                    callBack(null, groupData);
                                });

                            } else {
                                callBack(null, groupData);
                            }
                        },
                        // function createDefaultNoteBook(groupData, callBack) {
                        //
                        //     if (typeof groupData != 'undefined' && Object.keys(groupData).length > 0) {
                        //
                        //         var _notebook = {
                        //             name: groupData.name,
                        //             color: groupData.color,
                        //             type: NoteBookType.GROUP_NOTEBOOK,
                        //             user_id: userId,
                        //             group_id: groupData._id
                        //         };
                        //         NoteBook.addNewNoteBook(_notebook, function (resultSet) {
                        //             callBack(null, groupData);
                        //         });
                        //     } else {
                        //         callBack(null, groupData);
                        //     }
                        // },
                        function addNotification(groupData, callBack) {

                            if (notifyUsers.length > 0 && Object.keys(groupData).length > 0) {

                                var _data = {
                                    sender: userId,
                                    notification_type: Notifications.SHARE_GROUP,
                                    notified_group: groupData._id
                                }
                                Notification.saveNotification(_data, function (res) {
                                    if (res.status == 200) {
                                        callBack(null, groupData, res.result._id);
                                    }
                                });
                            } else {
                                callBack(null, groupData, null);
                            }
                        },
                        function notifyingUsers(groupData, notification_id, callBack) {

                            if (typeof notification_id != 'undefined' && notifyUsers.length > 0) {

                                var _members = [];
                                for (var x = 0; x < notifyUsers.length; x++) {
                                    if(userId.toString() != notifyUsers[x].user_id.toString()){
                                        _members.push(notifyUsers[x].user_id);
                                    }
                                }

                                var _data = {
                                    notification_id: notification_id,
                                    recipients: _members
                                };
                                NotificationRecipient.saveRecipients(_data, function (res) {
                                    callBack(null, groupData);
                                });

                            } else {
                                callBack(null, groupData);
                            }
                        },
                        function createConnections(groupData, callBack) {
                            if (notifyUsers.length > 0) {
                                Groups.addConnections(groupData, userId, function () {
                                    console.log("CREATING CONNECTIONS");
                                });
                                callBack(null, groupData);
                            } else {
                                callBack(null, groupData);
                            }
                        }
                    ], function (err, _groupData) {

                        callBack(null, _groupData);
                    });
                }
            }
        ], function (err, groupData) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS);
                outPut['result'] = groupData;
                res.status(200).send(outPut);
            }
        });
    },

    addGroupPost: function (req, res) {
        var outPut = {}, CurrentSession = Util.getCurrentSession(req);
        var TimeLinePostHandler = require('../../middleware/TimeLinePostHandler');
        var _async = require('async'),
            User = require('mongoose').model('User'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient'),
            Groups = require('mongoose').model('Groups');

        var groupId = req.body._groupId;
        _async.waterfall([
            function getGroupMembers(callBack) {
                var criteria = {_id: Util.toObjectId(groupId)};
                Groups.getGroupMembers(criteria, function (membersResult) {

                    callBack(null, membersResult.members);
                });
            },
            function addPost(members, callBack) {
                var data = {
                    has_attachment: (typeof req.body.__hs_attachment != 'undefined') ? req.body.__hs_attachment : false,
                    content: (typeof req.body.__content != 'undefined') ? req.body.__content : "",
                    created_by: (req.body.__on_friends_wall === 'true') ? req.body.__profile_user_id : CurrentSession.id,
                    post_owned_by: CurrentSession.id,
                    page_link: (typeof req.body.page_link != 'undefined') ? req.body.page_link : "",
                    post_visible_mode: PostVisibleMode.GROUP_MEMBERS,
                    visible_users: members,
                    post_mode: (typeof req.body.__post_mode != 'undefined') ? req.body.__post_mode : PostConfig.NORMAL_POST,
                    file_content: (typeof req.body.__file_content != 'undefined') ? req.body.__file_content : "",
                    upload_id: (typeof req.body.__uuid != 'undefined') ? req.body.__uuid : "",
                    location: (typeof req.body.__lct != 'undefined') ? req.body.__lct : "",
                    life_event: (typeof req.body.__lf_evt != 'undefined') ? req.body.__lf_evt : "",
                    shared_post: ""
                };
                TimeLinePostHandler.addNewPost(data, function (addResult) {
                    callBack(null, addResult);
                });
            },


            function addNotification(postData, callBack) {

                if (postData.visible_users.length > 0 && Object.keys(postData).length > 0) {

                    var _data = {
                        sender: postData.post_owned_by.user_id,
                        notification_type: Notifications.SHARE_GROUP,
                        notified_group: groupId
                    }
                    Notification.saveNotification(_data, function (notificationRes) {
                        if (notificationRes.status == 200) {
                            console.log(notificationRes);
                            callBack(null, postData, notificationRes.result._id);
                        }
                    });
                } else {
                    callBack(null, postData, null);
                }
            },
            function notifyingUsers(postData, notification_id, callBack) {

                if (typeof notification_id != 'undefined' && postData.visible_users.length > 0) {
                    var _data = {
                        notification_id: notification_id,
                        recipients: postData.visible_users
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null, postData);
                    });

                } else {
                    callBack(null, postData);
                }
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });

    },

    /*
     * Updating the group description
     */
    updateDescription: function (req, res) {

        var outPut = {};
        var currentSession = Util.getCurrentSession(req);
        var async = require('async');
        var groups = require('mongoose').model('Groups');
        var groupId = (typeof req.body.__groupId != 'undefined') ? req.body.__groupId : null;
        var description = (typeof req.body.__description != 'undefined') ? req.body.__description : null;

        if (groupId == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_ID_EMPTY, Alert.GROUP_ID_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        if (description == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_DESCRIPTION_EMPTY, Alert.GROUP_DESCRIPTION_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        async.waterfall([
            function updateDb(callBack) {
                var filter = {
                    "_id": groupId
                };
                var value = {
                    "description": description
                };
                groups.updateGroups(filter, value, function (updateResult) {
                    callBack(null, updateResult.group);
                });
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });
    },


    /**
     * @description Add new users as an array
     * @param String groupId
     * @param Array newusers
     *      ex:-
     *          [{
     *              "permissions" : null,
     *              "status" : 3,
     *               "user_id" : "583d3d0ddaf9fd094117eb72",
     *               "name" : "Supun Sulan"
     *          }]
     */
    addMembers: function (req, res) {

        var outPut = {};
        var currentSession = Util.getCurrentSession(req);
        var async = require('async');
        var randColor = require('randomcolor');
        var _grep = require('grep-from-array')
        var groups = require('mongoose').model('Groups');
        var folders = require('mongoose').model('Folders');
        var Notification = require('mongoose').model('Notification');
        var NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var groupId = (typeof req.body.__groupId != 'undefined') ? req.body.__groupId : null;
        var requestMembers = (typeof req.body.__members != 'undefined') ? req.body.__members : [];
        var userId = currentSession.id;
        var newMembers = [], onceRemovedMembers = [];

        if (groupId == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_ID_EMPTY, Alert.GROUP_ID_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        if (requestMembers == null) {
            outPut['status'] = ApiHelper.getMessage(602, Alert.GROUP_MEMBERS_EMPTY, Alert.GROUP_MEMBERS_EMPTY);
            res.status(602).send(outPut);
            return;
        }

        async.waterfall([
            function isMemberExists(callBack){

                var group_id= Util.toObjectId(groupId);

                groups.getGroupById(group_id, function (groupData){
                    var members = groupData.members;
                    for(var i = 0; i < requestMembers.length; i++){
                        var grep_member = _grep(members, function (e) {
                            return e.user_id.toString() == requestMembers[i].user_id;
                        });
                        if(grep_member.length == 0){
                            newMembers.push(requestMembers[i]);
                        } else if(grep_member[0].status == GroupSharedRequest.MEMBER_REMOVED){
                            onceRemovedMembers.push(requestMembers[i]);
                        }
                    }
                    callBack(null);
                });
            },
            function updateOnceRemovedMemberStatus(callBack) {
                async.each(onceRemovedMembers, function (onceRemovedMember, callBack) {
                    var criteria = {
                        '_id': Util.toObjectId(groupId),
                        'members.user_id': Util.toObjectId(onceRemovedMember.user_id)
                    };

                    var _status = {
                        'members.$.status': GroupSharedRequest.REQUEST_PENDING
                    };

                    groups.updateGroups(criteria, _status, function (r) {
                        callBack(null);
                    });

                }, function (err) {
                    callBack(null);
                });
            },
            function updateDb(callBack) {
                var filter = {
                    "_id": groupId
                };
                var value = {
                    $push: {
                        "members": {$each: newMembers}
                    }
                };
                groups.updateGroups(filter, value, function (updateResult) {
                    callBack(null, updateResult.group);
                });
            },
            function addAllMembers(groupData, callBack) {
                if (onceRemovedMembers.length > 0) {
                    for(var i = 0; i < onceRemovedMembers.length; i++){
                        if(newMembers.indexOf(onceRemovedMembers[i]) == -1) {
                            newMembers.push(onceRemovedMembers[i]);
                        }
                    }
                }
                callBack(null, groupData);
            },
            function createConnections(groupData, callBack) {

                if (newMembers.length > 0) {
                    var criteria = {"_id": groupId};
                    groups.getGroup(criteria, function (result) {
                        if (result.status == 200) {
                            groups.addConnections(result.group[0], currentSession.id, function () {
                                console.log("CREATING CONNECTIONS");
                            });
                        }
                        callBack(null, groupData);

                    });

                } else {
                    callBack(null, groupData);
                }
            },
            function getGroupFolders(groupData, callBack) {
                if (newMembers.length > 0) {
                    folders.getFoldersByGroupId(groupId, function (result) {
                        if (result.status == 200) {
                            var arrFolders = result.data;
                            callBack(null, arrFolders);
                        } else {
                            callBack(null, []);
                        }
                    });
                } else {
                    callBack(null, []);
                }
            },
            function updateGroupFolders(arrFolders, callBack) {
                if (arrFolders != undefined && arrFolders.length > 0) {
                    async.each(arrFolders, function(folder, callBack) {
                        var arrMembers = folder.shared_users;
                        async.each(newMembers, function(member, callBack) {
                            var color = randColor.randomColor({
                                luminosity: 'light',
                                hue: 'random'
                            });
                            var sharingMember = {
                                user_id: Util.toObjectId(member.user_id),
                                user_note_color: color,
                                shared_type: FolderSharedMode.VIEW_UPLOAD,
                                status: FolderSharedRequest.REQUEST_PENDING
                            };
                            arrMembers.push(sharingMember);
                            callBack(null);

                        }, function(err) {
                            if( err ) {
                                console.log('A group member failed to process');
                                callBack(null);
                            } else {
                                var criteria = {
                                    "_id":folder._id
                                };
                                var data = {
                                    "shared_users":arrMembers
                                };
                                folders.updateFolder(criteria, data, function (updateResult) {
                                    callBack(null, updateResult.group);
                                });
                            }
                        });
                    }, function(err) {
                        if( err ) {
                            console.log('A group folder failed to process');
                            callBack(null);
                        } else {
                            callBack(null);
                            console.log('All group folders are processed successfully');
                        }
                    });

                } else {
                    callBack(null);
                }
            },
            function addNotification(callBack) {
                if (newMembers.length > 0) {

                    var _data = {
                        sender: userId,
                        notification_type: Notifications.SHARE_GROUP,
                        notified_group: Util.toObjectId(groupId)
                    }


                    Notification.getNotification(_data, function (res) {
                        if(res.status == 200 && typeof res.result != "undefined" && res.result != null){
                            callBack(null, res.result._id);
                        }else {
                            Notification.saveNotification(_data, function (res) {
                                callBack(null, res.result._id);
                            });
                        }
                    });
                } else {
                    callBack(null, null);
                }
            },
            function notifyingUsers(notification_id, callBack) {
                if (typeof notification_id != 'undefined' && newMembers.length > 0) {

                    var _members = [];
                    for (var x = 0; x < newMembers.length; x++) {
                        if(userId.toString() != newMembers[x].user_id.toString()){
                            _members.push(newMembers[x].user_id);
                        }
                    }

                    var _data = {
                        notification_id: notification_id,
                        recipients: _members
                    };
                    NotificationRecipient.saveRecipients(_data, function (res) {
                        callBack(null);
                    });

                } else {
                    callBack(null);
                }
            }
        ], function (err) {
            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).send(outPut);
        });
    },

    removeMember: function (req, res) {
        var Groups = require('mongoose').model('Groups'),
            Folders = require('mongoose').model('Folders'),
            Posts = require('mongoose').model('Post'),
            FolderDocs = require('mongoose').model('FolderDocs'),
            SubscribedPost = require('mongoose').model('SubscribedPost'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User'),
            _async = require('async'),
            _arrIndex = require('array-index-of-property');

        var Notification = require('mongoose').model('Notification');
        var NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var currentSession = Util.getCurrentSession(req);

        var group_id = req.body._group_id,
            member_id = req.body._member_id;

        _async.waterfall([

            function removeUserFromGroup(callBack) {
                var criteria = {
                    '_id': Util.toObjectId(group_id),
                    'members.user_id': Util.toObjectId(member_id)
                };

                var _status = {
                    'members.$.status': GroupSharedRequest.MEMBER_REMOVED
                };

                Groups.updateGroups(criteria, _status, function (r) {
                    callBack(null, r.group);
                });
            },
            function removeMemberFolders(groupData, callBack){

                _async.waterfall([
                    function updateMemberStatus(rfCallBack){

                        var _udata = {
                            'shared_users.$.status': FolderSharedRequest.MEMBER_REMOVED
                        };
                        var criteria = {
                            type: FolderType.GROUP_FOLDER,
                            group_id: Util.toObjectId(group_id),
                            'shared_users.user_id': Util.toObjectId(member_id)
                        };

                        Folders.updateFolder(criteria, _udata, function(res){
                            rfCallBack(null);
                        });
                    },
                    function getOwnFoldersToGroup(rfCallBack) {
                        var es_criteria= {
                            _index: FolderConfig.ES_INDEX_OWN_GROUP_FOLDER + member_id.toString(),
                            q: 'folder_type:' + FolderType.GROUP_FOLDER + ' AND folder_group_id:' + group_id.toString()
                        };

                        Folders.getSharedFolders(es_criteria, function (r) {
                            rfCallBack(null, r.folders);
                        });
                    },
                    function getSharedFoldersToGroup(ownFolders, rfCallBack) {
                        var es_criteria= {
                            _index: FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER + member_id.toString(),
                            q: 'folder_type:' + FolderType.GROUP_FOLDER + ' AND folder_group_id:' + group_id.toString()
                        };

                        Folders.getSharedFolders(es_criteria, function (r) {
                            var allFolders = ownFolders.concat(r.folders);
                            rfCallBack(null, allFolders);
                        });
                    },
                    function removeFolderDocs(allFolders, rfCallBack){

                        if(typeof allFolders != "undefined" && allFolders.length >0){
                            _async.eachSeries(allFolders, function (folder, folderCallBack) {

                                _async.waterfall([
                                    function getFolderDocs(innerCallBack){
                                        var docs_criteria = {
                                            folder_id: Util.toObjectId(folder.folder_id)
                                        }

                                        FolderDocs.getDocuments(docs_criteria, function(docsResult){
                                            innerCallBack(null, docsResult.documents);
                                        });
                                    },
                                    function removeFromES(docs,innerCallBack){

                                        if(typeof docs != "undefined" && docs.length > 0){
                                            _async.eachSeries(docs, function (doc, docsCallBack) {
                                                var _index = "";
                                                var _type = "";

                                                if (member_id.toString() == doc.user_id.toString()) {
                                                    _index = FolderDocsConfig.ES_INDEX_OWN_GROUP_DOC;
                                                    _type = "own_group_document";
                                                }else {
                                                    _index = FolderDocsConfig.ES_INDEX_SHARED_GROUP_DOC;
                                                    _type = "shared_group_document";
                                                }

                                                var _payload = {
                                                    id: doc._id.toString(),
                                                    type: _type,
                                                    cache_key: _index + member_id.toString()
                                                };

                                                FolderDocs.deleteDocumentFromCache(_payload, function(r) {
                                                    docsCallBack(null);
                                                });

                                            }, function (err) {
                                                innerCallBack(null);
                                            });

                                        }else {
                                            innerCallBack(null);
                                        }
                                    },
                                    function removeFolderFromES(innerCallBack){

                                        var _index = "";
                                        var _type = "";

                                        if (member_id.toString() == folder.folder_owner.toString()) {
                                            _index = FolderConfig.ES_INDEX_OWN_GROUP_FOLDER;
                                            _type = "own_folder";
                                        }else {
                                            _index = FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER;
                                            _type = "shared_folder";
                                        }

                                        var _payload = {
                                            id: folder.folder_id.toString(),
                                            type: _type,
                                            cache_key: _index + member_id.toString()
                                        };

                                        Folders.deleteFolderFromCache(_payload, function(r) {
                                            innerCallBack(null);
                                        });

                                    }
                                ], function (err) {
                                    folderCallBack(null);
                                });
                            }, function (err) {
                                rfCallBack(null);
                            });
                        }else {
                            rfCallBack(null);
                        }

                    }
                ], function (err) {
                    callBack(null, groupData);
                });
            },
            function removePostSubscriptions(groupData, callBack) {
                _async.waterfall([
                    function getAllPostsToGroup(rpCallBack){

                        var payLoad = {
                            q:"post_type:" + PostType.GROUP_POST
                        }, postsType = PostType.GROUP_POST;

                        Posts.ch_getPost(group_id,payLoad,postsType,function(resultSet){
                            var _posts = resultSet;
                            rpCallBack(null, _posts);
                        });
                    },
                    function removeFromSubscribedPosts(posts, rpCallBack){

                        var post_ids = [];

                        if(posts != null && posts.length > 0){
                            for(var i = 0; i < posts.length; i++){
                                post_ids.push(Util.toObjectId(posts[i].post_id));
                            }

                            var criteria = {
                                post_id: {'$in': post_ids},
                                user_id: Util.toObjectId(member_id)
                            }
                            SubscribedPost.deleteSubscribedUsers(criteria, function (r){
                                rpCallBack(null);
                            });
                        }else {
                            rpCallBack(null);
                        }
                    }
                ], function (err) {
                    callBack(null, groupData);
                });
            },
            function removeSharedCalendar(groupData, callBack) {
                //ToDo: remove member calendar events tasks todos
                callBack(null, groupData);
            },
            function removeConnections(groupData, callBack){
                _async.waterfall([
                    function statusUpdateMemberConnection(rcCallBack){
                        var criteria = {
                            user_id: Util.toObjectId(member_id),
                            connected_group: Util.toObjectId(group_id)
                        }, dataToUpdate = {
                            status: ConnectionStatus.CONNECTION_BLOCKED
                        };

                        Connection.updateConnection(criteria, dataToUpdate, function(r){
                            rcCallBack(null);
                        });
                    },
                    function updateESGroupIndex(rcCallBack){

                        var groupKey = GroupConfig.ES_INDEX;
                        var groupPayLoad={
                            index: groupKey,
                            id: group_id.toString(),
                            type: 'group',
                            data: groupData
                        };

                        ES.update(groupPayLoad, function(r){
                            rcCallBack(null);
                        });
                    },
                    function removeESIndexWithGroup(rcCallBack){

                        var groupKey = ConnectionConfig.ES_INDEX_NAME+group_id.toString();
                        var _payload={
                            index: groupKey,
                            id: member_id.toString(),
                            type: 'connections'
                        };

                        ES.delete(_payload, function(r){
                            rcCallBack(null);
                        });
                    },
                    function removeESIndexWithUser(rcCallBack){

                        var userKey = ConnectionConfig.ES_GROUP_INDEX_NAME+member_id.toString();
                        var _payload={
                            index: userKey,
                            id: group_id.toString(),
                            type: 'connections'
                        };

                        ES.delete(_payload, function(r){
                            rcCallBack(null);
                        });
                    }
                ], function (err) {
                    callBack(null);
                });
            },
            function removeNotifications(callBack) {
                console.log("came to removeNotifications ==")
                _async.waterfall([
                    function getNotificaionRequests (callBack){
                        var criteria = {
                            sender: Util.toObjectId(currentSession.id),
                            notification_type: Notifications.SHARE_GROUP,
                            notified_group: Util.toObjectId(group_id)
                        }

                        var filteredObject = {}

                        Notification.getNotifications(criteria, function(r){
                            _async.eachSeries(r.result, function (notifObj, sCallBack) {

                                var innerCriteria = {
                                    notification_id: notifObj._id,
                                    recipient: member_id
                                };

                                NotificationRecipient.getAllRecipientNotification(innerCriteria, function(nrResults){
                                    if (typeof nrResults.result != 'undefined' && nrResults.result.length > 0
                                        && nrResults.result[0].recipient.toString() == member_id.toString()){
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
                    }

                ], function (err) {
                    callBack(null);
                });
            }

        ], function (err) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.ERROR);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS);
                res.status(200).send(outPut);
            }
        });
    },

    /**
     * Upload the group image
     * @param req
     * @param res
     * @returns Object outPut
     */
    uploadGroupProfileImage: function (req, res) {

        var CurrentSession = Util.getCurrentSession(req);
        var User = require('mongoose').model('User');
        var data = {
            content_title: "Group profile Image",
            file_name: req.body.image,
            is_default: 1,
            entity_id: null,
            entity_tag: UploadMeta.GROUP_IMAGE,
            status: 7
        }
        ContentUploader.uploadFile(data, function (payLoad) {
            if (payLoad.status != 400) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.GROUP_IMAGE_SUCCESS, Alert.SUCCESS)
                }
                outPut['upload'] = payLoad;
                res.status(200).json(outPut);
            } else {
                var outPut = {
                    status: ApiHelper.getMessage(400, Alert.GROUP_IMAGE_ERROR, Alert.ERROR)
                };
                res.status(400).send(outPut);
            }
        });
    },

    /**
     * This function returns a given group
     * @param req
     * @param res
     * @returns Object outPut
     */
    getGroup: function (req, res) {
        var Group = require('mongoose').model('Groups');
        var _async = require('async');
        var namePrefix = req.body.name_prefix;


        _async.waterfall([
            function getGroup(callBack) {
                var criteria = {"name_prefix": namePrefix};
                Group.getGroup(criteria, function (result) {
                    if (result.status == 200) {
                        callBack(null, result.group[0]);
                    } else {
                        callBack(null, null);
                    }
                });
            }
        ], function (err, group) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(500, Alert.ERROR, Alert.ERROR);
                outPut['group'] = null;
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['group'] = group;
            }
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * This function returns groups under a given criteria
     * @param req
     * @param res
     * @returns Object outPut
     */
    getGroups: function (req, res) {
        var Group = require('mongoose').model('Groups');
        var _async = require('async');

        _async.waterfall([
            function getGroups(callBack) {
                var userId = Util.getCurrentSession(req).id.toString();
                var query = {
                    index: ConnectionConfig.ES_GROUP_INDEX_NAME + userId,
                    type: 'connections',
                    id: userId
                };
                console.log(" THE INDEX IS : " + ConnectionConfig.ES_GROUP_INDEX_NAME + userId);
                ES.search(query, function (groupsResult) {
                    var groups = [];
                    if (groupsResult) {
                        groups = groupsResult.result;
                    }
                    callBack(null, groups);
                });
            }
        ], function (err, groups) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(500, Alert.ERROR, Alert.ERROR);
                outPut['groups'] = null;
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['groups'] = groups;
                console.log(outPut['groups']);
                console.log("GROUPS FROM BACKEND ");
            }
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * This function returns 12 random members
     * @param req
     * @param res
     * @returns Object outPut
     */
    getMembers: function (req, res) {
        var Group = require('mongoose').model('Groups');
        var User = require('mongoose').model('User');
        var Upload = require('mongoose').model('Upload');
        var name_prefix = req.body.name_prefix;
        var defaultRandomMemberCount = 12;

        var _async = require('async');
        _async.waterfall([
            function getGroupMembers(callBack) {

                var criteria = {name_prefix: name_prefix};
                Group.getGroupMembers(criteria, function (result) {
                    if (result.error && result == null) {
                        callBack(result.error, null);
                    }
                    callBack(null, result);
                });
            },
            function composeMembers(membersResult, callBack) {
                var i = 0;
                var arrUsers = [];
                var BreakException = {};
                var members = typeof(membersResult.memberObjs) != 'undefined' ? membersResult.memberObjs : [];
                members.forEach(function (member) {
                    Upload.getProfileImage(member.user_id, function (profileImageData) {
                        var url = '';
                        if (profileImageData.status != 200) {
                            url = Config.DEFAULT_PROFILE_IMAGE;
                        } else {
                            var _images = profileImageData.image;

                            var url = (_images.hasOwnProperty('profile_image') && _images.profile_image != 'undefined') ?
                                (_images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : _images.profile_image.http_url
                                : "/images/default-profile-pic.png";
                        }

                        var tmpUserObj = {
                            name: member.name,
                            user_id: member.user_id,
                            status: member.status,
                            permissions: member.permissions,
                            _id: member._id,
                            profile_image: url
                        };
                        arrUsers.push(tmpUserObj);
                        i = i + 1;

                        if (( i == members.length && members.length != defaultRandomMemberCount + 1) || i == defaultRandomMemberCount) {
                            callBack(null, membersResult, arrUsers);
                        }
                    });
                });
            }
        ], function (err, groupMembers, randomMembers) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(500, Alert.ERROR, Alert.ERROR);
                outPut['members'] = null;
            } else {
                groupMembers['random_members'] = randomMembers;
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['members'] = groupMembers;
            }
            res.status(200).send(outPut);
            return;
        });
    },

    /**
     * Update shared member group status for a given id
     * @param req
     * @param res
     * @return Json
     */
    updateGroupMemberStatus: function (req, res) {
        console.log("starting updateGroupMemberStatus method");
        var CurrentSession = Util.getCurrentSession(req);
        var Group = require('mongoose').model('Groups');
        var Folders = require('mongoose').model('Folders');
        var NotificationRecipient = require('mongoose').model('NotificationRecipient');
        var _async = require('async');
        var randColor = require('randomcolor');
        var FolderDocs = require('mongoose').model('FolderDocs');


        var groupId = req.body.id;
        var status = req.body.status;
        var shared_user_id = req.body.shared_user_id;
        var notification_id = req.body.notification_id;

        _async.waterfall([
            /**
             * This function will get the group by id
             * @param callBack
             */
            function getGroup(callBack) {

                var criteria = {"_id": groupId};
                Group.getGroup(criteria, function (result) {
                    if (result.status == 200) {
                        callBack(null, result.group[0]);
                    } else {
                        callBack(null, null);
                    }
                });
            },
            /**
             * This function will update current users's status as 'ACCEPTED' in group
             * @param resultSet
             * @param callBack
             */
            function updateMemberStatus(resultSet, callBack) {
                if(resultSet != undefined && resultSet._id != undefined) {
                    var criteria = {
                        _id: groupId,
                        'members.user_id': shared_user_id
                    };
                    var shared_status = status == 'REQUEST_REJECTED' ?
                        GroupSharedRequest.REQUEST_REJECTED : GroupSharedRequest.REQUEST_ACCEPTED;
                    var updateData = {
                        'members.$.status': shared_status
                    };
                    Group.updateGroups(criteria, updateData, function (res) {
                        if (res.status == 200) {
                            callBack(null, res.group);
                        } else {
                            callBack(null, null);
                        }

                    });
                } else {
                    callBack(null, null);
                }
            },
            /**
             * This function will create connections indexes in ES for;
             * 1) For the group 'idx_group'
             * 2) For the group 'idx_connections'
             * 3) For the member 'idx_group_connections'
             * @param _groupData
             * @param callBack
             */
            function createConnections(_groupData, callBack) {
                if(_groupData != undefined && status == 'REQUEST_ACCEPTED') {
                    Group.addConnections(_groupData, _groupData.created_by, function () {
                        console.log("CREATING GROUP CONNECTIONS");
                    });
                    callBack(null, _groupData);
                } else {
                    callBack(null, _groupData);
                }

            },
            /**
             * This function will update the notifications as 'read'
             * @param _groupData
             * @param callBack
             */
            function updateNotifications(_groupData, callBack){
                var _data = {read_status:true};
                var _criteria = {notification_id:Util.toObjectId(notification_id), recipient:Util.toObjectId(CurrentSession.id)};
                NotificationRecipient.updateRecipientNotification(_criteria, _data, function(res){
                    callBack(null, _groupData);
                });
            },
            /**
             * This function will do group folder processing
             * @param _groupData
             * @param callBack
             */
            function updateGroupFolderStatus(_groupData, callBack) {

                if(_groupData != undefined) {
                    _async.waterfall([

                        /**
                         * This function gets all teh folders that are added in the group
                         * @param callBackOne
                         */
                        function getGroupFolders(callBackOne) {
                            Folders.getFoldersByGroupId(groupId, function (result) {
                                if (result.status == 200) {
                                    var arrFolders = result.data;
                                    callBackOne(null, arrFolders);
                                } else {
                                    callBackOne(null, []);
                                }
                            });

                        },
                        /**
                         * This function will loop all folders and do updating
                         * @param arrFolders
                         * @param callBackOne
                         */
                        function updateGroupFolder(arrFolders, callBackOne) {

                            if (arrFolders != undefined && arrFolders.length > 0) {

                                _async.each(arrFolders, function(folder, callBackTwo) {
                                    var arrMembers = folder.shared_users;

                                    _async.waterfall([
                                        /**
                                         * This function will update current users's status as 'ACCEPTED' in folder
                                         * @param callBackTwo
                                         */
                                        function updateGroupFolderStatus(callBackTwo) {
                                            var shared_status = status == 'REQUEST_ACCEPTED' ?
                                                FolderSharedRequest.REQUEST_ACCEPTED : FolderSharedRequest.REQUEST_REJECTED;
                                            var _udata = {
                                                'shared_users.$.status': shared_status
                                            };

                                            var criteria = {
                                                _id: Util.toObjectId(folder._id),
                                                group_id: Util.toObjectId(groupId),
                                                'shared_users.user_id': Util.toObjectId(shared_user_id)
                                            };
                                            Folders.updateSharedFolder(criteria, _udata, function (result) {
                                                callBackTwo(null);
                                            });
                                        },
                                        /**
                                         * This function will add folder into current users ES as a group folder
                                         * @param callBackTwo
                                         */
                                        function updateGroupFolderCache(callBackTwo) {
                                            if(status == 'REQUEST_ACCEPTED') {
                                                var color = randColor.randomColor({
                                                    luminosity: 'light',
                                                    hue: 'random'
                                                });
                                                var sharingMember = {
                                                    user_id: CurrentSession.id,
                                                    user_note_color: color,
                                                    shared_type: FolderSharedMode.VIEW_UPLOAD,
                                                    status: FolderSharedRequest.REQUEST_ACCEPTED
                                                };
                                                arrMembers.push(sharingMember);

                                                var cacheData = {
                                                    folder_id: folder._id,
                                                    folder_name: folder.name,
                                                    folder_color: folder.color,
                                                    folder_owner: folder.user_id,
                                                    folder_updated_at: folder.updated_at,
                                                    folder_shared_mode: FolderSharedMode.VIEW_UPLOAD,
                                                    folder_user: CurrentSession.id.toString(),
                                                    folder_type: FolderType.GROUP_FOLDER,
                                                    group_id: folder.group_id.toString(),
                                                    isDefault: folder.isDefault,
                                                    cache_key: FolderConfig.ES_INDEX_SHARED_GROUP_FOLDER + CurrentSession.id.toString()
                                                }

                                                Folders.addFolderToCache(cacheData, function(cacheResult){
                                                    callBackTwo(null);
                                                });
                                            } else {
                                                callBackTwo(null);
                                            }
                                        },
                                        /**
                                         * This function will all documents in folder to current users ES index
                                         * @param callBack
                                         */
                                        function addDocumentsToES(callBack){
                                            console.log("addDocumentsToES");

                                            if(status == 'REQUEST_ACCEPTED'){

                                                var _criteria = {folder_id:Util.toObjectId(folder._id)}

                                                FolderDocs.getFolderDocument(_criteria, function(result){
                                                    if(result.status == 200){
                                                        var _docs = result.document;

                                                        _async.eachSeries(_docs, function(doc, callback){

                                                            console.log("=====================")
                                                            console.log(doc);

                                                            var _esDocument = {
                                                                cache_key:FolderDocsConfig.ES_INDEX_SHARED_GROUP_DOC + CurrentSession.id.toString(),
                                                                document_id:doc._id,
                                                                document_name:doc.name,
                                                                content_type:doc.content_type,
                                                                document_owner:doc.user_id,
                                                                document_user:user_id,
                                                                file_path:doc.file_path,
                                                                thumb_path:doc.thumb_path,
                                                                folder_id:folder.folder_id,
                                                                folder_name:folder.folder_name
                                                            };
                                                            FolderDocs.addDocToCache(_esDocument, function(res){callback(null)});

                                                        },function(err){
                                                            callBack(null);
                                                        });

                                                    } else{
                                                        callBack(null);
                                                    }
                                                });

                                            } else{
                                                callBack(null);
                                            }

                                        }
                                    ], function(err) {
                                        callBackTwo(null);
                                    });

                                }, function(err) {
                                    if( err ) {
                                        console.log('A group folder failed to process');
                                    }
                                    callBackOne(null);
                                });

                            } else {
                                callBackOne(null);
                            }
                        }

                    ], function(err) {
                        callBack(null, _groupData);
                    });
                } else {
                    callBack(null, _groupData);
                }
            }
        ], function (err,_group) {
            var outPut = {};
            if (err) {
                outPut['status'] = ApiHelper.getMessage(400, err);
                res.status(400).send(outPut);
            } else {
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                //outPut['group'] = _group;
                res.status(200).send(outPut);
            }
        });
    }
}

module.exports = GroupsController;
