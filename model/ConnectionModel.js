/**
 * This is connection module that handle connections
 */

'use strict'
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * Define Connection Status
 */
GLOBAL.ConnectionStatus = {
    REQUEST_ACCEPTED: 1,
    RESPONSE_DECLINED: 2,
    REQUEST_BLOCKED: 3,
    REQUEST_SENT: 4,
    CONNECTION_UNFRIEND: 5,
    CONNECTION_BLOCKED: 6

};

GLOBAL.ConnectedType = {
    PERSONAL_CONNECTION: 1,
    GROUP_CONNECTION: 2
};

GLOBAL.ConnectionConfig = {
    CACHE_NAME: "connections:",
    ES_INDEX_NAME: "idx_connections:",
    ES_GROUP_INDEX_NAME: "idx_group_connections:"
};

var ConnectionSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        default: null
    },
    connected_with: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    connected_group: {
        type: Schema.ObjectId,
        ref: 'Groups',
        default: null
    },
    connected_with_type: {
        type: Number,
        required: true,
        default: ConnectedType.PERSONAL_CONNECTION
    },
    status: {
        type: Number,
        default: 0
    },
    action_user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }

}, {collection: "connections"});

/**
 * Create a new connection
 * @param connectionData an Object of this
 */
ConnectionSchema.statics.createConnection = function (connectionData, callBack) {

    connectionData.save(function (err, resultSet) {
        if (!err) {
            callBack({
                status: 200,
                connection: {
                    id: resultSet._id,
                }
            });
        } else {
            console.log("Server Error --------")
            console.log(err)
            callBack({status: 400, error: err});
        }
    });
};


/**
 * Update connection
 * @param criteria
 * @param data to update
 */
ConnectionSchema.statics.updateConnection = function (criteria, _data, callBack) {

    this.collection.update(criteria, {$set: _data}, {upsert: true, multi: false}, function (err, rsUpdate) {
        if (!err) {
            callBack(null);
        } else {
            console.log("user connection update error \n");
            console.log(err);
        }
    })
};

ConnectionSchema.statics.sendConnectionRequest = function (user_id, connected_users, unconnected_users, callBack) {
    var _connected_users = [], now = new Date(), _this = this, _async = require('async');
    //REMOVE UNSELECTED CONNECTIONS
    if (unconnected_users.length > 0) {
        var _formatted_unconnected_ids = [];
        for (var a = 0; a < unconnected_users.length; a++) {
            this.remove({connected_with: unconnected_users[a].toObjectId()}, function (err) {
                console.log(err);
            })
        }
    }
    if (connected_users.length > 0) {
        _async.each(connected_users, function (connected_user, callBack) {

            _this.collection.update(
                {
                    $or: [
                        {
                            user_id: Util.toObjectId(connected_user.toObjectId()),
                            connected_with: Util.toObjectId(user_id)
                        },
                        {
                            user_id: Util.toObjectId(user_id),
                            connected_with: Util.toObjectId(connected_user.toObjectId())

                        }
                    ]
                }
                , {
                    $set: {
                        user_id: Util.toObjectId(user_id),
                        connected_with: connected_user.toObjectId(),
                        created_at: now,
                        action_user_id: Util.toObjectId(user_id),
                        status: ConnectionStatus.REQUEST_SENT,
                        connected_with_type: ConnectedType.PERSONAL_CONNECTION
                    }
                }, {upsert: true, multi: false}, function (err, rsUpdate) {
                    if (!err) {
                        callBack(null);
                    } else {
                        console.log("user connection removed \n");
                        console.log(err);
                    }
                })

        }, function (err) {
            callBack({status: 200, connected: "ok"});
        });

        // for (var i = 0; connected_users.length > i; i++) {
        //     _connected_users.push({
        //         user_id: Util.toObjectId(user_id),
        //         connected_with: connected_users[i].toObjectId(),
        //         created_at: now,
        //         action_user_id:Util.toObjectId(user_id),
        //         status:ConnectionStatus.REQUEST_SENT
        //     });
        // }
        // this.collection.insert(_connected_users,function(err,resultSet){});
    } else {
        callBack({status: 200, connected: "empty"});
    }

}

/**
 * Get Connections that related to users
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getFriends = function (userId, status, callBack) {
    var _this = this, _async = require('async'),
        _friendIds = [], _friends = {},
        _status = {
            $in: status
        }

    _async.waterfall([
        function getMyRequestAcceptedUsers(callBack) {
            _this.find({user_id: userId, status: _status, connected_with_type: ConnectedType.PERSONAL_CONNECTION})
                .exec(function (err, resultSet) {
                    if (!err) {
                        for (var a = 0; a < resultSet.length; a++) {
                            var usr_id = resultSet[a].connected_with.toString();
                            if (_friendIds.indexOf(usr_id) == -1) {
                                var _usr_id = resultSet[a].connected_with.toString();
                                _friendIds.push(_usr_id);
                                _friends[_usr_id] = resultSet[a];
                            }
                        }
                        callBack(null);
                    } else {
                        console.log("Server Error --------");
                        console.log(err);
                        callBack(null);
                    }
                });
        },
        function getIAcceptedRequest(callBack) {
            _this.find({
                connected_with: userId,
                status: _status,
                connected_with_type: ConnectedType.PERSONAL_CONNECTION
            })
                .exec(function (err, resultSet) {
                    if (!err) {
                        for (var a = 0; a < resultSet.length; a++) {
                            var usr_id = resultSet[a].user_id.toString();
                            if (_friendIds.indexOf(usr_id) == -1) {
                                var _usr_id = resultSet[a].user_id.toString();
                                _friendIds.push(_usr_id);
                                _friends[_usr_id] = resultSet[a];
                            }
                        }
                        callBack(null, _friendIds, _friends);
                    } else {
                        console.log("Server Error --------");
                        console.log(err);
                        callBack(null);
                    }
                });
        }
    ], function (err, _friendIds, _friends) {

        callBack({
            friends_ids: _friendIds,
            friends: _friends
        })
    });
}


/**
 * Format Users object
 * if getIdOnly is tru then function will return all user ids based on the connectedUser object
 * if not it will return connection object as it is
 * @param connectedUsers
 * @param getIdOnly
 */
ConnectionSchema.statics.formatConnectedUsers = function (connectedUsers, getIdOnly) {

    if (typeof getIdOnly != 'undefined' && getIdOnly === true) {
        var _tmp_connected_user_ids = [];

        for (var i = 0; i < connectedUsers.length; i++) {
            _tmp_connected_user_ids.push(connectedUsers[i].connected_with.toString());
        }
        return _tmp_connected_user_ids;
    }

    return connectedUsers;


}


/**
 * Get Connection Count
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.getFriendsCount = function (userId, callBack) {
    var _this = this,
        _async = require('async'),
        friendsCount = 0;


    _async.waterfall([
        function getMyRequestAcceptedUsers(callBack) {
            _this.count({
                user_id: userId,
                status: ConnectionStatus.REQUEST_ACCEPTED,
                connected_with_type: ConnectedType.PERSONAL_CONNECTION
            })
                .exec(function (err, resultCount) {
                    if (!err) {
                        friendsCount = resultCount
                        callBack(null);
                    } else {
                        console.log("Server Error --------");
                        console.log(err);
                        callBack(null);
                    }
                });
        },
        function getIAcceptedRequest(callBack) {
            _this.count({
                connected_with: userId,
                status: ConnectionStatus.REQUEST_ACCEPTED,
                connected_with_type: ConnectedType.PERSONAL_CONNECTION
            })
                .exec(function (err, resultCount) {
                    if (!err) {
                        friendsCount = friendsCount + resultCount;
                        callBack(null, friendsCount);
                    } else {
                        console.log("Server Error --------");
                        console.log(err);
                        callBack(null);
                    }
                });
        }
    ], function (err, friendsCount) {
        callBack(friendsCount)
    });
}


function onInsert(err, resultSet, callBack) {

    callBack(resultSet)

}
ConnectionSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});


/**
 * Get Connection requests that received for me
 * @param userId
 */
ConnectionSchema.statics.getConnectionRequests = function (criteria, callBack) {

    var _this = this, _async = require('async'), _moment = require('moment'), _formatted_connection_requests = [];

    var _query = {
        connected_with: Util.toObjectId(criteria.user_id),
        status: ConnectionStatus.REQUEST_SENT,
        connected_with_type: ConnectedType.PERSONAL_CONNECTION
    }

    if(criteria.filter != null && criteria.filter == "recently added"){
        let then = _moment().subtract(1, 'months');
        _query['created_at'] = {$gte: then};
    }

    _this.find(_query)
        .exec(function (err, resultSet) {
            if (!err) {
                _async.each(resultSet,
                    function (connection, callBack) {
                        var query = {
                            q: connection.user_id.toString(),
                            index: 'idx_usr'
                        };
                        ES.search(query, function (esResultSet) {

                            if (typeof esResultSet.result[0] == "undefined") {
                                callBack();
                            } else {
                                _formatted_connection_requests.push(esResultSet.result[0]);
                                callBack();
                            }


                        });

                    }, function (err) {
                        if (err) {
                            console.log("getConnectionRequests \n ")
                            console.log(err)
                            callBack({status: 400, error: err});
                        } else {
                            callBack({status: 200, requested_connections: _formatted_connection_requests});
                        }

                    })
            } else {
                console.log("Server Error --------");
                console.log(err);
                callBack(null);
            }

        });


}

/**
 * Accept connection request
 * following are the tasks that need to be handle in this function
 * 1. Change status to 1 in connections document
 * 2. Update Each users connection index
 *
 * @param criteria
 * @param callBack
 */
ConnectionSchema.statics.acceptConnectionRequest = function (criteria, callBack) {

    var _this = this, _async = require('async');

    _async.waterfall([

        function changeStatus(callBack) {
            var now = new Date();
            _this.update({
                user_id: Util.toObjectId(criteria.sender_id),
                connected_with_type: ConnectedType.PERSONAL_CONNECTION,
                connected_with: Util.toObjectId(criteria.user_id)
            }, {
                $set: {
                    status: ConnectionStatus.REQUEST_ACCEPTED,
                    updated_at: now,
                    action_user_id: Util.toObjectId(criteria.user_id)
                }
            }, {upsert: false, multi: false}, function (err, rsUpdate) {
                if (!err) {
                    callBack(null);
                } else {
                    console.log("acceptConnectionRequest \n");
                    console.log(err);
                }
            })
        },
        function updateIndexConnection(callBack) {

            //UPDATE OWN CONNECTION ES
            var query = {
                q: criteria.sender_id.toString(),
                index: 'idx_usr'

            };
            ES.search(query, function (esResultSet) {

                var now = new Date();
                esResultSet.result[0]['connected_at'] = now;
                var _data = esResultSet.result[0];

                var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.user_id.toString();
                var payLoad = {
                    index: _cache_key,
                    id: criteria.sender_id.toString(),
                    type: 'connections',
                    data: _data,
                    tag_fields: [esResultSet.result[0].first_name, esResultSet.result[0].last_name]
                }

                ES.createIndex(payLoad, function (resultSet) {
                    //DONE
                    console.log("createIndex")
                    console.log(resultSet)
                });

            });


            //UPDATE FRIEND'S CONNECTION ES
            var query = {
                q: criteria.user_id.toString(),
                index: 'idx_usr'
            };
            ES.search(query, function (esResultSet) {

                var now = new Date();
                esResultSet.result[0]['connected_at'] = now;
                var _data = esResultSet.result[0];

                var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.sender_id.toString();
                var payLoad = {
                    index: _cache_key,
                    id: criteria.user_id.toString(),
                    type: 'connections',
                    data: _data,
                    tag_fields: [esResultSet.result[0].first_name, esResultSet.result[0].last_name]
                }

                ES.createIndex(payLoad, function (resultSet) {
                    console.log("createIndex")
                    console.log(resultSet)
                    //DONE
                });

            });
            callBack(null)
        }

    ], function (err, resultSet) {
        callBack({status: 200})
    });

}


/**
 * Decline connection request
 * Update the db connection status with REQUEST_BLOCKED
 *
 * @param criteria
 * @param callBack
 */
ConnectionSchema.statics.declineConnectionRequest = function (criteria, callBack) {

    var _this = this;
    var now = new Date();
    _this.update({
        user_id: Util.toObjectId(criteria.sender_id),
        connected_with: Util.toObjectId(criteria.user_id)
    }, {
        $set: {
            status: ConnectionStatus.REQUEST_BLOCKED,
            updated_at: now,
            action_user_id: Util.toObjectId(criteria.user_id)
        }
    }, {upsert: false, multi: false}, function (err, rsUpdate) {
        callBack({status: 200})
    })

}

/**
 * Get My Connection
 * @param criteria
 * @param callBack
 */
ConnectionSchema.statics.getMyConnection = function (criteria, callBack) {

    var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.user_id.toString(),
        _async = require('async');

    var query = {
            q: criteria.q,
            index: _cache_key
        },
        formatted_users = [];

    ES.search(query, function (esResultSet) {

        if (esResultSet != null) {
            _async.each(esResultSet.result,
                function (result, callBack) {

                    var query = {
                        q: "user_id:" + result.user_id,
                        index: 'idx_usr'
                    };

                    ES.search(query, function (sesResultSet) {
                        if (result.user_id != criteria.user_id) {
                            if (result.connected_at) {
                                sesResultSet.result[0]['connected_at'] = result.connected_at;
                            }
                            formatted_users.push(sesResultSet.result[0]);
                        }
                        callBack();

                    });
                },
                function (err) {
                    callBack({result_count: formatted_users.length, results: formatted_users})
                });
        } else {
            callBack({result_count: 0, results: []})
        }
    });

}

/**
 * Get User Connections - Users, Groups
 * @param criteria {Object} include search params needed for elastic search
 * @param callBack {Object} return elastic search result
 * **/
ConnectionSchema.statics.getConnections = function (criteria, getConnCallback) {
    var _async = require('async');

    _async.waterfall([
        function getUserConnections(callback) {
            var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.user_id.toString();
            var query = {
                q: criteria.q,
                index: _cache_key
            };

            ES.search(query, function (esResultSet) {
                if (esResultSet) {
                    callback(null, esResultSet.result);
                } else {
                    callback(null, []);
                }
            });
        },
        function getEachUser(aConnections, callback) {
            var formatted_users = [];

            if (aConnections.length > 0) {
                _async.each(aConnections, function (oResult, userCallback) {
                    var query = {
                        q: "user_id:" + oResult.user_id,
                        index: "idx_usr"
                    };

                    ES.search(query, function (sesResultSet) {
                        if (oResult.user_id != criteria.user_id) {
                            if (oResult.connected_at) {
                                sesResultSet.result[0]['connected_at'] = oResult.connected_at;
                                sesResultSet.result[0]['type'] = 1;
                                sesResultSet.result[0]['contact_name'] = sesResultSet.result[0].first_name;
                            }
                            formatted_users.push(sesResultSet.result[0]);
                        }
                        userCallback();
                    });
                }, function (error) {
                    error ? callback(error) : callback(null, formatted_users);
                });
            } else {
                callback(null, []);
            }
        },
        function getGroupConnections(aIndividualUsers, callback) {
            var _cache_key = ConnectionConfig.ES_GROUP_INDEX_NAME + criteria.user_id.toString();
            var query = {
                q: criteria.q,
                index: _cache_key
            };

            ES.search(query, function (sesResultSet) {
                if (sesResultSet) {
                    callback(null, aIndividualUsers, sesResultSet.result);
                } else {
                    callback(null, aIndividualUsers, []);
                }
            });
        }, function getEachGroup(aUsers, aGroups, callback) {
            var formatted_groups = [];

            if (aGroups.length > 0) {
                _async.each(aGroups, function (oGroup, groupCallback) {
                    var query = {
                        q: '_id:' + oGroup._id,
                        index: 'idx_group'
                    };

                    ES.search(query, function (sesResultSet) {
                        sesResultSet.result[0]['type'] = 2;
                        sesResultSet.result[0]['contact_name'] = sesResultSet.result[0].name_prefix;
                        delete sesResultSet.result[0]['members'];
                        formatted_groups.push(sesResultSet.result[0]);
                        groupCallback();
                    });
                }, function (error) {
                    error ? callback(error) : callback(null, aUsers.concat(formatted_groups));
                });
            } else {
                callback(null, aUsers);
            }
        }
    ], function (error, aConnections) {
        error ? getConnCallback({status: 400, error: error}) : getConnCallback({status: 200, data: aConnections});
    });
};

/**
 * Get My Connection with Unfriend Users
 * @param criteria
 * @param callBack
 */
ConnectionSchema.statics.getMyConnectionsBindUnfriendConnections = function (criteria, callBack) {

    var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.user_id.toString(),
        _async = require('async'), _this = this;

    var formatted_users = [], responseObj = {};

    _async.waterfall([
        function getEsUsers(callBack) {
            var query = {
                q: criteria.q,
                index: _cache_key
            };

            ES.search(query, function (esResultSet) {

                if (esResultSet != null) {
                    _async.each(esResultSet.result,
                        function (result, callBack) {

                            var query = {
                                q: "user_id:" + result.user_id,
                                index: 'idx_usr'
                            };
                            ES.search(query, function (sesResultSet) {
                                if (result.user_id != criteria.user_id) {
                                    formatted_users.push(sesResultSet.result[0]);
                                }
                                callBack(null);

                            });
                        },
                        function (err) {
                            responseObj = {result_count: formatted_users.length, results: formatted_users};
                            callBack(null, responseObj);
                        });
                } else {
                    responseObj = {result_count: 0, results: []};
                    callBack(null, responseObj);
                }

            });
        },
        function getUnfriendUsers(resultSet, callBack) {
            var query = {
                $or: [
                    {
                        connected_with: Util.toObjectId(criteria.user_id),
                        status: ConnectionStatus.CONNECTION_UNFRIEND,
                        connected_with_type: ConnectedType.PERSONAL_CONNECTION
                    },
                    {
                        user_id: Util.toObjectId(criteria.user_id),
                        status: ConnectionStatus.CONNECTION_UNFRIEND,
                        connected_with_type: ConnectedType.PERSONAL_CONNECTION
                    }
                ]
            };

            _this.find(query)
                .exec(function (err, dbResult) {
                    _async.each(dbResult, function (result, callBack) {
                            var friendsId = null;

                            if (criteria.user_id == result.user_id) {
                                friendsId = result.connected_with;
                            } else {
                                friendsId = result.user_id;
                            }
                            var esQuery = {
                                q: "user_id:" + friendsId.toString(),
                                index: 'idx_usr'
                            };
                            ES.search(esQuery, function (sesResultSet) {
                                if (result._id != criteria.user_id) {
                                    sesResultSet.result[0]['connection_status'] = 'CONNECTION_UNFRIEND';
                                    formatted_users.push(sesResultSet.result[0]);
                                }
                                callBack(null);

                            });
                        },
                        function (err) {
                            responseObj = {result_count: formatted_users.length, results: formatted_users};
                            callBack(null);
                        });


                });
        }
    ], function (err) {
        callBack(responseObj);
    });

};


ConnectionSchema.statics.getFriendSuggestion = function (criteria, callBack) {

    var _async = require('async'),
        User = require('mongoose').model('User'),
        _this = this;

    _async.waterfall([
        function getUsersConnections(callBack) {

            _this.getFriends(criteria.user_id, criteria.status, function (myFriends) {

                callBack(null, myFriends.friends)

            });
        },
        function getAllUsers(myFriends, callBack) {

            User.getAllUsers(criteria.country, criteria.user_id, function (resultSet) {
                callBack(null, {
                    total_result: resultSet.total_result,
                    users: resultSet.users,
                    my_friends: myFriends
                })
            })
        },
        function mergeConnection(connections, callBack) {
            var _my_friends = connections.my_friends,
                _formattedFriendList = [],
                _allUsers = connections.users;


            for (var i = 0; i < _allUsers.length; i++) {
                var _c_users = {},
                    _my_friend = _my_friends[_allUsers[i].user_id.toString()];

                if (typeof _my_friend == 'undefined' && criteria.filter_ids.indexOf(_allUsers[i].user_id) == -1) {
                    _allUsers[i].connection_status = 0
                    _formattedFriendList.push(_allUsers[i]);

                }

            }
            callBack(null, {
                total_result: _formattedFriendList.length,
                friends: _formattedFriendList
            })
        }


    ], function (err, resultSet) {

        if (!err) {
            callBack({status: 200, friends: resultSet.friends, total_result: resultSet.total_result})
        } else {
            console.log("LOOP ERROR")
            console.log({status: 400, error: err});
        }

    });


};

ConnectionSchema.statics.getMyConnectionData = function (criteria, callBack) {
    var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.user_id.toString(),
        _async = require('async');

    var query = {
            q: criteria.q,
            index: _cache_key
        },
        formatted_users = [];

    ES.search(query, function (esResultSet) {

        if (esResultSet != null) {

            formatted_users = esResultSet.result;
            callBack({result_count: formatted_users.length, results: formatted_users})


        } else {
            callBack({result_count: 0, results: []})
        }

    });
};

ConnectionSchema.statics.getGroupConnectionsData = function (criteria, callBack) {
    var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.group_id.toString(),
        _async = require('async');

    var query = {
            q: criteria.q,
            index: _cache_key
        },
        formatted_users = [];

    ES.search(query, function (esResultSet) {

        if (esResultSet != null) {

            formatted_users = esResultSet.result;
            callBack({result_count: formatted_users.length, results: formatted_users})
            
        } else {
            callBack({result_count: 0, results: []})
        }

    });
};


/**
 * Get Request Count
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.checkRequestSentReceived = function (i, other, callBack) {
    var _this = this;

    var criteria = {
        status: ConnectionStatus.REQUEST_SENT,
        connected_with_type: ConnectedType.PERSONAL_CONNECTION,
        $or: [
            {$and: [{user_id: Util.toObjectId(i)}, {connected_with: Util.toObjectId(other)}]},
            {$and: [{user_id: Util.toObjectId(other)}, {connected_with: Util.toObjectId(i)}]}
        ]
    };

    _this.find(criteria)
        .exec(function (err, result) {
            if (!err) {
                callBack(result);
            } else {
                console.log("Server Error --------");
                console.log(err);
                callBack(null);
            }
        });
}

/**
 * Unfriend Connection
 * @param userId
 * @param callBack
 */
ConnectionSchema.statics.unfriendUser = function (criteria, callBack) {

    var _this = this, _async = require('async');

    _async.parallel([

        function changeStatus(callBack) {
            var now = new Date();
            _this.update(
                {
                    $or: [
                        {
                            user_id: Util.toObjectId(criteria.sender_id),
                            connected_with: Util.toObjectId(criteria.user_id),
                            connected_with_type: ConnectedType.PERSONAL_CONNECTION
                        },
                        {
                            user_id: Util.toObjectId(criteria.user_id),
                            connected_with: Util.toObjectId(criteria.sender_id),
                            connected_with_type: ConnectedType.PERSONAL_CONNECTION
                        }
                    ]
                }
                , {
                    $set: {
                        status: ConnectionStatus.CONNECTION_UNFRIEND,
                        updated_at: now
                    }
                }, {upsert: false, multi: false}, function (err, rsUpdate) {
                    if (!err) {
                        callBack(null);
                    } else {
                        console.log("user connection removed \n");
                        console.log(err);
                    }
                })
        },
        function updateOwnConnectionES(callBack) {
            //UPDATE OWN CONNECTION ES
            var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.user_id.toString();
            var payLoad = {
                index: _cache_key,
                id: criteria.sender_id.toString(),
                type: 'connections'
            }

            ES.delete(payLoad, function (resultSet) {
                console.log("own connection removeIndex");
                //console.log(resultSet);
                callBack(null);
            });

        },
        function updateFriendsConnectionES(callBack) {
            //UPDATE FRIEND'S CONNECTION ES
            var _cache_key = ConnectionConfig.ES_INDEX_NAME + criteria.sender_id.toString();
            var payLoad = {
                index: _cache_key,
                id: criteria.user_id.toString(),
                type: 'connections'
            }

            ES.delete(payLoad, function (resultSet) {
                console.log("friend's connection removeIndex");
                //console.log(resultSet);
                callBack(null);
            });

        }

    ], function (err) {
        callBack({status: 200})
    });
}

String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};

mongoose.model('Connection', ConnectionSchema);
