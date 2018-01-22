import React from "react";
import Session from "../../../middleware/Session";
import WorkMode from "../../../middleware/WorkMode";
import Lib from "../../../middleware/Lib";
import Autosuggest from "react-autosuggest";

export default class NewChatMessage extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            minimized: this.props.minimizeChat,
            conversations: this.props.conv,
            userLoggedIn: Session.getSession('prg_lg'),
            messages: this.props.messages,
            isActiveBubble: this.props.isActiveBubble,
            suggestions: [],
            suggestionsList: [],
            value: ''
        };

        this.onMinimiseClick = this.onMinimiseClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.onSuggestionsFetchRequested  = this.onSuggestionsFetchRequested .bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.isMinimized = false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            minimized:nextProps.minimizeChat,
            conversations: nextProps.conv,
            messages: nextProps.messages,
            isActiveBubble: nextProps.isActiveBubble
        });
    }

    onCloseClick(e){
        this.props.bubbleClose(this.props.conv);
    }

    onMinimiseClick(e){
        this.isMinimized = !this.state.minimized;
        this.props.onMinimize(this.isMinimized);
    }

    onHeaderClick(e) {
        let convId = "usr:" + this.state.conversations.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    // This gets called when a suggested user is selected.
    getSuggestionValue(suggestion) {
        let userid = suggestion.user_id;
        let suggestionImages = suggestion.images; // Get images from the suggestion object.
        this.props.setNewChatToList(this.props.conv, suggestion.user_id);
        return suggestion.first_name + " " + suggestion.last_name;
    }

    renderSuggestion(suggestion) {
        return (
            <div id={suggestion.user_id} className="user">{suggestion.first_name+" "+suggestion.last_name}</div>
        );
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue });
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.props.my_connections),
            suggestionsList : this.getSuggestions(value, this.props.my_connections)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    render() {

        const {
            conversations,
            value,
            suggestions
        } = this.state;

        let user = conversations.user, chatBubbleCls = "chat-bubble new ";

        const inputProps = {
            placeholder: 'to:',
            value,
            onChange: this.onChange
        };

        if(this.state.isActiveBubble){
            chatBubbleCls += " active";
        }

        if(this.props.prg_wm.messages){
            chatBubbleCls += "  wm-chat-bubble";
        }

        return (
            <div className={chatBubbleCls}>
                <div className="bubble-header clearfix" id="hdr_btn" onClick={this.onHeaderClick.bind(this)}>
                    <div className="username-holder">
                        <h3 className="name">new message</h3>
                    </div>
                    <div className="opt-icons clearfix">
                        <span className="icon close-icon"  id="cls_btn" onClick={this.onCloseClick.bind(this)}></span>
                    </div>
                </div>
                <div className="conv-holder">
                    {
                        (this.props.prg_wm.messages) ?
                            <div>
                                <div className="header-holder">
                                    <div className="icon-holder">
                                        <img src="/images/work-mode/wm-icon-chatbubble.png" />
                                    </div>
                                    <p className="wm-intro">you’re still on #workmode and blocked messages! </p>
                                </div>
                                <div className="btn-holder">
                                    <span className="btn grey"onClick={this.onCloseClick.bind(this)}>back to work</span>
                                    <span className="btn blue" onClick={()=> {WorkMode.workModeAction("unblock", "messages")}}>unblock chat</span>
                                </div>
                            </div> :
                            <div className="pick-user">
                                <div className="users-popup">

                                    <Autosuggest suggestions={suggestions}
                                                 onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                 onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                                 getSuggestionValue={this.getSuggestionValue}
                                                 renderSuggestion={this.renderSuggestion}
                                                 inputProps={inputProps} />
                                </div>
                            </div>
                    }
                </div>
            </div>
        );
    }
}