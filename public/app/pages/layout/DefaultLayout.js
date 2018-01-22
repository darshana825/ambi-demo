import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import SignupIndex from '../signup/Index';
import SigninHeader from '../../components/header/SigninHeader'
import SidebarNav from '../../components/sidebarNav/SidebarNav'
import FooterHolder from '../../components/footer/FooterHolder'
import Session  from '../../middleware/Session';
import Dashboard  from '../dashboard/Dashboard';
import InCallPane  from '../chat/InCallPane';
import QuickChatHandler from '../chat/QuickChatHandler';
import WorkMode from '../workmode/Index';
import NotificationPop from '../notifications/NotificationPop';
import Moment from 'moment';
import PubSub from 'pubsub-js';
import Chat from '../../middleware/Chat';

export default class DefaultLayout extends React.Component{
    constructor(props){
        super(props);

        //bit6 will work on https
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }
        if (window.location.protocol == 'http:' ) {
            var url_arr = window.location.href.split('http');
            window.location.href = 'https'+url_arr[1];
        }

        let _rightBottom = false;
        let _socialNotifications = false;

        this.checkWorkModeInterval = null;

        if(Session.getSession('prg_wm') != null){
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime){
                Session.destroy("prg_wm");
            } else{
                let _this = this;
                _rightBottom = Session.getSession('prg_wm').rightBottom;
                _socialNotifications = Session.getSession('prg_wm').socialNotifications;
                if(_rightBottom == true || _socialNotifications == true){
                    this.checkWorkModeInterval = setInterval(function(){_this.checkWorkMode()}, 1000);
                }
            }
        }

        this.state={
            chatBubble:[],
            rightBottom:_rightBottom,
            socialNotifications:_socialNotifications,
            isShowingModal: false,
            notifiType: "",
            notificationCount: ""
        };

        this.quickChatUsers = [];
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.doVideoCall = this.doVideoCall.bind(this);
        this.doAudioCall = this.doAudioCall.bind(this);
    }

    componentWillMount() {
        let _this = this;
        let FVM = "FRIEND_PROFILE_MESSAGING";
        let FPVC = "FRIEND_PROFILE_VIDEO_CALL";
        let VIDEO_CALL = "VIDEO";

        PubSub.subscribe(FVM, function( msg, data ){

            let chatExists = false;
            if(_this.quickChatUsers.length > 0) {
                for(let con in _this.quickChatUsers){
                    if(_this.quickChatUsers[con].title == data.title){
                        chatExists = true;
                    }
                }
            }

            if(!chatExists) {
                _this.quickChatUsers.push(data);
                _this.setState({chatBubble:_this.quickChatUsers});
            }
        });

        PubSub.subscribe(FPVC, function( msg, data ){

            if(data.type == VIDEO_CALL) {
                _this.doVideoCall(data);
            } else {
                _this.doAudioCall(data);
            }

        });



    }

    doVideoCall(callObj){
        Chat.startOutgoingCall(callObj.uri, true);
    };

    doAudioCall(callObj){
        Chat.startOutgoingCall(callObj.uri, false);
    };


    checkWorkMode(){
        if(Session.getSession('prg_wm') != null){
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime){
                console.log("TIME UP from Default Layout")
                this.setState({rightBottom:false, socialNotifications:false})
                Session.destroy("prg_wm");
                clearInterval(this.checkWorkModeInterval);
                this.checkWorkModeInterval = null;
            }
        } else{
            this.setState({rightBottom:false, socialNotifications:false});
            clearInterval(this.checkWorkModeInterval);
            this.checkWorkModeInterval = null;
        }

    }

    loadQuickChat(conv){

        if(typeof this.quickChatUsers.length != 'undefined' && this.quickChatUsers.length >= 3) {
            alert("Maximum quick chat window limit is reached.");
            return;
        }

        var chatExists = false;
        if(this.quickChatUsers.length > 0) {
            for(let con in this.quickChatUsers){
                if(this.quickChatUsers[con].title == conv.title){
                    chatExists = true;
                }
            }
        }

        if(!chatExists) {
            this.quickChatUsers.push(conv);
            this.setState({chatBubble:this.quickChatUsers});
        }
    }

    closeChatBubble(title) {

        let bbList = this.state.chatBubble;
        if (typeof bbList != 'undefined' && bbList.length > 0) {
            let index = this.getBubbleIndex(title);
            if(index > -1) {
                bbList.splice(index, 1);
            }
            this.quickChatUsers = [];
            this.quickChatUsers = bbList;
            this.setState({chatBubble:this.quickChatUsers});
        }
    }

    getBubbleIndex(title) {
        let bbList = this.state.chatBubble;
        for (let my_con in bbList) {
            if (title == bbList[my_con].title) {
                return my_con;
            }
        }
        return -1
    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onWorkmodeClick(){
        this.handleClick();
    }

    onNotifiTypeClick(type, count){
        this.setState({notifiType : type, notificationCount : count});
    }

    onNotifiClose(){
        this.setState({notifiType : ""});
    }

    updateNotificationPopCount(c){
        console.log("going to update count - 02");
        console.log(c);
        this.setState({notificationCount : c});
    }

    render(){
        return(
            <div className="row row-clr pg-full-wrapper">
                <SigninHeader quickChat={this.loadQuickChat.bind(this)}/>
                <SidebarNav side="left" menuItems={{items:[
                  {"name": "Notes", "link" : "/notes", "imgName": "nav-ico-2"},
                  {"name": "Folders", "link" : "/folders", "imgName": "folder-icon"},
                  {"name": "Doc", "link" : "/doc", "imgName": "document-icon"},
                  {"name": "Pro Calendar", "link" : "/calender-weeks", "imgName": "nav-ico-5"}
                ]
              }}/>

                <SidebarNav side="right" menuItems={{items:[
                  {"name": "News", "link" : "/news", "imgName": "nav-ico-1"},
                  {"name": "interests", "link" : "/interests", "imgName": "nav-ico-8"},
                  {"name": "Groups", "link" : "/professional-networks", "imgName": "nav-ico-10"},
                  {"name": "Call Center", "link" : "/chat", "imgName": "call-center-icon"}
                ]
              }} blockRight={this.state.rightBottom}/>
                <div className="row row-clr pg-middle-sign-wrapper">
                    <div className="container-fluid pg-custom-container">
                        {this.props.children || <Dashboard />}
                    </div>
                </div>
                <FooterHolder blockBottom={this.state.rightBottom} blockSocialNotification={this.state.socialNotifications} onWorkmodeClick={this.onWorkmodeClick.bind(this)} onNotifiTypeClick={this.onNotifiTypeClick.bind(this)} onUpdateNotifiPopupCount={this.updateNotificationPopCount.bind(this)}/>
                <InCallPane/>
                {
                    this.state.isShowingModal &&
                    <ModalContainer zIndex={9999}>
                        <ModalDialog width="65%" className="workmode-popup-holder">
                            <div className="workmode-popup-wrapper">
                                <WorkMode />
                                <i className="fa fa-times close-icon" aria-hidden="true" onClick={this.handleClose.bind(this)}></i>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
                {
                    (this.state.notifiType)?
                        <NotificationPop notifiType={this.state.notifiType} notifyCount={this.state.notificationCount} onNotifiClose={this.onNotifiClose.bind(this)}/>
                    :
                        null
                }
                <QuickChatHandler chatList={this.state.chatBubble} bubClose={this.closeChatBubble.bind(this)}/>
            </div>
        );
    }
}
