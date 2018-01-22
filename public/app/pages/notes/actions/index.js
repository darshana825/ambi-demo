import axios from 'axios';

export const FETCH_NOTEBOOKS = 'fetch_notebooks';
export const FETCH_NOTES = 'fetch_notes';
export const ADD_NOTEBOOK = 'add_notebook';
export const ADD_NOTE = 'add_note';
export const UPDATE_NOTE = 'update_note';
export const DELETE_NOTE = 'delete_note';
export const DELETE_NOTEBOOK = 'delete_notebook';

//TODO: Set default headers for axios calls
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;


export function fetchNotebooks(user) {
  return (dispatch, getState) => {
    dispatch({ type: "REQUEST_STARTED" });
    axios.get('/notes/get-notes', { headers: { 'prg-auth-header': user.token } })
      .then(response => {
        dispatch({ type: FETCH_NOTEBOOKS, payload: response })
    })
      .catch(error => dispatch({ type: "REQUEST_FAILED", error }))
  }
}

export function createNotebook(user, newNotebook) {
  return (dispatch, getState) => {
    dispatch({ type: "REQUEST_STARTED" });
    axios.post('/notes/add-notebook', newNotebook, { headers: { 'prg-auth-header':user.token } } )
    .then(response => {
        dispatch({ type: ADD_NOTEBOOK, payload: response })
    })
      .catch(error => dispatch({ type: "REQUEST_FAILED", error }))
  }
}

export function createNote(user, newNote) {
  return (dispatch, getState) => {
    dispatch({ type: "REQUEST_STARTED" });
    axios.post('/notes/add-note', newNote, { headers: { 'prg-auth-header':user.token } } )
    .then(response => {
        dispatch({ type: ADD_NOTE, payload: response })
    })
      .catch(error => dispatch({ type: "REQUEST_FAILED", error }))
  }
}

export function deleteNote(user, noteDetails) {
  return (dispatch, getState) => {
    dispatch({ type: "REQUEST_STARTED" });
    axios.post('/notes/delete-note', noteDetails, { headers: { 'prg-auth-header':user.token } } )
    .then(response => {
        dispatch({ type: DELET_NOTE, payload: response })
    })
      .catch(error => dispatch({ type: "REQUEST_FAILED", error }))
  }
}

// the issue here is that there is no default notebook. i am an idiot

export function fetchNotes(user) {
  return axios.get('/notes/get-notes', { headers: { 'prg-auth-header':user.token } })
    .then((notesResult) => {
      return {
        type: FETCH_NOTES,
        payload: notesResult
      }
    });
}

//TODO: implement deleteNotebook

export function saveNote(values, callback) {
  return axios.post('/notes/add-note', { headers: { 'prg-auth-header':user.token } })
    .then((saveNoteResult) => {
      return {
        type: SAVE_NOTE,
        payload: saveNoteResult
      }
    });
}

//TODO: implement updateNotes
