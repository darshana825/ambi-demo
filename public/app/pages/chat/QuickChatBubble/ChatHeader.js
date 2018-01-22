import React from "react";
import Promise from "bluebird";
import Session from "../../../middleware/Session";
import Socket from "../../../middleware/Socket";
import WorkMode from "../../../middleware/WorkMode";
import Lib from "../../../middleware/Lib";
import MessageList from "./MessageList";
import ComposeMessage from "./ComposeMessage";
import Autosuggest from 'react-autosuggest';
import Chat from "../../../middleware/Chat";
import axios from "axios";

export default class ChatHeader extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            minimized: this.props.minimizeChat,
            conversations: this.props.conv,
            userLoggedIn: Session.getSession('prg_lg'),
            messages: this.props.messages,
            isActiveBubble: this.props.isActiveBubble,
            suggestions: [],
            value: '',
            addFriendVisible: false,
            selectedUser: null,
            emojiPickerActive: false,
            isUserOnWorkMode: false,
            recipientFirstName: '', // TODO: Change to an array later to figure out how to deal with Group chats.
            recipientLastName: '',   // TODO: Change to an array later to figure out how to deal with Group chats.
            unreadMessageCount: 0
        };

        this.unreadMessageCount = 0;
        this.isMinimized = false;
        this.isAddFriendVisible = false;
        this._onWorkMode = "init";

        this.onMinimiseClick = this.onMinimiseClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
        this.onAddFriendButtonClick = this.onAddFriendButtonClick.bind(this);
        this.toggleEmojiPickerVisible = this.toggleEmojiPickerVisible.bind(this);

        this.listenToWorkModeMessage();
        this.findUserByUserName = this.findUserByUserName.bind(this);
        this.findUserById = this.findUserById.bind(this);
        this.messageAddedListener = this.messageAddedListener.bind(this);
    }

    messageAddedListener(message) {
        // Check if minimized and that message comes in from someone other than the current user.
        let me = Session.getSession("prg_lg");
        if (this.state.minimized) {
            if (message.author !== me.id) {
                this.unreadMessageCount++;
                this.setState({
                    unreadMessageCount: this.unreadMessageCount
                });
            }
        } else {
            // Update the message consumption horizon on Twilio.
            let newestMessageIndex = this.state.conversations.messages.items.length -1;
            let lastConsumedMessageIndex = this.state.conversations.channel.lastConsumedMessageIndex;
            if (newestMessageIndex !== lastConsumedMessageIndex) {
                this.state.conversations.channel.updateLastConsumedMessageIndex(newestMessageIndex);
            }

            // Reset the unread message count
            this.unreadMessageCount = 0;

            this.setState({
                unreadMessageCount: this.unreadMessageCount
            });
        }
    }

    findUserByUserName(userName) {
        let user = Session.getSession('prg_lg');
        return new Promise((resolve, reject) => {
            axios.get("/user/find?uname=" + userName, { headers: {'prg-auth-header': user.token}})
                .then((foundUser) => {
                    resolve(foundUser);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    findUserById(userid) {
        let user = Session.getSession('prg_lg');
        return new Promise((resolve, reject) => {
            axios.get("/user/find/id?userid=" + userid, { headers: {'prg-auth-header': user.token}})
                .then((foundUser) => {
                    resolve(foundUser);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    componentWillReceiveProps(nextProps) {
        let _this = this;
        this.setState({
            minimized:nextProps.minimizeChat,
            conversations: nextProps.conv,
            messages: nextProps.messages,
            isActiveBubble: nextProps.isActiveBubble}, function () {
            _this.getUserWorkMode();
        });
    }

    componentWillMount() {
        // Fetch data about the user that we are talking with.
        // Make sure that conversations is being handled appropriately.
        // For an existing conversation, we expect to see this.conversations.channel
        // For a new conversation, we just want to use this.state.conversation
        let conversation = this.state.conversations.channel;
        if (!conversation) {
            conversation = this.state.conversations;
        }

        conversation.on('messageAdded', this.messageAddedListener);

        conversation.getMembers()
            .then((members) => {
                // make an http request to get names of the people in the conversation.
                // Also need to get the profile image URL.
                let memberList = [];
                let me = Session.getSession("prg_lg");
                for (let i = 0; i < members.length; i++) {
                    let currentMember = members[i];
                    if (currentMember.identity !== me.id) {
                        // Put usernames into array, now retrieve these usernames.
                        memberList.push(currentMember.identity);
                    }
                }

                // if user is the only one in the chat at the moment, use the friendly name of the channel to find who we are talking to.
                if (memberList.length === 0) {
                    memberList.push(conversation.friendlyName);
                }

                return Promise.each(memberList, (member) => {
                    return this.findUserById(member)
                        .then((user) => {
                            // TODO: Use an array for this so that we can properly handle group chats.
                            this.setState({
                                recipientFirstName: user.data.first_name,
                                recipientLastName: user.data.last_name
                            });
                        })
                        .catch((error) => {
                            console.log("ChatHeader error going though user map: ", error);
                        });
                });
            });
    }

    onCloseClick(e){
        this.props.bubbleClose(this.props.conv);
    }

    onAddFriendClick(e) {
        this.isAddFriendVisible = !this.state.addFriendVisible;
        this.setState({
            addFriendVisible: this.isAddFriendVisible
        });
        // Stop event propagation to the minimize action.
        e.stopPropagation();
    }

    toggleEmojiPickerVisible() {
        let _emojiPickerActive = this.state.emojiPickerActive;
        this.setState({
            emojiPickerActive: !_emojiPickerActive
        });
    }

    onAddFriendButtonClick(e) {
        if (this.state.selectedUser) {
            this.props.startGroupChat(this.state.selectedUser);

            // Reset the selected user once they are added to the chat.
            this.setState({
                selectedUser: null
            });
        }
    }

    onMinimiseClick(e){
        this.toggleMinimize();
    }

    toggleMinimize() {
        this.isMinimized = !this.state.minimized;
        if (!this.isMinimized) {
            // Reset the unread message count
            this.unreadMessageCount = 0;

            // Update the message consumption horizon on Twilio.
            let newestMessageIndex = this.state.conversations.messages.items.length -1;
            let lastConsumedMessageIndex = this.state.conversations.channel.lastConsumedMessageIndex;
            if (newestMessageIndex !== lastConsumedMessageIndex) {
                this.state.conversations.channel.updateLastConsumedMessageIndex(newestMessageIndex);
            }
        }

        this.setState({
            emojiPickerActive: false, // when user opens or hides chat box, hide the emoji picker
            unreadMessageCount: 0
        });

        this.props.onMinimize(this.isMinimized);
    }

    onHeaderClick(e) {
        if (this.state.minimized) {
            let convId = "usr:" + this.state.conversations.proglobeTitle;
            this.props.setActiveBubbleId(convId);
        } else {
            this.toggleMinimize();
        }
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');

        // TODO: Going to need to filter out the current user that we are chatting with.
        const searchResult = data.filter(data => regex.test(data.first_name+" "+data.last_name));
        return searchResult;
    }

    getSuggestionValue(suggestion) {
        return suggestion;
    }

    renderSuggestion(suggestion) {
        console.log(suggestion);
        let img = suggestion.images.profile_image.http_url;

        if (typeof img == 'undefined'){
            img = "/images/default-profile-pic.png";
        }

        return (
            <a href="javascript:void(0)" onClick={()=>this.loadProfile(suggestion.user_name)}>
                <div className="suggestion" id={suggestion.user_id}>
                    <div className="img-holder">
                        <img src={img} alt={suggestion.first_name} className="img-responsive" />
                    </div>
                    <span>{suggestion.first_name+" "+suggestion.last_name}</span>
                </div>
            </a>
        );
    }

    onChange(event, { newValue, method }) {
        this.setState({
            value: newValue
        });
    };

    onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, selectionIndex, method }) {
        console.log("SelectedSuggestion: " + JSON.stringify(suggestion));

        this.setState({
            value: suggestion.first_name + " " + suggestion.last_name,
            selectedUser: suggestion
        });
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.props.my_connections),
            suggestionsList : this.getSuggestions(value, this.props.my_connections)
        });
    }

    getUserWorkMode(){
        let _this = this, user = this.state.conversations.user;
        if(typeof user != "undefined" && user != null){
            $.ajax({
                url: '/work-mode/get',
                method: "GET",
                dataType: "JSON",
                headers: {'prg-auth-header': _this.state.userLoggedIn.token},
                data: {_user_id: user.user_id}
            }).done(function (data) {
                if (data.status.code == 200) {
                    let userWMdata = data.work_mode;
                    if(typeof userWMdata != "undefined" && userWMdata != null){
                        _this.setState({isUserOnWorkMode: userWMdata.messages});
                        _this._onWorkMode = userWMdata.messages;
                    }else {
                        _this.setState({isUserOnWorkMode: false});
                    }
                }
            }.bind(this));
        }
    }

    listenToWorkModeMessage(){
        let _this = this, user = this.state.conversations.user;
        Socket.listenToWorkModeMessage(function (data) {
            if(data.user_name == user.user_name){
                _this.setState({isUserOnWorkMode: data.messages});
            }
        });
    }

    onUrgentChat(){
        this._onWorkMode = "urgent";
        this.setState({isUserOnWorkMode: false});
    }

    render() {
        const {
            conversations,
            minimized,
            userLoggedIn,
            messages,
            suggestions,
            value,
            addFriendVisible,
            recipientFirstName,
            recipientLastName,
            isUserOnWorkMode
        } = this.state;

        const inputProps = {
            placeholder: '+ Add a user to chat.',
            value,
            onChange: this.onChange
        };

        // TODO: We need a way of getting who we are talking to from the Twilio channel.
        // Currently, the conversation object looks like:
        //var channel = {channel: TwilioChannel, messages: TwilioMessages[]};
        // we should be able to do something with conversations.channel.members;
        let user = conversations.user,
            chatBubbleCls = "chat-bubble";

        if(this.state.isActiveBubble){
            chatBubbleCls += " active";
        }

        if(this.props.prg_wm.messages){
            chatBubbleCls += "  wm-chat-bubble";
        }

        if(isUserOnWorkMode){
            chatBubbleCls += "  wm-chat-bubble";
        }

        // TODO: Remove console.log statements.
        console.log("Conversations: " + JSON.stringify(conversations));
        console.log("User: " + JSON.stringify(user));

        const renderInputComponent = inputProps => (
            <div className="inputContainer">
                <span>
                    <input {...inputProps} />
                    <button className="add-friend-autosuggest-button" onClick={this.onAddFriendButtonClick.bind(this)}>Add</button>
                </span>
            </div>
        );

        // TODO: Figure out somethng here with the profile image.
        let default_img = "/images/default-profile-pic.png";
        let firstName = this.state.recipientFirstName;
        let lastName = this.state.recipientLastName;
        let unreadCount = this.state.unreadMessageCount > 0 ? " (" + this.state.unreadMessageCount + ")" : "";
        return (
            (minimized)?
                <div className="chat-bubble minimized" onClick={this.onMinimiseClick.bind(this)}>
                    <div className="bubble-header clearfix">
                        <div className="pro-pic">
                            <img src={default_img} alt={firstName + " " + lastName} onClick={this.props.onLoadProfile} className="img-responsive" />
                        </div>
                        <div className="username-holder"  onClick={this.onMinimiseClick.bind(this)}>
                            <h3 className="name" onClick={this.onMinimiseClick.bind(this)}>{firstName + " " + lastName + unreadCount}</h3>
                            {
                                (typeof conversations.connection_status != 'undefined' && conversations.connection_status == 'CONNECTION_UNFRIEND') ?
                                    <span className="all-media-btn">( Not a Friend )</span>
                                    :
                                    <span className="all-media-btn">all media</span>
                            }
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon close-icon" onClick={this.onCloseClick.bind(this)}></span>
                        </div>
                    </div>
                </div>
                :
                <div className={chatBubbleCls}>
                    <div className="bubble-header clearfix" id="hdr_btn" onClick={this.onHeaderClick.bind(this)}>
                        <div className="pro-pic">
                            <img src={default_img} alt={firstName + " " + lastName} onClick={this.props.onLoadProfile} className="img-responsive" />
                        </div>
                        <div className="username-holder">
                            <h3 className="name">{firstName + " " + lastName}</h3>
                            {
                                (typeof conversations.connection_status != 'undefined' && conversations.connection_status == 'CONNECTION_UNFRIEND') ?
                                    <span className="all-media-btn">( Not a Friend )</span>
                                    :
                                    <span className="all-media-btn">all media</span>
                            }
                        </div>
                        <div className="opt-icons clearfix">
                            {/*
                                <span className="icon addfriend-icon" id="addfriend_btn" onClick={this.onAddFriendClick.bind(this)}></span>
                                <span className="icon phn-icon"  id="aud_btn" onClick={this.props.doAudioCall}></span>
                                <span className="icon video-icon"  id="vid_btn" onClick={this.props.doVideoCall}></span>
                            */}
                            <span className="icon close-icon"  id="cls_btn" onClick={this.onCloseClick.bind(this)}></span>
                        </div>
                    </div>

                    { addFriendVisible ?
                        <div className="add-friend-autosuggest-holder clearfix">
                            <span>
                                <Autosuggest
                                    suggestions={suggestions}
                                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                    getSuggestionValue={this.getSuggestionValue}
                                    onSuggestionSelected={this.onSuggestionSelected}
                                    renderSuggestion={this.renderSuggestion}
                                    renderInputComponent={renderInputComponent}
                                    inputProps={inputProps}
                                />
                            </span>
                        </div>
                        :
                        null
                    }

                    {
                        (this.props.prg_wm.messages) ?
                            <div className="conv-holder">
                                <div className="header-holder">
                                    <div className="icon-holder">
                                        <img src="/images/work-mode/wm-icon-chatbubble.png" />
                                    </div>
                                    <p className="wm-intro">you’re still on #workmode and blocked messages! </p>
                                </div>
                                <div className="btn-holder">
                                    <span className="btn grey" onClick={this.onCloseClick.bind(this)}>back to work</span>
                                    <span className="btn blue" onClick={()=> {WorkMode.workModeAction("unblock", "messages")}}>unblock chat</span>
                                </div>
                            </div> : (isUserOnWorkMode && (this._onWorkMode != "urgent")) ?
                            <div className="conv-holder">
                                <div className="header-holder">
                                    <div className="icon-holder">
                                        <img src="/images/work-mode/wm-icon-chatbubble.png" />
                                    </div>
                                    <p className="wm-intro">{user.first_name} is currently on #workmode! she will receive your message afterwards</p>
                                </div>
                                <div className="btn-holder">
                                    <span className="btn pink" onClick={this.onUrgentChat.bind(this)}>it’s urgent</span>
                                    <span className="btn blue" onClick={this.onCloseClick.bind(this)}>sounds good</span>
                                </div>
                            </div> :
                            <MessageList
                                conv={conversations}
                                loggedUser = {userLoggedIn}
                                messages = {messages}
                                minimizeChat = {minimized}
                                setActiveBubbleId= {this.props.setActiveBubbleId}
                                someoneTyping={this.props.someoneTyping}
                                emojiPickerActive={this.state.emojiPickerActive}
                            />
                    }

                    <ComposeMessage
                        sendChat={this.props.sendChat}
                        conv={conversations}
                        minimizeChat = {minimized}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                        toggleEmojiPickerVisible={this.toggleEmojiPickerVisible.bind(this)}
                        prg_wm_msg={this.props.prg_wm.messages}
                        isUserOnWorkMode={isUserOnWorkMode && (this._onWorkMode == "init")}
                    />
                </div>
        );
    }
}
