/**
 * This is Notes Model
 */

'use strict';
var  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uuid = require('node-uuid');

var NoteSchema = new Schema({

  title: { type:String, trim:true },
  doc_id: { type:String, trim:true }, // ShareDB Identifier
  creator: { type: Schema.ObjectId, ref: 'User' },
  notebook_id: { type: Schema.ObjectId, ref: 'Notebook' },
  created_at: { type:Date },
  updated_at: { type:Date }

});

NoteSchema.pre('save', function(next){
  var now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

/**
 * Create Note
 */
NoteSchema.statics.createNote = function(data, callBack) {
  var newNote = new this(data);

  newNote.save(function(err, results) {
    if (err) {
      console.log(err);
      callBack(results);
    } else {
      mongoose.model('Notebook').addNote(results, function(newResults) {
        callBack(newResults);
      });
    }
  });
};

/**
 * Get Notes
 */
NoteSchema.statics.getNotes = function(criteria, callBack) {
  this.find(criteria).sort({created_at:-1}).exec(function(err, results) {
    if (err) console.log(err);
    callBack(results);
  });
};

/**
 * Get Note
 */
NoteSchema.statics.getNoteById = function(id, callBack) { 
  this.findOne({_id: id}).exec(function (err, results) {
    if (err) console.log(err);
    callBack(results);
  });
};

/**
 * Update Note
 */
NoteSchema.statics.updateNote = function(id, updateData, callBack) {
  this.update({_id: id}, {$set:updateData}, {new: true}, function(err, results) {
    if (err) console.log(err);
    callBack(results);
  });
};

/**
 * Delete Note
 */
NoteSchema.statics.deleteNote = function(id, callBack) {
  this.findOneAndRemove({_id: id}, function(err, results) {
    if (err) console.log(err);
    callback(error == null);
  });
};

mongoose.model('Note', NoteSchema);