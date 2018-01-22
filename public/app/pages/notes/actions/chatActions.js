
export const LOAD_NEW_CONVERSATION = "load_new_conversation";
export const LOAD_EXISTING_CONVERSATION = "load_existing_conversation";

export function loadNewConversation(twilioConversation) {
    return (dispatch, getState) => {
        dispatch({type: LOAD_NEW_CONVERSATION, conversation: twilioConversation});
    }
}

export function loadExistingConversation(twilioConversation) {
    return (dispatch, getState) => {
        dispatch({type: LOAD_EXISTING_CONVERSATION, conversation: twilioConversation});
    }
}