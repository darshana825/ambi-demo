/**
 * Group model
 */


'use strict';
var mongoose = require('mongoose'),
    uuid = require('node-uuid'),
    slug = require('mongoose-slug-generator'),
    Schema   = mongoose.Schema;
    mongoose.plugin(slug);

GLOBAL.GroupSharedRequest = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3,
    MEMBER_REMOVED: 4
};

GLOBAL.GroupPermissions = {
    FULL_ACCESS: 1,
    VIEW_ONLY: 2,
    VIEW_POST: 3,
    ADD_POST: 4,
    SHARE_POST: 5,
    VIEW_DOCUMENT: 6,
    VIEW_MEMBER: 7,
    ADD_MEMBER: 8,
    VIEW_CALENDAR: 9,
    VIEW_FOLDER: 10,
};

GLOBAL.GroupConfig = {
    ES_INDEX: "idx_group"
};

var SharedMemberSchema = new Schema({
    name:{
        type:String,
        default:null
    },
    user_id:{
        type : Schema.ObjectId,
        ref : 'User',
        default : null
    },
    status:{
        type : Number,
        default : null /* 1 - pending | 2 - rejected | 3 - accepted | 4 - deleted*/
    },
    permissions:{
        type : Number,
        default : null /* 1 - pending | 2 - rejected | 3 - accepted*/
    },
    join_date: {
        type:Date
    },
});

var GroupsSchema = new Schema({
    type:{
        type : Number,
        default : 1 /* 1 - group | 2 - community*/
    },
    name:{
        type:String,
        default:null
    },
    name_prefix:{
        type: String,
        slug: "name",
        unique: true
    },
    description:{
        type:String,
        default:null
    },
    color:{
        type:String,
        trim:true
    },
    group_pic_link:{
        type:String,
        trim:true,
        default:null
    },
    created_by:{
        type: Schema.ObjectId,
        ref: 'User',
        default:null
    },
    members:[SharedMemberSchema],
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"groups"});


GroupsSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Create group
 * @param groupData
 * @param callBack
 */
GroupsSchema.statics.createGroup = function(groupData,callBack){
    var _group = new this();
    _group.name = groupData.name;
    _group.description = groupData.description;
    _group.color = groupData.color;
    _group.group_pic_link = groupData.group_pic_link;
    _group.created_by = groupData.created_by;
    _group.members = groupData.members;
    _group.type = groupData.type;

    var _async = require('async');

    _group.save({lean:true},function(err,result){

        if(!err){
            callBack({
                status:200,
                result:result
            });
        }else{
            callBack({status:400,error:err});
        }
    });
};

/**
 * Create group
 * @param groupData
 * @param callBack
 */
GroupsSchema.statics.getGroupMembers = function(criteria,callBack){
    var _this = this;


    /* TODO: We can use this aggrigation approch,
    when we are using new version (3.2) of MongoDB */
    /*_this.aggregate([
        {
            "$match": {
                "_id": groupId
            }
        },
        {
            "$filter": {
                "input": "$members",
                "as": "member",
                "cond": { "$eq": ["$$member.status", 3] }
            }
        },
        { "$unwind": "$members" },
        {
            "$lookup": {
                "from" : "SharedMember",
                "localField" : "members.user_id",
                "foreignField" : "user_id",
                "as" : "member"
            }
        }
    ]).exec(function(err, results) {
        if (err) throw err;
    });*/

    _this.find(criteria).select('created_by members -_id').exec(function(err,resultSet){
        if(!err && typeof(resultSet[0]) != 'undefined'){

            console.log(resultSet);
            var memberObjs = resultSet[0].members;
            var tmpArray = [];
            var tmpObjArray = [];
            for (var i = 0; i < memberObjs.length; i++) {

                var member = memberObjs[i];
                if(member.status == GroupSharedRequest.REQUEST_ACCEPTED || member.status == GroupSharedRequest.REQUEST_PENDING) {
                    tmpArray.push(member.user_id);
                    tmpObjArray.push(member);
                }

                if(memberObjs.length == i + 1) {
                    callBack({
                        owner : resultSet[0].created_by,
                        members : tmpArray,
                        members_count : tmpArray.length,
                        memberObjs : tmpObjArray
                    });
                }
            }
        }else{
            console.log("Server Error --------");
            callBack({status:400, error:err});
        }
    })
};

/**
 * Get Groups By a given criteria
 */
GroupsSchema.statics.getGroup = function(criteria,callBack){

    var _this = this;

    _this.find(criteria).sort({created_at:1}).exec(function (err, resultSet) {
        if (!err) {

            callBack({status: 200, group: resultSet});
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get Group By Id
 */
GroupsSchema.statics.getGroupById = function(id,callBack){

    var _this = this;

    _this.findOne({_id: id}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }

            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get Group Data
 */
GroupsSchema.statics.getGroupData = function(criteria,callBack){

    var _this = this;

    _this.find(criteria , {'members.$': 1}).exec(function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callBack(null);
                return;
            }

            callBack(resultSet);
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * Get Group Filtered Data
 */
GroupsSchema.statics.getGroupDataFiltered = function(criteria,filter,callBack){

    var _this = this;

    _this.find(criteria , filter).exec(function (err, resultSet) {
        if (!err) {
            callBack({status: 200, data: resultSet});
        } else {
            console.log(err)
            callBack({status: 400, error: err})
        }
    });

};

/**
 * This is to get the group name of given group_id
 * @param criteria
 * @param data
 * @param callBack
 */
GroupsSchema.statics.bindNotificationData = function(notificationObj, callBack){

    this.getGroupById(notificationObj.group_id,function(groupData){

        notificationObj['group_name'] = groupData.name;
        notificationObj['name_prefix'] = groupData.name_prefix;

        callBack(notificationObj);
    });

};

/**
 * Update a Group
 * @param filter
 * @param value
 * @param callBack
 */
GroupsSchema.statics.updateGroups = function(filter, value, callBack){

    var _this = this;
    var options = {multi: true};

    this.update(filter, value, options, function(err, update) {
        if(err){
            console.log(err);
            console.log("Error - An Error occured in group updating.");
            callBack({status:400,error:err});
        } else {
            console.log("Success - The group updating is success.");
            _this.getGroupById(filter._id, function (r){
                callBack({status:200, group:r});
            });
        }
    });
};

/**
 * Create connections related to the group
 * @param groupData
 * @param userId
 * @param callBack
 */
GroupsSchema.statics.addConnections = function(groupData, userId, callBack){

    var Connection = require('mongoose').model('Connection');
    var _async = require('async');
    _async.waterfall([
        function createIndex(callBack) {
            // creates the group index
            var groupKey = GroupConfig.ES_INDEX;
            var groupPayLoad={
                index:groupKey,
                id:groupData._id.toString(),
                type: 'group',
                data: groupData
            };

            // create ES index with group id
            ES.createIndex(groupPayLoad, function(resultSet){
                console.log("ES INDEX IS CREATED FOR : " + GroupConfig.ES_INDEX);
                callBack(null, groupData);
            });
        },
        function createUserIndexes(groupData, callBack) {
            groupData.members.forEach(function(member) {
                if(member.status == GroupSharedRequest.REQUEST_ACCEPTED) {

                    // create connection in DB
                    var connectionData = new Connection();
                    connectionData.connected_group = groupData._id;
                    connectionData.connected_with_type = ConnectedType.GROUP_CONNECTION;
                    connectionData.action_user_id = userId;
                    connectionData.status = ConnectionStatus.REQUEST_ACCEPTED;
                    connectionData.user_id = member.user_id;
                    Connection.createConnection(connectionData, function(connectionResult) {
                        console.log("CREATE DB CONNECTION FOR "+ member.user_id.toString());
                    });

                    var query={
                        q:"user_id:"+member.user_id,
                        index:'idx_usr'
                    };

                    // for getting member
                    ES.search(query,function(userResult){

                        //creates the group index
                        var groupKey = ConnectionConfig.ES_INDEX_NAME+groupData._id;
                        var groupPayLoad={
                            index:groupKey,
                            id:member.user_id.toString(),
                            type: 'connections',
                            data: userResult.result[0],
                        };

                        // create ES index with group id
                        ES.createIndex(groupPayLoad, function(resultSet){
                            console.log("ES INDEX IS CREATED FOR : " +ConnectionConfig.ES_INDEX_NAME+groupData._id);
                        });
                    });

                    // create ES index with user id
                    var userKey = ConnectionConfig.ES_GROUP_INDEX_NAME+member.user_id
                    var groupPayLoad={
                        index:userKey,
                        id:groupData._id.toString(),
                        type: 'connections',
                        data:groupData
                    };

                    ES.createIndex(groupPayLoad, function(resultSet){
                        console.log("ES INDEX IS CREATED FOR : " + ConnectionConfig.ES_GROUP_INDEX_NAME+member.user_id);
                    });
                    callBack(null, groupData);
                } else {
                    callBack(null, groupData);
                }
            });
        }
    ], function (err, groupData) {
        if(err) {
            console.log(err);
            callBack({status:400, error:err});
        } else {
            callBack({status:200, value:null});
        }
    });
};

mongoose.model('Groups',GroupsSchema);
