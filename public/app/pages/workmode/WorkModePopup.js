/**
 * WorkModePopup Component
 */
import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import WorkMode from '../../middleware/WorkMode';

export default class WorkModePopup extends React.Component {
    constructor(props) {
        super(props);

        if (Session.getSession('prg_lg') == null) {
            window.location.href = "/";
        }

        this.state = {
            is_work_mode_active: false,
            selectedList: [],
            selected_option: "",
            customTime: {hours: 'hh', mins: 'mm'},
            start_time: null,
            end_time: null,
            errorMessage: '',

            remainingTime: {
                hours: '00',
                mins: '00',
                secs: '00'
            },

            _prg_wm: null
        };

        this._isMounted = false;
        this.checkRemainingTimeInterval = null;
        this.listenToWMSocket();

    }

    componentDidMount() {
        let _this = this, _wmData = WorkMode.getWorkMode();
        this._isMounted = true;
        this.setState({_prg_wm: _wmData}, function () {
           this.checkRemainingTimeInterval = null;
           this.changeStates();
        });
    }

    componentWillUnmount() {
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
        this._isMounted = false;
    }

    changeStates(){
            let _this = this, _prg_wm = this.state._prg_wm;

            if (_prg_wm != null && _prg_wm != '') {
                let selectedList = [], selected_option = "", customTime = {hours: '1', mins: '00'};

                if (_prg_wm.news_feed.is_active) {
                    selectedList.push("news_feed")
                }
                if (_prg_wm.calls) {
                    selectedList.push("calls")
                }
                if (_prg_wm.messages) {
                    selectedList.push("msg")
                }
                if (_prg_wm.social_notifications) {
                    selectedList.push("social_notifications")
                }
                if (_prg_wm.all_notifications) {
                    selectedList.push("all_notifications")
                }
                if (selectedList.length == 5) {
                    selectedList.push("all")
                }

                if (_prg_wm.selected_option) {
                    let _option = _prg_wm.selected_option;
                    if(_option == 'custom') {
                        let diff = Moment.utc(Moment.utc(_prg_wm.end_time,"YYYY-MM-DD HH:mm").diff(Moment.utc(_prg_wm.start_time,"YYYY-MM-DD HH:mm")));
                        customTime = {
                            hours: Moment.utc(diff).format("HH"),
                            mins: Moment.utc(diff).format("mm")
                        };
                    }
                    this.setState({selected_option: _option, start_time: _prg_wm.start_time, end_time: _prg_wm.end_time, customTime: customTime});
                } else{
                    this.setState({selected_option: selected_option, start_time: null, end_time: null, customTime: {hours: '1', mins: '00'}});
                }

                this.setState({selectedList: selectedList, is_work_mode_active: _prg_wm.is_work_mode_active}, function () {
                    if( _prg_wm.is_work_mode_active) {
                        _this.checkRemainingTimeInterval = setInterval(function () {
                            _this.checkRemainingTime();
                        }, 1000);
                    }
                });
            }

    }

    onBlockedModeSelect(e) {
        let checkbox = e.target.value, selectedList = this.state.selectedList;
        let checkBoxArray = ["newsfeed", "calls", "msg", "social_notifications", "all_notifications", "all"];
        let hasCheckedIndex = selectedList.indexOf(checkbox);
        let allCheckedIndex = selectedList.indexOf('all');

        if (hasCheckedIndex > -1) {
            selectedList.splice(hasCheckedIndex, 1);
            if (checkbox !== 'all') {
                if (allCheckedIndex > -1 && selectedList.length < 6) {
                    selectedList.splice(selectedList.indexOf("all"), 1);
                }
            } else {
                selectedList = [];
            }

        } else {
            selectedList.push(checkbox);
            if (checkbox == 'all' && selectedList.indexOf("all") > -1 && selectedList.length < 6) {
                for (let i in checkBoxArray) {
                    if (selectedList.indexOf(checkBoxArray[i]) == -1) {
                        selectedList.push(checkBoxArray[i]);
                    }
                }
            }
        }

        let workModeErrorDetected = (this.state.errorMessage == "Please Select Work Mode" || this.state.errorMessage == "Work Mode time out") ? '' : this.state.errorMessage;
        this.setState({selectedList: selectedList, errorMessage: workModeErrorDetected});
    }

    onTimeOptionSelected(e) {
        let checkbox = e.target.value, customTime = this.state.customTime;
        let timeErrorDetected = (this.state.errorMessage == "Please Select Time" || this.state.errorMessage == "Work Mode time out") ? '' : this.state.errorMessage;
        let _time = 0;
        if (checkbox == "30") {
            _time = 30, customTime ={
                hours: '1',
                mins: '00',
            };
        } else if (checkbox == "120") {
            _time = 120, customTime ={
                hours: '1',
                mins: '00',
            };
        }else {
            customTime ={
                hours: 'hh',
                mins: 'mm'
            };
        }
        this.setState({selected_option: checkbox, customTime: customTime, errorMessage: timeErrorDetected});
    }

    onTimeChange(e) {

        let timeField = e.target.name;
        let timeFieldValue = e.target.value;
        let customTime = this.state.customTime;
        let currSpinerH = customTime.hours;

        if (timeField == "hours") {
            if (timeFieldValue <= 12) {
                timeFieldValue = e.target.value.substring(0, 2);
                customTime.hours = timeFieldValue;
                this.setState({customTime: customTime});
            }
        }

        if (timeField == "mins") {
            if (timeFieldValue == 60) {
                if(currSpinerH < 12){
                    timeFieldValue = e.target.value.substring(0, 2);
                    currSpinerH = parseInt(currSpinerH) + 1;
                    customTime = {
                        hours: currSpinerH,
                        mins: '0'
                    };
                    this.setState({customTime: customTime});
                }
            }

            if (timeFieldValue <= 59) {
                timeFieldValue = e.target.value.substring(0, 2);
                customTime.mins = timeFieldValue;
                this.setState({customTime: customTime});
            }
        }

    }

    onWorkModeSet(){
        let {selectedList, selected_option, customTime} = this.state, _start_time = Moment.utc(), _end_time, data, _this = this;

        if (selectedList.length <= 0) {
            this.setState({errorMessage: "please select work mode"});
            return false;
        }

        if(selected_option != "30" && selected_option != "120" && selected_option != "custom"){
            this.setState({errorMessage: "please select a time option"});
            return false;
        }

        if(selected_option == "30"){
            _end_time = Moment.utc(_start_time).add(30, 'minutes');
        }else if(selected_option == "120"){
            _end_time = Moment.utc(_start_time).add(2 , 'hours');
        }else if(selected_option == "custom"){
            if(customTime.hours == "hh" || customTime.mins == "mm"|| customTime.hours == "" || customTime.mins == "" ||
                (customTime.hours > 12 || customTime.hours < 0 ) || (customTime.mins > 59 || customTime.mins < 0 ) ){
                this.setState({errorMessage: "please enter a valid time"});
                return false;
            }
            _end_time = Moment.utc(_start_time).add(customTime.hours, 'hours').add(customTime.mins, 'minutes');
        }

        var _wm = {
            is_work_mode_active: true,
            news_feed: (selectedList.indexOf("news_feed") != -1 || selectedList.indexOf("all") != -1) ?
                                                    {is_active: true, scheduler: "", start_time: "", end_time: ""} : {is_active: false, scheduler: "", start_time: "", end_time: ""},
            calls: (selectedList.indexOf("calls") != -1 || selectedList.indexOf("all") != -1) ? true : false,
            messages: (selectedList.indexOf("msg") != -1 || selectedList.indexOf("all") != -1) ? true : false,
            social_notifications: (selectedList.indexOf("social_notifications") != -1 ||
                                    selectedList.indexOf("all_notifications") != -1 || selectedList.indexOf("all") != -1) ? true : false,
            all_notifications: (selectedList.indexOf("all_notifications") != -1 || selectedList.indexOf("all") != -1) ? true : false,
            selected_option: selected_option,
            start_time: Moment(_start_time).format(),
            end_time: Moment(_end_time).format()
        };

        this.setState({start_time: _start_time, end_time: _end_time, is_work_mode_active: true, selected_option: _wm.selected_option}, function(){
            WorkMode.setWorkMode(_wm);
            _this.props.closePopUp();
        });

    }

    onDeactivateWorkMode(){
        WorkMode.deactivateWorkMode();
        this.props.closePopUp();
    }

    checkRemainingTime() {
        let timeLeft = WorkMode.getRemainingTime();

        this.setState({
            remainingTime: {
                hours: timeLeft.format("HH"),
                mins: timeLeft.format("mm"),
                secs: timeLeft.format("ss")
            }
        });

        // console.log(timeLeft.format("HH") + " " + timeLeft.format("mm") + " " + timeLeft.format("ss"));
    }

    listenToWMSocket() {
        let _this = this;
        Socket.listenToWorkModeStatus(function (data) {
            if(_this._isMounted) {
                _this.setState({_prg_wm: data}, function () {
                    clearInterval(_this.checkRemainingTimeInterval);
                    _this.checkRemainingTimeInterval = null;
                    _this.changeStates();
                });
            }
        });
    }

    render() {
        let {selectedList, selected_option, customTime, remainingTime, is_work_mode_active} = this.state;

        return (
            <div className="popup-holder">
                <div className={(is_work_mode_active)? "work-mode-popup-wrapper work-mode-active-popup-wrapper" : "work-mode-popup-wrapper"}>
                    <div className="header-wrapper">
                        <img src="../images/work-mode/logo.png" alt="" className="logo"/>
                        <p className="header">work mode</p>
                    </div>
                    {
                        (!is_work_mode_active) ?
                        <div className="content-wrapper">
                            <p className="inner-header">what distractions can we rid you of?</p>
                            <div className="components-wrapper">

                                <div className="option-selector-wrapper">
                                    <div
                                        className={(selectedList.includes("news_feed") || selectedList.includes("all")) ? "option news-feed selected" : "option news-feed"}>
                                        <div className="inner-holder clearfix">
                                            <input type="checkbox" name="workmode_option" value="news_feed"
                                                   id="news_feed-block-check"
                                                   onChange={(event)=> {
                                                       this.onBlockedModeSelect(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selectedList.includes("news_feed") || selectedList.includes("news_feed")) ? true : false }/>
                                            <label htmlFor="news_feed-block-check" className="selector-label">
                                                <div className="select-content clearfix">
                                                    <img src="../images/work-mode/newsfeed.png"
                                                         className="type-icon"/>
                                                    <div className="type-content">
                                                        <p className="type-title">news_feed</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={(selectedList.includes("calls") || selectedList.includes("all")) ? "option calls selected" : "option calls"}>
                                        <div className="inner-holder clearfix">
                                            <input type="checkbox" name="workmode_option" value="calls"
                                                   id="calls-block-check"
                                                   onChange={(event)=> {
                                                       this.onBlockedModeSelect(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selectedList.includes("calls") || selectedList.includes("all")) ? true : false }/>
                                            <label htmlFor="calls-block-check" className="selector-label">
                                                <div className="select-content clearfix">
                                                    <img src="../images/work-mode/calls.png" className="type-icon"/>
                                                    <div className="type-content">
                                                        <p className="type-title">calls</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={(selectedList.includes("msg") || selectedList.includes("all")) ? "option messages selected" : "option messages"}>
                                        <div className="inner-holder clearfix">
                                            <input type="checkbox" name="workmode_option" value="msg"
                                                   id="msg-block-check"
                                                   onChange={(event)=> {
                                                       this.onBlockedModeSelect(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selectedList.includes("msg") || selectedList.includes("all")) ? true : false }/>
                                            <label htmlFor="msg-block-check" className="selector-label">
                                                <div className="select-content clearfix">
                                                    <img src="../images/work-mode/messages.png"
                                                         className="type-icon"/>
                                                    <div className="type-content">
                                                        <p className="type-title">messages</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={(selectedList.includes("social_notifications") || selectedList.includes("all")) ? "option social selected" : "option social"}>
                                        <div className="inner-holder clearfix">
                                            <input type="checkbox" name="workmode_option"
                                                   value="social_notifications"
                                                   id="social_notifications-block-check"
                                                   onChange={(event)=> {
                                                       this.onBlockedModeSelect(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selectedList.includes("social_notifications") || selectedList.includes("all")) ? true : false }/>
                                            <label htmlFor="social_notifications-block-check"
                                                   className="selector-label">
                                                <div className="select-content clearfix">
                                                    <img src="../images/work-mode/social.png"
                                                         className="type-icon"/>
                                                    <div className="type-content">
                                                        <p className="type-title">social notifications</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={(selectedList.includes("all_notifications") || selectedList.includes("all")) ? "option notifications selected" : "option notifications"}>
                                        <div className="inner-holder clearfix">
                                            <input type="checkbox" name="workmode_option"
                                                   id="notifications-block-check"
                                                   value="all_notifications"
                                                   onChange={(event)=> {
                                                       this.onBlockedModeSelect(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selectedList.includes("all_notifications") || selectedList.includes("all")) ? true : false }/>
                                            <label htmlFor="notifications-block-check" className="selector-label">
                                                <div className="select-content clearfix">
                                                    <img src="../images/work-mode/notifications.png"
                                                         className="type-icon"/>
                                                    <div className="type-content">
                                                        <p className="type-title">all notifications</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={selectedList.includes("all") ? "option all selected" : "option all"}>
                                        <div className="inner-holder clearfix">
                                            <input type="checkbox" name="workmode_option" value="all"
                                                   id="all-block-check"
                                                   onChange={(event)=> {
                                                       this.onBlockedModeSelect(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selectedList.includes("all")) ? true : false }/>
                                            <label htmlFor="all-block-check" className="selector-label">
                                                <div className="select-content clearfix">
                                                    <img src="../images/work-mode/all.png" className="type-icon"/>
                                                    <div className="type-content">
                                                        <p className="type-title">all</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="time-selector-wrapper">
                                    <div
                                        className={(selected_option == 30) ? "option selected" : "option"}>
                                        <div className="inner-holder clearfix">
                                            <input type="radio" name="workmode_option_time" id="mins" value="30"
                                                   onChange={(event)=> {
                                                       this.onTimeOptionSelected(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selected_option == 30) ? true : false}/>
                                            <label htmlFor="mins" className="selector-label">
                                                <div className="type-content">
                                                    <p className="type-title">30 min</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={(selected_option == 120) ? "option selected" : "option"}>
                                        <div className="inner-holder clearfix">
                                            <input type="radio" name="workmode_option_time" id="hours" value="120"
                                                   onChange={(event)=> {
                                                       this.onTimeOptionSelected(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selected_option == 120) ? true : false}/>
                                            <label htmlFor="hours" className="selector-label selected">
                                                <div className="type-content">
                                                    <p className="type-title">2 hours</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div
                                        className={(selected_option == "custom") ? "option selected" : "option"}>
                                        <div className="inner-holder clearfix">
                                            <input type="radio" name="workmode_option_time" id="custom"
                                                   value="custom"
                                                   onChange={(event)=> {
                                                       this.onTimeOptionSelected(event)
                                                   }}
                                                   disabled={is_work_mode_active}
                                                   checked={(selected_option == "custom") ? true : false}/>
                                            <label htmlFor="custom" className="selector-label">
                                                <div className="type-content">
                                                    <p className="type-title">custom</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    {
                                        (selected_option == "custom")?
                                            <div className="option custom-time">
                                                <input type="number" name="hours" className="t_input" min="1" max="12"
                                                       placeholder="hh" value={customTime.hours}
                                                       disabled={!(selected_option == "custom") || is_work_mode_active}
                                                       onChange={(event)=> {
                                                           this.onTimeChange(event)
                                                       }}/>
                                                <span className="colon top"></span>
                                                <span className="colon bottom"></span>
                                                <input type="number" name="mins" className="t_input" min="0" max="60"
                                                       placeholder="mm" value={customTime.mins}
                                                       disabled={!(selected_option == "custom") || is_work_mode_active}
                                                       onChange={(event)=> {
                                                           this.onTimeChange(event)
                                                       }}/>
                                            </div>
                                            :
                                            null
                                    }
                                </div>
                            </div>
                        </div> :
                        <div className="content-wrapper">
                            <p className="inner-header">#workmode is active for another: </p>
                            <div className="timer-wrapper">
                                {
                                    (remainingTime.hours != "00")?
                                        <div className="hour time">
                                            <p className="timer">{(remainingTime.hours.length == 2)? remainingTime.hours : "00"}</p>
                                            <p className="time-type">hours</p>
                                        </div>
                                        :
                                        null
                                }
                                <div className="minutes time">
                                    <p className="timer">{(remainingTime.mins.length == 2)? remainingTime.mins : "00"}</p>
                                    <p className="time-type">minutes</p>
                                </div>
                                {
                                    (remainingTime.hours == "00")?
                                        <div className="minutes time">
                                            <p className="timer">{(remainingTime.secs.length == 2)? remainingTime.secs : "00"}</p>
                                            <p className="time-type">seconds</p>
                                        </div>
                                        :
                                        null
                                }
                            </div>
                        </div>
                    }

                    {this.state.errorMessage  && this.state.errorMessage != '' ? <div className="wm-error clearfix">{this.state.errorMessage}</div> : null}

                    <div className="footer">
                        {is_work_mode_active ?
                            <button type="submit" className="btn work-mode" onClick={this.onDeactivateWorkMode.bind(this)}>
                                deactivate work mode</button>
                            :
                            <button type="submit" className="btn work-mode" onClick={this.onWorkModeSet.bind(this)}>
                                activate work mode</button>
                        }
                    </div>

                </div>
            </div>
        );
    }
}