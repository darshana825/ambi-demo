/**
 * The Index view of the caleder section
 */
import React from 'react';
import Session  from '../../middleware/Session';

import DayView from './../calender/DayView';
import YearView from './../calender/YearView';
import MonthView from './../calender/MonthView';
import WeekView from './../calender/WeekView';
import CalenderView from './../calender/MonthView';

import moment from 'moment';

export default class Index extends React.Component {

    constructor(props) {

        let user = Session.getSession('prg_lg');
        if (user == null) {
            window.location.href = "/";
        }

        super(props);
        this.dayViewDate = moment().format('YYYY-MM-DD');
        this.state = {
            current: 'week',
            dayViewDate: moment().format('YYYY-MM-DD'),
            monthViewDate: moment().startOf("day"),
            user: user,
            group:this.props.myGroup
        };
        this.relativeView = this.relativeView.bind(this);
        this.loadDayView = this.loadDayView.bind(this);
        this.loadMonthView = this.loadMonthView.bind(this);

        this.calendarOrigin = 2;// 1 - PERSONAL_CALENDAR, 2 - GROUP_CALENDAR
    }

    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.myGroup != 'undefined' && nextProps.myGroup) {
            this.setState({group: nextProps.myGroup});
        }
    }

    componentDidMount() {
        //if (this.props.params.name) {
        //
        //    $.ajax({
        //        url: '/calendar/event/get',
        //        method: "POST",
        //        data: {eventId: this.props.params.name},
        //        dataType: "JSON",
        //        headers: {"prg-auth-header": this.state.user.token},
        //        success: function (data, text) {
        //            if (data.status.code == 200) {
        //                var event = data.event;
        //                console.log(event.start_date_time);
        //                console.log(moment(event.start_date_time).format('YYYY-MM-DD'));
        //                this.dayViewDate = moment(event.start_date_time).format('YYYY-MM-DD');
        //                this.setState({
        //                    dayViewDate: moment(event.start_date_time).format('YYYY-MM-DD'),
        //                    current: 'day'
        //                });
        //            }
        //        }.bind(this),
        //        error: function (request, status, error) {
        //            console.log(error);
        //        }
        //    });
        //
        //}
    }

    relativeView() {

        let groupCall = {
            isGroupCall: true,
            groupId: this.state.group._id,
            group:this.state.group
        };

        switch (this.state.current) {
            case 'week':
                return (<WeekView
                    groupId={this.state.group._id}
                    calendarOrigin={this.calendarOrigin}
                    isGroupCall={true}
                    groupCall={groupCall}/>);
            case 'day':
                return (<DayView
                    groupId={this.state.group._id}
                    calendarOrigin={this.calendarOrigin}
                    dayDate={this.state.dayViewDate}
                    selectedEvent={null}/>);
            case 'month':
                return (<MonthView
                    groupId={this.state.group._id}
                    calendarOrigin={this.calendarOrigin}
                    isGroupCall={true}
                    ref="MonthViewComponent"
                    selected={this.state.monthViewDate}
                    setDayView={true.loadDayView}/>);
            case 'year':
                return (<YearView
                    groupId={this.state.group._id}
                    calendarOrigin={this.calendarOrigin}
                    isGroupCall={true}
                    setMonthView={this.loadMonthView.bind(this)}/>);
            default:
                return (<DayView calendarOrigin={this.calendarOrigin} isGroupCall={true} viewType={"group_calendar"} dayDate={this.state.dayViewDate} user={user}/>);
        }
    }

    loadMonthView(date) {
        this.setState({current: 'month', monthViewDate: date});
    }

    loadDayView(view, date) {
        this.setState({current: view, dayViewDate: moment(date).format('YYYY-MM-DD')});
    }

    setView(view) {
        this.setState({current: view});
    }

    render() {

        return (
            <section className="group-content">
                <div className={"group-calendar-container " + this.state.current}>
                    <section className="calender-header row">
                        <div className="col-sm-6 col-sm-offset-3 calender-tab-holder">
                            <div className="inner-wrapper clearfix">
                                <div
                                    className={ this.state.current == 'day' ? 'calender-type active' : 'calender-type'}
                                    onClick={() => this.setView('day')}>
                                    <h4>Day</h4>
                                </div>
                                <div
                                    className={ this.state.current == 'week' ? 'calender-type active' : 'calender-type'}
                                    onClick={() => this.setView('week')}>
                                    <h4>Week</h4>
                                </div>
                                <div
                                    className={ this.state.current == 'month' ? 'calender-type active' : 'calender-type'}
                                    onClick={() => this.setView('month')}>
                                    <h4>Month</h4>
                                </div>
                                <div
                                    className={ this.state.current == 'year' ? 'calender-type active' : 'calender-type'}
                                    onClick={() => this.setView('year')}>
                                    <h4>Year</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="search-folder">
                                <span className="inner-addon">
                                    <i className="fa fa-search"></i>
                                    <input type="text" className="form-control" placeholder="Search"/>
                                </span>
                            </div>
                        </div>
                    </section>
                    {this.relativeView()}
                </div>
            </section>
        );
    }
}
