'use strict';
import React, { Component } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import moment from 'moment';

export default class TimePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime:this.props.defaultEventTime,
            endTime:this.props.defaultEventEndTime,
            endTimeBool: moment(this.props.defaultEventEndTime) > moment()
        };

        this.onSelectHour = this.onSelectHour.bind(this);
        this.onSelectMins = this.onSelectMins.bind(this);
        this.onSelectMeridian = this.onSelectMeridian.bind(this);
        this.toggleEndTimeSection = this.toggleEndTimeSection.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let endTimeShow = moment(nextProps.defaultEventEndTime) > moment();
        this.setState({startTime: nextProps.defaultEventTime, endTime: nextProps.defaultEventEndTime, endTimeBool: endTimeShow});
    }

    onSelectHour(value, type) {

        let _time = type == "start-time" ? this.state.startTime : this.state.endTime;
        let _a = moment(_time).format('a');
        const strDate = moment(_time).format('YYYY-MM-DD');
        let _hrs = _a == 'am' ? value : value == 12 ? value : Number(value) + 12;

        const _modifiedTime = _hrs + ":" + moment(_time).format('mm');
        const _dt = moment(strDate + ' ' + _modifiedTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        // if(this.doValidateTime(type == "start-time" ? _dt: this.state.startTime, type == "end-time" ? _dt: this.state.endTime) == true) {
            this.props.setTimePickerTimeChange(_dt, type);
        // }
    }

    onSelectMins(value, type) {

        let _time = type == "start-time" ? this.state.startTime : this.state.endTime;
        const strDate = moment(_time).format('YYYY-MM-DD');
        const _modifiedTime = moment(_time).format('HH') + ":" + value;
        const _dt = moment(strDate + ' ' + _modifiedTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        // if(this.doValidateTime(type == "start-time" ? _dt: this.state.startTime, type == "end-time" ? _dt: this.state.endTime) == true) {
            this.props.setTimePickerTimeChange(_dt, type);
        // }
    }

    onSelectMeridian(value, type) {

        let _time = type == "start-time" ? this.state.startTime : this.state.endTime;
        let _a = moment(_time).format('a');
        const strDate = moment(_time).format('YYYY-MM-DD');
        let _hrs = moment(_time).format('HH');

        if(_a == 'am'  && value == 'pm') {
            _hrs = Number(_hrs) + 12;
        }
        if(_a == 'pm'  && value == 'am') {
            _hrs = Number(_hrs) - 12;
        }
        const _modifiedTime = _hrs + ":" + moment(_time).format('mm');
        const _dt = moment(strDate + ' ' + _modifiedTime, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');

        // if(this.doValidateTime(type == "start-time" ? _dt: this.state.startTime, type == "end-time" ? _dt: this.state.endTime) == true) {
            this.props.setTimePickerTimeChange(_dt, type);
        // }

    }

    doValidateTime(_start, _end) {

        let startDtTime = moment(_start).format('YYYY-MM-DD HH:mm:ss'), endDtTime = moment(_end).format('YYYY-MM-DD HH:mm:ss');

        if(startDtTime <= moment().format('YYYY-MM-DD HH:mm:ss')) {
            this.props.doTimePickerValidation("lesser_time")
        }
        else if(endDtTime <= moment().format('YYYY-MM-DD HH:mm:ss')) {
            this.props.doTimePickerValidation("lesser_time")
        }
        else if(endDtTime <= startDtTime) {
           this.props.doTimePickerValidation("invalid_time")
        }
        return endDtTime > startDtTime ? true : false;
    }

    toggleEndTimeSection() {
        let _endTimeBool = this.state.endTimeBool;
        this.setState({endTimeBool: !_endTimeBool});
    }

    render() {
        let _this = this;
        return (
            <div className="popup-holder">
                <div className="time-popover-wrapper clearfix">
                    <p className="title">time</p>
                    <PickTime
                        type="start-time"
                        onSelectHour={_this.onSelectHour}
                        onSelectMins={_this.onSelectMins}
                        onSelectMeridian={_this.onSelectMeridian}
                        selectedTime={_this.state.startTime}
                    />
                    <div className="footer-title-wrapper" onClick={_this.toggleEndTimeSection}>
                    <p className="title footer" >end time</p>
                        {
                            //onClick={_this.props.overlayHide}
                        (_this.state.endTimeBool) ? <span className="end-time close"></span> : <span className="end-time view"></span>
                    }
                    </div>
                    {
                        (_this.state.endTimeBool) ?
                            <PickTime
                                type="end-time"
                                onSelectHour={_this.onSelectHour}
                                onSelectMins={_this.onSelectMins}
                                onSelectMeridian={_this.onSelectMeridian}
                                selectedTime={_this.state.endTime}
                            /> : null
                    }
                </div>
            </div>
        );
    }
}

class PickTime extends React.Component {
    constructor(props) {
        super(props);

        this.onSelectHour = this.onSelectHour.bind(this);
        this.onSelectMins = this.onSelectMins.bind(this);
        this.onSelectMeridian = this.onSelectMeridian.bind(this);
    }

    onSelectHour(e) {
        this.refs.overlayHours.hide();
        this.props.onSelectHour(e.target.id, this.props.type);
    }

    onSelectMins(e) {
        this.refs.overlayMins.hide();
        this.props.onSelectMins(e.target.id, this.props.type);
    }

    onSelectMeridian(e) {
        this.refs.overlayMeridian.hide();
        this.props.onSelectMeridian(e.target.id, this.props.type);
    }

    render() {

        let _this = this;
        const {selectedTime, type} = this.props;
        let cls = (type == "end-time") ? "set-time-container clearfix footer" : "set-time-container clearfix";

        let _mins = moment(selectedTime).format('mm');
        let  _hrs = moment(selectedTime).format('hh');
        let   _meridian = moment(selectedTime).format('a');

        //let _hours = _hrs > 12 ? Number(_hrs - 12) : _hrs;

        const mins = (
            <Popover id="time-select-popover">
                <div className="popup-holder">
                    <div className="inner-time-popover">
                        <TimeOptionsList listArr={
                            ["00","10","15","20","25","30","35","40","45","50","55"]
                        } onSelectItem={this.onSelectMins} selectedItem={_mins}/>
                    </div>
                </div>
            </Popover>
        );

        const hours = (
            <Popover id="time-select-popover">
                <div className="popup-holder">
                    <div className="inner-time-popover">
                        <TimeOptionsList listArr={
                            ["00","01","02","03","04","05","06","07","08","09","10","11","12"]
                        } onSelectItem={this.onSelectHour} selectedItem={_hrs} />
                    </div>
                </div>
            </Popover>
        );

        const meridian = (
            <Popover id="time-select-popover">
                <div className="popup-holder">
                    <div className="inner-time-popover">
                        <TimeOptionsList listArr={
                            ["am","pm"]
                        } onSelectItem={this.onSelectMeridian} selectedItem={_meridian} />
                    </div>
                </div>
            </Popover>
        );

        return (
            <div className={cls}>
                <OverlayTrigger ref="overlayHours" trigger="click" rootClose placement="bottom" overlay={hours}>
                    <div className="time-block">
                        <span className="time">{_hrs}</span>
                        <span className="caret-icon"></span>
                    </div>
                </OverlayTrigger>
                <OverlayTrigger ref="overlayMins" trigger="click" rootClose placement="bottom" overlay={mins}>
                    <div className="time-block">
                        <span className="time">{_mins}</span>
                        <span className="caret-icon"></span>
                    </div>
                </OverlayTrigger>
                <OverlayTrigger ref="overlayMeridian" trigger="click" rootClose placement="bottom" overlay={meridian}>
                    <div className="time-block">
                        <span className="time meridian">{_meridian}</span>
                        <span className="caret-icon"></span>
                    </div>
                </OverlayTrigger>
            </div>
        );
    }
}

class TimeOptionsList extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        let _this = this;
        let numberList = this.props.listArr.map(function(listItem,key){
            let cls = (_this.props.selectedItem == listItem) ? "selected" : "";
            return(
                <li className={cls} id={listItem} onClick={_this.props.onSelectItem} key={key}>
                    {listItem}
                </li>
            );
        });

        return (
            <ul className="time-list">
                {numberList}
            </ul>
        );
    }
}