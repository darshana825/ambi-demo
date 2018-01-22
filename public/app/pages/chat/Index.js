// TODO: Remove comment. We know this is chat index component.
/**
 * This is chat index component
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import Session from '../../middleware/Session';
import Chat from '../../middleware/Chat';
import CallCenter from '../../middleware/CallCenter';
import {Alert} from '../../config/Alert';
import Lib from '../../middleware/Lib';
import Autosuggest from 'react-autosuggest';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "block"
};

let unfriendStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : "0 15px"
};

export default class Index extends React.Component{
    constructor(props) {
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        //bit6 will work on https
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }
        if (window.location.protocol == 'http:' ) {
            var url_arr = window.location.href.split('http');
            window.location.href = 'https'+url_arr[1];
        }

        this.state= {
            chatWith:this.getUrl(),
            userLoggedIn : Session.getSession('prg_lg'),
            my_connections:[],
            chatWithUserName:"",
            unreadConversations:[],
            conversations:[],
            messages:[],
            searchKey:'',
            myAllMessages:[],
            uri:'usr:proglobe'+this.getUrl()
        };

        this.b6 = CallCenter.b6;
        this.convUsers = [];
        this.conversations = [];
        this.unreadConversations = [];
        this.msgDivIds = [];
        this.messages = [];
        this.allChatList = [];
        this.checkChatWith = this.getUrl();
        this.initChat(this.b6);
        this.loadChat(this.state.chatWith);
        this.loadMyConnections();
    };

    initChat(b6){
        let _this = this;

        // A conversation has changed
        b6.on('conversation', function(c, op) {
            _this.onConversationChange(c, op, b6);
        });

        // A message has changed
        b6.on('message', function(m, op) {
            _this.onMessageChange(m, op, b6);
        });
    }

    // Convert element id to a Conversation id
    domIdToConversationId(id) {
        let r = id.split('__');
        id = r.length > 0 ? r[1] : id
        return bit6.Conversation.fromDomId(id);
    }

    // Get Chat Tab jQuery selector for a Conversation
    tabDomIdForConversation(c) {
        return '#tab__' + c.domId();
    }

    // Get jQuery selector for a Message
    domIdForMessage(m) {
        return '#msg__' + m.domId();
    };

    // Get Messages Container jQuery selector for a Conversation
    msgsDomIdForConversation(c) {
        return '#msgs__' + c.domId();
    }

    onConversationChange(c,op,b6){

        let conv = {};

        let tabId = this.tabDomIdForConversation(c);
        let msgsId = this.msgsDomIdForConversation(c);

        // Conversation deleted
        if (op < 0) {
            return
        }

        let proglobe_title = b6.getNameFromIdentity(c.id);
        let proglobe_title_array = proglobe_title.split('proglobe');
        let title = proglobe_title_array[1];

        // New conversation
        if (op > 0) {

            if (c.deleted) {
                return;
            }

            if(title != 'undefined' && title != 'new'){

                if(typeof this.convUsers[title] == 'undefined'){
                    for(let my_con in this.state.my_connections){
                        if(title === this.state.my_connections[my_con].user_name){
                            this.convUsers[title] = this.state.my_connections[my_con];
                            conv = {
                                id:tabId.substring(1),
                                tabId:tabId,
                                proglobeTitle:proglobe_title,
                                title:title,
                                user:this.state.my_connections[my_con],
                                connection_status: this.state.my_connections[my_con].connection_status
                            };

                            //Update Conversation data
                            let stamp = Lib.getRelativeTime(c.updated);
                            let latestText = '';
                            let lastMsg = c.getLastMessage();
                            if (lastMsg) {
                                // Show the text from the latest conversation
                                if (lastMsg.content)
                                    latestText = lastMsg.content;
                                // If no text, but has an attachment, show the mime type
                                else if (lastMsg.data && lastMsg.data.type) {
                                    latestText = lastMsg.data.type;
                                }
                            }

                            conv.date = stamp;
                            conv.latestMsg = latestText;

                            if (c.unread > 0 && this.unreadConversations.indexOf(c.id) == -1) {
                                this.unreadConversations.push(c.id);
                            }

                            if(this.conversations.length > 0){
                                let first_conv = this.conversations[0];
                                let first_id = first_conv.id;
                                let first_conv_id = this.domIdToConversationId(first_id);
                                let first_conversation = b6.getConversation(first_conv_id);

                                if (first_conversation && first_conversation.id != c.id && c.updated > first_conversation.updated) {
                                    this.conversations.splice(0,0,conv);
                                    if(typeof this.checkChatWith == 'undefined'){
                                        this.setState({chatWith : conv.title});
                                        this.setState({chatWithUserName:conv.user.first_name+" "+conv.user.last_name});
                                        this.setState({uri : 'usr:proglobe'+conv.title});
                                        window.history.pushState('Chat','Chat','/chat/'+conv.title);
                                    }
                                } else{
                                    this.conversations.push(conv);
                                }
                            } else{
                                this.conversations.push(conv);
                                if(typeof this.checkChatWith == 'undefined'){
                                    this.setState({chatWith : conv.title});
                                    this.setState({chatWithUserName:conv.user.first_name+" "+conv.user.last_name});
                                    this.setState({uri : 'usr:proglobe'+conv.title});
                                    window.history.pushState('Chat','Chat','/chat/'+conv.title);
                                }
                            }

                            let message = {};
                            message = {
                                id:msgsId,
                                title:title,
                                messages:[]
                            };

                            let myChats = {};
                            myChats = {
                                chat_id:msgsId,
                                chat_user:title,
                                chat_list:[]
                            };

                            this.allChatList.push(myChats);

                            this.messages.push(message);
                            this.setState({messages:this.messages, myAllMessages:this.allChatList});
                        }
                    }
                }

            }
        }

        if(op >= 0 && title != 'undefined' && title != 'new'){

            // Update Conversation data
            let stamp = Lib.getRelativeTime(c.updated);
            let latestText = '';
            let lastMsg = c.getLastMessage();
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

            for(let con in this.conversations){
                if(this.conversations[con].title == title){
                    this.conversations[con].date = stamp;
                    this.conversations[con].latestMsg = latestText;
                    cur_conv = con;
                }
            }

            if (c.unread > 0 && this.unreadConversations.indexOf(c.id) == -1) {
                this.unreadConversations.push(c.id);
            }

            if(this.conversations.length > 0 && cur_conv !=  0){
                let first_conv = this.conversations[0];
                let first_id = first_conv.id;
                let first_conv_id = this.domIdToConversationId(first_id);
                let first_conversation = b6.getConversation(first_conv_id);

                let current_conv = this.conversations[cur_conv];
                let current_conv_id = current_conv.id;
                let current_conversation_id = this.domIdToConversationId(current_conv_id);
                let current_conversation = b6.getConversation(current_conversation_id);

                if (first_conversation && first_conversation.id != current_conversation.id && current_conversation.updated > first_conversation.updated) {
                    this.conversations.splice(cur_conv,1);
                    this.conversations.splice(0,0,current_conv);
                    if(typeof this.checkChatWith == 'undefined'){
                        this.setState({chatWith : current_conv.title});
                        this.setState({chatWithUserName:current_conv.user.first_name+" "+current_conv.user.last_name});
                        this.setState({uri : 'usr:proglobe'+current_conv.title});
                        window.history.pushState('Chat','Chat','/chat/'+current_conv.title);
                    }
                }
            }

            if(typeof this.checkChatWith != 'undefined' && this.checkChatWith != 'new' && "usr:"+proglobe_title == this.state.uri){

                //var conversation = b6.getConversation(this.state.uri);

                if (b6.markConversationAsRead(c) > 0) {
                    // Some messages have been marked as read
                    // update chat list
                    if(this.unreadConversations.indexOf(c.id) != -1){
                        this.unreadConversations.splice(this.unreadConversations.indexOf(c.id),1);
                    }
                }

            }
        }

        this.setState({conversations:this.conversations});
        this.setState({unreadConversations:this.unreadConversations});

    }

    onMessageChange(m, op, b6){

        if(op < 0 || Object.keys(m).length > 7){
            return;
        }
        let convId = m.getConversationId();
        let c = b6.getConversation(convId);
        let msgsId = this.msgsDomIdForConversation(c);
        let divId = this.domIdForMessage(m);
        if(this.msgDivIds.indexOf(divId) == -1){
            this.msgDivIds.push(divId);
            let cssClass = m.incoming() ? 'receiver' : 'sender';

            if(typeof this.checkChatWith != 'undefined' && this.checkChatWith != 'new'){
                if (convId == this.state.uri) {
                    // Mark this new message as read since it is on the screen
                    if (m.incoming()) {
                        b6.markMessageAsRead(m);
                    }
                }
            }

            // Message content to show
            let text = m.content;

            // This is a call history item
            if (m.isCall()) {
                let ch = m.channel();
                let r = [];
                if (ch & bit6.Message.AUDIO) {
                    r.push('Audio');
                }
                if (ch & bit6.Message.VIDEO) {
                    r.push('Video');
                }
                if (ch & bit6.Message.DATA) {
                    if (r.length === 0) {
                        r.push('Data');
                    }
                }
                text = r.join(' + ') + ' Call';
                if (m.data && m.data.duration) {
                    let dur = m.data.duration;
                    let mins = Math.floor(dur / 60);
                    let secs = dur % 60;
                    text += ' - ' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
                }
            }

            let my_name = '';
            let my_prof_img = '/images/default-profile-pic.png';
            let other_name = '';
            let other_prof_img = '/images/default-profile-pic.png';

            if (this.state.userLoggedIn != null) {
                my_name = this.state.userLoggedIn['first_name'] + " " + this.state.userLoggedIn['last_name'];
                if (this.state.userLoggedIn['profile_image'] != null) {
                    my_prof_img = this.state.userLoggedIn['profile_image'];
                }
            }

            let other_array = m.other.split('proglobe');
            let other = other_array[1];

            if (this.convUsers != null && this.convUsers[other] != null) {
                other_name = this.convUsers[other]['first_name'] + ' ' + this.convUsers[other]['last_name'];
                if (this.convUsers[other]['images'] != null && this.convUsers[other]['images']['profile_image'] != null) {
                    other_prof_img = this.convUsers[other]['images']['profile_image']['http_url']
                }
            }

            var display_name = m.incoming() ? other_name : my_name;
            var display_prof_img = m.incoming() ? other_prof_img : my_prof_img;

            let msg = {
                id:divId.substring(1),
                cssClass:cssClass,
                text:text,
                display_name:display_name,
                display_prof_img:display_prof_img,
                searchFilterApplied:false,
                highlightText:text
            };

            for(let con in this.messages){
                if(this.messages[con].id == msgsId){
                    this.messages[con].messages.push(msg);
                }
            }

            for(let _con in this.allChatList){
                if(this.allChatList[_con].chat_id == msgsId){

                    var obj = this.allChatList[_con].chat_list.filter(function ( obj ) {
                        return obj.id === msg.id;
                    })[0];
                    if(!obj) {
                        this.allChatList[_con].chat_list.push(msg);
                    }

                }
            }
            this.setState({messages:this.messages});
        }
    }

    loadMyConnections(){
        $.ajax({
            url: '/connection/me/unfriend',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.userLoggedIn.token }
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({my_connections:data.my_con});
            }
        }.bind(this));
    }

    loadChat(chatWith){
        if(chatWith != 'undefined' && chatWith != 'new'){
            this.checkChatWith = chatWith;
            $.ajax({
                url: '/get-profile/' + chatWith,
                method: "GET",
                dataType: "JSON"
            }).done(function(data){
                if (data.status.code == 200 && data.profile_data != null) {
                    this.setState({chatWithUserName:data.profile_data.first_name+" "+data.profile_data.last_name});
                    this.makeConversationRead(this.state.uri);
                }
            }.bind(this));
        }
    }

    loadRoute(url){
        this.setState({chatWith : url, chatWithUserName : "", searchKey : ""});
        if(url !== 'new'){
            this.setState({uri:'usr:proglobe'+url});
            this.loadChat(url);
        }
        window.history.pushState('Chat','Chat','/chat/'+url);
    }

    selectChange(e){
        this.loadRoute(e);
        //if(e.target.value.length != 0 ){
        //
        //}else{
        //    console.log("no user selected")
        //}
    }

    getUrl(){
        return  this.props.params.chatWith;
    }

    sendChat(msg){

        this.checkChatWith = this.state.chatWith;
        this.makeConversationRead(this.state.uri);
        let user = Session.getSession('prg_lg');
        this.b6.session.displayName = user.first_name + " " + user.last_name;
        this.b6.compose(this.state.uri).text(msg).send(function(err) {
            if (err) {
                console.log('error', err);
            }
            else {
                console.log("msg sent");
            }
        });

    }

    doVideoCall(){

        let _this = this;

        if(typeof _this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"make audio call"});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            this.checkChatWith = this.getUrl();
            this.makeConversationRead(this.state.uri);
            Chat.startOutgoingCall(this.state.uri, true);
        }

    }

    doAudioCall(){

        let _this = this;

        if(typeof _this.state.chatWith == 'undefined' || this.state.chatWith == 'new'){
            _this.setState({validateAlert: Alert.EMPTY_RECEIVER+"make video call"});
            return 0;
        } else{
            _this.setState({validateAlert: ""});
            this.checkChatWith = this.getUrl();
            this.makeConversationRead(this.state.uri);
            Chat.startOutgoingCall(this.state.uri, false);
        }

    }

    makeConversationRead(uri){
        var conv = this.b6.getConversation(uri);

        if (conv != null && this.b6.markConversationAsRead(conv) > 0) {
            // Some messages have been marked as read
            // update chat list
            if(this.unreadConversations.indexOf(conv.id) != -1){
                this.unreadConversations.splice(this.unreadConversations.indexOf(conv.id), 1);
                this.setState({unreadConversations:this.unreadConversations});
            }
            Chat.updateHeaderUnreadCount(conv.id);
        }
    }

    doMessageSearch(key) {
        this.setState({searchKey:key});
    }

    clearMessageSearch() {
        let clearKey = this.state.chatWith + "-clear";
        this.setState({searchKey:clearKey, messages:this.messages});

    }

    render() {

        const {
            chatWith,
            userLoggedIn,
            my_connections,
            chatWithUserName,
            conversations,
            unreadConversations,
            messages,
            searchKey,
            myAllMessages
            }=this.state;

        return (
            <div className="pg-middle-chat-screen-area container">
                <div className="pg-middle-chat-content-header pg-chat-screen-header">
                    <div className="container">
                        <h2>Message and video calls</h2>
                    </div>
                </div>
                <div className="chat-window container">
                    <div className="header clearfix">
                        <LeftMenu unreadConversations = {unreadConversations}/>
                        <RightMenu
                            loadRoute ={this.loadRoute.bind(this)}
                            doChatSearch ={this.doMessageSearch.bind(this)}
                            doClearSearch ={this.clearMessageSearch.bind(this)}
                            chatWith = {chatWith}
                            chatWithUserName = {chatWithUserName}
                            my_connections = {my_connections}
                            selectChange = {this.selectChange.bind(this)}
                            doAudioCall = {this.doAudioCall.bind(this)}
                            doVideoCall = {this.doVideoCall.bind(this)}
                            />
                    </div>
                    <div className="chat-body">
                        <ChatList conversations = {conversations} chatWith = {chatWith} loadRoute ={this.loadRoute.bind(this)} />
                        <div className="chat-msg-holder col-sm-8">
                            <MessageList
                                loggedUser = {userLoggedIn}
                                chatWith = {chatWith}
                                searchKey = {searchKey}
                                sendChat = {this.sendChat.bind(this)}
                                messages = {messages}
                                all_chats = {myAllMessages}
                                />
                            <ComposeMessage loggedUser = {userLoggedIn}
                                            chatWith = {chatWith}
                                            sendChat = {this.sendChat.bind(this)}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// TODO: Move into separate file. Only one class per file please.
export class LeftMenu extends React.Component{
    constructor(props){
        super(props)
        this.state ={
        };
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        return (
            <div className="chat-inbox-options col-sm-4">
                <div className="inbox">
                    <p id="unread_inbox_p">inbox

                        {this.props.unreadConversations.length > 0 ? <span className="total">{this.props.unreadConversations.length}</span> : null}
                    </p>
                </div>
                <div className="otherMsg">
                    <p>Other</p>
                </div>
                <div className="more">
                    <p>more...</p>
                </div>
            </div>
        )
    }
}

// TODO: Move into separate file. Only one class per file please.
export class RightMenu extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            value: '',
            suggestions: this.getSuggestions(''),
            searchTerm: "",
            showSearchTerm: false
        };
        this.loggedUser = this.props.loggedUser;
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
    }


    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    getSuggestionValue(suggestion) {
        this.props.selectChange(suggestion.user_name)
        return suggestion.first_name+" "+suggestion.last_name;
    }

    renderSuggestion(suggestion) {
        return (
            <span id={suggestion.user_id}>{suggestion.first_name+" "+suggestion.last_name}</span>
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

    elementChangeHandler(event){
        this.setState({searchTerm: event.target.value});
        if(event.target.value == "" && this.state.showSearchTerm === true){
            this.props.doClearSearch();
            this.setState({showSearchTerm : false});
        }
    }

    onTermSearch(){
        if(this.state.searchTerm != ""){
            this.setState({showSearchTerm : true});
            this.props.doChatSearch(this.state.searchTerm);
        }
    }

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: 'To',
            value,
            onChange: this.onChange
        };
        let searchFieldClass = (this.props.chatWith !== 'new')? "hasSearch" : "";
        return (
            <div className="col-sm-8 chat-person-options clearfix">
                <div className="connection-name">
                    <p id="chat_with">{this.props.chatWithUserName}</p>
                </div>
                {
                    (this.props.chatWith == 'new')?

                            <Autosuggest suggestions={suggestions}
                                         onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                         onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                         getSuggestionValue={this.getSuggestionValue}
                                         renderSuggestion={this.renderSuggestion}
                                         inputProps={inputProps} />
                         : null
                }
                <div className="media-options-holder">
                    <div className={"media-options " + searchFieldClass}>
                        {
                            (this.props.chatWith !== 'new')?
                            <span className="opt new-message">
                                <a href='#' onClick={()=>this.props.loadRoute('new')}>New Message</a>
                            </span> : null
                        }
                        {
                            (this.props.chatWith !== 'new')?
                            <div className="msg-search-holder form-group">
                                <input type="text" className="form-control" name="searchTerm" placeholder="Search Term.." value={this.state.searchTerm} onChange={(event)=>{this.elementChangeHandler(event)}} />
                                <i className="fa fa-search" aria-hidden="true" onClick={this.onTermSearch.bind(this)}></i>
                            </div> : null
                        }
                        <span className="opt chat-icon">
                            <i className="fa"></i>
                        </span>
                        <span className="opt video-icon" onClick={this.props.doVideoCall}>
                            <i className="fa fa-video-camera"></i>
                        </span>
                        <span className="opt call-icon" onClick={this.props.doAudioCall}>
                            <i className="fa fa-phone"></i>
                        </span>
                    </div>
                    <div className="all-media btn btn-default">
                        <span className="btn-text">All Media</span>
                        <i className="fa fa-caret-down"></i>
                    </div>
                </div>
                {
                    (this.state.showSearchTerm)?
                        <div className="searching-notifi">
                            <p className="alert-text">{'Searching the conversation for "' + this.state.searchTerm + '"'}</p>
                        </div>
                    :
                        null

                }
            </div>
        )
    }
}

// TODO: Move into separate file. Only one class per file please.
export class ChatList extends React.Component{
    constructor(props){
        super(props);
        this.state ={};
        this.loggedUser = this.props.loggedUser;
    }
    render() {
        let _this = this;
        let convs = this.props.conversations.map(function(conv,key){
            let _classNames = "tab msg-holder ";
            if(_this.props.chatWith == conv.title){
                _classNames += "msg-holder-selected";
            }

            return (
                <div className={_classNames} key={key}>
                    <a href="javascript:void(0)" onClick={()=>_this.props.loadRoute(conv.title)}>
                        <div className="chat-pro-img">
                            <img src={conv.user.images.profile_image.http_url}/>
                        </div>
                        <div className="chat-body">
                            <span className="connection-name">{conv.user.first_name + " " + conv.user.last_name}
                                {typeof conv.connection_status != 'undefined' && conv.connection_status == 'CONNECTION_UNFRIEND' ? <span className="form-validation-alert" style={unfriendStyles}>( Not a Friend )</span> : null}
                            </span>

                            <p className="msg">{conv.latestMsg}</p>
                            <span className="chat-date">{conv.date}</span>
                        </div>
                    </a>
                </div>
            );
        });

        return (
            <div className="conv-holder col-sm-4">
                <Scrollbars autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                    <div id="chatList">
                        {convs}
                    </div>
                </Scrollbars>
            </div>
        )
    }
}

// TODO: Move into separate file. Only one class per file please.
export class MessageList extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            messageList:[],
            myAllMsgList:[]
        };
        this.loggedUser = this.props.loggedUser;
        this.onLoadProfile = this.onLoadProfile.bind(this);

        this.chatMessages = [];
    }

    componentWillMount() {
        this.setState({messageList:this.props.messages, myAllMsgList:this.props.messages});
    }

    componentWillReceiveProps(nextProps) {

        let chatwithIndex = -1;
        let searchMessageList = [];
        this.chatMessages = [];

        if(nextProps.searchKey != '' && nextProps.searchKey) {

            var searchKeyValue = nextProps.searchKey;

            for(let conv in nextProps.messages) {

                searchMessageList = [];
                this.chatMessages.push(nextProps.messages[conv]);
                var clearKey = nextProps.messages[conv].title + "-clear";

                if(nextProps.messages[conv].title == this.props.chatWith && searchKeyValue != clearKey) {

                    let messageList = nextProps.messages[conv].messages;
                    chatwithIndex = conv;

                    for(let msg in messageList) {
                        var result2 = messageList[msg].text.toLowerCase().indexOf(searchKeyValue.toLowerCase());

                        if(typeof result2 != 'undefined' && result2 >= 0){
                            var sub1="", sub2="", sub3="", myMsg=messageList[msg].text, part1=Number(result2) + Number(searchKeyValue.length), highlightedMessage="";

                            if(result2 == 0) {

                                if(searchKeyValue.length < myMsg.length) {
                                    sub1 = "<span class='highlighted'>" + myMsg.toString().substr(0, searchKeyValue.length) + "</span>";
                                    sub2 = myMsg.toString().substr(searchKeyValue.length, myMsg.length);
                                    highlightedMessage = sub1 + sub2;
                                } else {
                                    sub1 = "<span class='highlighted'>" + searchKeyValue + "</span>";
                                    highlightedMessage = sub1;
                                }

                            } else if(result2 > 0) {

                                if(part1 < myMsg.length) {
                                    sub1 = myMsg.toString().substr(0, Number(result2));
                                    sub2 = "<span class='highlighted'>" + myMsg.toString().substr(Number(result2), searchKeyValue.length) + "</span>";
                                    sub3 = myMsg.toString().substr(part1);
                                    highlightedMessage = sub1 + sub2 + sub3;
                                } else {
                                    sub1 = myMsg.toString().substr(0, Number(result2));
                                    sub2 = "<span class='highlighted'>" + myMsg.toString().substr(Number(result2), myMsg.length) + "</span>";
                                    highlightedMessage = sub1 + sub2;
                                }

                            } else {
                                highlightedMessage = msg;
                            }

                            messageList[msg].highlightText = highlightedMessage;
                            messageList[msg].searchFilterApplied = true;
                            searchMessageList.push(messageList[msg]);
                        }
                    }
                    this.chatMessages[conv].messages = searchMessageList;

                } else if(nextProps.messages[conv].title == this.props.chatWith && nextProps.searchKey == clearKey) {

                    for(let _conv in nextProps.all_chats) {
                        if(nextProps.all_chats[_conv].chat_user == nextProps.messages[conv].title) {
                            let chats = nextProps.all_chats[_conv].chat_list;
                            for(let mesgs in chats) {
                                let messageObj = chats[mesgs];
                                messageObj.highlightText = messageObj.text;
                                messageObj.searchFilterApplied = false;
                                searchMessageList.push(messageObj);
                            }
                        }
                    }

                    this.chatMessages[conv].messages = searchMessageList;
                }
            }
            this.setState({messageList:this.chatMessages});

        } else {
            /*
            No search key means just the chat only
             */
            this.setState({messageList:nextProps.messages});
        }

    }


    onLoadProfile(){
        console.log('loaing...');
        window.location.href = '/profile/'+this.props.chatWith;
    }

    render() {

        if(Object.keys(this.refs).length > 0){

            for(var key in this.refs){
                if(key == "msgScrollBar"){
                    const scrollbars = this.refs[key];
                    const scrollHeight = scrollbars.getScrollHeight();
                    scrollbars.scrollTop(scrollHeight);
                }
            }
        }

        let _this = this;
        let convs = _this.state.messageList.map(function(conv,key){
            let style = {display:"none"};
            if(conv.title == _this.props.chatWith){
                style = {display:"block"};
            }



            let msgs = conv.messages.map(function(msg,key){
                let cssClass = 'chat-block '+msg.cssClass;
                return (
                    <div className={cssClass} key={key}>
                        <img src={msg.display_prof_img} alt="" width="40px" height="40px" onClick={_this.onLoadProfile}/>
                        <div className="chat-msg-body"><span className="user-name" onClick={_this.onLoadProfile}>{msg.display_name}</span>{
                            msg.searchFilterApplied ?
                                <p className="chat-msg" dangerouslySetInnerHTML={{__html: msg.highlightText}} />
                                :
                                <p className="chat-msg">{msg.text}</p>
                        }</div>
                    </div>
                );
            });

            return (
                <div className="msgs" key={key} style={style}>
                    {msgs}
                </div>
            );
        });

        return (
            <div className="chat-view">
                <Scrollbars ref="msgScrollBar" autoHide={true} autoHideTimeout={1000} autoHideDuration={200}>
                    <div id="msgListRow">
                        <div className="col-xs-12">
                            <div id="msgList">
                                {convs}
                            </div>
                        </div>
                    </div>
                </Scrollbars>
            </div>
        )
    }
}

// TODO: Move into separate file. Only one class per file please.
export class ComposeMessage extends React.Component{
    constructor(props) {
        super(props);
        this.loggedUser = this.props.loggedUser;
        this.state = {
            validateAlert: "",
            formData: {}
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
    }

    elementChangeHandler(event){

        this.state.formData['msg'] = event.target.value;

        let _error = "";
        if(this.state.formData['msg'] == ""){
            _error = Alert.EMPTY_MESSAGE;
        }
        this.setState({validateAlert:_error})

    }

    sendMessage(e){
        e.preventDefault();
        let _this = this;
        if(typeof this.props.chatWith == 'undefined' || this.props.chatWith == 'new'){
            this.setState({validateAlert: Alert.EMPTY_RECEIVER+"send message"});
            return 0;
        } else if(!this.state.formData['msg'] || this.state.formData['msg'] == "") {
            this.setState({validateAlert: Alert.EMPTY_MESSAGE});
        } else{
            let msg = this.state.formData.msg;
            this.setState({formData: {}});
            this.setState({validateAlert: ""});
            this.props.sendChat(msg);
        }
    }

    onEnter(e){
        if (e.keyCode == 13) {
            this.sendMessage(e);
        }
    }

    render(){
        return(
            <form onSubmit={this.sendMessage.bind(this)} id="chatMsg">
                <div className="chat-msg-input-holder">
                    {
                        (this.loggedUser.profile_image != null ? <img src={this.loggedUser.profile_image} alt="" width="40" height="40" id="my_profile_img"/>:<img src="/images/default-profile-pic.png" alt="" width="40" height="40" id="my_profile_img"/>)
                    }
                    <div className="msg-input">
                        <textarea className="form-control" placeholder="New Message..." name="msg"      value={(this.state.formData.msg)?this.state.formData.msg:''}
                        onChange={(event)=>{ this.elementChangeHandler(event)}}
                        onKeyDown={(event)=>{this.onEnter(event)}}
                        ></textarea>
                    </div>
                    {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                </div>
                <div className="chat-msg-options-holder">
                    <div className="send-msg">
                        <span className="send-msg-helper-text">Press enter to send</span>
                        <button type="submit" className="btn btn-default send-btn">Send</button>
                    </div>
                </div>
            </form>
        )
    }
}
