/**
 * Week Component
 */
import React from 'react';
import moment from 'moment';

export default class YearWeek extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        var days = [],
            date = this.props.date,
            month = this.props.month,
            events = this.props.events,
            _this = this;

        for (var i = 0; i < 7; i++) {

            var day = {
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date,
                daily_events: this.getEventsForTheDay(date)
            };

            days.push(<span key={day.date.toString()}
                            className={"day" + ((day.isToday && day.isCurrentMonth) ? " active" : "") + (day.isCurrentMonth ? "" : " different-month") }
                            onClick={this.props.select.bind(null, day)}>
                    <div className="squre">{this.renderNormalDate(day)}</div>
                        <div className="action-area">
                            {day.daily_events._todo == true && !_this.props.isGroupCall ?
                                <div className="todo"></div> : '' }
                            {day.daily_events._events == true ?
                                <div className="event"></div> : '' }
                            {day.daily_events._tasks == true ?
                                <div className="tasks"></div> : '' }
                        </div>
                    </span>);
            date = date.clone();
            date.add(1, "d");

        }

        return <div className="week" key={days[0].toString()}>
            {days}
        </div>
    }

    renderNormalDate(day) {
        return (
            <div className="squre">{day.number}</div>
        );
    }

    getEventsForTheDay(date) {
       // let _events = [];
        let _rtnObj = {
            _todo : false,
            _events : false
            };

        if(this.props.events.length > 0){
            for (let c in this.props.events) {
                let e_date = moment(this.props.events[c].start_date_time).format('YYYY-MM-DD');
                let c_date = date.format('YYYY-MM-DD');

                if (c_date == e_date) {
                   // console.log(this.props.events[c].type);
                    if(this.props.events[c].type == 2){
                        _rtnObj._todo = true;
                    }
                    if(this.props.events[c].type == 1){
                        _rtnObj._events = true;
                    }
                    if(this.props.events[c].type == 3){
                        _rtnObj._tasks = true;
                    }
                    // _events.push(this.props.events[c]);
                }
            }
        }
        return _rtnObj;
    }
}