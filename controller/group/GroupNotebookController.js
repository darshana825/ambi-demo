'use strict';

/**
 * Handle All Notebook related functions
 */

var GroupNotebookController = {

    /**
     * Adding New Notebook
     * @param req
     * @param res
     */
    addNewNotebook: function (req, res) {

        var Groups = require('mongoose').model('Groups'),
            _async = require('async'),
            _randColor = require('randomcolor'),
            NoteBook = require('mongoose').model('NoteBook'),
            CurrentSession = Util.getCurrentSession(req),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');

        var _notebook = {
            name: req.body.notebook_name,
            color: req.body.notebook_color,
            isDefault: req.body.isDefault,
            type: NoteBookType.GROUP_NOTEBOOK,
            group_id: req.body.group_id,
            user_id : CurrentSession.id
        };

        var notifyUsers = null;

        _async.waterfall([
            function saveNotebook(callBack) {
                NoteBook.addNewNoteBook(_notebook, function (resultSet) {

                    // console.log(resultSet.notebook._id);

                    callBack(null, resultSet.notebook);
                });
            },
            function getGroupMembers(notebook, callBack) {

                var criteria = {_id: Util.toObjectId(notebook.group_id)};
                Groups.getGroupMembers(criteria, function (r) {

                    for(var i = 0; i< r.members.length; i++){
                        if(r.members[i].toString() == _notebook.user_id.toString()){
                            r.members.splice(i, 1);

                            r.members.push(r.owner.toString());
                        }
                    }
                    notifyUsers = r.members;

                    callBack( null,{notebook : notebook,members : r.members});
                });
            },
            function shareNotebook(groupResults, callBack) {
                _async.eachSeries(groupResults.members, function(user, callBackSharedUser){
                    var sharedUsers = groupResults.notebook.shared_users;

                    _async.waterfall([
                        function isESIndexExists(callBack){
                            var _cache_key = "idx_user:"+NoteBookConfig.CACHE_PREFIX+user.toString();
                            var query={
                                index:_cache_key,
                                id: user.toString(),
                                type: 'shared_notebooks',
                            };
                            ES.isIndexExists(query, function (esResultSet){
                                callBack(null, esResultSet);
                            });
                        },
                        function getSharedNoteBooks(resultSet, callBack){
                            if(resultSet) {
                                var query = {
                                    q: "_id:" + user.toString()
                                };
                                NoteBook.ch_getSharedNoteBooks(user, query, function (esResultSet) {

                                    callBack(null, esResultSet);
                                });
                            }else{
                                callBack(null, null);
                            }
                        },
                        function ch_shareNoteBook(resultSet, callBack) {
                            if(resultSet != null){
                                var notebook_list = resultSet.result[0].notebooks;
                                var index_a = notebook_list.indexOf(groupResults.notebook._id);
                                if(index_a == -1) { //in any case if the notebook id exists in the shared list not adding it again
                                    notebook_list.push(groupResults.notebook._id);
                                    var query={
                                            q:"user_id:"+user.toString()
                                        },
                                        data = {
                                            user_id: user,
                                            notebooks: notebook_list
                                        };

                                    NoteBook.ch_shareNoteBookUpdateIndex(user,data, function(esResultSet){
                                        callBack(null);
                                    });
                                } else {
                                    callBack(null);
                                }
                            }else{
                                var query={
                                        q:"user_id:"+user.toString()
                                    },
                                    data = {
                                        user_id: user,
                                        notebooks: [groupResults.notebook._id]
                                    };
                                NoteBook.ch_shareNoteBookCreateIndex(user,data, function(esResultSet){
                                    callBack(null);
                                });
                            }
                        },
                        function saveInDB(callBack){
                            var randColor = _randColor.randomColor({
                                luminosity: 'light',
                                hue: 'random'
                            });
                            var _sharingUser = {
                                user_id: user,
                                user_note_color: randColor,
                                shared_type: SharedMode.READ_WRITE,
                                status: SharedRequestStatus.REQUEST_ACCEPTED
                            };
                            sharedUsers.push(_sharingUser);

                            var _sharedUsers = {
                                shared_users: sharedUsers
                            };

                            NoteBook.shareNoteBook(groupResults.notebook._id,_sharedUsers,function(resultSet){
                                callBack(null);
                            });
                        }
                    ], function (err, resultSet) {
                        callBackSharedUser(null);
                    });
                },function(err){
                    callBack(null, groupResults.notebook);
                });
            },
            function addNotification(notebook, callBack){

                if(notifyUsers.length > 0){

                    var _data = {
                        sender:CurrentSession.id,
                        notification_type:Notifications.SHARE_GROUP_NOTEBOOK,
                        notified_notebook: notebook._id,
                        notified_group: _notebook.group_id
                    };
                    Notification.saveNotification(_data, function(res){
                        if(res.status == 200){
                            callBack(null,res.result._id);
                        }
                    });

                } else{
                    callBack(null);
                }
            },
            function notifyingUsers(notification_id, callBack){

                if(typeof notification_id != 'undefined' && notifyUsers.length > 0){

                    var _data = {
                        notification_id:notification_id,
                        recipients:notifyUsers
                    };
                    NotificationRecipient.saveRecipients(_data, function(res){
                        callBack(null);
                    })

                } else{
                    callBack(null);
                }
            }
        ], function (err, resultSet) {
            if (err) {
                console.log(err);
                return;
            }
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                notes: resultSet
            };
            res.status(200).json(outPut);
        });

    },

    removeMember: function (req, res) {

    }

};

module.exports = GroupNotebookController;
