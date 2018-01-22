/**
 * Calender component
 */
import React from 'react';
import YearDayNames from './YearDayNames';
import YearWeek from './YearWeek';
import Session from '../../middleware/Session';
import moment from 'moment';

export default class Month extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            month: this.props.selected.clone(),
            events: [],
            showDailyPopUp: false,
            currDate:moment().format('YYYY-MM-DD HH:mm')
        };
        this.loggedUser = Session.getSession('prg_lg');
        this.getAllEventsForMonth();
    }


    getAllEventsForMonth() {
        let _month = this.state.month.format("MM");
        let _year = this.state.month.format("YYYY");
        let postData = {};

        if(this.props.calendarOrigin == 2){
            postData = {
                month : _month,
                year : _year,
                calendarOrigin : 2,
                calendarType : "year",
                groupId : this.props.groupId
            }
        }else{
            postData = {
                month : _month,
                year : _year,
                calendarType : "year"
            }
        }

        $.ajax({
            url: '/calendar/month/all',
            method: "GET",
            dataType: "JSON",
            data: postData,
            headers: {'prg-auth-header': this.loggedUser.token}
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({events: data.events});
            }
        }.bind(this));
    }

    select(day) {
        this.props.changeView(day.date);
        this.forceUpdate();
    }

    handleClick() {
        this.setState({showDailyPopUp: true});
    }

    handleClose() {
        this.setState({showDailyPopUp: false});
    }

    loadData() {
        this.getAllEventsForMonth();
    }

    render() {
        let currDt = moment(this.state.currDate);

        return (
        <div className="month-tile">
            <div className="mini-calendar">
                <div className="header">
                    <span>{this.state.month.format("MMMM")}</span>
                </div>
                <YearDayNames />
                {this.renderWeeks()}
            </div>
        </div>
        );
    }

    renderWeeks() {
        var weeks = [],
            empty_done = false,
            day = { date: this.state.month.clone().startOf("month")},
            done = false,
            date = this.state.month.clone().startOf("month").add("w" - 1).day("Sunday"),
            monthIndex = date.month(),
            count = 0;
        while (!done) {
            if(count == 5 && empty_done == true){
                weeks.push(<div className="week" ke3y={date.toString()}>
                    <span className="day" key="1" onClick={() => this.select(day)}><div className="squre"></div></span>
                    <span className="day" key="2" onClick={() => this.select(day)}><div className="squre"></div></span>
                    <span className="day" key="3" onClick={() => this.select(day)}><div className="squre"></div></span>
                    <span className="day" key="4" onClick={() => this.select(day)}><div className="squre"></div></span>
                    <span className="day" key="5" onClick={() => this.select(day)}><div className="squre"></div></span>
                    <span className="day" key="6" onClick={() => this.select(day)}><div className="squre"></div></span>
                    <span className="day" key="7" onClick={() => this.select(day)}><div className="squre"></div></span>
                    </div>);
                date.add(1, "w");
            }else{
                weeks.push(<YearWeek key={date.toString()} date={date.clone()} month={this.state.month}
                                     select={this.select.bind(this)} selected={this.props.selected}
                                     events={this.state.events} isGroupCall={(this.props.isGroupCall)? true : false}/>);
                date.add(1, "w");
            }
            done = count++ > 2 && monthIndex !== date.month();

            if(count == 5 && done == true){
                empty_done = true;
                done = false;
            }
            if(count == 6){
                done = true;
            }
            monthIndex = date.month();
        }

        return weeks;
    }
}