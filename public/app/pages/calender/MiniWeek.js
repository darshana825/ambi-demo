/**
 * Week Component
 */
import React from 'react';

export default class MiniWeek extends React.Component {
    
    render() {

        var days = [],
        date = this.props.date,
        month = this.props.month;

        for (var i = 0; i < 7; i++) {
            var day = {
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date
            };
            days.push(<span key={day.date.toString()} className={"day" + (day.isToday ? " today" : "") + (day.isCurrentMonth ? "" : " different-month") + (day.date.isSame(this.props.selected) ? " selected" : "")} onClick={this.props.select.bind(null, day)}><div className="squre">{day.number}</div></span>);
            date = date.clone();
            date.add(1, "d");

        }

        return <div className="week" key={days[0].toString()}>
            {days}
        </div>
    }
}
