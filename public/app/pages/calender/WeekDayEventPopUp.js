
import React from 'react';
import Session from '../../middleware/Session';
import moment from 'moment-timezone';
import Datetime from 'react-datetime';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw, Modifier} from 'draft-js';
import Socket  from '../../middleware/Socket';

import EditorField from './EditorField';
import SharedUsers from './SharedUsers';
import TimePicker from './TimePicker';

import { fromJS } from 'immutable';

import forEach from 'lodash.foreach';

import 'rc-time-picker/assets/index.css';
// import TimePicker from 'rc-time-picker';

export default class WeekDayEventPopUp extends React.Component {
    constructor(props) {
        super(props);
        let user = Session.getSession('prg_lg');
        this.state = {
            user:user,
            eventType:'event',
            sharedWithIds:[],
            sharedWithNames: [],
            // defaultEventTime:moment().format('HH:mm'),
            defaultEventTime : moment(this.props.curr_date).format('YYYY-MM-DD HH:mm'),
            defaultEventEndTime : moment(this.props.curr_date).format('YYYY-MM-DD HH:mm'),
            getEditor : false,
            showTimePanel : '',
            showTimePanelWindow : false,
            showUserPanel : '',
            showUserPanelWindow : false,
            msgOn : false,
            errorMsg : '',
            isButtonDisabled : false,
            tagged: '',
            editorTimeSet:false,
            taskPriority:0
        }

        this.loggedUser = user;
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.addEvent = this.addEvent.bind(this);
        this.toggleMsg = this.toggleMsg.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.doColorChange = this.doColorChange.bind(this);
        this.loadEventData = this.loadEventData.bind(this);
    }

    componentDidMount() {
        this.setState({getEditor : true});
        const {editEventId, editOn} = this.props;
        if(editOn == true && editEventId != undefined && editEventId != '') {
            this.loadEventData(editEventId);
        }
    }

    componentWillUnmount() {
        this.setState({getEditor : false});
    }

    changeEventType(type) {
        const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
        this.editor.setState({editorState});
        this.resetEventForm();
        this.setState({eventType : type, editOn : false});
    }

    setSharedUsers(selected) {
        var arrEntries = selected._root.entries;
        if(this.sharedWithIds.indexOf(arrEntries[3][1])==-1){
            this.sharedWithIds.push(arrEntries[3][1]);
            this.sharedWithNames.push(arrEntries[0][1]);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false})
        } else{
            this.setState({isAlreadySelected:true});
        }
    }

    setSharedUsersFromDropDown(selected) {

      if(this.sharedWithIds.indexOf(selected.user_id)==-1){
          this.sharedWithIds.push(selected.user_id);
          this.sharedWithNames.push(selected.first_name+" "+selected.last_name);
          this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, isAlreadySelected:false});

      } else{
          this.setState({isAlreadySelected:true});
      }
      this.setTagged();
      return "";
    }

    removeUser(key, name){

        // removing the mention text
        const contentState = this.editor.state.editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        const startingAt = plainText.indexOf(name);
        const endingAt = startingAt+name.length;
        if(startingAt != -1){
            const newSelection = this.editor.state.editorState.getSelection().merge({
                anchorOffset: startingAt,
                focusOffset: endingAt
            });
            const newContent = Modifier.removeRange(contentState, newSelection, 'backward');

            const editorState = EditorState.push(this.editor.state.editorState, newContent);
            this.editor.setState({editorState});
        }
        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
        this.setTagged();
    }

    setTagged() {
        if(this.sharedWithIds.length > 0) {
            this.setState({'tagged' : 'tagged'});
        } else {
            this.setState({'tagged' : ''});
        }
    }

    removeUsersByName(arrUsers) {

        var arrKeysToBeRemoved = [];
        for (var i = 0; i < arrUsers.length; i++) {
            arrKeysToBeRemoved.push(this.sharedWithNames.indexOf(arrUsers[i]));

            // indexOf returnes the key of the matching value
            // splice removes the given key form the array.
            this.sharedWithIds.splice(this.sharedWithIds.indexOf(arrUsers[i]),1);
            this.sharedWithNames.splice(this.sharedWithNames.indexOf(arrUsers[i]),1);

            if(i == (arrUsers.length - 1)) {
                this.setState({sharedWithIds : this.sharedWithIds, sharedWithNames : this.sharedWithNames});
            }
        }

    }

    setTime(selected) {
        // var arrEntries = selected._root.entries;
        // var time = arrEntries[1][1];
        // let year = this.props.curr_date.year();
        // let month = this.props.curr_date.month();
        // let date = this.props.curr_date.day();
        // let timeWithDay = year+'/'+month+'/'+date+' '+time;

        // this.setState({ defaultEventTime: moment(timeWithDay).format('HH:mm') });
        // this.setState({ defaultEventTime: moment(timeWithDay).format('YYYY-MM-DD HH:mm')});

        let arrEntries = selected._root.entries;
        let strTime = arrEntries[1][1];
        let endTime = arrEntries[2][1];
        const strDate = moment(this.state.currentDay).format('YYYY-MM-DD');
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
        const endDateWithTime = moment(strDate + ' ' + endTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        this.setState({ defaultEventTime: dateWithTime, defaultEventEndTime:endDateWithTime, editorTimeSet: true });
        //this.refs.timepicker_overlay.show();
        //setTimeout(this.doColorChange, 500);
    }

    /**
     * this part will highlight the time by RED coour
     */
    doColorChange() {
        // removing the mention text
        const contentState = this.editor.state.editorState.getCurrentContent();
        const plainText = contentState.getPlainText();

        const startingAt = plainText.indexOf("@");
        const endingAt = startingAt+20;
        if(startingAt != -1){
            const newSelection = this.editor.state.editorState.getSelection().merge({
                anchorOffset: startingAt,
                focusOffset: endingAt
            });
            const newContent = Modifier.applyInlineStyle(contentState, newSelection, 'RED');

            const editorState = EditorState.push(this.editor.state.editorState, newContent);
            this.editor.setState({editorState});
        }
    }

    _onHashClick() {
        this.refs.timepicker_overlay.hide();
        let showUserPanelWindow = this.state.showUserPanelWindow;
        this.setState({showUserPanelWindow : (showUserPanelWindow == true ? false : true), showTimePanelWindow: false });
    }

    _onAtClick() {

        //this.refs.timepicker_overlay.show();
        //let showTimePanel = this.state.showTimePanel;
        //let showTimePanelWindow = this.state.showTimePanelWindow;
        //this.setState({showTimePanel : (showTimePanel == 'active' ? '' : 'active'), showTimePanelWindow : true });
        if(this.state.showTimePanelWindow == true) {
            this.refs.timepicker_overlay.hide();
            this.setState({showTimePanelWindow : false});
        } else {
            this.refs.timepicker_overlay.show();
            this.setState({showTimePanelWindow : true});
        }
    }

    handleTimeChange(_stime, _etime) {
        let _strDate = moment(_stime).format('YYYY-MM-DD');
        const endDateWithTime = moment(_strDate + ' ' + _etime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
        this.setState({ defaultEventTime: _stime, defaultEventEndTime: endDateWithTime, showTimePanelWindow : true });
        //this.refs.timepicker_overlay.show();
    }

    toggleMsg() {
        this.setState({ msgOn: !this.state.msgOn });
    }

    addEvent(event) {

        const strDate = moment(this.props.curr_date).format('YYYY-MM-DD');
        const strTime = moment(this.state.defaultEventTime).format('HH:mm');
        const endTime = moment(this.state.defaultEventEndTime).format('HH:mm');
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
        const endDateWithTime = moment(strDate + ' ' + endTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        const Editor = this.editor.state.editorState;
        const contentState = this.editor.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        // front-end validations
        // TODO: remove this msg showing method after implementing a global way to show error message
        if(!plainText) {
            this.setState({errorMsg : 'Please add the event description'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        if(dateWithTime < moment().format('YYYY-MM-DD HH:mm')) {
            this.setState({errorMsg : 'Please add a future date and time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        if(endDateWithTime <= dateWithTime) {
            this.setState({errorMsg : 'Event end time should be greater than start time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        //var priority = 3;
        //if(contentState.hasText()) {
        //    priority = (plainText.includes("!2")) ? 2 : priority;
        //    priority = (plainText.includes("!1")) ? 1 : priority;
        //}

        let _priority = this.state.taskPriority;
        if(this.state.eventType == 'task' && this.state.taskPriority == 0  && plainText.indexOf('!') != -1) {
            if(plainText.includes("!1")) {
                _priority = 1;
            }
            if(plainText.includes("!2")) {
                _priority = 2;
            }
            if(plainText.includes("!3")) {
                _priority = 3;
            }
        }

        // get shared users from SharedUsers field
        const sharedUsers = this.state.sharedWithIds;
        // const sharedUsers = this.refs.SharedUserField.sharedWithIds;

        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.eventType,
            apply_date : dateWithTime,
            event_time : strTime,
            event_end_time : moment(endDateWithTime).format('HH:mm'),
            event_timezone : moment.tz.guess(),
            shared_users : sharedUsers,
            priority : this.state.eventType == 'task' ? _priority : 0,
            calendar_origin : this.props.calendarOrigin,
            group_id : (this.props.calendarOrigin == 2) ? this.props.groupId : null // Only group calendar have group id
        };

        // the button dissabled untill the response comes
        this.setState({ isButtonDisabled: true});

        $.ajax({
            url: '/calendar/event/add',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(postData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){

                // the button dissabled untill the response comes
                this.setState({ isButtonDisabled: false, editorTimeSet:false});

                const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
                this.editor.setState({editorState});
                this.props.handleClose();
                this.refs.timepicker_overlay.hide();
                this.setState({showTimePanelWindow : false });

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:data.events._id,
                        notification_type:"calendar_share_notification",
                        notification_sender:this.loggedUser,
                        notification_receiver:sharedUsers
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }

                // load data
                this.loadWeekData();
            }
        }.bind(this));
    }

    _onBoldClick() {
        this.editor.onChange(RichUtils.toggleInlineStyle(this.editor.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.editor.onChange(RichUtils.toggleInlineStyle(this.editor.state.editorState, 'ITALIC'));
    }

    _onUnderLineClick() {
        this.editor.onChange(RichUtils.toggleInlineStyle(this.editor.state.editorState, 'UNDERLINE'));
    }

    overlayHide() {
        this.refs.timepicker_overlay.hide();
        this.setState({showTimePanelWindow : false });

    }

    setTimePickerTimeChange(_Data, _type) {

        // removing the mention text
        const contentState = this.editor.state.editorState.getCurrentContent();
        //const rawContent = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        const startingAt = plainText.indexOf("@");
        const endingAt = startingAt+20;
        if(startingAt != -1){
            const newSelection = this.editor.state.editorState.getSelection().merge({
                anchorOffset: startingAt,
                focusOffset: endingAt
            });


            const word1 = plainText.slice(startingAt, endingAt);
            const _dtStr = moment(_Data).format('hh:mm A');

            const str1 = _type == "start-time" ? _dtStr : word1.slice(1, 9);
            const str2 = _type == "start-time" ? word1.slice(12, word1.length) : _dtStr;

            let replacedText = "@"+ str1 + " - " + str2;

            const contentReplaced = Modifier.replaceText(
                contentState,
                newSelection,
                replacedText);

            const editorState = EditorState.push(this.editor.state.editorState, contentReplaced, 'replace-text');
            this.editor.setState({editorState});

            setTimeout(this.doColorChange, 500);
        }


        if(_type == "start-time"){
            this.setState({ defaultEventTime: _Data, editorTimeSet: true});
        } else {
            this.setState({defaultEventEndTime:_Data, editorTimeSet: true});
        }

    }

    doTimePickerValidation(_val) {

        let _msg = _val == "invalid_time" ? 'End time should be greter then start time' : 'Please add a future time';

        if(_msg != '') {
            this.setState({errorMsg : _msg});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

    }


    loadEventData(_editEventId) {
        $.ajax({
            url : '/calendar/event/get',
            method : "POST",
            data : { eventId : _editEventId },
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    var rawContent = data.event.description;
                    if(typeof(rawContent.entityMap) === 'undefined' || rawContent.entityMap === null ) {
                        rawContent.entityMap = {};
                    }
                    forEach(rawContent.entityMap, function(value, key) {
                        value.data.mention = fromJS(value.data.mention)
                    });

                    const contentState = convertFromRaw(rawContent);
                    const toUpdateEditorState = EditorState.createWithContent(contentState);
                    const editorState = EditorState.push(this.editor.state.editorState, contentState);

                    this.editor.setState({editorState});
                    this.sharedWithIds = data.event.sharedWithIds;
                    this.sharedWithNames = data.event.sharedWithNames;

                    var eventType = 'event';
                    switch(data.event.type) {
                        case 2:
                            eventType = 'todo';
                            break;
                        case 3:
                            eventType = 'task';
                            break;
                        default:
                            eventType = 'event';
                    }
                    this.setState({
                        sharedWithNames: data.event.sharedWithNames,
                        sharedWithIds: data.event.sharedWithIds,
                        editorTimeSet: true,
                        eventType : eventType,
                        taskPriority: data.event.priority
                    });
                    this.handleTimeChange(data.event.start_date_time, data.event.event_end_time);
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    /*
     * update a given event or a todo.
     */
    updateEvent() {

        const strDate = moment(this.props.curr_date).format('YYYY-MM-DD');
        const strTime = moment(this.state.defaultEventTime).format('HH:mm');
        const endTime = moment(this.state.defaultEventEndTime).format('HH:mm');
        const dateWithTime = moment(strDate + ' ' + strTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
        const endDateWithTime = moment(strDate + ' ' + endTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
        // const dateWithTime = this.state.defaultEventTime;

        if(dateWithTime < moment().format('YYYY-MM-DD HH:mm')) {
            this.setState({errorMsg : 'Please add a future date and time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        if(endDateWithTime < dateWithTime) {
            this.setState({errorMsg : 'Event end time should be greater than start time'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        const Editor = this.editor.state.editorState;
        const contentState = this.editor.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        const plainText = contentState.getPlainText();

        // front-end alidations
        if(!plainText) {
            this.setState({errorMsg : 'Please add the event description'});
            this.toggleMsg();
            setTimeout(this.toggleMsg, 3000);
            return;
        }

        let _priority = this.state.taskPriority;
        if(this.state.eventType == 'task' && plainText.indexOf('!') != -1) {
            if(plainText.includes("!1") && _priority != 1) {
                _priority = 1;
            }
            if(plainText.includes("!2") && _priority != 2) {
                _priority = 2;
            }
            if(plainText.includes("!3") && _priority != 3) {
                _priority = 3;
            }
        }

        // get shared users from SharedUsers field
        const sharedUsers = this.sharedWithIds;
        const postData = {
            description : editorContentRaw,
            plain_text : plainText,
            type : this.state.eventType,
            apply_date : dateWithTime,
            event_time : moment(dateWithTime).format('HH:mm'),
            event_end_time : moment(endDateWithTime).format('HH:mm'),
            shared_users : sharedUsers,
            id : this.props.editEventId,
            priority : this.state.eventType == 'task' ? _priority : 0
        };

        $.ajax({
            url: '/calendar/update',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(postData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){

                const editorState = EditorState.push(this.editor.state.editorState, ContentState.createFromText(''));
                this.editor.setState({editorState});

                if(typeof sharedUsers != 'undefined' && sharedUsers.length > 0) {
                    let _notificationData = {
                        cal_event_id:postData.id,
                        notification_type:data.event_time.isTimeChanged == true ? "calendar_schedule_time_changed" : "calendar_schedule_updated",
                        notification_sender:this.loggedUser,
                        notification_receivers:data.shared_users
                    };

                    Socket.sendCalendarShareNotification(_notificationData);
                }

                this.resetEventForm();
                this.loadWeekData();
                this.setTagged();
                this.props.handleClose();
            }
        }.bind(this));
    }

    loadWeekData() {
        // load data
        let week_start = moment(this.props.week_startDt).format('YYYY-MM-DD');
        let week_end = moment(this.props.week_startDt).weekday(7).format('YYYY-MM-DD');

        let postData = {
            start_date:week_start,
            end_date:week_end
        };
        this.props.loadData(postData);
    }

    resetEventForm() {
        //if(this.state.showUserPanelWindow) {
        //    this.state.sharedWithNames = [];
        //    this.state.sharedWithIds = [];
        //}

        this.setState({
            sharedWithNames: [],
            sharedWithIds: [],
            showUserPanel:'',
            showTimePanel:'',
            showUserPanelWindow: false,
            showTimePanelWindow: false,
            defaultEventTime: moment(this.props.curr_date).format('YYYY-MM-DD HH:mm'),
            defaultEventEndTime: moment(this.props.curr_date).format('YYYY-MM-DD HH:mm'),
            isButtonDisabled: false,
            editorTimeSet:false,
            taskPriority:0
        });
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.refs.timepicker_overlay.hide();

    }

    setTaskPriority(priorityNumber) {
        this.setState({taskPriority:priorityNumber});
    }

    render() {

        const showSecond = false;

        /*
         this loads editor font styling popover
         */
        const typoPopover = (
            <Popover id="calendar-popover-typo">
                <div className="menu-ico">
                    <p>
                        <span className="bold" onClick={this._onBoldClick.bind(this)}>B</span>
                    </p>
                </div>
                <div className="menu-ico">
                    <p>
                        <span className="italic" onClick={this._onItalicClick.bind(this)}>I</span>
                    </p>
                </div>
                <div className="menu-ico">
                    <p>
                        <span className="underline" onClick={this._onUnderLineClick.bind(this)}>U</span>
                    </p>
                </div>
            </Popover>
        );

        /*
         this loads start time and end time popover
         */
        const timePopover = (
            <Popover id="popover-positioned-scrolling-bottom" className="calendar-time-popover">
                <TimePicker
                    overlayHide={this.overlayHide.bind(this)}
                    setTimePickerTimeChange={this.setTimePickerTimeChange.bind(this)}
                    doTimePickerValidation={this.doTimePickerValidation.bind(this)}
                    defaultEventTime={this.state.defaultEventTime}
                    defaultEventEndTime={this.state.defaultEventEndTime}
                />
            </Popover>
        );

        let shared_with_list = [];
        let _this = this;
        if(this.state.sharedWithNames.length > 0){
            shared_with_list = this.state.sharedWithNames.map((name,key)=>{
                // return <span key={key} className="user selected-users">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{_this.removeUser(key, name)}}></i></span>
                return <span key={key} className="person selected">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key, name)}}></i></span>
            });
        // } else {
        //     shared_with_list = <span className="user-label">Only me</span>
        }

        let _sTime = moment(this.state.defaultEventTime).format('hh:mm a');
        let _eTime = moment(this.state.defaultEventEndTime).format('hh:mm a');

        return(
            <ModalContainer zIndex={9999}>
                <ModalDialog className="modalPopup">
                    <div className="popup-holder week-view-editor-popup-holder">
                        <div className="calendar-week-popup-wrapper">
                            <div className="model-header">
                                <div className="model-title-wrapper">
                                    <div className="model-title-inner-wrapper week-popup">
                                        <h4 className={this.state.eventType + " modal-title"}>{this.state.eventType == 'todo' ? 'to-do' : this.state.eventType }</h4>
                                        <span className="calender-popup-closeBtn" onClick={this.props.handleClose}></span>
                                    </div>
                                </div>
                            </div>
                            <div className="model-body">
                                <div className="calendar-date-wrapper">
                                    <h4>{this.props.curr_date.format('dddd')}</h4>
                                    <p>{this.props.curr_date.format('DD')}</p>
                                </div>
                                <div className="calendar-input-area">
                                    {this.state.getEditor ?
                                        <EditorField
                                            ref={(element) => { this.editor = element; }}
                                            setTime={this.setTime.bind(this)}
                                            setSharedUsers={this.setSharedUsers.bind(this)}
                                            removeUsersByName={this.removeUsersByName.bind(this)}
                                            calendarOrigin={this.props.calendarOrigin}
                                            groupId={this.props.groupId}
                                            eventType={this.state.eventType}
                                            setTaskPriority={this.setTaskPriority.bind(this)}
                                            />
                                    : null }
                                    <div className="tag-wrapper clearfix">
                                        <div className={this.state.tagged + " people-wrapper"}  >
                                            <p className="title" onClick={this._onHashClick.bind(this)}>People in the {this.state.eventType} &#58;</p>
                                            <div className="people-container">
                                                {shared_with_list}
                                                {this.state.showUserPanelWindow ?
                                                    <SharedUsers
                                                        setSharedUsersFromDropDown={this.setSharedUsersFromDropDown.bind(this)}
                                                        removeUser={this.removeUser}
                                                        sharedWithIds={this.state.sharedWithIds}
                                                        sharedWithNames={this.state.sharedWithNames}
                                                        calendarOrigin={this.props.calendarOrigin}
                                                        groupId={this.props.groupId}
                                                    />
                                                :
                                                    null
                                                }
                                            </div>
                                        </div>
                                        <div className="time-wrapper" >
                                            { /* this.state.showTimePanelWindow ?*/}
                                                {/*<Datetime*/}
                                                    {/*dateFormat={false}*/}
                                                    {/*onChange={this.handleTimeChange}*/}
                                                    {/*value={moment(this.state.defaultEventTime).format('LT')}/>*/}
                                            {/*:*/}
                                                {/*null*/}
                                            <div className="main-div">
                                                <OverlayTrigger rootClose container={this} trigger="click" placement="bottom" overlay={timePopover} ref="timepicker_overlay">
                                                    {this.state.editorTimeSet == true ?
                                                        <p className="selected-time">{_sTime} - {_eTime}</p> :
                                                        <p className="title"  onClick={this._onAtClick.bind(this)}>Time &#58;</p>
                                                    }
                                                </OverlayTrigger>
                                            </div>
                                            {
                                                (this.state.eventType == "task" && this.state.taskPriority > 0 && this.state.taskPriority <= 3) ?
                                                    <div className="main-div">
                                                        <p className="title">Task Priority &#58; <span style={{"color": "#ff0000"}}>&#33;{this.state.taskPriority}</span></p>
                                                    </div> : null
                                            }
                                            { /* this.state.showTimePanelWindow ?
                                                <TimePicker
                                                    style={{ width: 100 }}
                                                    showSecond={showSecond}
                                                    onChange={this.handleTimeChange}
                                                    placeholder="00:00"
                                                />
                                            :
                                                null
                                            */ }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="model-footer">
                                <div className="input-items-outer-wrapper">
                                    <ul className="input-items-wrapper">
                                        <li>
                                            <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={typoPopover}>
                                                <span className="ico font_style">B</span>
                                            </OverlayTrigger>
                                        </li>
                                        <li onClick={this._onHashClick.bind(this)}>
                                            <span className="ico tag" >#</span>
                                        </li>

                                        <li onClick={this._onAtClick.bind(this)}>
                                            <span  >
                                                <i className="fa fa-at  ico time" aria-hidden="true"></i>
                                            </span>
                                        </li>
                                        <li className="btn-group">
                                            <button
                                                type="button"
                                                className={"btn event "+(this.state.eventType == 'event' ? "active" : null)}
                                                onClick={() => this.changeEventType('event')}
                                                >
                                                <i className="fa fa-calendar" aria-hidden="true"></i> Event
                                            </button>
                                            {(this.props.isGroupCall == false) ?
                                                <button
                                                    type="button"
                                                    className={"btn todo "+(this.state.eventType == 'todo' ? "active" : null)}
                                                    onClick={() => this.changeEventType('todo')}
                                                    >
                                                    <i className="fa fa-wpforms" aria-hidden="true"></i> To-do
                                                </button>
                                            :
                                                <button
                                                    type="button"
                                                    className={"btn task "+(this.state.eventType == 'task' ? "active" : null)}
                                                    onClick={() => this.changeEventType('task')}
                                                    >
                                                    <i className="fa fa-wpforms" aria-hidden="true"></i> Tasks
                                                </button>
                                            }
                                        </li>
                                        <li className="post">
                                            { this.props.editOn == false ?
                                                <button className="menu-ico-txt btn" disabled={this.state.isButtonDisabled} onClick={this.addEvent}>
                                                    <span className="fly-ico"></span> Enter
                                                </button>
                                                :
                                                <button className="menu-ico-txt btn" onClick={this.updateEvent.bind(this)}>
                                                    <span className="fly-ico"></span> Update
                                                </button>
                                            }
                                        </li>
                                    </ul>
                                    <div className="msg-holder pull-left">
                                        {this.state.msgOn ?
                                            <p className="text-danger">{this.state.errorMsg}</p>
                                        : null }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}
