/**
 * Header is to display menu items for the si
 */
import React from 'react';
import { Link} from 'react-router';
import Logo from './Logo';
import { Scrollbars } from 'react-custom-scrollbars';
import GlobalSearch from './GlobalSearch';
import ProfileImg from './ProfileImg';
import LogoutButton from '../../components/elements/LogoutButton';
import Session from '../../middleware/Session';
import Chat from '../../middleware/Chat';
import Lib from '../../middleware/Lib';
import CallCenter from '../../middleware/CallCenter';
//import DummyConversationList from './DummyConversationList'
import FriendRequestList from './FriendRequestList'
import ConversationList from '../../pages/chat/ConversationList'

export default class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            headerChatUnreadCount:0,
            my_connections:this.props.my_connections,
            connection_requests:this.props.connection_requests,
            showChatNotification: false,
            showFriendRequestNotification: false,
            chat_conversations: [],
            unreadChatCount:0,
            friendRequestsCount:0

        }
        this.quickChatUsers = [];
        this.logged_me = Session.getSession('prg_lg');
    }

    componentWillReceiveProps(nextProps) {
        this.setState({showFriendRequestNotification: nextProps.showFriendRequestNotification, my_connections: nextProps.my_connections, connection_requests: nextProps.connection_requests});
    }

    initiateQuickChat(conv) {
        this.props.quickChat(conv);
    }

    loadTwilioQuickChat(conversation) {
        this.props.loadTwilioQuickChat(conversation);
    }

    loadNewTwilioQuickChat(conversation) {
        this.props.loadNewTwilioQuickChat(conversation);
    }

    initiateDummyQuickChat(id) {
        this.props.dummyQuickChat(id);
    }

    toggleChatNotifications() {
        let _ct = this.state.showChatNotification;
        this.setState({
            showFriendRequestNotification: false,
            showChatNotification: !_ct
        });
    }

    toggleFriendRequestNotifications() {
        let _frl = this.state.showFriendRequestNotification;
        this.setState({
            showFriendRequestNotification: !_frl,
            showChatNotification: false
        });
    }

    setChatConversations(conv) {
        this.setState({chat_conversations: conv});
    }

    setUnreadChatCount(_count) {
        this.setState({unreadChatCount: _count});
    }

    setFriendRequestCount(_count) {
        this.setState({friendRequestsCount: _count});
        this.props.resetConnections();
    }

    render(){
        return(
            <header>
                <div className="container">
                    <div className="clearfix">
                        <Logo url ="/images/logo.png" />
                        <GlobalSearch/>
                        <div className="notification-holder clearfix">
                            <div className="news-feed opt-holder">
                                <a href="/news-feed">
                                    <div className="icon-holder"></div>
                                </a>
                            </div>
                            <div onClick={this.toggleChatNotifications.bind(this)} className="chat-icon opt-holder chat-dropdown-holder dropDown-holder" id="chat_notification_a">
                                <div className="icon-holder"></div>
                                <div id="unread_chat_count_header" className="notifi-num notifi-alert-holder">
                                    {this.state.unreadChatCount > 0 ? <span className="notifi-num">{this.state.unreadChatCount}</span> : null}
                                </div>
                            </div>
                            <div onClick={this.toggleFriendRequestNotifications.bind(this)} className="friends-icon opt-holder">
                                <div className="icon-holder"></div>
                                <div className="notifi-alert-holder">
                                    {this.state.friendRequestsCount > 0 ? <span className="notifi-num">{this.state.friendRequestsCount}</span> : null}
                                </div>
                            </div>
                            <ProfileImg />
                        </div>
                    </div>

                    {
                        <ConversationList my_connections={this.state.my_connections}
                                          loadQuickChat={this.initiateQuickChat.bind(this)}
                                          loadTwilioQuickChat={this.loadTwilioQuickChat.bind(this)}
                                          chatConversations={this.setChatConversations.bind(this)}
                                          unreadChatCount={this.setUnreadChatCount.bind(this)}
                                          conversations={this.state.chat_conversations}
                                          showChatNotification={this.state.showChatNotification}
                                          loadNewTwilioQuickChat={this.loadNewTwilioQuickChat.bind(this)}
                        />
                    }
                    <FriendRequestList my_connections={this.state.my_connections}
                                       connection_requests={this.state.connection_requests}
                                       showFriendRequests={this.state.showFriendRequestNotification}
                                       setFriendRequestCount={this.setFriendRequestCount.bind(this)}
                    />

                </div>
            </header>

        );
    }

}
