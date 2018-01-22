import React, { Component } from 'react';
import { connect } from 'react-redux';
import Session from '../../middleware/Session';
import * as actions from './actions';
import NoteEditor from './NoteEditor';


class NoteList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user:Session.getSession('prg_lg'),
    };
  }

  addNewNote(notebook){
    let newNote = { title: 'New Note', notebookId: notebook._id };

    this.props.createNote(this.state.user, newNote);
    let that = this;
    setTimeout(function() {
      that.props.fetchNotebooks(that.state.user);
      setTimeout(function() {
        that.editNote(that.props.notebook.notes[0])
      }, 200);
    }, 100);

    // this.props.showNotePopup(notebook_id,null, null);
  }

  editNote(note){
    console.log("Edit note!");
    this.setState({editNote: note});
    // this.props.showNotePopup(notebook_id,note);
  }

  endNoteEdit() {
    this.setState({editNote: null});
  }

  deleteNote(note) {
    let noteToRemove = { noteId: note._id, notebookId: note.notebook_id };

    this.props.deleteNote(this.state.user, noteToRemove);
    this.props.fetchNotebooks(this.state.user);
  }

  showConfirm(note_id){
    this.props.showConfirm(note_id);
  }

  showMoreNotes(){
    let visibilityState = this.state.allNotesAreVisible;
    this.setState({allNotesAreVisible : !visibilityState});
  }

  formatNote(note, key) {
    note.title = note.title || 'New Note';
    if (note.title.length > 30) note.title = note.title.substring(0,30);
    note.color = '#eee';

    let that = this;
    return (
      <div className="notebook-col" id={note._id} key={key}>
        <div className="notebook-item" style={{borderColor : note.color}}>
          <a onClick={ that.editNote.bind(that, note)}>
            <div className="time-wrapper">
              <p className="date-created">{ new Date(note.updated_at).toLocaleDateString() }</p>

              <p className="time-created">{ new Date(note.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }</p>
            </div>
            <div className="notebook-title-holder">
              <p className="notebook-title">{note.title}</p>
            </div>
          </a>
          <span className="note-delete-btn" onClick={ that.deleteNote.bind(that, note) }></span>
          <p className="note-owner" style={{color : note.color}}>{note.creator.first_name + ' ' + note.creator.last_name}</p>
        </div>
      </div>
    );
  }

  render() {
    let notebook = this.props.notebook;
    let border_color = notebook.border_color;

    // let _first_notes = notebook.notes.splice(0, 4).map(function(note, key){
    //   return this.formatNote(note);
    // });
    let that = this;
    let _allNotes = notebook.notes.sort(function compare(a, b) { return new Date(b.updated_at) - new Date(a.updated_at) }).map(function(note, key) {
      return that.formatNote(note, key);
    });

    return(
      <div>
        <div className="notebook-items-wrapper">
          <div className="notebook-col">
            <div className="notebook-item create-note" style={{borderColor: border_color}} onClick={this.addNewNote.bind(this, notebook)}>
              <i className="fa fa-plus" style={{color: border_color}}></i>
              <p className="add-note-text" style={{color: border_color}}>Create a new note</p>
            </div>
          </div>
          { _allNotes }
        </div>
        { this.state.editNote &&
          <NoteEditor note={this.state.editNote } dismissModal={this.endNoteEdit.bind(this)} />
        }
      </div>
    );
  }
}

export default connect(null, actions)(NoteList);
