import React from 'react';
import Session from '../../../middleware/Session';
import Socket  from '../../../middleware/Socket';
import WorkMode  from '../../../middleware/WorkMode';
import {Alert} from '../../../config/Alert';
import {CallChannel} from '../../../config/CallcenterStats';
import NewChatMessage from "./NewChatMessage";
import ChatHeader from "./ChatHeader";
import CommunicationsProvider from '../../../middleware/CommunicationsProvider';

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

export default class QuickChatBubble extends React.Component{
    constructor(props) {
        super(props);

        this.state ={
            userLoggedIn : Session.getSession('prg_lg'),
            messages:[],
            uri:'usr:proglobe'+this.props.chatData.title,
            isMinimized : false,
            isNavHidden: this.props.isNavHidden,
            chatData: this.props.chatData,
            isActiveBubble: this.props.isActiveBubble,
            my_connections: this.props.my_connections,
            _prg_wm: WorkMode.getWorkMode()

        };

        this.messages = [];
        this.onChatMinimize = this.onChatMinimize.bind(this);
        this.chatProvider = CommunicationsProvider.getChatProvider();

        this.checkWorkMode();
    };

    checkWorkMode(){
        let _this = this;
        Socket.listenToWorkModeStatus(function (data) {
            _this.setState({_prg_wm: data});
        });
    }

    componentDidMount() {
        this.setState({messages: this.props.messages});
    }

    componentWillReceiveProps(nextProps) {
      // NOTE: Make sure that messages are part of nextProps here.
      this.setState({
          messages:nextProps.messages, 
          isNavHidden: nextProps.isNavHidden, 
          chatData: nextProps.chatData,
          isActiveBubble: nextProps.isActiveBubble, 
          my_connections: nextProps.my_connections, 
          isMinimized: nextProps.chatData.isMinimized
        });
    }

    onbubbleClosed(data){
        this.props.bubbleClosed(data);
    }

    sendMsg(msg, channel) {
        this.props.sendMyMessage(msg, channel);
    }

    doVideoCall(){

        let callBody = {
            title: this.state.chatData.title,
            uri: this.state.uri
        }
        this.props.doVideoCall(callBody);
    }

    doAudioCall(){
        let callBody = {
            title: this.state.chatData.title,
            uri: this.state.uri
        }
        this.props.doAudioCall(callBody);
    }

    onLoadProfile(){
        window.location.href = '/profile/'+this.state.chatData.user.user_name;
    }

    onChatMinimize(state){
        if(state){
            this.setState({isMinimized: true});
        }else{
            this.setState({isMinimized: false});
        }
    }

    render() {
        const {
            userLoggedIn,
            messages
        }=this.state;

        if(this.state.chatData.id === "NEW_CHAT_MESSAGE") {

            return (

                <div>
                    <NewChatMessage
                        conv={this.state.chatData}
                        bubbleClose={this.onbubbleClosed.bind(this)}
                        onLoadProfile = {this.onLoadProfile.bind(this)}
                        onMinimize = {this.onChatMinimize.bind(this)}
                        loggedUser = {userLoggedIn}
                        messages = {messages}
                        minimizeChat = {this.state.isMinimized}
                        sendChat={this.sendMsg.bind(this)}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                        isActiveBubble= {this.state.isActiveBubble}
                        my_connections={this.state.my_connections}
                        setNewChatToList= {this.props.setNewChatToList}

                        prg_wm={this.state._prg_wm}
                    />
                </div>

            );

        } else {
            return (

                <div>
                    <ChatHeader
                        conv={this.state.chatData}
                        bubbleClose={this.onbubbleClosed.bind(this)}
                        onLoadProfile = {this.onLoadProfile.bind(this)}
                        onMinimize = {this.onChatMinimize.bind(this)}

                        loggedUser = {userLoggedIn}
                        messages = {this.props.messages}
                        minimizeChat = {this.state.isMinimized}

                        sendChat={this.sendMsg.bind(this)}
                        setActiveBubbleId= {this.props.setActiveBubbleId}
                        isActiveBubble= {this.state.isActiveBubble}
                        my_connections={this.state.my_connections}
                        setNewChatToList= {this.props.setNewChatToList}
                        startCall={this.props.startCall}
                        someoneTyping={this.props.someoneTyping}

                        prg_wm={this.state._prg_wm}
                    />
                </div>

            );
        }


    }
}
