import _ from 'lodash';
import Session from '../../../middleware/Session';
import {
  LOAD_NEW_CONVERSATION,
  LOAD_EXISTING_CONVERSATION
} from '../actions/chatActions';

export default function(
  state = { 
    conversations: []
  }, action) {
  switch (action.type) {
    case LOAD_NEW_CONVERSATION:
        console.log("action: " + action);
        console.log("state: " + state);
        state.conversations.push(action.conversation);
        return state;
    case LOAD_EXISTING_CONVERSATION:
        let conversation = action.conversation;
        var conversationIndex = -1;
        for (var i = 0; i < state.conversations.length; i++) {
          if (conversation.channel.sid === state.conversations[i].channel.sid) {
            conversationIndex = i;
          }
        }

        if (conversationIndex > -1) {
            // Set the current conversation to active.
            conversation.isMinimized = false;
            state.conversations[conversationIndex] = conversation; 
        } else {
          conversation.isMinimized = false;
          state.conversations.push(conversation);
        }
        
        console.log("action: " + action);
        console.log("state: " + state);
        // TODO: Find the index of the newly passed in conversation
        return state;
    default:
      return state
  }
}
