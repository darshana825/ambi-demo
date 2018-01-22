/**
 * The Index view of the caleder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';

import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import CalenderView from './MonthView';
import moment from 'moment';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }

        super(props);
        this.dayViewDate = moment().format('YYYY-MM-DD');
        this.state = {
            current : 'week',
            dayViewDate: moment().format('YYYY-MM-DD'),
            monthViewDate: moment().startOf("day"),
            user: user
        };
        this.relativeView = this.relativeView.bind(this);
        this.loadDayView = this.loadDayView.bind(this);
        this.loadMonthView = this.loadMonthView.bind(this);
        this.calendarOrigin = 1;// 1 - PERSONAL_CALENDAR, 2 - GROUP_CALENDAR
    }

    componentDidMount() {
        if(this.props.params.name) {

            $.ajax({
                url : '/calendar/event/get',
                method : "POST",
                data : { eventId : this.props.params.name },
                dataType : "JSON",
                headers : { "prg-auth-header" : this.state.user.token },
                success : function (data, text) {
                    if (data.status.code == 200) {
                        var event = data.event;
                        console.log(event.start_date_time);
                        console.log(moment(event.start_date_time).format('YYYY-MM-DD'));
                        this.dayViewDate = moment(event.start_date_time).format('YYYY-MM-DD');
                        this.setState({dayViewDate: moment(event.start_date_time).format('YYYY-MM-DD'), current: 'day'});
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(error);
                }
            });

        }
    }

    relativeView() {
        let groupCall = {
            isGroupCall: false,
            groupId: '',
            group:''
        }

        switch(this.state.current) {
            case 'week':
                return (<WeekView calendarOrigin={this.calendarOrigin} isGroupCall={false} groupCall={groupCall}/>);
            case 'day':
                return  (<DayView calendarOrigin={this.calendarOrigin} dayDate={this.state.dayViewDate} selectedEvent={this.props.params.name} />);
            case 'month':
                return  (<MonthView calendarOrigin={this.calendarOrigin} selected={this.state.monthViewDate} setDayView={this.loadDayView} ref="MonthViewComponent" />);
            case 'year':
                return  (<YearView calendarOrigin={this.calendarOrigin} setMonthView={this.loadMonthView.bind(this)}/>);
            default:
                return (<DayView calendarOrigin={this.calendarOrigin} dayDate={this.state.dayViewDate}/>);
        }
    }

    loadMonthView(date) {
        this.setState({current : 'month', monthViewDate:date});
    }

    loadDayView(view, date) {
        this.setState({current : view, dayViewDate:moment(date).format('YYYY-MM-DD')});
    }

    setView(view) {
        this.setState({ current : view});
    }

    render() {

        return (
            <section className="calender-container">
                <div className="container">
                    <section className="calender-header">
                        <div className="row">
                            <div className="col-sm-3">
                                <h2>Calendar</h2>
                            </div>
                            <div className="col-sm-6 calendar-main-nav">
                                <div className={ this.state.current == 'day' ? 'calender-type active' : 'calender-type'}  onClick={() => this.setView('day')} >
                                    <h4>Day</h4>
                                </div>
                                <div className={ this.state.current == 'week' ? 'calender-type active' : 'calender-type'}  onClick={() => this.setView('week')} >
                                    <h4>Week</h4>
                                </div>
                                <div className={ this.state.current == 'month' ? 'calender-type active' : 'calender-type'}  onClick={() => this.setView('month')} >
                                    <h4>Month</h4>
                                </div>
                               <div className={ this.state.current == 'year' ? 'calender-type active' : 'calender-type'}  onClick={() => this.setView('year')} >
                                    <h4>Year</h4>
                                </div>
                            </div>
                            <div className="col-sm-3">
                            </div>
                        </div>
                    </section>
                    {this.relativeView()}
                </div>
            </section>
        );
    }
}
