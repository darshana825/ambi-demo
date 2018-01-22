'use strict';

var mongoose = require('mongoose');
var Notebook = require('mongoose').model('Notebook');
var Note = require('mongoose').model('Note'); 
var uuid = require("node-uuid");

let connectedSharedDB = SharedDB.connect();

/**
 * Handle note related operation in the class
 */ 
var NotesController = {

  addNotebook:function(req,res) {
    let userId = Util.getCurrentSession(req).id;
    var _notebook = {
      name: req.body.name,
      color: req.body.color, 
      creator: userId
    };

    Notebook.createNotebook(_notebook, function(results){
      if (results) {
        // Will noop on share if necessary
        Notebook.shareNotebook(userId, results._id, req.body.shared, function() {
          res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
        }); 
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  deleteNotebook: function(req, res) {
    Notebook.deleteNotebook(req.body.notebookId, function(results) {
      if (results) {
        res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    }); 
  },

  getNotebooks:function(req,res){
    var criteria = { creator: Util.getCurrentSession(req).id };

    Notebook.getNotebooks(criteria, function(results) {
      if (results) {
        res.status(200).json({ notebooks: results, status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS) });
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  // Includes notebooks shared with me
  getAllNotebooks:function(req,res){
    let userId = Util.getCurrentSession(req).id;
    var criteria = { $or: [{creator: userId}, { $and: [{'shared_users.user': userId}, {'shared_users.status': SharedRequestStatus.REQUEST_ACCEPTED} ] } ] };

    Notebook.getNotebooks(criteria, function(results) {
      if (results) {
        res.status(200).json({ notebooks: results, status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS) });
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  addNote:function(req,res) {
    let newDocName = uuid.v1();
    let doc = connectedSharedDB.get('collab-notes', newDocName);

    doc.create([{insert: 'Start typing...'}], 'rich-text', function() {
      var _note = {
        title: req.body.title,
        doc_id: newDocName,
        notebook_id: req.body.notebookId,
        creator: Util.getCurrentSession(req).id,
      };

      Note.createNote(_note, function(results) {
        if (results) {
          res.status(200).json({note: results, status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS) });
        } else {
          res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
        }
      });
    });
  },

  getNote:function(req,res){ 
    var criteria = { _id: Util.toObjectId(req.params.note_id) };

    Note.getNote(criteria, function(results) {
      if (results) {
        res.status(200).json({ note: results, status: ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS) });
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  updateNote:function(req, res) { 
    var updateData = {
      title: req.body.title,
      updated_at: new Date()
    };

    console.log("update data: " + JSON.stringify(req.body));

    Note.updateNote(req.body.noteId, updateData, function(results) {
      if (results) {
        res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  deleteNote:function(req,res){ 
    // Remove from notebook only? potential LE reasons.
    var criteria = { noteId: req.body.noteId, notebookId: req.body.notebookId };

    Notebook.removeNote(criteria, function(results){
      if (results) {
        res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  shareNoteBook: function(req, res) {

    var notebookId = req.body.notebookId;
    var notifyUsers = req.body.toShare; // Array of user ids

    // Do sharing (add user ids)
    Notebook.shareNotebook(Util.getCurrentSession(req).id, notebookId, notifyUsers, function(results){
      if (results) {
        res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  sendShareNotification: function(senderId, notebookId, recipients, callback) {
    
  },

  /**
   * get shared users for a notebook
   * @param req
   * @param res
   */
  getSharedUsers:function(req,res){
 
     
  },

  /**
   * notebook owner changing the edit permission of a notebook to a shared user
   * @param req
   * @param res
   */
  updateNoteBookSharedPermissions:function(req,res){
    var criteria = {
      _id: req.body.notebook_id,
      'shared_users.user':req.body.user_id,
    };

    Notebook.updateSharedNotebook2(criteria, {'shared_users.$.mode':req.body.shared_mode}, function(results){
      if (results) {
        res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  /**
   * notebook owner can remove shared users from db and ES
   * @param req
   * @param res
   */
  removeSharedNoteBookUser:function(req, res){
    console.log("removing: " + req.body.user_id + " from " + req.body.notebook_id);
    Notebook.removeSharedUser(req.body.notebook_id, req.body.user_id, function(results){
      if (results) {
        res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
      } else {
        res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
      }
    });
  },

  /**
   * update shared user's note color
   * @param req
   * @param res
   */
  updateSharedUsersListColor:function(req,res){


  }
};

module.exports = NotesController;
