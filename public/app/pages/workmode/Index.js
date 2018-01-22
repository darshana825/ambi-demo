import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import Session  from '../../middleware/Session';

require('react-datepicker/dist/react-datepicker.css');

export default class Index extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.tPeriod = Moment().format("A");
        this.cH = Moment().format("hh");
        this.cM = Moment().format("mm");
        let _sesData = Session.getSession('prg_wm');
        let _startTime = new Date().getTime();
        let _sesStartTime;
        let _sesHowLong;
        let _endTime;
        let timeLeft;
        let timeIn;
        if(_sesData){
            _endTime = _sesData.endTime;
            timeLeft = _endTime - _startTime;
            if(timeLeft > 60000){
                timeLeft =  Moment.utc(timeLeft).format("DD HH mm");
                timeIn = "min";
            }else if(timeLeft < 60000 && timeLeft > 0) {
                timeLeft =  Moment.utc(timeLeft).format("HH mm ss");
                timeIn = "sec";
            } else{
                timeLeft = undefined;
            }
            _sesStartTime = _sesData.startTimer;
            _sesHowLong = _sesData.howLong;
        }
        let isVisible = (timeLeft)? false : true;
        let _this = this;
        this.checkRemainingTimeInterval = (timeLeft)?setInterval(function(){_this.checkRemainingTime()}, 1000):null;

        this.state={
            startDate: Moment(),
            customHours: this.cH,
            customMins: this.cM,
            selectedTimeOpt: 0,
            blockedMode: "",
            timeBlockIsVisible: isVisible,
            timePeriod: this.tPeriod,
            remainingTime: timeLeft,
            remainingTimeIn:timeIn,
            sesStartTime:_sesStartTime,
            sesHowLong:_sesHowLong,
            sesEndTime:_endTime
        };

        this.handleChange = this.handleChange.bind(this);
        this.formatDate;
        this.selectedList = [];

        if(Session.getSession('prg_wm') != null){

            if(Session.getSession('prg_wm').rightBottom){this.selectedList.push("bars")}
            if(Session.getSession('prg_wm').newsFeed){this.selectedList.push("newsfeed")}
            if(Session.getSession('prg_wm').calls){this.selectedList.push("calls")}
            if(Session.getSession('prg_wm').messages){this.selectedList.push("msg")}
            if(Session.getSession('prg_wm').socialNotifications){this.selectedList.push("notifications")}
            if(this.selectedList.length == 5){this.selectedList.push("all")}

        }

    }

    componentDidMount() {
        console.log("componentDidMount")
        //this.loadInterval = setInterval(this.loadSearches, this.props.pollInterval);
    }

    componentWillUnmount () {
        console.log("componentWillUnmount")
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
    }

    checkRemainingTime(){
        //console.log("checkRemainingTime");
        let _sesData = Session.getSession('prg_wm');
        let _startTime = new Date().getTime();
        let _endTime;
        let timeLeft;
        let timeIn;
        if(_sesData){
            _endTime = _sesData.endTime;
            timeLeft = _endTime - _startTime;
            if(timeLeft > 60000){
                timeLeft =  Moment.utc(timeLeft).format("DD HH mm");
                timeIn = "min";
            }else if(timeLeft < 60000 && timeLeft > 0) {
                timeLeft =  Moment.utc(timeLeft).format("HH mm ss");
                timeIn = "sec";
            } else{
                this.setState({timeBlockIsVisible:true})
                timeLeft = undefined;
                clearInterval(this.checkRemainingTimeInterval);
                this.checkRemainingTimeInterval = null;
                alert("Work Mode time out");
                location.reload();
            }
            this.setState({remainingTime:timeLeft, remainingTimeIn:timeIn});
        } else{
            this.setState({timeBlockIsVisible:true})
            console.log("NO session data")
            clearInterval(this.checkRemainingTimeInterval);
            this.checkRemainingTimeInterval = null;
            alert("Work Mode time out");
            location.reload();
        }

    }

    onTimeChange(e){
        let timeField = e.target.name;
        let timeFieldValue = e.target.value;
        let currSpinerH = this.state.customHours;
        let currSpinerM = this.state.customMins;

        if(timeField == "hours"){
            if(timeFieldValue <= 12){
                timeFieldValue = e.target.value.substring(0,2);
                this.setState({customHours: timeFieldValue});
            }
        }

        if(timeField == "mins"){
            if(timeFieldValue == 60){
                timeFieldValue = e.target.value.substring(0,2);
                currSpinerH = parseInt(currSpinerH) + 1;
                this.setState({customMins: 0, customHours: currSpinerH});
            }

            if(timeFieldValue <= 59){
                timeFieldValue = e.target.value.substring(0,2);
                this.setState({customMins: timeFieldValue});
            }
        }

    }

    onTimeSelect(e){
        let checkbox = e.target.value;
        this.setState({selectedTimeOpt : checkbox});
    }

    onBlockedModeSelect(e){
        let checkbox = e.target.value;
        let hasCheckedIndex = this.selectedList.indexOf(checkbox);

        if (hasCheckedIndex > -1) {
            this.selectedList.splice(hasCheckedIndex, 1);
        }else{
            this.selectedList.push(checkbox);
        }

        this.setState({blockedMode : this.selectedList});
    }

    handleChange(date) {
        this.setState({
          startDate: date
        });

        this.formatDate = date.format("YYYY-MM-DD");
    }

    onCancelTimeClick(){
        console.log("onCancelTimeClick")
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
        this.setState({sesStartTime:undefined, sesHowLong:undefined, sesEndTime:undefined, timeBlockIsVisible: true})
    }

    onWorkModeSet(e){

        let data;

        if (this.selectedList.length >= 1) {
            if(this.formatDate == undefined){
                console.log("not set");
                this.formatDate = Moment().format("YYYY-MM-DD");
            }
            data = {
                mode : this.selectedList,
                time : this.state.selectedTimeOpt,
                date : {
                    day : this.formatDate,
                    hh : this.state.customHours,
                    mm : this.state.customMins,
                    period : this.state.timePeriod
                }
            }
        }else{
            e.preventDefault();
            alert("Please Select Work Mode");
            return false;
        }
        console.log(data);

        let _startTime = (this.state.sesStartTime)? this.state.sesStartTime:new Date().getTime();
        let howLong = (this.state.sesHowLong)? this.state.sesHowLong:0;
        let _endTime = (this.state.sesEndTime)? this.state.sesEndTime:_startTime+howLong;

        if(howLong == 0){

            if(data.time != 0){
                howLong = data.time*60*1000;
                _endTime = _startTime+howLong;
            } else{
                console.log("time not selected");

                let now = Moment().format('YYYY-MM-DD HH:mm a');
                let toFormat = Moment(data.date.day + ' ' + data.date.hh + ':' + data.date.mm +' ' + data.date.period, "YYYY-MM-DD HH:mm a");
                howLong = toFormat.diff(now);

                if(howLong <= 0){
                    e.preventDefault();
                    alert("Please Select Time");
                    return false;
                }
                console.log(howLong);
                _endTime = _startTime+howLong;
            }

        }

        var _wm = {
            rightBottom:(data.mode.indexOf("bars") != -1 || data.mode.indexOf("all") != -1)?true:false,
            newsFeed:(data.mode.indexOf("newsfeed") != -1 || data.mode.indexOf("all") != -1)?true:false,
            calls:(data.mode.indexOf("calls") != -1 || data.mode.indexOf("all") != -1)?true:false,
            messages:(data.mode.indexOf("msg") != -1 || data.mode.indexOf("all") != -1)?true:false,
            socialNotifications:(data.mode.indexOf("notifications") != -1 || data.mode.indexOf("all") != -1)?true:false,
            startTimer:_startTime,
            howLong:howLong,
            endTime:_endTime
        };
        console.log(_wm);

        Session.createSession("prg_wm",_wm);

        //it must be at the end. because to create session form must get posted
        e.preventDefault(); //can uncomment if we find a way to hide footer & right bar without refresh.

        location.reload();
    }

    onTimeSummeryClick(){
        this.setState({timeBlockIsVisible: true});
    }

    onTimeSet(){
        let howLong;
        let timeLeft;
        let time = this.state.selectedTimeOpt;
        let _startTime = new Date().getTime();
        let _endTime;

        if (time != 0) {
            howLong = time*60*1000;
            _endTime = Moment().add(howLong, 'ms').format("x");
            timeLeft = _endTime - _startTime;
            timeLeft =  Moment.utc(timeLeft).format("DD HH mm");
        }else{
            if(this.formatDate == undefined){
                this.formatDate = Moment().format("YYYY-MM-DD");
            }
            let now = Moment().format('YYYY-MM-DD HH:mm a');
            let toFormat = Moment(this.formatDate + ' ' + this.state.customHours + ':' + this.state.customMins +' ' + this.state.timePeriod, "YYYY-MM-DD HH:mm a");
            howLong = toFormat.diff(now);
            timeLeft = Moment.utc(howLong).format("DD HH mm");
        }
        this.setState({timeBlockIsVisible: false, remainingTime: timeLeft});
    }

    onPeriodChange(e){
        let selectedPeriod = e.target.value;
        this.setState({timePeriod: selectedPeriod});
    }

    render(){
        let timeLeft = this.state.remainingTime;
        let timeIn = this.state.remainingTimeIn;
        let days, hrs, mins, sec;
        if (timeLeft) {
            timeLeft = timeLeft.split(" ");
            if(timeIn == "min"){
                days = timeLeft[0];
                hrs = timeLeft[1];
                mins = timeLeft[2];
                if(days == "01"){
                    days = "";
                }else{
                    days = days+"'days ";
                }
            } else{
                hrs = timeLeft[0];
                mins = timeLeft[1];
                sec = timeLeft[2];
                if(mins == "0"){
                    mins = "";
                }else{
                    mins = mins+"'minutes ";

                }
            }

            if(hrs == "0"){
                hrs = "";
            }else{
                hrs = hrs+"'hours ";
            }

        }

        return(
            <div className="work-mode-container">
                <form method="post" onSubmit={this.onWorkModeSet.bind(this)}>
                    <div className="inner-wrapper clearfix">
                        <div className="header-section">
                            <h2 className="section-text">Work Mode</h2>
                        </div>
                        <div className="opt-wrapper" ref="modeSelector">
                            <div className="opt-block clearfix">
                                <span className="icon bar-block"></span>
                                <div className="field-holder">
                                    <input type="checkbox" value="bars" id="bar-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                           checked={(this.selectedList.includes("bars") || this.selectedList.includes("all"))? true : false } />
                                    <label htmlFor="bar-block-check">Block Right Bar + Bottom Bar</label>
                                </div>
                            </div>
                            <div className="opt-block clearfix">
                                <span className="icon newsfeed-block"></span>
                                <div className="field-holder">
                                    <input type="checkbox" value="newsfeed" id="newsfeed-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                           checked={(this.selectedList.includes("newsfeed") || this.selectedList.includes("all") )? true : false } />
                                    <label htmlFor="newsfeed-block-check">Block Newsfeed Temporarily</label>
                                </div>
                            </div>
                            <div className="opt-block clearfix">
                                <span className="icon voice-video-block"></span>
                                <div className="field-holder">
                                    <input type="checkbox" value="calls" id="calls-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                           checked={(this.selectedList.includes("calls") || this.selectedList.includes("all"))? true : false } />
                                    <label htmlFor="calls-block-check">Block Voice / Video Calls</label>
                                </div>
                            </div>
                            <div className="opt-block clearfix">
                                <span className="icon msg-block"></span>
                                <div className="field-holder">
                                    <input type="checkbox" value="msg" id="msg-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                           checked={(this.selectedList.includes("msg") || this.selectedList.includes("all"))? true : false } />
                                    <label htmlFor="msg-block-check">Block Messages</label>
                                </div>
                            </div>
                            <div className="opt-block clearfix">
                                <span className="icon notifications-block"></span>
                                <div className="field-holder">
                                    <input type="checkbox" value="notifications" id="notifications-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                           checked={(this.selectedList.includes("notifications") || this.selectedList.includes("all"))? true : false } />
                                    <label htmlFor="notifications-block-check">Block Social Notifications</label>
                                </div>
                            </div>
                            <div className="opt-block clearfix">
                                <span className="icon all-block"></span>
                                <div className="field-holder">
                                    <input type="checkbox" value="all" id="all-block-check" onChange={(event)=>{ this.onBlockedModeSelect(event)}}
                                           checked={(this.selectedList.includes("all"))? true : false } />
                                    <label htmlFor="all-block-check">Block All</label>
                                </div>
                            </div>
                        </div>
                        {
                            (this.state.timeBlockIsVisible)?
                                <div className="time-holder">
                                    <div className="inner-wrapper clearfix">
                                        <div className="time-wrapper col-sm-6">
                                            <h3 className="section-title">Set a fixed time for next,</h3>
                                            <div className="opt-holder">
                                                <div className="opt-block clearfix">
                                                    <input type="checkbox" value="30" id="min-check" onChange={(event)=>{ this.onTimeSelect(event)}}
                                                           checked={(this.state.selectedTimeOpt == 30)? true : false} />
                                                    <label htmlFor="min-check">30 Mins</label>
                                                </div>
                                                <div className="opt-block clearfix">
                                                    <input type="checkbox" value="60" id="one-hour-check" onChange={(event)=>{ this.onTimeSelect(event)}}
                                                           checked={(this.state.selectedTimeOpt == 60)? true : false}/>
                                                    <label htmlFor="one-hour-check">1 Hour</label>
                                                </div>
                                                <div className="opt-block clearfix">
                                                    <input type="checkbox" value="180" id="three-hour-check" onChange={(event)=>{ this.onTimeSelect(event)}}
                                                           checked={(this.state.selectedTimeOpt == 180)? true : false}/>
                                                    <label htmlFor="three-hour-check">3 Hour</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="date-holder col-sm-6">
                                            <h3 className="section-title">Set time till</h3>
                                            <div className="date-field-holder clearfix">
                                                <div className="field-holder">
                                                    <span className="field-label">Day</span>
                                                    <DatePicker
                                                        selected={this.state.startDate}
                                                        onChange={this.handleChange}
                                                        dateFormat="MMM DD"
                                                        className="form-control" />
                                                    <i className="fa fa-calendar" aria-hidden="true"></i>
                                                </div>
                                                <div className="field-holder">
                                                    <span className="field-label">HR</span>
                                                    <input type="number" name="hours" min="1" max="24" className="form-control" value={this.state.customHours} placeholder="Hour" onChange={(event)=>{this.onTimeChange(event)}}/>
                                                </div>
                                                <div className="field-holder">
                                                    <span className="field-label">MIN</span>
                                                    <input type="number" name="mins" min="0" max="60" className="form-control" value={this.state.customMins} placeholder="Minute" onChange={(event)=>{this.onTimeChange(event)}}/>
                                                </div>
                                                <div className="field-holder day-period">
                                                    <span className="field-label">Period</span>
                                                    <select name="periods" className="form-control" value={this.state.timePeriod} onChange={this.onPeriodChange.bind(this)}>
                                                        <option value="AM">AM</option>
                                                        <option value="PM">PM</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="btn-holder">
                                            <button type="button" className="btn btn-default set-btn" onClick={this.onTimeSet.bind(this)}>Set</button>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="mode-notice">
                                    <div onClick={this.onTimeSummeryClick.bind(this)}>
                                        {
                                            (timeIn == "min")?
                                                <h3 className="title">{"Work Mode on for next " + days + hrs + "and "+ mins+"'minutes" }</h3>
                                                :
                                                <h3 className="title">{"Work Mode on for next " + hrs + mins+"and "+ sec+"'seconds" }</h3>
                                        }

                                        <i className="fa fa-times" aria-hidden="true" onClick={this.onCancelTimeClick.bind(this)}></i>
                                    </div>
                                </div>
                        }
                        <div className="btn-holder">
                            <button type="submit" className="btn btn-default submit" >GO!</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
