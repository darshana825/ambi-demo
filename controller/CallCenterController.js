'use strict';

var async = require('async');

var ES = require('../middleware/ES');
var ESUpdateHandler = require('../middleware/ESUpdateHandler');

var Connection = require('mongoose').model('Connection');
var mUser = require('mongoose').model('User');
var mCall = require('mongoose').model('Call');


var CallCenterController = {
  me: {
    updateMode: function (req, res, next) {
      var _async = require('async');

      _async.waterfall([
        function updateDatabase(callback) {
          var CurrentSession = Util.getCurrentSession(req);

          var onlineMode = null;

          if (req.body.userMode == mUser.modes.ONLINE) {
            onlineMode = mUser.modes.ONLINE;
          } else if (req.body.userMode == mUser.modes.OFFLINE) {
            onlineMode = mUser.modes.OFFLINE;
          } else if (req.body.userMode == mUser.modes.WORK_MODE) {
            onlineMode = mUser.modes.WORK_MODE;
          } else {
            onlineMode = mUser.modes.OFFLINE;
          }

          mUser.saveUpdates(CurrentSession.id, {"onlineMode": onlineMode}, function (r) {
            (r.status == 200) ? callback(null, CurrentSession.id, onlineMode) : callback(error);
          });
        }, function updateES(userId, onlineMode, callback) {
          var payLoad = {
            index: 'idx_usr',
            id: userId,
            type: 'user',
            data: {online_mode: onlineMode}
          };

          ESUpdateHandler.updateUserOnlineMode(payLoad, function (resultSet) {
            callback(null, onlineMode)
          });
        }
      ], function (error, onlineMode) {
        var outPut = {};

        if (error) {
          outPut = {status: ApiHelper.getMessage(400, Alert.ERROR)};
          return res.status(400).json(outPut);
        } else {
          outPut = {onlineMode: onlineMode, status: ApiHelper.getMessage(200, Alert.SUCCESS)};
          return res.status(200).json(outPut);
        }
      });
    }
  },
  contact: {
    /**
     * Get all contacts - Connections
     * @param req
     * @param res
     * @param next
     * */
    getAll: function (req, res, next) {
      var CurrentSession = Util.getCurrentSession(req);
      var criteria = {
        user_id: CurrentSession.id,
        q: req.query['q']
      };

      async.waterfall([
        function (callback) {
          Connection.getConnections(criteria, function (resultSet) {
            if (resultSet) {
              var connections = resultSet.data.reduce(function (allConnections, connection) {

                allConnections.push({
                  user_id: connection.user_id,
                  first_name: connection.first_name,
                  last_name: connection.last_name,
                  contact_name: connection.contact_name,
                  online_mode: connection.online_mode,
                  onlineStatus: connection.onlineStatus,
                  user_name: connection.user_name,
                  images: connection.images,
                  type: connection.type
                });

                return allConnections;
              }, []);

              callback(null, connections);
            } else {
              callback(null, null);
            }
          });
        },
        function (aConns, callback) {
          if (typeof aConns != 'undefined' && aConns.length > 0) {
            var aAlphabet = [];

            aConns.sort(function (a, b) {
              var textA = a.contact_name.toUpperCase();
              var textB = b.contact_name.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            var aConnsLength = aConns.length;

            for (var i = 0; i < aConnsLength; i++) {
              var first_letter = aConns[i].contact_name[0].toUpperCase();

              if (aAlphabet.indexOf(first_letter) == -1) {
                aAlphabet.push(first_letter);
              }
            }

            aAlphabet.sort();

            var aContacts = [];

            var aAlphabetLength = aAlphabet.length;
            for (var i = 0; i < aAlphabetLength; i++) {
              aContacts.push({
                letter: aAlphabet[i],
                users: []
              });
            }

            for (var i = 0; i < aConnsLength; i++) {
              var first_letter = aConns[i].contact_name[0].toUpperCase();

              var contactsLength = aContacts.length;
              for (var x = 0; x < contactsLength; x++) {
                if (aContacts[x].letter == first_letter) {
                  delete aContacts[x]['contact_name'];
                  // online status must be coming from Elastic Search.
                  aConns[i].onlineStatus = 1;
                  aContacts[x].users.push(aConns[i]);
                }
              }
            }

            callback(null, aContacts);
          } else {
            callback(null, []);
          }
        }
      ], function (error, aContacts) {
        var outPut = {};

        if (error) {
          outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
          return res.status(400).json(outPut);
        } else {
          outPut.contacts = aContacts;
          outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
          return res.status(200).json(outPut);
        }
      });
    },
    getGroupMembers: function (req, res) {
      var GroupId = req.body.group_id;

      var query = {
        q: '_id:' + GroupId,
        index: 'idx_group'
      };

      var _async = require('async');

      _async.waterfall([
        function getGroupMembers(callback) {
          ES.search(query, function (ResultSet) {
            if (ResultSet.hasOwnProperty('result')) {
              callback(null, ResultSet.result.shift());
            } else {
              callback(null, null);
            }
          });
        },
        function getUsersFromMembers(aMembers, callback) {
          var aUsers = [];

          if (aMembers) {
            _async.each(aMembers.members, function (member, getUserCallback) {

              var query = {
                q: '_id:' + member.user_id,
                index: 'idx_usr'
              };

              ES.search(query, function (ResultSet) {
                if (ResultSet.hasOwnProperty('result')) {
                  aUsers.push(ResultSet.result.shift());
                  getUserCallback();
                }

                getUserCallback();
              });

            }, function (error) {
              (error) ? callback(error) : callback(null, aUsers);
            });
          } else {
            callback(null, []);
          }
        }
      ], function (error, aGroupMembers) {
        var outPut = {};

        if (error) {
          outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
          return res.status(400).json(outPut);
        } else {
          outPut.members = aGroupMembers;
          outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
          return res.status(200).json(outPut);
        }
      });


    },
    getContact: function (req, res, next) {
      var query = {
        q: '_id:' + req.body.user_name,
        index: 'idx_usr'
      };

      ES.search(query, function (ResultSet) {
        var outPut = {};

        if (ResultSet.hasOwnProperty('result')) {
          outPut.user = ResultSet.result.shift();
          outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
          return res.status(200).json(outPut);
        } else {
          outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
          return res.status(400).json(outPut);
        }
      });
    }
  }
  ,
  call: {
    /**
     * add call center record
     * @param req
     * @param res
     */
    addCallRecord: function (req, res, next) {
      var oCallRecord = req.body.callRecord;

      var CurrentSession = Util.getCurrentSession(req);

      var oNewRecord = {
        user_id: CurrentSession.id,
        // should be support for both individual or group
        contact_type: oCallRecord.contact.contactType,
        call_channel: oCallRecord.callChannel,
        receivers_list: oCallRecord.targets,
        started_at: oCallRecord.dialedAt,
        call_status: mCall.callStatus.MISSED,
        call_type: mCall.callTypes.OUTGOING
      };

      mCall.addNew(oNewRecord, function (oCallRes) {
        var outPut = {};

        if (oCallRes.status == 400) {
          outPut.error = oCallRes.error;
          outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
          return res.status(400).json(outPut);
        } else {
          outPut.call_record = oCallRes.data;
          outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
          return res.status(200).json(outPut);
        }
      });
    },

    /**
     * get call center records
     * @param req
     * @param res
     */
    getCallRecords: function (req, res, next) {
      var CurrentSession = Util.getCurrentSession(req);

      var _cache_key = CallConfig.CACHE_PREFIX + CurrentSession.id.toString(),
        _async = require('async');

      var query = {
        q: req.q,
        index: _cache_key,
        sort: "createdAt:desc"
      };

      _async.waterfall([
        function searchCallRecords(callback) {
          ES.search(query, function (esCallRecordsResult) {
            if (esCallRecordsResult) {
              var esCallRecords = esCallRecordsResult.result;

              var aReceiverIds = [];

              // TODO : Group call records in 2 hours range
              if (esCallRecords && esCallRecords.length > 0) {
                esCallRecords.forEach(function (oRecord) {
                  oRecord.receivers_list.forEach(function (oReceiver) {
                    if (aReceiverIds.indexOf(oReceiver.user_id) == -1) {
                      aReceiverIds.push(oReceiver.user_id);
                    }
                  });
                });

                var aReceivers = [];

                callback(null, aReceiverIds, aReceivers, esCallRecords);
              } else {
                callback(null, null, null, null);
              }
            } else {
              callback(null, null, null, null);
            }
          });
        }, function getReceivers(aReceiverIds, aReceivers, aCallRecords, callback) {
          if (aReceiverIds) {
            _async.each(aReceiverIds, function (receiverId, getReceiverCallback) {

              var query = {
                q: 'user_id:' + receiverId,
                index: 'idx_usr'
              };

              ES.search(query, function (oUserResult) {
                aReceivers.push(oUserResult.result[0]);
                getReceiverCallback();
              });

            }, function (error) {
              error ? callback(error) : callback(null, aReceivers, aCallRecords);
            });
          } else {
            callback(null, null, null);
          }
        }, function prepareCallRecords(aReceivers, aCallRecords, callback) {
          if (aReceivers) {
            _async.each(aCallRecords, function (oCallRecord, callRecordCallback) {
              var aReceiverIds = [];

              oCallRecord.receivers_list.forEach(function (oReceiver) {
                aReceiverIds.push(oReceiver.user_id);
              });

              oCallRecord.receivers_list = [];

              _async.each(aReceivers, function (oReceiver, getUserCallback) {
                if (aReceiverIds.indexOf(oReceiver.user_id) != -1) {
                  if (oReceiver.user_id == CurrentSession.id && oCallRecord.call_type == mCall.callTypes.INCOMING) {
                    var query = {
                      q: 'user_id:' + oCallRecord.user_id,
                      index: 'idx_usr'
                    };

                    ES.search(query, function (oUserResult) {
                      if (oUserResult) {
                        oCallRecord.origin_user = oUserResult.result[0];
                      }

                      oCallRecord.receivers_list.push(oReceiver);
                      getUserCallback();
                    });
                  } else {
                    oCallRecord.receivers_list.push(oReceiver);
                    getUserCallback();
                  }
                } else {
                  getUserCallback();
                }
              }, function (error) {
                (error) ? callRecordCallback(error) : callRecordCallback();
              });
            }, function (error) {
              (error) ? callback(error) : callback(null, aCallRecords);
            });
          } else {
            callback(null, []);
          }
        }
      ], function (error, aCallRecords) {
        var outPut = {};

        if (error) {
          outPut.error = error;
          outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
          return res.status(400).json(outPut);
        } else {
          outPut.call_records = aCallRecords;
          outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
          return res.status(200).json(outPut);
        }
      });
    },

    /**
     * update call center records
     * @param req
     * @param res
     */
    updateCallRecord: function (req, res, next) {
      var _async = require('async');

      var odm = require('mongoose');
      var recordId = odm.Types.ObjectId(req.body.record_id);

      _async.waterfall([
        function updateCallRecord(callback) {
          mCall.updateCallRecord(recordId, {call_status: req.body.status}, function (callRecordResult) {
            if (callRecordResult.status == 200) {
              callback(null, callRecordResult.data);
            } else {
              callback(callRecordResult.error);
            }
          });
        }, function updateES(oRecord, callback) {
          var oReceiver = oRecord.receivers_list.shift();

          var _cache_key = CallConfig.CACHE_PREFIX + oReceiver.user_id.toString();

          var payLoad = {
            index: _cache_key,
            id: oRecord._id.toString(),
            type: 'call-record',
            data: {call_status: oRecord.call_status}
          };

          console.log('payload', payLoad);

          ES.update(payLoad, function (resultSet) {
            callback(null, oRecord);
          });
        }
      ], function (error, oCallRecord) {
        var outPut = {};

        if (error) {
          outPut.error = error;
          outPut.status = ApiHelper.getMessage(400, Alert.ERROR);
          return res.status(400).json(outPut);
        } else {
          outPut.call_record = oCallRecord;
          outPut.status = ApiHelper.getMessage(200, Alert.SUCCESS);
          return res.status(200).json(outPut);
        }
      });
    }
  },
  twilio: {}
};

module.exports = CallCenterController;
