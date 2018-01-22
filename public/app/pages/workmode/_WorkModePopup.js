/**
 * WorkModePopup Component
 */
import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import Session  from '../../middleware/Session';

export default class WorkModePopup extends React.Component {

    constructor(props) {
        super(props);

        if (Session.getSession('prg_lg') == null) {
            window.location.href = "/";
        }

        //this.cM = Moment().format("mm");
        let _sesData = Session.getSession('prg_wm');
        let _startTime = new Date().getTime();
        let _sesStartTime;
        let _sesHowLong;
        let _endTime;
        let timeLeft;
        let timeIn;
        if (_sesData) {
            _endTime = _sesData.endTime;
            timeLeft = _endTime - _startTime;
            if (timeLeft > 60000) {
                timeLeft = Moment.utc(timeLeft).format("DD HH mm");
                timeIn = "min";
            } else if (timeLeft < 60000 && timeLeft > 0) {
                timeLeft = Moment.utc(timeLeft).format("HH mm ss");
                timeIn = "sec";
            } else {
                timeLeft = undefined;
            }
            _sesStartTime = _sesData.startTimer;
            _sesHowLong = _sesData.howLong;
        }
        let isVisible = (typeof timeLeft == "undefined" || !timeLeft) ? false : true;
        let _this = this;
        this.checkRemainingTimeInterval = (isVisible === true) ? setInterval(function () {
            _this.checkRemainingTime()
        }, 1000) : null;

        this.state = {
            startDate: Moment(),
            customHours: '00',
            customMins: '00',
            selectedTime: 0,
            selectedTimeOption: '',
            blockedMode: "",
            timeBlockIsVisible: isVisible,
            timePeriod: Moment().format("A"),
            remainingTime: timeLeft,
            remainingTimeIn: timeIn,
            sesStartTime: _sesStartTime,
            sesHowLong: _sesHowLong,
            sesEndTime: _endTime,
            errorMessage:''
        };

        this.handleChange = this.handleChange.bind(this);
        this.showTimeOutMessage = this.showTimeOutMessage.bind(this);
        this.formatDate;
        this.selectedList = [];

    }

    componentDidMount() {
        if (Session.getSession('prg_wm') != null) {

            if(this.state.timeBlockIsVisible == false) {
                this.selectedList = [];
                Session.createSession("prg_wm", '');
                this.setState({sesStartTime: undefined, sesHowLong: undefined, sesEndTime: undefined, timeBlockIsVisible: false, selectedTimeOption: ''})
                return false;
            }

            let _prg_wm = Session.getSession('prg_wm');

            if (_prg_wm.rightBottom) {
                this.selectedList.push("bars")
            }
            if (_prg_wm.newsFeed) {
                this.selectedList.push("newsfeed")
            }
            if (_prg_wm.calls) {
                this.selectedList.push("calls")
            }
            if (_prg_wm.messages) {
                this.selectedList.push("msg")
            }
            if (_prg_wm.socialNotifications) {
                this.selectedList.push("social_notifications")
            }
            if (_prg_wm.allNotifications) {
                this.selectedList.push("all_notifications")
            }
            if (this.selectedList.length == 6) {
                this.selectedList.push("all")
            }
            if (_prg_wm.selectedTimeOption) {
                let _option = _prg_wm.selectedTimeOption;
                if(_option == 'custom') {
                    let _customHours = _prg_wm.customHours;
                    let _customMins = _prg_wm.customMins;

                    this.setState({selectedTimeOption: _option, customHours: _customHours, customMins: _customMins});
                } else {
                    this.setState({selectedTimeOption: _option});
                }
            }
        }
        //this.loadInterval = setInterval(this.loadSearches, this.props.pollInterval);
    }

    componentWillUnmount() {
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
    }

    checkRemainingTime() {

        let _sesData = Session.getSession('prg_wm');
        let _startTime = new Date().getTime();
        let _endTime;
        let timeLeft;
        let timeIn;
        if (_sesData) {
            _endTime = _sesData.endTime;
            timeLeft = _endTime - _startTime;
            if (timeLeft > 60000) {
                timeLeft = Moment.utc(timeLeft).format("DD HH mm");
                timeIn = "min";
            } else if (timeLeft < 60000 && timeLeft > 0) {
                timeLeft = Moment.utc(timeLeft).format("HH mm ss");
                timeIn = "sec";
            } else {
                timeLeft = undefined;
                clearInterval(this.checkRemainingTimeInterval);
                this.checkRemainingTimeInterval = null;
                this.setState({timeBlockIsVisible: true, errorMessage: "Work Mode time out"})
                //alert("Work Mode time out");
                this.showTimeOutMessage();
                //location.reload();

                return false;
            }
            this.setState({remainingTime: timeLeft, remainingTimeIn: timeIn});
        } else {
            //console.log("NO session data");
            clearInterval(this.checkRemainingTimeInterval);
            this.checkRemainingTimeInterval = null;
            this.setState({timeBlockIsVisible: true, errorMessage: "Work Mode time out"})
            //alert("Work Mode time out");
            this.showTimeOutMessage();

            //location.reload();

            //return false;
        }

    }

    showTimeOutMessage() {
        Session.createSession("prg_wm", '');
        this.selectedList = [];
        this.setState({sesStartTime: undefined, sesHowLong: undefined, sesEndTime: undefined, timeBlockIsVisible: false, selectedTimeOption: ''})

        //let _toastMessage = {
        //    visible: true,
        //    message:'Work Mode time out',
        //    type:'success'
        //};
        //
        //this.props.showMessage(_toastMessage);
    }

    onTimeChange(e) {

        let timeField = e.target.name;
        let timeFieldValue = e.target.value;
        let currSpinerH = this.state.customHours;

        if (timeField == "hours") {
            if (timeFieldValue <= 12) {
                timeFieldValue = e.target.value.substring(0, 2);
                this.setState({customHours: timeFieldValue});
            }
        }

        if (timeField == "mins") {
            if (timeFieldValue == 60) {
                timeFieldValue = e.target.value.substring(0, 2);
                currSpinerH = parseInt(currSpinerH) + 1;
                this.setState({customMins: 0, customHours: currSpinerH});
            }

            if (timeFieldValue <= 59) {
                timeFieldValue = e.target.value.substring(0, 2);
                this.setState({customMins: timeFieldValue});
            }
        }

    }

    onTimeOptionSelected(e) {
        let checkbox = e.target.value;
        let timeErrorDetected = (this.state.errorMessage == "Please Select Time" || this.state.errorMessage == "Work Mode time out") ? '' : this.state.errorMessage;
        let _time = 0;
        if (checkbox == "30") {
            _time = 30;
        } else if (checkbox == "120") {
            _time = 120;
        }
        this.setState({selectedTimeOption: checkbox, selectedTime: _time, errorMessage: timeErrorDetected});

    }

    onBlockedModeSelect(e) {
        let checkbox = e.target.value;
        let checkBoxArray = ["newsfeed", "calls", "msg", "social_notifications", "all_notifications", "all"];
        let hasCheckedIndex = this.selectedList.indexOf(checkbox);
        let allCheckedIndex = this.selectedList.indexOf('all');

        if (hasCheckedIndex > -1) {
            this.selectedList.splice(hasCheckedIndex, 1);
            if (checkbox !== 'all') {
                if (allCheckedIndex > -1 && this.selectedList.length < 6) {
                    this.selectedList.splice(this.selectedList.indexOf("all"), 1);
                }
            } else {
                this.selectedList = [];
            }

        } else {
            this.selectedList.push(checkbox);
            if (checkbox == 'all' && this.selectedList.indexOf("all") > -1 && this.selectedList.length < 6) {
                for (let i in checkBoxArray) {
                    if (this.selectedList.indexOf(checkBoxArray[i]) == -1) {
                        this.selectedList.push(checkBoxArray[i]);
                    }
                }
            }
        }

        //console.log(this.selectedList);
        let workModeErrorDetected = (this.state.errorMessage == "Please Select Work Mode" || this.state.errorMessage == "Work Mode time out") ? '' : this.state.errorMessage;
        this.setState({blockedMode: this.selectedList, errorMessage: workModeErrorDetected});
    }

    handleChange(date) {
        this.setState({
            startDate: date
        });

        this.formatDate = date.format("YYYY-MM-DD");
    }

    onCancelTimeClick() {
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
        this.setState({sesStartTime: undefined, sesHowLong: undefined, sesEndTime: undefined, timeBlockIsVisible: true})
    }

    onWorkModeSet(e) {

        this.onTimeSet();

        let data;

        if (this.selectedList.length >= 1) {
            if (this.formatDate == 'undefined') {
                //console.log("not set");
                this.formatDate = Moment().format("YYYY-MM-DD");
            }
            data = {
                mode: this.selectedList,
                time: this.state.selectedTime,
                date: {
                    day: this.formatDate,
                    hh: this.state.customHours,
                    mm: this.state.customMins,
                    period: this.state.timePeriod
                }
            }
        } else {
            e.preventDefault();
            //alert("Please Select Work Mode");
            this.setState({errorMessage: "Please Select Work Mode"});
            return false;
        }
        //console.log(data);

        let _startTime = (this.state.sesStartTime) ? this.state.sesStartTime : new Date().getTime();
        let howLong = (this.state.sesHowLong) ? this.state.sesHowLong : 0;
        let _endTime = (this.state.sesEndTime) ? this.state.sesEndTime : _startTime + howLong;

        if (howLong == 0) {
            if (data.time != 0) {
                howLong = data.time * 60 * 1000;
                _endTime = _startTime + howLong;
            } else {
                let now = Moment().format('YYYY-MM-DD HH:mm a');
                let toFormat = Moment(data.date.day + ' ' + data.date.hh + ':' + data.date.mm + ' ' + data.date.period, "YYYY-MM-DD HH:mm a");

                howLong = toFormat.diff(now);

                if (howLong <= 0) {
                    e.preventDefault();
                    //alert("Please Select Time");
                    this.setState({errorMessage: "Please Select Time"});
                    return false;
                }
                //console.log(howLong);
                _endTime = _startTime + howLong;
            }

        }

        var _wm = {
            rightBottom: (data.mode.indexOf("bars") != -1 || data.mode.indexOf("all") != -1) ? true : false,
            newsFeed: (data.mode.indexOf("newsfeed") != -1 || data.mode.indexOf("all") != -1) ? true : false,
            calls: (data.mode.indexOf("calls") != -1 || data.mode.indexOf("all") != -1) ? true : false,
            messages: (data.mode.indexOf("msg") != -1 || data.mode.indexOf("all") != -1) ? true : false,
            socialNotifications: (data.mode.indexOf("social_notifications") != -1 || data.mode.indexOf("all") != -1) ? true : false,
            allNotifications: (data.mode.indexOf("all_notifications") != -1 || data.mode.indexOf("all") != -1) ? true : false,
            selectedTimeOption: this.state.selectedTimeOption,
            startTimer: _startTime,
            howLong: howLong,
            endTime: _endTime,
            customHours: this.state.customHours,
            customMins: this.state.customMins
        };

        Session.createSession("prg_wm", _wm);

        this.setState({sesStartTime: _startTime, sesHowLong: howLong, sesEndTime: _endTime, timeBlockIsVisible: true, selectedTimeOption: _wm.selectedTimeOption})

        //it must be at the end. because to create session form must get posted
        e.preventDefault(); //can uncomment if we find a way to hide footer & right bar without refresh.
        this.props.closePopUp();
        //location.reload();
    }

    onWorkModeRemove(e) {
        this.selectedList = [];
        //Session.destroy("prg_wm");
        Session.createSession("prg_wm", '');
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
        this.setState({sesStartTime: undefined, sesHowLong: undefined, sesEndTime: undefined, timeBlockIsVisible: false, selectedTimeOption: '', customHours: '00', customMins: '00'})
        //this.props.closePopUp();
    }

    onTimeSummeryClick() {
        this.setState({timeBlockIsVisible: true});
    }

    onTimeSet() {
        let howLong;
        let timeLeft;
        let time = this.state.selectedTime;
        let _startTime = new Date().getTime();
        let _endTime;

        if (time != 0) {
            howLong = time * 60 * 1000;
            _endTime = Moment().add(howLong, 'ms').format("x");
            timeLeft = _endTime - _startTime;
            timeLeft = Moment.utc(timeLeft).format("DD HH mm");
        } else {
            if (this.formatDate == undefined) {
                this.formatDate = Moment().format("YYYY-MM-DD");
            }
            let now = Moment().format('YYYY-MM-DD HH:mm a');
            let toFormat = Moment(this.formatDate + ' ' + this.state.customHours + ':' + this.state.customMins + ' ' + this.state.timePeriod, "YYYY-MM-DD HH:mm a");
            howLong = toFormat.diff(now);
            timeLeft = Moment.utc(howLong).format("DD HH mm");
        }
        this.setState({timeBlockIsVisible: false, remainingTime: timeLeft});
    }

    onPeriodChange(e) {
        let selectedPeriod = e.target.value;
        this.setState({timePeriod: selectedPeriod});
    }

    render() {

        let timeLeft = this.state.remainingTime;
        let timeIn = this.state.remainingTimeIn;
        let days, hrs, mins, sec;
        if (timeLeft) {
            timeLeft = timeLeft.split(" ");
            if (timeIn == "min") {
                days = timeLeft[0];
                hrs = timeLeft[1];
                mins = timeLeft[2];
                if (days == "01") {
                    days = "";
                } else {
                    days = days + "'days ";
                }
            } else {
                hrs = timeLeft[0];
                mins = timeLeft[1];
                sec = timeLeft[2];
                if (mins == "0") {
                    mins = "";
                } else {
                    mins = mins + "'minutes ";

                }
            }

            if (hrs == "0") {
                hrs = "";
            } else {
                hrs = hrs + "'hours ";
            }

        }

        return (
            <div className="popup-holder">
                <div className="work-mode-popup-wrapper">
                    <div className="header-wrapper">
                        <img src="../images/work-mode/logo.png" alt="" className="logo"/>
                        <p className="header">work mode</p>
                    </div>

                    <div className="content-wrapper">
                        <p className="inner-header">what distractions can we rid you of?</p>

                        <div className="components-wrapper">

                            <div className="option-selector-wrapper">
                                <div
                                    className={(this.selectedList.includes("newsfeed") || this.selectedList.includes("all")) ? "option news-feed selected" : "option news-feed"}>
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" value="newsfeed"
                                               id="newsfeed-block-check"
                                               onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                               disabled={this.state.timeBlockIsVisible}/>
                                        <label htmlFor="newsfeed-block-check" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="../images/work-mode/newsfeed.png" className="type-icon"/>
                                                <div className="type-content">
                                                    <p className="type-title">newsfeed</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div
                                    className={(this.selectedList.includes("calls") || this.selectedList.includes("all")) ? "option calls selected" : "option calls"}>
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" value="calls"
                                               id="calls-block-check"
                                               onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.selectedList.includes("calls") || this.selectedList.includes("all"))? true : false }/>
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
                                    className={(this.selectedList.includes("msg") || this.selectedList.includes("all")) ? "option messages selected" : "option messages"}>
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" value="msg" id="msg-block-check"
                                               onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.selectedList.includes("msg") || this.selectedList.includes("all"))? true : false }/>
                                        <label htmlFor="msg-block-check" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="../images/work-mode/messages.png" className="type-icon"/>
                                                <div className="type-content">
                                                    <p className="type-title">messages</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div
                                    className={(this.selectedList.includes("social_notifications") || this.selectedList.includes("all")) ? "option social selected" : "option social"}>
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" value="social_notifications"
                                               id="social_notifications-block-check"
                                               onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.selectedList.includes("social_notifications") || this.selectedList.includes("all"))? true : false }/>
                                        <label htmlFor="social_notifications-block-check" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="../images/work-mode/social.png" className="type-icon"/>
                                                <div className="type-content">
                                                    <p className="type-title">social notifications</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div
                                    className={(this.selectedList.includes("all_notifications") || this.selectedList.includes("all")) ? "option notifications selected" : "option notifications"}>
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" id="notifications-block-check"
                                               disabled={this.state.timeBlockIsVisible ? "true": "false"}
                                               value="all_notifications"
                                               onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.selectedList.includes("all_notifications") || this.selectedList.includes("all"))? true : false }/>
                                        <label htmlFor="notifications-block-check" className="selector-label">
                                            <div className="select-content clearfix">
                                                <img src="../images/work-mode/notifications.png" className="type-icon"/>
                                                <div className="type-content">
                                                    <p className="type-title">all notifications</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div
                                    className={this.selectedList.includes("all") ? "option all selected" : "option all"}>
                                    <div className="inner-holder clearfix">
                                        <input type="checkbox" name="workmode_option" value="all" id="all-block-check"
                                               onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.selectedList.includes("all"))? true : false }/>
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
                                <div className={(this.state.selectedTimeOption == 30)? "option selected" : "option"}>
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="workmode_option_time" id="mins" value="30"
                                               onChange={(event)=>{ this.onTimeOptionSelected(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.state.selectedTimeOption == 30)? true : false}/>
                                        <label htmlFor="mins" className="selector-label">
                                            <div className="type-content">
                                                <p className="type-title">30 min</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className={(this.state.selectedTimeOption == 120)? "option selected" : "option"}>
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="workmode_option_time" id="hours" value="120"
                                               onChange={(event)=>{ this.onTimeOptionSelected(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.state.selectedTimeOption == 120)? true : false}/>
                                        <label htmlFor="hours" className="selector-label selected">
                                            <div className="type-content">
                                                <p className="type-title">2 hours</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div
                                    className={(this.state.selectedTimeOption == "custom")? "option selected" : "option"}>
                                    <div className="inner-holder clearfix">
                                        <input type="radio" name="workmode_option_time" id="custom" value="custom"
                                               onChange={(event)=>{ this.onTimeOptionSelected(event)}}
                                               disabled={this.state.timeBlockIsVisible}
                                               checked={(this.state.selectedTimeOption == "custom")? true : false}/>
                                        <label htmlFor="custom" className="selector-label">
                                            <div className="type-content">
                                                <p className="type-title">custom</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="option custom-time">
                                    <input type="number" name="hours" className="t_input" min="1" max="24"
                                           placeholder="hh" value={this.state.customHours}
                                           disabled={this.state.timeBlockIsVisible}
                                           onChange={(event)=>{this.onTimeChange(event)}}/>
                                    <span className="colon top"></span>
                                    <span className="colon bottom"></span>
                                    <input type="number" name="mins" className="t_input" min="0" max="60"
                                           placeholder="mm" value={this.state.customMins}
                                           disabled={this.state.timeBlockIsVisible}
                                           onChange={(event)=>{this.onTimeChange(event)}}/>
                                </div>
                            </div>



                        </div>

                    </div>

                    {this.state.errorMessage  && this.state.errorMessage != '' ? <div className="wm-error clearfix">{this.state.errorMessage}</div> : null}

                    <div className="footer">
                        {this.state.timeBlockIsVisible ?
                            <button type="submit" className="btn work-mode" onClick={this.onWorkModeRemove.bind(this)}>
                                deactivate work mode</button>
                            :
                            <button type="submit" className="btn work-mode" onClick={this.onWorkModeSet.bind(this)}>
                                activate work mode</button>
                        }
                    </div>

                </div>
            </div>
        )

    }


}