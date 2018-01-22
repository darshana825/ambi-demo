/**
 * This is notifications index class that handle all
 */

import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export default class Index extends React.Component{
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
            notificationCount: 0,
            seeAllNotifications: false,
            resultHeader:[],
            eleList:[],
            telNumber: "",
            selectedOpt: "",
            customHours: "",
            customMins: ""
        };

        this.currentTime = new Date();
        this.currentPage = 1;
        this.days = 1;
        this.currentTimeUpdate = this.currentTimeUpdate.bind(this);
        this.listenToNotification();
        this.handleScroll = this.handleScroll.bind(this);
        this.elementsList = [];
        this.loadNotifications();
    }

    listenToNotification(){
        let _this = this;

        Socket.listenToNotification(function(data){

            let _existingNotifications = _this.state.eleList;
            let _newNotifications = [];
            let _oldNotification = {}, _newNotification = {};
            let _alreadyExist = false;

            let _notificationType = typeof data.notification_type != "undefined" ? data.notification_type : data.data.notification_type;


            if(_notificationType == "share_notebook" || _notificationType == "share_notebook_response" || _notificationType == "share_folder" || _notificationType == "share_folder_response"
                || _notificationType == "calendar_share_notification" || _notificationType == "share_calendar_response"|| _notificationType == "calendar_schedule_updated" || _notificationType == "calendar_schedule_time_changed" || _notificationType == "calendar_schedule_carried_next_day") {

                console.log("came to load >>" + _notificationType);
                _this.loadNotifications();

            } else if(_notificationType == "Birthday") {
                _this.state.notificationCount++;
                _newNotifications.push(data);
                for (var j = 0; j < _existingNotifications.length; j++) {
                    _newNotifications.push(_existingNotifications[j]);
                }
                //_this.state.eleList = _newNotifications;
                this.setState({eleList: _newNotifications});
                //_this.setState({notifications:_newNotifications});

            } else {
                if(data.user != _this.state.loggedUser.user_name){

                    _this.state.notificationCount++;

                    for(var j = _existingNotifications.length - 1; j >= 0; j--){
                        if(_existingNotifications[j].post_id == data.data.post_id && _existingNotifications[j].notification_type == data.data.notification_type){
                            _alreadyExist = true;
                            _oldNotification = _existingNotifications[j];
                        } else{
                            _newNotifications.unshift(_existingNotifications[j]);
                        }
                    }

                    if(_alreadyExist == true){

                        let _oldsender = _oldNotification.sender_name;
                        let _newsender = data.data.notification_sender.first_name+" "+data.data.notification_sender.last_name;
                        let _oldSenderCount = _oldNotification.sender_count;

                        let _senderFirstArray = _oldsender.split("and");

                        if(_senderFirstArray.length > 1){
                            let _senderSecondArray = _senderFirstArray[0].trim().split(",");
                            if(_senderSecondArray.length > 1){
                                _oldSenderCount++;
                                _newsender += ", "+_senderSecondArray[0].trim()+" and "+_senderSecondArray[1].trim();
                            } else{
                                _newsender += " and "+_senderSecondArray[0].trim();
                            }
                        } else{
                            _newsender += " and "+_senderFirstArray[0].trim();
                        }

                        let _createdAt = _oldNotification.created_at;
                        _createdAt['time_a_go'] = 'Just Now';

                        _newNotification = {
                            post_id:_oldNotification.post_id,
                            notification_type:_oldNotification.notification_type,
                            read_status:false,
                            created_at:_createdAt,
                            post_owner_username:_oldNotification.post_owner_username,
                            post_owner_name:_oldNotification.post_owner_name,
                            sender_profile_picture:data.data.notification_sender.profile_image,
                            sender_name:_newsender,
                            sender_count:_oldSenderCount
                        };
                        _newNotifications.unshift(_newNotification);
                    }else{
                        $.ajax({
                            url: '/notifications/get-details',
                            method: "GET",
                            dataType: "JSON",
                            data: {post_id:data.data.post_id, notification_type:data.data.notification_type},
                            headers: { 'prg-auth-header':_this.state.loggedUser.token }
                        }).done( function (data, text) {
                            if(data.status.code == 200){
                                _newNotifications.unshift(data.data);
                            }
                        }.bind(_this));

                    }

                    //_this.setState({notifications:_newNotifications});
                    //_this.elementsList = _newNotifications;
                    _this.setState({eleList: _newNotifications});
                }

            }
        });
    }

    loadNotifications(){

        console.log("---- going to load notifications again ----");

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

    componentWillMount(){
        this.currentTimeUpdate();
        this.currentDate();
    }

    componentDidMount(){
        window.setInterval(function () {
            this.currentTimeUpdate();
        }.bind(this), 1000);
    }

    addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    currentTimeUpdate(){
        let _this = this;
        let currentTime = new Date();
        let hours = _this.addZero(currentTime.getHours() % 12 || 12);
        let minutes = _this.addZero(currentTime.getMinutes());

        this.setState({hours : hours, minutes : minutes});
    }

    ordinal_suffix_of(i) {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    currentDate(){
        let _this = this;
        let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        let months = ["January", "February", "March", "April", "May","June", "July", "August", "September", "October","November", "December"];
        let weekDate = _this.currentTime.getDay();
        let rawDate = _this.currentTime.getDate();

        let year = _this.currentTime.getFullYear();
        let month = months[_this.currentTime.getMonth()];
        let date = days[weekDate];
        let dateAcr = this.ordinal_suffix_of(rawDate);

        return [year, month, date, dateAcr];
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
            _notification.notification_type != 'add_group_post') {
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
                } else if(_notification.notification_type != "share_notebook_response" &&
                    _notification.notification_type != "share_folder_response") {
                    window.location.href = '/profile/'+_notification.post_owner_username+'/'+_notification.post_id;
                }
            }

        } else if(_notification.notification_type == 'share_group'){
            window.location.href = '/groups/'+_notification.name_prefix;
        }

    }

    handleScroll(event, values) {

        if(this.state.seeAllNotifications){

            if  (values.scrollTop > (values.scrollHeight - values.clientHeight) - 4){

                if (this.currentPage <= this.state.resultHeader.total_pages){
                    this.currentPage = this.currentPage+1;
                    this.loadNotifications();
                }
            }
        }

    }

    markAllRead(){

        $.ajax({
            url: '/notifications/update-notifications',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            for (var i = 0; i < this.elementsList.length; i++){
                if(this.elementsList[i].notification_type != 'share_notebook' && this.elementsList[i].notification_type != 'share_folder') {
                    this.elementsList[i].read_status = true;
                }
            }
            this.setState({eleList: this.elementsList});
        }.bind(this));


    }

    allNotifications(){
        this.days = null;
        this.setState({seeAllNotifications : true});
        this.currentPage++;
        this.loadNotifications();
    }

    elementChangeHandler(e){
        let userNum = this.state.telNumber;
        if (e.keyCode === 38 || e.keyCode === 40) {
            e.preventDefault();
        }else{
            userNum = e.target.value.substring(0,10);
            this.setState({telNumber : userNum});
        }
    }

    onSelect(e){
        let checkbox = e.target.name;
        this.setState({selectedOpt : checkbox});
    }

    onTimeChange(e){
        let timeField = e.target.name;
        let timeFieldValue = e.target.value;

        if(timeField == "hours"){
            if(timeFieldValue <= 24){
                timeFieldValue = e.target.value.substring(0,2);
                this.setState({customHours: timeFieldValue});
            }
        }

        if(timeField == "mins"){
            if(timeFieldValue <= 60){
                timeFieldValue = e.target.value.substring(0,2);
                this.setState({customMins: timeFieldValue});
            }
        }

    }

    onTimeSave(){
        this.refs.overlay.hide();
        if(this.state.telNumber.length == 0){
            alert("Add Contact Number");
        }else if(this.state.selectedOpt.length == 0){
            alert("Choose options");
            if(this.state.selectedOpt == "custom"){
                if(this.state.customHours == "" && this.state.customMins == ""){
                    alert("Add Custom Time");
                }
            }
        }else{
            let obj = {
                __phone_number: this.state.telNumber,
                __notification_mode: this.state.selectedOpt,
                __custom_time: {
                    hh : this.state.customHours,
                    mm : this.state.customMins,
                    period : this.refs.timePeriod.value
                }
            };

            console.log(obj);
        }

    }

    onPopoverOpen(){
        let currH = this.state.hours;
        let currM = this.state.minutes;

        this.setState({customHours: currH, customMins: currM});
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

        console.log("onUpdateSharedFolder");
        console.log(notification);
        console.log(status)

        if(typeof notification.folder_id != 'undefined' && notification.notification_type == "share_folder" && !notification.read_status){

            $.ajax({
                url: '/notifications/folder-update',
                method: "POST",
                dataType: "JSON",
                data:{folder_id:notification.folder_id, notification_type:notification.notification_type, notification_id:notification.notification_id, status:status, notification_sender:notification.sender_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done( function (data, text) {
                console.log("HEREEEE")

                let _notificationData = {
                    folder_id:notification.folder_id,
                    notification_type:"share_folder_response",
                    notification_sender:this.state.loggedUser,
                    notification_receivers:notification.sender_user_name
                };

                console.log(_notificationData);console.log(status);

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

    render() {
        let loggedUser = this.state.loggedUser;
        let _secretary_image = loggedUser.secretary_image_url;
        let elementsList = this.state.eleList;

        let partOfDay = "PM";
        let greating;
        let h = this.currentTime.getHours();
        let date = this.currentDate();
        let _this = this;

        if(h < 12){
            partOfDay = "AM";
            greating = 'Good Morning';
        }else if (h >= 12 && h <= 17){
			greating = 'Good Afternoon';
		}else if (h >= 17 && h <= 24){
            greating = 'Good Evening';
        }

        const {
            notifications,
            notificationCount
            }=this.state;

        let popover = (
            <Popover id="popover-trigger-click-root-close" className="notifications popover-holder">
                <div className="inner-wrapper clearfix">
                    <div className="number-block option-block">
                        <input type="number" value={this.state.telNumber} onChange={(event)=>{ this.elementChangeHandler(event)}} placeholder="Enter your contact number" className="form-control" name="tel" />
                        <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                    </div>
                    <div className={(this.state.selectedOpt == "now")? "option-block active" : "option-block" }>
                        <input type="checkbox" value="now" id="check-now" name="now" onChange={(event)=>{ this.onSelect(event)}}
                            checked={(this.state.selectedOpt == "now")? true : false }
                            />
                        <label htmlFor="check-now">Now</label>
                    </div>
                    <div className={(this.state.selectedOpt == "morning")? "option-block active" : "option-block" }>
                        <input type="checkbox" value="morning" id="check-morning" name="morning" onChange={(event)=>{ this.onSelect(event)}}
                            checked={(this.state.selectedOpt == "morning")? true : false }
                            />
                        <label htmlFor="check-morning">Every Morning</label>
                    </div>
                    <div className={(this.state.selectedOpt == "custom")? "custom-block option-block active" : "custom-block option-block" }>
                        <div className="custom-header">
                            <input type="checkbox" value="custom" id="check-custom" name="custom" onChange={(event)=>{ this.onSelect(event)}}
                                checked={(this.state.selectedOpt == "custom")? true : false }
                                />
                            <label htmlFor="check-custom">Custom</label>
                        </div>
                        <div className="time-holder">
                            <div className="field-holder">
                                <input type="number" name="hours" min="1" max="24" className="form-control" value={this.state.customHours} placeholder="Hour" onChange={(event)=>{this.onTimeChange(event)}} />
                            </div>
                            <div className="field-holder">
                                <input type="number" name="mins" min="0" max="60" className="form-control" value={this.state.customMins} placeholder="Minute" onChange={(event)=>{this.onTimeChange(event)}} />
                            </div>
                            <div className="field-holder day-period">
                                <select name="periods" className="form-control" ref="timePeriod">
                                    <option value="am" selected={partOfDay == "AM"}>AM</option>
                                    <option value="pm" selected={partOfDay == "PM"}>PM</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-default save-btn" onClick={_this.onTimeSave.bind(this)}>Save</button>
                </div>
            </Popover>
        );

        return (
            <div className="notificationsHolder">
                <div className="row row-clr pg-news-page-content">
                    <div className="row row-clr">
                        <div className="container">
                            <div className="notification-header">
                                <div className="pg-middle-content-top-middle-secretary">
                                    <SecretaryThumbnail url={_secretary_image}/>
                                </div>
                                <div className="middle-info-holder">
                                    <p className="users-time">{this.state.hours + ":" + this.state.minutes + " " + partOfDay}</p>
                                    <p className="user-date">{date[2] + "," + date[1] + " " + date[3] + ", " + date[0]}</p>
                                    <p className="greeting-and-notifi">{greating + " " + loggedUser.first_name } {notificationCount > 0 ? ", you have "+notificationCount+" Notifications":""}</p>
                                </div>
                                <OverlayTrigger onEntered={this.onPopoverOpen.bind(this)} rootClose trigger="click" placement="bottom" overlay={popover} ref="overlay">
                                    <button className="btn btn-default">Text me to do's</button>
                                </OverlayTrigger>
                            </div>
                            <div className="notification-box-holder">
                                <div className="col-sm-4 notification-box">
                                    <div className="notifi-inner-wrapper">
                                        <div className="box-header-wrapper clearfix">
                                            <div className="col-sm-6">
                                                <h3 className="box-title">Network Notifications</h3>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="pg-top-mark-setings">
                                                    <label htmlFor="readAll" >Mark All as Read</label>
                                                    <input type="checkbox" id="readAll" onChange={this.markAllRead.bind(this)}/>
                                                    <p className="notifi-sub-link"><i className="fa fa-cog"></i>Settings</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="box-body-wrapper">
                                            {elementsList.length > 5?
                                                <Scrollbars style={{ height: 360 }} onScroll={this.handleScroll}>
                                                    <div className="chat-notification-header" id="unread_chat_list">
                                                        <Notification notifications = {elementsList}
                                                                      clickNotification = {this.redirectToNotification.bind(this)}
                                                                      updateNoteBook = {this.onUpdateSharedNoteBook.bind(this)}
                                                                      updateFolder = {this.onUpdateSharedFolder.bind(this)}
                                                                      updateCalendar = {this.onUpdateSharedCalendar.bind(this)}/>
                                                    </div>
                                                </Scrollbars>
                                                :
                                                elementsList.length > 0 ?
                                                    <div className="chat-notification-header" id="unread_chat_list">
                                                        <Notification notifications = {elementsList}
                                                                      clickNotification = {this.redirectToNotification.bind(this)}
                                                                      updateNoteBook = {this.onUpdateSharedNoteBook.bind(this)}
                                                                      updateFolder = {this.onUpdateSharedFolder.bind(this)}
                                                                      updateCalendar = {this.onUpdateSharedCalendar.bind(this)}/>
                                                    </div>
                                                    :
                                                    null
                                            }
                                            {elementsList.length > 0 && !this.state.seeAllNotifications?
                                                <div className="row row-clr pg-secratery-chat-box-see-all">
                                                    <p onClick={this.allNotifications.bind(this)}>See all</p>
                                                </div>
                                                :
                                                null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export class Notification extends React.Component{
    constructor(props) {
        super(props);
        this.state={
        };
    }

    render() {
        let _this = this;
        let notifications = this.props.notifications;

        if (notifications.length <= 0) {
            return <div />
        }
        let _notifications = notifications.map(function(notification,key){
            let _classNames = "tab msg-holder "; // unread notification
            if(notification.read_status){ // read notification
                _classNames += "read";
            }
            var pro_img = (notification.sender_profile_picture == "") ? "/images/default-profile-pic.png" : notification.sender_profile_picture
            return (
                <div className={_classNames} key={key}>
                    <a href="javascript:void(0)" onClick={()=>_this.props.clickNotification(notification)}>
                        <div className="chat-pro-img">
                            <img src={pro_img}/>
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
                                    notification.notification_type != 'share_notebook_response' &&
                                    notification.notification_type != 'share_folder' &&
                                    notification.notification_type != 'share_folder_response' &&
                                    notification.notification_type != 'share_calendar' &&
                                    notification.notification_type != 'share_calendar_response' &&
                                    notification.notification_type != 'calendar_schedule_updated' &&
                                    notification.notification_type != 'calendar_schedule_time_changed' &&
                                    notification.notification_type != 'calendar_schedule_carried_next_day' &&
                                    notification.notification_type != 'share_group_notebook' &&
                                    notification.notification_type != 'share_group' &&
                                    notification.notification_type != 'add_group_post'
                                    ? notification.post_owner_name +" post":null}
                                {/*{notification.notification_type == 'share_notebook' ? notification.post_owner_name +" has invited you to collaborate on " + notification.notebook_name :null}*/}
                                {/*{notification.notification_type == 'share_notebook_response' ? notification.post_owner_name + " has " + notification.notification_status + " your invitation to collaborate on " + notification.notebook_name :null}*/}
                                {notification.notification_type == 'share_notebook' ? notification.sender_name +" has invited you to collaborate on " + notification.notebook_name :null}
                                {notification.notification_type == 'share_notebook_response' ? notification.sender_name + " has " + notification.notification_status + " your invitation to collaborate on the folder" + notification.notebook_name :null}
                                {notification.notification_type == 'share_folder' ? " has invited you to collaborate on " + notification.folder_name :null}
                                {notification.notification_type == 'share_folder_response' ? " has " +notification.notification_status+ " your invitation to collaborate on " + notification.folder_name :null}
                                {notification.notification_type == 'share_calendar' ? notification.sender_name + " has shared you a calendar event - " + notification.calendar_text :null}
                                {notification.notification_type == 'calendar_schedule_updated' ? notification.sender_name + " has updated a shared calendar event - " + notification.calendar_text :null}
                                {notification.notification_type == 'calendar_schedule_time_changed' ? notification.sender_name + " has completely updated a shared calendar event - " + notification.calendar_text :null}
                                {notification.notification_type == 'share_calendar_response' ? notification.sender_name + " has " + notification.notification_status + " your invitation to calendar event - " + notification.calendar_text :null}
                                {notification.notification_type == 'calendar_schedule_carried_next_day' ?  " calendar event moved to next day - " + notification.calendar_text :null}
                                {notification.notification_type == 'share_group_notebook' ? notification.sender_name +" has shared you to collaborate on " + notification.notebook_name + " on " + notification.group_name  :null}
                                {notification.notification_type == 'share_group' ? " added you to a group " + notification.group_name :null}
                                {notification.notification_type == 'add_group_post' ? " added a new post to " + notification.group_name :null}
                            </p>
                            <p className="chat-date">{notification.created_at.time_a_go}</p>

                            {notification.notification_type == 'share_notebook'  && !notification.read_status ? <button className="btn btn-default" onClick={()=>_this.props.updateNoteBook(notification, 'REQUEST_ACCEPTED')}>Accept</button> : null}
                            {notification.notification_type == 'share_notebook'  && !notification.read_status ? <button className="btn btn-default reject" onClick={()=>_this.props.updateNoteBook(notification, 'REQUEST_REJECTED')}>Decline</button> : null}

                            {notification.notification_type == 'share_folder'  && !notification.read_status ? <button className="btn btn-default" onClick={()=>_this.props.updateFolder(notification, 'REQUEST_ACCEPTED')}>Accept</button> : null}
                            {notification.notification_type == 'share_folder'  && !notification.read_status ? <button className="btn btn-default reject" onClick={()=>_this.props.updateFolder(notification, 'REQUEST_REJECTED')}>Decline</button> : null}

                            {notification.notification_type == 'share_calendar'  && !notification.read_status ? <button className="btn btn-default" onClick={()=>_this.props.updateCalendar(notification, 'REQUEST_ACCEPTED')}>Accept</button> : null}
                            {notification.notification_type == 'share_calendar'  && !notification.read_status ? <button className="btn btn-default reject" onClick={()=>_this.props.updateCalendar(notification, 'REQUEST_REJECTED')}>Decline</button> : null}

                            {notification.notification_type == 'calendar_schedule_time_changed'  && !notification.read_status ? <button className="btn btn-default" onClick={()=>_this.props.updateCalendar(notification, 'REQUEST_ACCEPTED')}>Accept</button> : null}
                            {notification.notification_type == 'calendar_schedule_time_changed'  && !notification.read_status ? <button className="btn btn-default reject" onClick={()=>_this.props.updateCalendar(notification, 'REQUEST_REJECTED')}>Decline</button> : null}

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
}
