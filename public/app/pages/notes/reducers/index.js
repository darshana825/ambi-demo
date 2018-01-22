import { combineReducers } from 'redux';
import NotesReducer from './reducer_notes';
import ChatReducer from './reducer_chat';

const rootReducer = combineReducers({
  notes: NotesReducer,
  chat: ChatReducer
});

export default rootReducer;
