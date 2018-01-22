import React from "react";
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import WorkMode  from '../../middleware/WorkMode';
import { Scrollbars } from 'react-custom-scrollbars';
import _ from 'lodash';
import { browserHistory } from 'react-router';

export default class NotificationPop extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            hours: "",
            minutes: "",
            notifications: [],
            notificationCount: this.props.notifyCount,
            seeAllNotifications: false,
            resultHeader:[],
            eleList:[],
            telNumber: "",
            selectedOpt: "",
            customHours: "",
            customMins: "",
            currentTypeNumber: 0,
            notifiType: this.props.notifiType,
            _prg_wm: WorkMode.getWorkMode()
        };

        this.currentPage = 1;
        this.days = 1;
        this.listenToNotification();
        this.elementsList = [];
        this.loadNotifications();
        this.checkWorkMode();
    }

    componentDidMount() {
        let _notifiType = this.props.notifiType;
        let _num;
        if (_notifiType == "events") {
            _num = 1;
        } else if(_notifiType == "social") {
            _num = 2;
        } else {
            _num = 3;
        }
        this.setState({notifiType: _notifiType, currentTypeNumber: _num});
    }

    componentWillReceiveProps(nextProps){
        let _num = this.state.currentTypeNumber;

        if(nextProps.notifiType == this.state.notifiType) {
            this.props.onNotifiClose();
        } else {
            if (nextProps.notifiType == "events") {
                _num = 1;
            } else if(nextProps.notifiType == "social") {
                _num = 2;
            } else {
                _num = 3;
            }
            this.setState({notifiType: nextProps.notifiType, currentTypeNumber: _num, notificationCount: nextProps.notifyCount});
        }
    }

    listenToNotification(){
        let _this = this;

        Socket.listenToNotification(function(data){

            //let _notificationType = typeof data.notification_type != "undefined" ? data.notification_type : data.data.notification_type;

            _this.loadNotifications();

        });
    }

    checkWorkMode(){
        let _this = this;
        Socket.listenToWorkModeStatus(function (data) {
            _this.setState({_prg_wm: data});
        });
    }

    redirectToNotification(_notification){
        console.log(_notification);

        if(_notification.notification_type != 'Birthday' &&
            _notification.notification_type != "share_notebook" &&
            _notification.notification_type != "share_folder" &&
            _notification.notification_type != 'share_calendar' &&
            _notification.notification_type != 'calendar_schedule_time_changed' &&
            _notification.notification_type != 'share_group' &&
            _notification.notification_type != 'share_group_response' &&
            _notification.notification_type != 'share_group_notebook' &&
            _notification.notification_type != 'add_group_post'
        ) {

            if(!_notification.read_status) {
                $.ajax({
                    url: '/notifications/update-notifications',
                    method: "POST",
                    dataType: "JSON",
                    data:{post_id:_notification.post_id, notification_type:_notification.notification_type, notification_id:_notification.notification_id},
                    headers: { 'prg-auth-header':this.state.loggedUser.token }
                }).done( function (data, text) {
                    if(_notification.notification_type == "share_notebook_response" ||
                        _notification.notification_type == "share_folder_response") {
                        this.loadNotifications();
                    } else if (_notification.notification_type == 'share_calendar_response' ||
                        _notification.notification_type == 'calendar_schedule_carried_next_day' ||
                        _notification.notification_type == 'calendar_schedule_updated') {
                        var strUrl = '/calendar/'+_notification.calendar_id;
                        browserHistory.push(strUrl);
                    }  else {
                        window.location.href = '/profile/'+_notification.post_owner_username+'/'+_notification.post_id;
                    }

                }.bind(this));

            } else {
                if (_notification.notification_type == 'share_calendar_response' ||
                    _notification.notification_type == 'calendar_schedule_carried_next_day' ||
                    _notification.notification_type == 'calendar_schedule_updated') {
                    var strUrl = '/calendar/'+_notification.calendar_id;
                    browserHistory.push(strUrl);
                }else if(_notification.notification_type == "share_group_notebook"){
                    window.location.href = '/notes/'+_notification.notebook_id;
                } else if(_notification.notification_type == 'share_group_task' || _notification.notification_type == 'share_group_task_response') {
                    window.location.href = '/groups/'+_notification.name_prefix;
                } else {
                    if(typeof _notification.post_owner_username != "undefined" && typeof _notification.post_id != "undefined"){
                        window.location.href = '/profile/'+_notification.post_owner_username+'/'+_notification.post_id;
                    }
                }
            }

        }

    }

    loadNotifications(){
        var _data = {};
        if(this.days == 1){
            _data = {days:this.days, pg:this.currentPage}
        } else{
            _data = {pg:this.currentPage}
        }

        $.ajax({
            url: '/notifications/get-notifications',
            method: "GET",
            dataType: "JSON",
            data: _data,
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {

            if(data.status.code == 200){
                if(this.days == 1){
                    this.setState({notificationCount:data.unreadCount,resultHeader:data.header});
                    this.elementsList = [];
                }
                this.setState({notifications:data.notifications});
                for(var i = 0; i < this.state.notifications.length; i++){
                    this.elementsList.push(this.state.notifications[i]);
                }
                this.setState({eleList: this.elementsList});
            }
        }.bind(this));

    }

    onUpdateSharedNoteBook(notification, stt) {

        if(typeof notification.notebook_id != 'undefined' && notification.notification_type == "share_notebook" && !notification.read_status){

            $.ajax({
                url: '/notifications/notebook-update',
                method: "POST",
                dataType: "JSON",
                data:{notebook_id:notification.notebook_id, notification_type:notification.notification_type, notification_id:notification.notification_id, status:stt, updating_user:notification.sender_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done( function (data, text) {

                let _notificationData = {
                    notebook_id:notification.notebook_id,
                    notification_type:"share_notebook_response",
                    notification_sender:this.state.loggedUser,
                    notification_receiver:notification.sender_user_name
                };

                Socket.sendNotebookNotification(_notificationData);

                if(stt == 'REQUEST_REJECTED') {
                    this.loadNotifications();
                } else {
                    window.location.href = '/notes';
                }

            }.bind(this));
        }
    }

    onUpdateSharedFolder(notification, status) {
        //console.log("onUpdateSharedFolder");

        if(typeof notification.folder_id != 'undefined' && notification.notification_type == "share_folder" && !notification.read_status){

            $.ajax({
                url: '/notifications/folder-update',
                method: "POST",
                dataType: "JSON",
                data:{folder_id:notification.folder_id, notification_type:notification.notification_type, notification_id:notification.notification_id, status:status, notification_sender:notification.sender_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done( function (data, text) {
                let _notificationData = {
                    folder_id:notification.folder_id,
                    notification_type:"share_folder_response",
                    notification_sender:this.state.loggedUser,
                    notification_receivers:notification.sender_user_name
                };

                Socket.sendFolderNotification(_notificationData);

                if(status == 'REQUEST_REJECTED') {
                    this.loadNotifications();
                } else {
                    window.location.href = '/folders';
                }

            }.bind(this));
        }
    }

    onUpdateSharedCalendar(notification, stt) {
        //console.log("onUpdateSharedCalendar");

        if(typeof notification.calendar_id != 'undefined' &&
            (notification.notification_type == "share_calendar" || notification.notification_type == "calendar_schedule_time_changed" ) &&
            !notification.read_status) {

            var _postData = {
                event_id:notification.calendar_id,
                notification_type:notification.notification_type,
                notification_id:notification.notification_id,
                status:stt,
                updating_user:notification.sender_id
            }

            $.ajax({
                url: '/calendar/notification/respond',
                method: "POST",
                dataType: "JSON",
                data:_postData,
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done( function (data, text) {

                let _notificationData = {
                    cal_event_id:notification.calendar_id,
                    notification_type:"share_calendar_response",
                    notification_sender:this.state.loggedUser,
                    notification_receivers:[notification.sender_user_name]
                };

                Socket.sendCalendarShareResponseNotification(_notificationData);

                if(stt == 'REQUEST_REJECTED') {
                    this.loadNotifications();
                } else {
                    var strUrl = '/calendar/'+notification.calendar_id;
                    browserHistory.push(strUrl);
                }

            }.bind(this));
        }
    }

    onUpdateSharedGroup(notification, status) {

        if(typeof notification.group_id != 'undefined' && notification.notification_type == "share_group" && !notification.read_status){
            var _data = {
                id:notification.group_id,
                status:status,
                shared_user_id:this.state.loggedUser.id,
                notification_type:notification.notification_type,
                notification_id:notification.notification_id
            }
            $.ajax({
                url: '/groups/update/member-status',
                method: "POST",
                dataType: "JSON",
                data:_data,
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done( function (data, text) {
                let _notificationData = {
                    folder_id:notification.group_id,
                    notification_type:"share_group_response",
                    notification_sender:this.state.loggedUser,
                    notification_receivers:notification.sender_user_name
                };

                Socket.sendFolderNotification(_notificationData);

                if(status == 'REQUEST_REJECTED') {
                    this.loadNotifications();
                } else if(notification.name_prefix != undefined && notification.name_prefix != ''){
                    window.location.href = '/groups/'+notification.name_prefix;
                } else {
                    window.location.href = '/groups';
                }

            }.bind(this));
        }
    }

    loadPrevType() {
        let _num = this.state.currentTypeNumber;
        let _type = this.state.notifiType;
        if(_num > 1) {
            _num--;

            if (_num == 1) {
                _type = "events";
            } else if(_num == 2) {
                _type = "social";
            } else {
                _type = "work";
            }
            this.setState({notifiType: _type, currentTypeNumber: _num});

        }
    }

    loadNextType() {
        let _num = this.state.currentTypeNumber;
        let _type = this.state.notifiType;
        if(_num < 3) {
            _num++;

            if (_num == 1) {
                _type = "events";
            } else if(_num == 2) {
                _type = "social";
            } else {
                _type = "work";
            }
            this.setState({notifiType: _type, currentTypeNumber: _num});
        }

    }

    render(){
        let elementsList = this.state.eleList;
        let notifiTypeTitle;
        let _nType;

        const {
            notificationCount,
            currentTypeNumber,
            notifiType,
            _prg_wm
            }=this.state;

        let _class = "notification-popup-holder " + notifiType;
        let wrapper_class = "header-wrapper " + notifiType + " clearfix";

        if(notifiType == "events"){
            notifiTypeTitle = "events & to-do’s";
            _nType = "todos";
        }else if(notifiType == "social"){
            notifiTypeTitle = "social notifications";
            _nType = "social";
        }else{
            notifiTypeTitle = "work Notifications";
            _nType = "productivity";
        }

        let holder_class = ((notifiType != "social" && _prg_wm.all_notifications) || (notifiType == "social" && _prg_wm.social_notifications))?
                                "notification-popup-wrapper wm-notification" : "notification-popup-wrapper";

        var _result = elementsList.filter(function( obj ) {
            return obj.notification_category == _nType;
        });

        /*return(
            {
                /!*<div className="notifi-popup-holder">
                    <div className="inner-wrapper">
                        <div className="header-holder">
                            <h3 className="section-title"><i className={"fa " + icon}></i>{notifiTypeTitle}</h3>
                            <span className="notifi-count">({notificationCount})</span>
                            <span className="fa fa-angle-left arrow"></span>
                            <span className="fa fa-angle-right arrow"></span>
                            <span className="close fa fa-times" onClick={() => this.props.onNotifiClose()}></span>
                        </div>
                        <div className="notifications-holder">
                            <Scrollbars style={{ height: 318 }}>
                                <Notification notifications = {elementsList}
                                    updateNoteBook = {this.onUpdateSharedNoteBook.bind(this)} clickNotification = {this.redirectToNotification.bind(this)}/>
                            </Scrollbars>
                        </div>
                        <div className="all-notifications">
                            <a href="/notifications">See all</a>
                        </div>
                    </div>
                </div>*!/
            }

        );*/

        return(
            <section className={holder_class}>
                <div className="container">
                    <section className={_class}>
                        <div className="inner-wrapper">
                            <div>
                                <div className={wrapper_class}>
                                    <span className="icon"></span>
                                    <h3 className="title">{notifiTypeTitle}</h3>
                                    <span className="notify-num">{_result.length}</span>
                                    <span className="arrow left" onClick={this.loadPrevType.bind(this)}></span>
                                    <span className="arrow right" onClick={this.loadNextType.bind(this)}></span>
                                    <span className="fa fa-times" onClick={(e) => this.props.onNotifiClose()}></span>
                                </div>
                                {/*this.getNotificationsList()*/}
                                {
                                    ((notifiType != "social" && _prg_wm.all_notifications) || (notifiType == "social" && _prg_wm.social_notifications)) ?
                                        <div className="notification-body">
                                            <div className="header-holder clearfix">
                                                <div className="icon-holder pull-left">
                                                    <img src="../images/work-mode/wm-chatdd-icon.png" />
                                                </div>
                                                <p className="wm-intro pull-left">you’re still on #workmode and blocked messages! </p>
                                            </div>
                                            <div className="btn-holder">
                                                <span className="btn grey" onClick={()=> {this.props.onNotifiClose()}}>get back to work</span>
                                                {
                                                    (notifiType != "social") ?
                                                        <span className="btn blue" onClick={()=> {WorkMode.workModeAction("unblock", "all_notifications")}}>unblock notifications</span> :
                                                        <span className="btn blue" onClick={()=> {WorkMode.workModeAction("unblock", "social_notifications")}}>unblock notifications</span>
                                                }

                                                <span className="btn pink" onClick={()=> {WorkMode.workModeAction("done")}}>i’m done!</span>
                                            </div>
                                        </div> :
                                        <div className="notification-body-wrapper">
                                            <Notifications notifications = {_result}
                                                           updateNoteBook = {this.onUpdateSharedNoteBook.bind(this)}
                                                           notifiType = {this.state.notifiType}
                                                           clickNotification = {this.redirectToNotification.bind(this)}
                                                           updateFolder = {this.onUpdateSharedFolder.bind(this)}
                                                           updateCalendar = {this.onUpdateSharedCalendar.bind(this)}
                                                           updateGroup = {this.onUpdateSharedGroup.bind(this)}/>
                                        </div>
                                }
                                <div className="see-all-holder">
                                    <a href="/notifications" className="see-all">see all</a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        );
    }
}

export class Notifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedUser:Session.getSession('prg_lg'),
            notifications: this.props.notifications,
            notifiType: this.props.notifiType
        };

        this.getNotificationText = this.getNotificationText.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({notifications: nextProps.notifications, notifiType: nextProps.notifiType});
    }

    getNotificationText(notification) {

        let postOwnerText = this.state.loggedUser.user_name == notification.sender_user_name ? "your" : notification.post_owner_name;
        let eventTaskText;

        if(notification.calendar_type == 1){
            eventTaskText = "event";
        }else if(notification.calendar_type == 2){
            eventTaskText = "to do";
        }else{
            eventTaskText = "task";
        }

        switch(notification.notification_type) {
            case 'like' : return notification.sender_name + ' likes ' + postOwnerText + ' post';
            case 'comment' : return notification.sender_name + ' commented on ' + postOwnerText + ' post';
            case 'share' : return notification.sender_name + ' shared ' + postOwnerText + ' post';
            case 'Birthday' : return notification.sender_name + ' has their bithday ' + notification.birthday;
            case 'share_notebook' : return notification.sender_name + ' has invited you to collaborate on ' + notification.notebook_name;
            case 'share_notebook_response' : return notification.sender_name + " has " + notification.notification_status + " your invitation to collaborate on " + notification.notebook_name;
            case 'share_folder' : return notification.sender_name + " has invited you to collaborate on " + notification.folder_name;
            case 'share_folder_response' : return notification.sender_name + " has " + notification.notification_status + " your invitation to collaborate on " + notification.folder_name;
            case 'share_calendar' : return notification.sender_name + " has shared you a calendar " + eventTaskText + " - " + notification.calendar_text;
            case 'calendar_schedule_updated' : return notification.sender_name + " has updated a shared calendar event - " + notification.calendar_text;
            case 'calendar_schedule_time_changed' : return notification.sender_name + " has completely updated a shared calendar event - " + notification.calendar_text;
            case 'share_calendar_response' : return notification.sender_name + " has " + notification.notification_status + " your invitation to calendar event - " + notification.calendar_text;
            case 'calendar_schedule_carried_next_day' : return " Your calendar event moved to next day - " + notification.calendar_text;
            case 'share_group_notebook' : return notification.sender_name + " has shared you to collaborate on " + notification.notebook_name + " on " + notification.group_name;
            case 'share_group' : return notification.sender_name + " added you to a group " + notification.group_name;
            case 'add_group_post' : return notification.sender_name + " added a new post to " + notification.group_name;
            case 'share_group_task' : return notification.sender_name + " shared task "+ notification.calendar_text +" on group " + notification.group_name;
            case 'share_group_task_response' : return notification.sender_name + " has "+ notification.notification_status + " task "+ notification.calendar_text +" on group " + notification.group_name;
            default : return ""
        }
    }

    showAcceptButtons(notification) {
        switch(notification.notification_type) {
            case 'share_notebook' : return notification.read_status == false ? true : false;
            case 'share_folder' : return notification.read_status == false ? true : false;
            case 'share_calendar' : return notification.read_status == false ? true : false;
            case 'calendar_schedule_time_changed' : return notification.read_status == false ? true : false;
            case 'share_group' : return notification.read_status == false ? true : false;
            default : return false
        }
    }

    callAcceptRejectAction(notification, stt) {
        //console.log("callAcceptRejectAction ------");
        switch(notification.notification_type) {
            case 'share_notebook' : return this.props.updateNoteBook(notification, stt);
            case 'share_folder' : return this.props.updateFolder(notification, stt);
            case 'share_calendar' :  return this.props.updateCalendar(notification, stt);
            case 'calendar_schedule_time_changed' : return this.props.updateCalendar(notification, stt);
            case 'share_group' : return this.props.updateGroup(notification, stt);
            default : return false
        }
    }

    render() {
        let _this = this;

        const {
            notifications,
            notifiType
            }=this.state;

        if (notifications.length <= 0) {
            return <div />
        }

        //console.log("notifications >> ", notifications);
        let _notifications = [];
        if(notifiType == "events") {
            _notifications = notifications.map(function(notification,key){
                let _classType = notification.calendar_type == 1 ? "event" : notification.calendar_type == 2 ? "todo-dot" : "task-dot";
                let showButtons = _this.showAcceptButtons(notification);
                return (

                    <div className="notification-item" key={key} onClick={()=>_this.props.clickNotification(notification)}>
                        <div className="task-icon">
                            <span className={_classType}></span>
                        </div>
                        <div className="content-body">
                            <p className="content">{_this.getNotificationText(notification)}</p>
                            {showButtons == true ?
                                <div className="btn-holder clearfix">
                                    <button className="btn decline" onClick={()=>_this.callAcceptRejectAction(notification, 'REQUEST_REJECTED')}>decline</button>
                                    <button className="btn accept" onClick={()=>_this.callAcceptRejectAction(notification, 'REQUEST_ACCEPTED')}>accept</button>
                                </div>
                                : null
                            }
                            <span className="time">{notification.created_at.time_a_go}</span>
                        </div>
                    </div>

                );
            });
        } else {
            _notifications = notifications.map(function(notification,key){
                let showButtons = _this.showAcceptButtons(notification);
                return (
                    <div className="notification-item" key={key} onClick={()=>_this.props.clickNotification(notification)}>
                        <div className="pro-img">
                            <img src={notification.sender_profile_picture} className="img-responsive" />
                        </div>
                        <div className="content-body">
                            <p className="content">{_this.getNotificationText(notification)}</p>
                            {showButtons == true ?
                                <div className="btn-holder clearfix">
                                    <button className="btn decline" onClick={()=>_this.callAcceptRejectAction(notification, 'REQUEST_REJECTED')}>decline</button>
                                    <button className="btn accept" onClick={()=>_this.callAcceptRejectAction(notification, 'REQUEST_ACCEPTED')}>accept</button>
                                </div>
                                : null
                            }
                            <span className="time">{notification.created_at.time_a_go}</span>
                        </div>
                    </div>

                );
            });
        }


        return (
                <div className="notification-body">
                    {_notifications}
                </div>
            );
    }
}


/*export class Notification extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            notificationList:this.props.notifications
        };
    }

    componentWillReceiveProps(nextProps){
        this.setState({notificationList: nextProps.notifications});
    }

    render() {
        let _this = this;
        let notifications = this.state.notificationList;

        if (notifications.length <= 0) {
            return <div />
        }
        let _notifications = notifications.map(function(notification,key){
            let _classNames = "tab msg-holder "; // unread notification
            if(notification.read_status){ // read notification
                _classNames += "read";
            }
            return (
                <div className={_classNames} key={key}>
                    <a href="javascript:void(0)" onClick={()=>_this.props.clickNotification(notification)}>
                        <div className="chat-pro-img">
                            <img src={notification.sender_profile_picture}/>
                        </div>
                        <div className="notification-body">
                            <p className="connection-name">{notification.sender_name}</p>
                            {notification.sender_count>0?<p className="extra-cont"> and {notification.sender_count} {notification.sender_count == 1? "other" : "others"} </p>:""}
                            <p className="type-of-action">
                                {notification.notification_type == 'like'?"likes ":"" }
                                {notification.notification_type == 'comment'?"commented on ":"" }
                                {notification.notification_type == 'share'?"shared ":"" }
                                {notification.notification_type == 'Birthday'?"has their bithday "+notification.birthday:"" }
                                {notification.notification_type != 'Birthday' &&
                                    notification.notification_type != 'share_notebook' &&
                                    notification.notification_type != 'share_notebook_response'
                                    ? notification.post_owner_name +" post":null}
                                {notification.notification_type == 'share_notebook' ? notification.post_owner_name +" has invited you to collaborate on " + notification.notebook_name :null}
                                {notification.notification_type == 'share_notebook_response' ? notification.post_owner_name + " has " + notification.notification_status + " your invitation to collaborate on " + notification.notebook_name :null}
                            </p>
                            <p className="chat-date">{notification.created_at.time_a_go}</p>

                            {notification.notification_type == 'share_notebook'  && !notification.read_status ? <button className="btn btn-default" onClick={()=>_this.props.updateNoteBook(notification, 'REQUEST_ACCEPTED')}>Accept</button> : null}
                            {notification.notification_type == 'share_notebook'  && !notification.read_status ? <button className="btn btn-default reject" onClick={()=>_this.props.updateNoteBook(notification, 'REQUEST_REJECTED')}>Decline</button> : null}

                        </div>
                    </a>
                </div>
            );
        });

        return (
            <div className="conv-holder">
                <div id="NotificationList">
                    {_notifications}
                </div>
            </div>
        );

    }
}*/
