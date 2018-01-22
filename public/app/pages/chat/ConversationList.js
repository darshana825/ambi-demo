import React from 'react';
import Promise from 'bluebird';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import * as actions from '../notes/actions/chatActions';
import uuid from 'node-uuid';
import moment from 'moment';
import Session from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import WorkMode  from '../../middleware/WorkMode';
import CommunicationsProvider from '../../middleware/CommunicationsProvider';
import Lib from '../../middleware/Lib';
import messageHelper from './QuickChatBubble/MessageHelper';
import axios from "axios";

class ConversationList extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            conversations : this.props.conversations,
            connections: this.props.my_connections,
            showChatNotification: this.props.showChatNotification,
            userLoggedIn: Session.getSession('prg_lg'),
            _prg_wm: WorkMode.getWorkMode(),
            twilioConversations: [],
            unreadMap: [],
            unreadChatCount: 0
        };

        this.findUserByUserName = this.findUserByUserName.bind(this);
        this.updateTwilioMemberMessageReadStatus = this.updateTwilioMemberMessageReadStatus.bind(this);
        this.updateMessageConsumedIndex = this.updateMessageConsumedIndex.bind(this);
        this.getUnreadMessageCountFromMap = this.getUnreadMessageCountFromMap.bind(this);
        this.findUserById = this.findUserById.bind(this);
        this.chatProvider = CommunicationsProvider.getChatProvider();
        this.twilioConversations = [];
        this.unreadMap = [];
        // TODO: Move this long chain of code to componentWillMount or componentDidMount
        // Initialize the Twilio client.
        this.chatProvider.initializeChatClient()
            .then((twilioClient) => {
                let twilioChannels = [];
                return twilioClient.getSubscribedChannels()
                    .then((subscribedChannels) => {
                        for (var i = 0; i < subscribedChannels.items.length; i++) {
                            // Send a message to the subscribed channel so that we have something on it.
                            let currentChannel = subscribedChannels.items[i];
                            twilioChannels.push(currentChannel);
                        }

                        return Promise.each(twilioChannels, (twilioChannel) => {
                            return twilioChannel.getMessages()
                                .then((messageResult) => {
                                    // Need to get the name of the person that we are talking to.
                                    return new Promise((resolve, reject) => {
                                        let twilioConversation = {
                                            channel: twilioChannel,
                                            messages: messageResult
                                        };
                                        var _this = this;

                                        // TODO: Move event listener out to a named function (messageAddedListener)
                                        // Listen for message added events.
                                        twilioConversation.channel.on('messageAdded', function(message) {
                                            for (let i = 0; i < _this.twilioConversations.length; i++) {
                                                let currentConversation = _this.twilioConversations[i];
                                                if (currentConversation.channel.sid === message.channel.sid) {

                                                    let myMessage = message;
                                                    let me = Session.getSession('prg_lg');

                                                    // update Unread count for the current conversation here.
                                                    if (message.author === me.id) {
                                                        // if message sent by current user, update count to the latest message index.
                                                        _this.updateMessageConsumedIndex(currentConversation);
                                                        _this.unreadMap[currentConversation.channel.sid] = 0;
                                                    } else {
                                                        // Current thread is unread, mark it in the map as a 1.
                                                        _this.unreadMap[currentConversation.channel.sid] = 1;
                                                    }

                                                    // Update state with the unread map
                                                    _this.setState({
                                                        twilioConversations: _this.twilioConversations,
                                                        unreadMap: _this.unreadMap
                                                    });

                                                    // Re calculate the number of read and unread messages.
                                                    let unreadThreadCount = _this.getUnreadMessageCountFromMap();

                                                    // update props to reflect what the conversation total should be in the conversation list.
                                                    _this.props.unreadChatCount(unreadThreadCount);
                                                }
                                            }
                                        });

                                        // TODO: Move event listener out to a named function (memberUpdatedListener)
                                        // Listen for memberUpdated events (for keeping read and unread count up to date)
                                        twilioConversation.channel.on('memberUpdated', function(member) {
                                            // TODO: Implement this function when we want to do read receipts.
                                            // TODO: Call _this.updateTwilioMemberMessageReadStatus to update the read status of messages.
                                            /*
                                            _this.updateTwilioMemberMessageReadStatus(member.identity,
                                                                                      member.lastConsumedMessageIndex,
                                                                                      member.lastConsumptionTimestamp);
                                            */
                                        });

                                        let newestMessageIndex = twilioConversation.messages.items.length -1;
                                        let lastConsumedMessageIndex = twilioConversation.channel.lastConsumedMessageIndex;

                                        // Keep a map of channel.sid to unread messages for each channel. That way we can listen to when an individual channel updates it's messages.
                                        if (newestMessageIndex !== lastConsumedMessageIndex) {
                                            _this.unreadMap[twilioConversation.channel.sid] = 1;
                                        } else {
                                            _this.unreadMap[twilioConversation.channel.sid] = 0;
                                        }

                                        // get the members of the conversation.
                                        return twilioConversation.channel.getMembers()
                                            .then((members) => {
                                                // make an http request to get names of the people in the conversation.
                                                // Also need to get the profile image URL.
                                                let memberList = [];
                                                var userNameList = [];
                                                let me = Session.getSession("prg_lg");

                                                for (let i = 0; i < members.length; i++) {
                                                    let currentMember = members[i];

                                                    if (currentMember.identity !== me.id) {
                                                        // Put user ids into array, now retrieve these usernames.
                                                        memberList.push(currentMember.identity);
                                                    }
                                                }

                                                // if user is the only one in the chat at the moment, use the friendly name of the channel to find who we are talking to.
                                                if (memberList.length === 0) {
                                                    memberList.push(twilioConversation.channel.friendlyName);
                                                }

                                                return Promise.each(memberList, (member) => {
                                                    return this.findUserById(member)
                                                        .then((user) => {
                                                            // TODO: Use an array for this so that we can properly handle group chats.
                                                            let userNameObj = {
                                                                firstName: user.data.first_name,
                                                                lastName: user.data.last_name
                                                            };

                                                            userNameList.push(userNameObj);
                                                            return userNameList;
                                                        });
                                                })
                                                .then((userNameListResult) => {
                                                    twilioConversation.userNames = userNameList;
                                                    // Set the current conversation to not active.
                                                    twilioConversation.isMinimized = true;
                                                    this.twilioConversations = this.state.twilioConversations;
                                                    this.twilioConversations.push(twilioConversation);

                                                    this.setState({
                                                        twilioConversations: this.twilioConversations,
                                                        unreadMap: this.unreadMap
                                                    });

                                                    // Re calculate the number of read and unread messages.
                                                    let unreadThreadCount = _this.getUnreadMessageCountFromMap();

                                                    // update props to reflect what the conversation total should be in the conversation list.
                                                    this.props.unreadChatCount(unreadThreadCount);

                                                    // finally, resolve the promise.
                                                    resolve();
                                                });

                                            })
                                            .catch((error) => {
                                                // TODO: Better error handling/crash reporting here.
                                                reject(error);
                                            });
                                    });
                                });
                        });
                    });
            });

        this.unreadConversationCount = [];
        this.unreadConversationTitles = [];
        this.unreadCount = 0;
        this.conv_ids = [];
        this.convUsers = [];
        this.quickChatUsers = [];
        this.notifiedUsers = [];
        this.onConversationChange = this.onConversationChange.bind(this);

        this.loadMyConnections();
        this.checkWorkMode();
    }

    updateMessageConsumedIndex(conversation) {
        // Get the most recent message from the channel
        let newestMessageIndex = conversation.messages.items.length -1;
        // update last consumed message index with Twilio's servers
        conversation.channel.updateLastConsumedMessageIndex(newestMessageIndex);
    }

    getUnreadMessageCountFromMap() {
        let totalUnread = 0;
        for (var key in this.state.unreadMap) {
            totalUnread += this.state.unreadMap[key];
        }
        return totalUnread;
    }

    // TODO: Handle updating when a user read a message here.
    updateTwilioMemberMessageReadStatus(memberIdentity, lastConsumedMessageIndex, lastConsumptionTimestamp) {
        console.log("ConversationList.UpdateTWilioMemberMessageReadStatus() identity: ", memberIdentity);
        console.log("ConversationList.UpdateTWilioMemberMessageReadStatus() lastConsumedMessageIndex: ", lastConsumedMessageIndex);
        console.log("ConversationList.UpdateTWilioMemberMessageReadStatus() lastConsumptionTimestamp: ", lastConsumptionTimestamp);
    }

    // TODO: Move to common module. This code is also used in ChatHeader.js
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

    // TODO: Move to common module. This code is also used in ChatHeader.js
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

    loadMyConnections() {
        let _this = this;
        $.ajax({ // TODO: Why is the route to get connections /connection/me/unfriend? Seems like you are trying to unfriend someone. Does not make much sense.
            url: '/connection/me/unfriend',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': _this.state.userLoggedIn.token} // TODO: Don't use _this.state, rather use Session.getSession('prg_lg'), makes it more maintainable if we want to move elsewhere.
        }).done(function (data) {
            if (data.status.code == 200) {
                _this.setState({connections: data.my_con});
                _this.chatProvider.initializeChatClient(_this.onConversationChange, null, null);
            }
        }.bind(this));
    }

    componentWillReceiveProps(nextProps) {
        this.setState({conversations: nextProps.conversations, showChatNotification: nextProps.showChatNotification});
    }

    checkWorkMode(){
        let _this = this;
        Socket.listenToWorkModeStatus(function (data) {
            _this.setState({_prg_wm: data});
        });
    }

    closeChatNotificationPopup(){
        this.setState({showChatNotification: false});
    }

    setToConnections(_list) {
        this.props.chatConversations(_list);
    }

    // TODO: This function shouldn't be used any more. Consider removing it.
    // TODO: Split into multiple, smaller functions. This function is huge and is very hard to refactor if needed.
    // Update Conversation View
    onConversationChange(c, op, b6) {
        let conv = {};
        let cons = [];

        // Conversation deleted
        if (op < 0) {
            return
        }
        var notificationId = this.notificationDomIdForConversation(c);
        var proglobe_title = b6.getNameFromIdentity(c.id);
        var proglobe_title_array = proglobe_title.split('proglobe');
        var title = proglobe_title_array[1];

        let _blockMessages = this.state._prg_wm.messages;
        let oUser = Session.getSession('prg_lg');

        // New conversation
        if (op > 0) {
            if (c.deleted) {
                return;
            }
            if(title != 'undefined' && typeof this.convUsers[title] == 'undefined'){
                for(let my_con in this.state.connections){
                    if(title === this.state.connections[my_con].user_name){
                        this.convUsers[title] = this.state.connections[my_con];
                        conv = {
                            id:notificationId.substring(1),
                            tabId:notificationId,
                            proglobeTitle:proglobe_title,
                            title:title,
                            user:this.state.connections[my_con],
                            connection_status:this.state.connections[my_con].connection_status,
                            date_up: c.updated
                        };

                        if(this.conv_ids.indexOf(c.id) == -1){
                            this.conv_ids.push(c.id);
                        }

                        //Update Conversation data
                        var stamp = Lib.getRelativeTime(c.updated);
                        var latestText = '';
                        var mId = '';
                        var lastMsg = c.getLastMessage();
                        if (lastMsg) {
                            // Show the text from the latest conversation

                            if (lastMsg.content)
                                latestText = lastMsg.content;
                            // If no text, but has an attachment, show the mime type
                            else if (lastMsg.data && lastMsg.data.type) {
                                latestText = lastMsg.data.type;
                            }
                            if(lastMsg.data && lastMsg.data.id) {
                                mId = lastMsg.data.id;
                            }
                        }

                        conv.date = stamp;
                        //conv.date_time = c.updated;
                        //conv.date_string = moment(c.updated).format("DD MMM YYYY hh:mm a");
                        //conv.date_up = new Date(c.updated);
                        conv.latestMsg = latestText;
                        conv.message_id = "msg__m" + mId;

                        cons = this.state.conversations;
                        cons.push(conv);
                        //this.setState({conversations:cons});
                        this.setToConnections(cons);

                        if (c.unread > 0 && this.unreadConversationCount.indexOf(c.id) == -1) {
                            this.unreadCount += 1;
                            this.unreadConversationCount.push(c.id);

                        }

                        if(this.unreadCount > 0){
                            //$("#unread_chat_count_header").html('<span class="total notifi-num">'+this.unreadCount+'</span>');
                            this.props.unreadChatCount(this.unreadCount);
                        } else{
                            //$("#unread_chat_count_header").html('');
                            this.props.unreadChatCount(0);
                        }

                        if(c.unread > 0 && _blockMessages && this.notifiedUsers.indexOf(c.id) == -1){

                            let _startTime = Session.getSession('prg_wm').startTimer;
                            let _lastMsgTime = c.updated;
                            //let _now = new Date().getTime();
                            //let _1minsb4 = _now - (60*1000);

                            if(_lastMsgTime > _startTime){



                                let _uri = c.uri;
                                console.log(_uri);
                                let _msg = "On work mode";

                                b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                                b6.compose(_uri).text(_msg).send(function(err) {
                                    if (err) {
                                        console.log('error', err);
                                    }
                                    else {
                                        console.log("msg sent");
                                    }
                                });

                                this.notifiedUsers.push(c.id);

                            }
                        }

                    }
                }
            }
        }
        if(op >= 0 && title != 'undefined'){
            //Update Conversation data
            var stamp = Lib.getRelativeTime(c.updated);
            var moment_data = moment(c.updated).format("DD MMM YYYY hh:mm a");
            var _updated = c.updated;
            var _date = new Date(c.updated);
            var latestText = '';
            var lastMsg = c.getLastMessage();
            if (lastMsg) {
                // Show the text from the latest conversation
                if (lastMsg.content)
                    latestText = lastMsg.content;
                // If no text, but has an attachment, show the mime type
                else if (lastMsg.data && lastMsg.data.type) {
                    latestText = lastMsg.data.type;
                }
            }
            var cur_conv = 0;
            var updated = false;

            cons = this.state.conversations;


            for(let con in cons){
                if(cons[con].title == title){
                    let _conObj = cons[con];
                    _conObj.date = stamp;
                    //_conObj.date_time = _updated;
                    //_conObj.date_string = moment_data;
                    _conObj.date_up = c.updated;
                    _conObj.latestMsg = latestText;
                    cur_conv = con;
                    updated = true;
                }
            }
            if(updated) {
                this.setState({conversations:cons});

            } else {
                if(title != 'undefined' && typeof this.convUsers[title] == 'undefined'){
                    for(let my_con in this.state.connections){
                        if(title === this.state.connections[my_con].user_name) {
                            this.convUsers[title] = this.state.connections[my_con];

                            conv = {
                                id:notificationId.substring(1),
                                tabId:notificationId,
                                proglobeTitle:proglobe_title,
                                title:title,
                                user:this.state.connections[my_con],
                                connection_status:this.state.connections[my_con].connection_status,
                                date_up: c.updated
                            };

                            //Update Conversation data
                            var mId = '';
                            if (lastMsg) {
                                if(lastMsg.data && lastMsg.data.id) {
                                    mId = lastMsg.data.id;
                                }
                            }

                            conv.date = stamp;
                            //conv.date_time = _updated;
                            //conv.date_string = moment_data;
                            //conv.date_up = _date;
                            conv.latestMsg = latestText;
                            conv.message_id = "msg__m" + mId;

                            cons = this.state.conversations;
                            cons.push(conv);
                            //this.setState({conversations:cons});
                        }
                    }
                }
            }

            this.setToConnections(cons);

            if (c.unread > 0 && this.unreadConversationCount.indexOf(c.id) == -1) {
                this.unreadCount += 1;
                this.unreadConversationCount.push(c.id);
            }

            if(this.unreadCount > 0){
                //$("#unread_chat_count_header").html('<span class="total notifi-num">'+this.unreadCount+'</span>');
                this.props.unreadChatCount(this.unreadCount);
            } else{
                //$("#unread_chat_count_header").html('');
                this.props.unreadChatCount(0);
            }
        }

    }

    // TODO: This function shouldn't be used any more. Consider removing it.
    notificationDomIdForConversation(c){
        return '#notification__' + c.domId();
    }

    // TODO: Remove this function. We're using onLoadTwilioChat instead
    onLoadQuickChat(conv, _unreads) {
        this.props.loadQuickChat(conv);
        let _blockMessages = this.state._prg_wm.messages;

        let convId = "usr:" + conv.proglobeTitle;
        let index = this.getUnreadIndex(convId);

        if(this.unreadCount > 0){

            if(index > -1) {
                //let c = this.b6.getConversation(convId);
                // TODO: Figure out a nice way to abstract this out
                let c = this.chatProvider.getConversation(convId);

                //if (this.b6.markConversationAsRead(c) > 0) {
                if (this.chatProvider.markConversationAsRead(c) > 0) {
                    this.unreadConversationCount.splice(index,1);
                    this.unreadCount--;
                    if(this.unreadCount <= 0){
                        // TODO: Remove commented out code.
                        //$("#unread_chat_count_header").html('');
                        this.props.unreadChatCount(0);
                    } else {
                        // TODO: Remove commented out code.
                        //$("#unread_chat_count_header").html('<span class="total notifi-num">' + this.unreadCount + '</span>');
                        this.props.unreadChatCount(this.unreadCount);
                    }
                }
            }
        } else {
            this.props.unreadChatCount(0);
        }
    }

    onLoadTwilioChat(conversation) {
        // TODO: Finish adding redux for managing conversations.
        // Set the current conversation as active.
        conversation.isMinimized = false;
        this.props.onLoadReduxConversation(conversation);

        // Mark thread as read
        this.unreadMap[conversation.channel.sid] = 0;
        this.setState({
            unreadMap: this.unreadMap
        });

        // Let twilio know that we are up to date on the current conversation
        this.updateMessageConsumedIndex(conversation);

        // Re calculate the number of read and unread messages.
        let unreadThreadCount = this.getUnreadMessageCountFromMap();

        // update props to reflect what the conversation total should be in the conversation list.
        this.props.unreadChatCount(unreadThreadCount);

        // Finally open the conversation up.
        this.props.loadTwilioQuickChat(conversation);
    }

    getUnreadIndex(convId) {
        let index = this.unreadConversationCount.indexOf(convId);
        return index;
    }

    openNewTwilioChat() {
        // TODO: Make sure that we are properly handling the redux store here.
        let newConversation = {
          id: "NEW_CHAT_MESSAGE"
        };

        // Put the new conversation into redux.
        this.props.onLoadNewReduxConversation(newConversation);
        this.props.loadNewTwilioQuickChat(newConversation);
    }

    render() {
        let wmClass = (this.state._prg_wm.messages) ? "chat-popover-holder wm-active" : "chat-popover-holder",
            _conversationsList = this.state.conversations;

        _conversationsList.sort(function(a, b) {
            return moment(a.date_up) < moment(b.date_up);
        });

        let _this = this;
        let _twilioConversations = this.state.twilioConversations.map(function(conversation, key) {
            let _index = _this.state.unreadMap[conversation.channel.sid];
            let channel = conversation.channel;
            let recentMessage = conversation.messages.items[conversation.messages.items.length -1];
            let messageText = "";
            if (recentMessage) {
                messageText = messageHelper.processMessageString(recentMessage.body);
            }

            let formattedDate = moment(channel.dateUpdated).format("hh:mm");
            let _defaultImg = "/images/default-profile-pic.png";

            return (
                <div className={_index > 0 ? "chat-item clearfix unread" : "chat-item clearfix"} onClick={()=> _this.onLoadTwilioChat(conversation)} key={key}>
                    <div className="prof-img">
                        <img src={_defaultImg} className="img-responsive" />
                    </div>
                    <div className="chat-preview">
                        <div className="chat-preview-header clearfix">
                            <h3 className="prof-name">{conversation.userNames[0].firstName + " " + conversation.userNames[0].lastName}</h3>
                            <p className="chat-time">@ {formattedDate}</p>
                        </div>
                        {
                            messageText.messageLink ?
                                <p className="chat-msg">{"File Upload: " + messageText.messageContent}</p>
                                :
                                <p className="chat-msg">{messageText.messageContent}</p>
                        }
                        <span className="mark-read" title="mark as read"></span>
                    </div>
                </div>
            )
        });

        // TODO: This code isn't used at the moment. Consider removing it.
        let _convs = _conversationsList.map(function(conv,key){

            let convId = "usr:" + conv.proglobeTitle;
            let _index = _this.getUnreadIndex(convId);
            let _defaultImg = "/images/default-profile-pic.png";
            let _image = conv.user.images;
            let receiver_image = _image.hasOwnProperty('profile_image') ? ( _image.profile_image.hasOwnProperty('http_url') ? _image.profile_image.http_url : _defaultImg ) : _defaultImg;

            let messageText = messageHelper.processMessageString(conv.latestMsg);

            return (
                <div className={_index > -1 ? "chat-item clearfix unread" : "chat-item clearfix"} onClick={()=>_this.onLoadQuickChat(conv, _this.unreadCount)} key={key}>
                    <div className="prof-img">
                        <img src={receiver_image} className="img-responsive" />
                    </div>
                    <div className="chat-preview">
                        <div className="chat-preview-header clearfix">
                            <h3 className="prof-name">{conv.user.first_name + " " + conv.user.last_name}</h3>
                            <p className="chat-time">@ {conv.date}</p>
                        </div>
                        {
                            messageText.messageLink ?
                                <p className="chat-msg">{"File Upload: " + messageText.messageContent}</p>
                                :
                                <p className="chat-msg">{messageText.messageContent}</p>
                        }

                        <span className="mark-read" title="mark as read"></span>
                    </div>
                </div>
            );

        });

        return (
            (this.state.showChatNotification) ?
                <section className={wmClass}>
                    <div className="inner-wrapper">
                        <div className="popover-header">
                            <div className="top-section clearfix">
                                <p className="inbox-count header-text clearfix">
                                    inbox<span className="count">({this.unreadCount})</span>
                                </p>
                                <p className="mark-all header-text">mark all as read</p>
                                <p className="new-msg header-text" onClick={this.openNewTwilioChat.bind(this)}>new message</p>
                            </div>
                            <div className="bottom-section">
                                <input type="text" className="form-control" />
                            </div>
                        </div>
                        {
                            (this.state._prg_wm.messages) ?
                                <div className="wm-container">
                                    <div className="header-holder clearfix">
                                        <div className="icon-holder pull-left">
                                            <img src="./images/work-mode/wm-chatdd-icon.png" />
                                        </div>
                                        <p className="wm-intro pull-left">you’re still on #workmode and blocked messages! </p>
                                    </div>
                                    <div className="btn-holder">
                                        <span className="btn grey" onClick={this.closeChatNotificationPopup.bind(this)}>get back to work</span>
                                        <span className="btn blue" onClick={()=> {WorkMode.workModeAction("unblock", "messages")}}>unblock chat</span>
                                        <span className="btn pink" onClick={()=> {WorkMode.workModeAction("done")}}>i’m done!</span>
                                    </div>
                                </div> :
                                <div className="chat-list-holder">
                                    <Scrollbars style={{ height: 355 }}>
                                        {_twilioConversations}
                                    </Scrollbars>
                                </div>
                        }
                        <p className="see-all">see all</p>
                    </div>
                </section>
                :
                null
        );
    }
}

function mapStateToProps(state) {
    return state;
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadReduxConversation(conversation) {
            dispatch(actions.loadExistingConversation(conversation));
    },
    onLoadNewReduxConversation(conversation) {
            dispatch(actions.loadNewConversation(conversation));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConversationList);