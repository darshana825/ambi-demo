import _ from 'lodash';
import Session from '../../../middleware/Session';
import {
  FETCH_NOTEBOOKS,
  FETCH_NOTES,
  ADD_NOTEBOOK,
  DELETE_NOTE,
  DELETE_NOTEBOOK,
  SAVE_NOTE,
  UPDATE_NOTE
} from '../actions';

export default function(state = { }, action) {
  switch (action.type) {
    case FETCH_NOTEBOOKS:
      return  { ...state, ...action.payload.data }
    case ADD_NOTEBOOK:
      return { ...state }
    // case FETCH_NOTES:
    //   return { ...state, [action.payload.data.notebook_id]: action.payload.data.notes, isFetching: false }
    // case DELETE_NOTEBOOK:
    //   //TODO:needs to omit the notebook by notebook id
    //   return _.omit(state, action.payload)
    // case DELETE_NOTE:
    //   //TODO:needs to omit the note by note id by the notebook id
    //   return _.omit(state, action.payload)
    // case SAVE_NOTE:
    //   return [ ...state, [action.payload.data.notebook_id]: action.payload.data.notes]
    // // case UPDATE_NOTE:
    // //   console.log(action);
    default:
      return state
  }
}
