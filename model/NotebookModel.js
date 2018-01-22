/**
 * This is Notebook model
 */

'use strict';
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uuid = require('node-uuid');

GLOBAL.NotebookType = {
  PERSONAL_NOTEBOOK: 0,
  GROUP_NOTEBOOK: 1
};

GLOBAL.SharedRequestStatus = {
    REQUEST_PENDING: 1,
    REQUEST_REJECTED: 2,
    REQUEST_ACCEPTED: 3,
    REMOVED_FROM_GROUP: 4
};

GLOBAL.SharedMode = {
    READ_ONLY: 1,
    READ_WRITE: 2
};

var NotebookSchema = new Schema({

  name: { type:String, trim:true },
  color: { type:String, trim:true },
  creator: { type: Schema.ObjectId, ref: 'User', default:null },
  type: { type:Number, default: NotebookType.PERSONAL_NOTEBOOK },

  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],

  shared_users: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    status: { type: Number, default: SharedRequestStatus.REQUEST_PENDING },
    mode: { type: Number, default: SharedMode.READ_ONLY },
  }],

  created_at:{ type:Date },
  updated_at:{ type:Date }

});

NotebookSchema.pre('save', function(next){
  var now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});

/**
 * Create Notebook
 */
NotebookSchema.statics.createNotebook = function(data, callBack) {
  var newNotebook = new this(data);

  newNotebook.save(function(err, results) {
    if (err) console.log(err);
    callBack(results);
  });
};

NotebookSchema.statics.deleteNotebook = function(id, callback) {
  this.findOneAndRemove({_id: id}, function(err, results) {
    if (err) console.log(err);
    callback(err == null);
  });
};

NotebookSchema.statics.addNote = function(data, callBack) {
  this.findOneAndUpdate({_id: data.notebook_id}, {$push: {notes: data._id}}, function(err, results) {
    if (err) console.log(err);
    callBack(results);
  });
};

NotebookSchema.statics.removeNote = function(data, callBack) { 
  this.findOneAndUpdate({_id: data.notebookId}, {$pull: {notes: data.noteId}}, function(err, results) {
    if (err) console.log(err);
    callBack(err == null);
  });
};

/**
 * Get Notebooks | DB
 */
NotebookSchema.statics.getNotebooks = function(criteria, callBack) {
  this.find(criteria).populate([
    { path:'notes', populate: {path: 'creator', select: '_id, first_name last_name'}},
    { path:'creator', select: '_id, first_name last_name user_name email education_details working_experiences'},
    { path:'shared_users.user', select: '_id, first_name last_name user_name email education_details working_experiences'}
    ]).sort({created_at:-1}).exec(function(err, results) {

    if (err) console.log(err);
    callBack(results);
  });
};

/**
 * Get Notebook By Id
 */
NotebookSchema.statics.getNotebookById = function(id, callBack) { 
  this.findOne({_id: id}).exec(function (err, results) {
    if (err) console.log(err);
    callBack(results);
  });
};

/**
 * Share notebook with other users
 */
NotebookSchema.statics.shareNotebook = function(senderId, notebookId, users, callBack) { 
  if (users.length == 0) {
    callBack(true); 
    return;
  }

  var to_share = users.map(function(user) {
    return { user: user }
  });

  console.log(to_share);

  this.findOneAndUpdate({_id: notebookId}, {$push: {shared_users: {$each: to_share}}}, function(err, results) {
    if (err) { 
      console.log(err);
      callBack(false);
    } else {
      var Notification = mongoose.model('Notification');
      var NotificationRecipient = mongoose.model('NotificationRecipient');

      var notificationData = {
        sender: senderId,
        notification_type: Notifications.SHARE_NOTEBOOK,
        notified_notebook: notebookId
      };

      Notification.saveNotification(notificationData, function(res) {
        if(res.status == 200) {
          NotificationRecipient.saveRecipients({ notification_id: res.result._id, recipients: users }, function(res) {
            callBack(true);
          });
        } else {
          console.log("Error sending share notification");
          console.log(res);
          callback(false);
        }
      });
    }
  });
};

NotebookSchema.statics.removeSharedUser = function(notebookId, userId, callBack) { 
  this.findOneAndUpdate({_id: notebookId }, {$pull: { shared_users: { user: userId}}}, function(err, results) {
    if (err) console.log(err);
    callBack(err == null);
  });
};

NotebookSchema.statics.ch_shareNoteBookCreateIndex = function(userId, data, callBack){
  var _cache_key = "idx_user:"+ NoteBookConfig.CACHE_PREFIX + userId;
  var payLoad={
    index:_cache_key,
    id:data.user_id.toString(),
    type: 'shared_notebooks',
    data:data
  } 

  ES.createIndex(payLoad, function(results){
    callBack(results)
  });
};

/**
 * Share Notebook | Cache based on User
 * {Update Notebook List}
 */
NotebookSchema.statics.ch_shareNoteBookUpdateIndex = function(userId, data, callBack){
  var _cache_key = "idx_user:"+ NoteBookConfig.CACHE_PREFIX + userId;
  var payLoad={
    index:_cache_key,
    id: data.user_id.toString(),
    type: 'shared_notebooks',
    data: data
  }

  ES.update(payLoad,function(resultSet){
    callBack(resultSet)
  });
};

/**
 * Get Notebook | Get shared notebook to user
 */
NotebookSchema.statics.ch_getSharedNoteBooks = function(userId, payload, callBack) {
  var _cache_key = "idx_user:" + NoteBookConfig.CACHE_PREFIX + userId;
  var query = {
    q: payload.q,
    index: _cache_key
  };

  //Find User from Elastic search
  ES.search(query,function(csResultSet) {
    callBack(csResultSet); 
  });
};

/**
 * Update Shared Notebook
 * @param criteria
 * @param data
 * @param callBack
 */
NotebookSchema.statics.updateSharedNotebook = function(criteria, data, callBack){
  this.update(criteria, data, {multi:true}, function(err,resultSet){
    if(!err){
      callBack({ status:200 });
    } else {
      console.log("Server Error --------")
      console.log(err)
      callBack( {status:400,error:err} );
    }
  });
}; 

NotebookSchema.statics.updateSharedNotebook2 = function(criteria, data, callBack){
  this.updateSharedNotebook(criteria, data, function(results) {
    callBack(results.status == 200);
  });
}; 

NotebookSchema.statics.bindNotificationData = function(notificationObj, callBack) {
  this.getNotebookById(notificationObj.notebook_id, function(notebookData) {
    if (notebookData) {
      notificationObj['notebook_name'] = notebookData.name;
    } else {
      notificationObj['notebook_name'] = 'Deleted';
    }
    
    callBack(notificationObj);
  });
};

mongoose.model('Notebook', NotebookSchema);
