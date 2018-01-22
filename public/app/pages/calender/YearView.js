/**
 * Day view of the calender
 */

'use strict';

import React, { Component } from 'react';
import moment from 'moment-timezone';
import Session from '../../middleware/Session';
import Month from './Month';
import Socket  from '../../middleware/Socket';

export default class YearView extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            currentYear : moment().startOf("day"),
            events : [],
            user : user,
            showUserPanel : ''
        };
        this.loggedUser = user;
        this.nextYear = this.nextYear.bind(this);
        this.currentYear = this.state.currentYear;

    }

    nextYear() {
        let nextYear = this.state.currentYear;
        this.currentYear = nextYear.add(1, "Y");
        this.setState({ currentYear: this.currentYear });
    }

    previousYear() {
        let prevYear = this.state.currentYear;
        this.currentYear = prevYear.add(-1, 'Y');
        this.setState({currentYear : prevYear});
    }

    render() {
        return (
        <section className="calender-body">
            <div className="calendar-main-row">
                <div className="calender-year-view">
                    <div className="view-header">
                        <div className="col-sm-3 remove-padding">
                            <div className="date-wrapper">
                                <div className="date-nav" onClick={() => this.previousYear()}>
                                    <i className="fa fa-angle-left" aria-hidden="true"></i>
                                </div>
                                <div className="date">
                                    <p>{this.state.currentYear.format("YYYY")}</p>
                                </div>
                                <div className="date-nav" onClick={() => this.nextYear()}>
                                    <i className="fa fa-angle-right" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-9 calender-date remove-padding">
                            <p>{this.state.currentYear.format("YYYY")}</p>
                        </div>
                    </div>
                    <div className="view-tile-area">
                        <div className="month-tiles">
                            {this.renderMonths()}

                        </div>
                    </div>
                </div>
            </div>
        </section>
        );
    }

    renderMonths() {
        var months = [];

        for (var i = 0; i < 12; i++) {
            //console.log(moment([this.state.currentYear.format("YYYY"),i]).startOf("day"));
            var startMonth = moment([this.state.currentYear.format("YYYY"),i]).startOf("day");
            months.push(<Month key={startMonth.toString()} selected={startMonth} changeView={this.props.setMonthView.bind(this)} groupId={(this.props.calendarOrigin == 2) ? this.props.groupId : null} isGroupCall={(this.props.calendarOrigin == 2) ? true : false} calendarOrigin={this.props.calendarOrigin} />);
        }
        return months;

    }
}
