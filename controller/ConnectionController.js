/**
 * This is connection controller that communicate with connection.
 */


var ConnectionController = {

    /**
     * Get Connection request
     * @param req
     * @param res
     */
    getRequestedConnections: function (req, res) {
        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            _moment = require('moment'),
            _page_count = (req.body.page_count != undefined &&  req.body.page_count != 0) ? req.body.page_count : 3,
            _filter = (req.body.filter != 'undefined' &&  req.body.filter != '') ? req.body.filter : null;

        _async.waterfall([
            function getFriendRequests(callBack) {
                console.log("came to getFriendRequests fucntion");
                var criteria = {
                    user_id: CurrentSession.id,
                    result_per_page: _page_count,
                    filter: _filter
                }
                Connection.getConnectionRequests(criteria, function (resultSet) {
                    callBack(null, resultSet.requested_connections);
                });
            },
            function getMyConnections(_results, callBack) {
                console.log("came to getMyConnections fucntion");

                var criteria = {
                    user_id: CurrentSession.id,
                    //q:req.query['q']
                };

                Connection.getMyConnection(criteria, function (resultSet) {
                    callBack(null, _results, resultSet.results);
                })
            },
            function getMutualConnections(newRequests, _myConns, callBack) {
                console.log("came to getMutualConnections fucntion");
                "use strict";

                var requestsList = [], _grep = require('grep-from-array');

                _async.each(newRequests, function (newRequest, callBack) {
                    _async.waterfall([
                        function getNewUserFriends(callBack) {
                            console.log("came to getNewUserFriends fucntion");
                            var criteria = {
                                    user_id: newRequest.user_id,
                                    //q:req.query['q']
                                };

                            Connection.getMyConnection(criteria, function (resultSet) {
                                callBack(null, resultSet.results);
                            });
                        },
                        function getNewUserUpdatedTime(newUserConns, callBack) {
                            console.log("came to getNewUserUpdatedTime fucntion");

                            Connection.checkRequestSentReceived(newRequest.user_id, CurrentSession.id, function (resultSet) {
                                callBack(null, newUserConns, resultSet);
                            });
                        },
                        function updateNewUserFriends(newUserConns, connData, callBack) {
                            console.log("came to updateNewUserFriends fucntion");

                            var _mutual_cons = [], userId= CurrentSession.id;

                            for (var inc = 0; inc < _myConns.length; inc++) {
                                var user_id = _myConns[inc].user_id;
                                if (user_id != userId) {

                                    var mutual_con = _grep(newUserConns, function (e) {
                                        return e.user_id == user_id;
                                    });
                                    if (mutual_con[0] != null) {
                                        _mutual_cons.push(mutual_con[0]);
                                    }
                                }
                            }

                            newRequest['mutual_connections'] = _mutual_cons;
                            newRequest['mutual_connection_count'] = _mutual_cons.length;
                            newRequest['created_time'] = connData[0].created_at;

                            requestsList.push(newRequest);

                            callBack(null);
                        }

                    ], function(err) {
                        callBack(null);
                    })

                }, function (err) {
                    callBack(null, requestsList);
                })

            }
        ], function(err, resultSet) {
                "use strict";
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    req_cons: resultSet
                }

                res.status(200).send(outPut);

        });

    },

    /**
     * Get My Connection
     * @param req
     * @param res
     */
    getMyConnections: function (req, res) {
        console.log(req.query['q']);
        console.log('default');
        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            user_id: (typeof req.query['user_id'] != "undefined") ? req.query['user_id'] : CurrentSession.id,
            q: req.query['q']
        }


        Connection.getMyConnection(criteria, function (resultSet) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),

            }
            outPut['header'] = {
                total_result: resultSet.result_count,
                result_per_page: Config.CONNECTION_RESULT_PER_PAGE,
                total_pages: Math.ceil(resultSet.result_count / Config.CONNECTION_RESULT_PER_PAGE)
            };

            outPut['my_con'] = resultSet.results

            res.status(200).send(outPut);
            return 0
        })
    },

    /**
     * Get My Connection - Sort
     * @param req
     * @param res
     */
    getMySortedConnections: function (req, res) {

        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            user_id: CurrentSession.id,
            q: req.query['q']
        }, sortingOption = req.params['option'];

        Connection.getMyConnection(criteria, function (resultSet) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),

            }
            outPut['header'] = {
                total_result: resultSet.result_count,
                result_per_page: Config.CONNECTION_RESULT_PER_PAGE,
                total_pages: Math.ceil(resultSet.result_count / Config.CONNECTION_RESULT_PER_PAGE)
            };

            var _allConnections = resultSet.results,
                sortedUsers = [];

            switch (sortingOption) {
                case 'name':
                    sortedUsers = Util.sortByKeyASC(_allConnections, 'first_name');
                    break;
                case 'date':
                    sortedUsers = Util.sortByKeyDES(_allConnections, 'connected_at');
                    break;
                default:
                    sortedUsers = _allConnections;
            }
            outPut['my_con'] = sortedUsers;

            res.status(200).send(outPut);
            return 0
        })
    },

    /**
     * Get My Connection with Unfriend User
     * @param req
     * @param res
     */
    getMyConnectionsBindUnfriendConnections: function (req, res) {
        console.log(req.query['q']);
        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            user_id: CurrentSession.id,
            q: req.query['q']
        }

        Connection.getMyConnectionsBindUnfriendConnections(criteria, function (resultSet) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),

            }
            outPut['header'] = {
                total_result: resultSet.result_count,
                result_per_page: Config.CONNECTION_RESULT_PER_PAGE,
                total_pages: Math.ceil(resultSet.result_count / Config.CONNECTION_RESULT_PER_PAGE)
            };

            outPut['my_con'] = resultSet.results;
            outPut['unfriend'] = resultSet.unfriend_connections;

            res.status(200).send(outPut);
            return 0
        })
    },
    /**
     * Accept Friend request
     * @param req
     * @param res
     */
    acceptFriendRequest: function (req, res) {
        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            sender_id: req.body.sender_id,
            user_id: CurrentSession.id
        }
        Connection.acceptConnectionRequest(criteria, function (resultSet) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
            }
            res.status(200).send(outPut);
            return 0
        });
    },

    /**
     * Decline Friend request
     * @param req
     * @param res
     */
    declineFriendRequest: function (req, res) {
        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req);
        var criteria = {
            sender_id: req.body.sender_id,
            user_id: CurrentSession.id
        }
        Connection.declineConnectionRequest(criteria, function (resultSet) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
            }
            res.status(200).send(outPut);
            return 0
        });
    },

    getMutualConnections: function (req, res) {

        var User = require('mongoose').model('User'),
            Connection = require('mongoose').model('Connection'),
            CurrentSession = Util.getCurrentSession(req),
            _async = require('async'),
            _grep = require('grep-from-array'),
            _mutual_cons = [];

        _async.waterfall([
                function getMyConnections(callback) {
                    var criteria = {
                        user_id: CurrentSession.id,
                        q: req.query['q']
                    };

                    Connection.getMyConnection(criteria, function (resultSet) {
                        var my_cons = resultSet.results;
                        callback(null, my_cons);
                    })
                },
                function getFriendsConnection(resultSet, callback) {
                    var myConnection = resultSet,
                        criteria = {
                            user_id: req.query['uid'],
                            q: req.query['q']
                        };

                    Connection.getMyConnection(criteria, function (resultSet) {
                        var friend_cons = resultSet.results;

                        for (var inc = 0; inc < myConnection.length; inc++) {
                            var user_id = myConnection[inc].user_id;
                            if (user_id != req.query['uid']) {

                                var mutual_con = _grep(friend_cons, function (e) {
                                    return e.user_id == user_id;
                                });
                                if (mutual_con[0] != null) {
                                    _mutual_cons.push(mutual_con[0]);
                                }
                            }
                        }
                        callback(null);
                    });
                }
            ], function (err) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
                };
                outPut['mutual_cons'] = _mutual_cons;
                outPut['mutual_cons_count'] = _mutual_cons.length;
                res.status(200).send(outPut);
            }
        );


    },

    /**
     * Send Frind Request
     * @param req
     * @param res
     */
    getFriendSuggestion: function (req, res) {

        var Connection = require('mongoose').model('Connection'),
            filter_ids = [], CurrentSession = Util.getCurrentSession(req);
        filter_ids.push(CurrentSession.id);
        var criteria = {
            pg: 0,
            country: CurrentSession.country,
            user_id: CurrentSession.id,
            status: [ConnectionStatus.REQUEST_ACCEPTED, ConnectionStatus.REQUEST_SENT],
            random: 3,
            filter_ids: filter_ids
        };


        Connection.getFriendSuggestion(criteria, function (resultSet) {

            var outPut = {};

            if (resultSet.status !== 400) {

                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['header'] = {
                    total_result: resultSet.total_result,
                    result_per_page: Config.CONNECTION_RESULT_PER_PAGE,
                    total_pages: Math.ceil(resultSet.total_result / Config.CONNECTION_RESULT_PER_PAGE)
                };

                //LOAD RANDOM FRIEND SUGGESTIONS

                var _connection = [];

                /*if(resultSet.total_result > 3){

                 for(var a =0 ;a<3;a++){
                 var r = Util.getRandomInt(0,resultSet.total_result-1);
                 _connection.push(resultSet.friends[r]);
                 }






                 outPut['connections'] = _connection;







                 }else{
                 outPut['connections'] = resultSet.friends;
                 }*/

                outPut['connections'] = resultSet.friends
                res.status(200).send(outPut);
                return 0
            } else {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CONNECTION_USERS_EMPTY, Alert.ERROR);

                res.status(400).send(outPut);
                return 0;
            }

        });
    },

    /**
     * Send Connection request
     * @param req
     * @param res
     */
    sendFriendRequest: function (req, res) {
        var Connection = require('mongoose').model('Connection'), CurrentSession = Util.getCurrentSession(req);

        var req_connected_users = JSON.parse(req.body.connected_users);
        var req_unconnected_users = [];

        Connection.sendConnectionRequest(CurrentSession.id, req_connected_users, req_unconnected_users, function (resultSet) {
            var outPut = {};
            if (resultSet.status !== 200) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CONNECT_ERROR, Alert.ERROR);
                res.status(400).send(outPut);
                return 0;
            }


            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            res.status(200).json(outPut);
            return 0;
        });
    },

    /**
     * Get unique suggestion
     * @param req
     * @param res
     */
    getUniqueFriendRequest: function (req, res) {
        var Connection = require('mongoose').model('Connection'),
            req_connected_users = JSON.parse(req.body.cur_b_ids), CurrentSession = Util.getCurrentSession(req);
        req_connected_users.push(CurrentSession.id);
        var criteria = {
            pg: 0,
            country: CurrentSession.country,
            user_id: CurrentSession.id,
            status: [ConnectionStatus.REQUEST_ACCEPTED, ConnectionStatus.REQUEST_SENT],
            random: 3,
            filter_ids: req_connected_users
        };


        Connection.getFriendSuggestion(criteria, function (resultSet) {

            var outPut = {};

            if (resultSet.status !== 400) {
                var rand = Util.getRandomInt(0, resultSet.total_result);
                outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['header'] = {
                    total_result: resultSet.total_result,
                    result_per_page: Config.CONNECTION_RESULT_PER_PAGE,
                    total_pages: Math.ceil(resultSet.total_result / Config.CONNECTION_RESULT_PER_PAGE)
                };
                outPut['connection'] = resultSet.friends[rand];
                res.status(200).send(outPut);
                return 0
            } else {
                outPut['status'] = ApiHelper.getMessage(400, Alert.CONNECTION_USERS_EMPTY, Alert.ERROR);

                res.status(400).send(outPut);
                return 0;
            }

        });
    },

    checkConnection: function (req, res) {

        var User = require('mongoose').model('User'),
            Connection = require('mongoose').model('Connection'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req),
            outPut = {},
            _alreadyConnected = false, _alreadyRequestSent = false, _alreadyRequestReceived = false, _otherUserId = null,_otherUserConnected = false;

        _async.waterfall([
                function getOtherUserDetails(callback) {
                    var query = {
                        q: "user_name:" + req.params['uname'],
                        index: 'idx_usr'
                    };
                    //Find User from Elastic search
                    ES.search(query, function (csResultSet) {
                        _otherUserId = csResultSet.result[0]['user_id'];
                        callback(null);
                    });
                },
                function checkMyConnections(callback) {
                    var criteria = {
                        user_id: CurrentSession.id,
                        q: 'user_name:' + req.params['uname']
                    };

                    Connection.getMyConnectionData(criteria, function (resultSet) {
                        if (resultSet.results.length > 0) {
                            _alreadyConnected = true;
                        }
                        callback(null);
                    })
                },
                function checkOtherConnections(callback) {
                    var criteria = {
                        user_id: _otherUserId,
                        q: 'user_name:' + CurrentSession.user_name.toString()
                    };

                    Connection.getMyConnectionData(criteria, function (resultSet) {
                        if (resultSet.results.length > 0) {
                            _otherUserConnected = true;
                        }
                        callback(null);
                    })
                },
                function checkAlreadyRequested(callback) {
                    if (_alreadyConnected == false || _otherUserConnected == false) {
                        Connection.checkRequestSentReceived(CurrentSession.id, _otherUserId, function (resultSet) {
                            if (resultSet.length > 0) {
                                console.log(resultSet[0].connected_with);
                                if (resultSet[0].user_id.toString() == CurrentSession.id) {
                                    _alreadyRequestSent = true;
                                }
                                if (resultSet[0].connected_with.toString() == CurrentSession.id) {
                                    _alreadyRequestReceived = true;
                                }
                                callback(null)
                            } else {
                                callback(null)
                            }
                        });
                    } else {
                        callback(null)
                    }
                }


            ], function (err) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    alreadyConnected: (_alreadyConnected && _otherUserConnected),
                    alreadyRequestSent: _alreadyRequestSent,
                    alreadyRequestReceived: _alreadyRequestReceived,
                    profile_user_id: _otherUserId
                };
                res.status(200).send(outPut);
                return 0;
            }
        );
    },

    /**
     * Remove User Connections
     * @param req
     * @param res
     */
    unfriendUser: function (req, res) {
        var Connection = require('mongoose').model('Connection'),
            NoteBook = require('mongoose').model('Notebook'),
            _async = require('async'),
            CurrentSession = Util.getCurrentSession(req);

        _async.waterfall([
            function updateConnection(callback) {
                var criteria = {
                    sender_id: req.body.sender_id,
                    user_id: CurrentSession.id
                };

                Connection.unfriendUser(criteria, function (resultSet) {
                    console.log('connections');
                    callback(null);
                });
            },
            //TODO: 'sharedNotebookOnUnfriend' function has been removed from Notebook model. It should need to be implemented
            // function updateNotebookByLoggedUser(callback) {
            //     var criteria = {
            //         sender_id: req.body.sender_id,
            //         user_id: CurrentSession.id
            //     };
            //
            //     NoteBook.sharedNotebookOnUnfriend(criteria, function (resultSet) {
            //         callback(null);
            //     });
            // },
            // function updateNotebookByRemovedUser(callback) {
            //     var criteria = {
            //         user_id: req.body.sender_id,
            //         sender_id: CurrentSession.id.toString()
            //     };
            //
            //     NoteBook.sharedNotebookOnUnfriend(criteria, function (resultSet) {
            //         callback(null);
            //     });
            // }
        ], function (err) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS)
            };
            res.status(200).send(outPut);
        });
    },

    /**
     * Search Connection
     * @param req
     * @param res
     */
    searchConnection: function (req, res) {
        var User = require('mongoose').model('User'),
            Connection = require('mongoose').model('Connection'),
            CurrentSession = Util.getCurrentSession(req);

        var _user_id = CurrentSession.id,
            _search = req.params['q'];

        var criteria = {
            user_id: _user_id,
            q: 'first_name:' + _search + '* OR last_name:' + _search + '*'
        };

        Connection.getMyConnectionData(criteria, function (resultSet) {
            var outPut = {
                status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                suggested_users: resultSet.results
            };
            res.status(200).send(outPut);
            return 0;
        });

    },


    /**
     * Get my connections
     * @param req
     * @param res
     * @return outPut.status
     * @return outPut.suggested_users{name : '', title: '', avatar : '', user_id : '' }
     */
    getConnections: function (req, res) {
        var User = require('mongoose').model('User'),
            Connection = require('mongoose').model('Connection'),
            CurrentSession = Util.getCurrentSession(req);

        var _user_id = CurrentSession.id,
            _search = req.params['q'];

        var criteria = {
            user_id: _user_id,
            q: 'first_name:' + _search + '* OR last_name:' + _search + '*'
        };
        var suggested_users = [];

        Connection.getMyConnectionData(criteria, function (resultSet) {

            if (resultSet.results.length == 0) {
                var outPut = {
                    status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                    suggested_users: suggested_users
                };
                res.status(200).send(outPut);
            }

            for (var i = 0; i < resultSet.results.length; i++) {
                var user = resultSet.results[i];
                var userObj = {
                    name: user.first_name + ' ' + user.last_name,
                    title: (user.cur_designation ? user.cur_designation : 'Unknown'),
                    avatar: user.images.profile_image.http_url,
                    user_id: user.user_id
                }
                suggested_users.push(userObj);

                if (i + 1 == resultSet.results.length) {
                    var outPut = {
                        status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS),
                        suggested_users: suggested_users
                    };
                    res.status(200).send(outPut);
                }
            }
            return 0;
        });
    },
}

module.exports = ConnectionController;