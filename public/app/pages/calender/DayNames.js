/**
 * Day Name Component 
 */
import React from 'react';

export default class DayNames extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            mini : this.props.mini,
        }; 
    }

    render() {

        return <div className="week names">
            <span className="day day-names">{ this.state.mini ? "S" : "Sunday" }</span>
            <span className="day day-names">{ this.state.mini ? "M" : "Monday" }</span>
            <span className="day day-names">{ this.state.mini ? "T" : "Tuesday" }</span>
            <span className="day day-names">{ this.state.mini ? "W" : "Wednesday" }</span>
            <span className="day day-names">{ this.state.mini ? "T" : "Thursday" }</span>
            <span className="day day-names">{ this.state.mini ? "F" : "Friday" }</span>
            <span className="day day-names">{ this.state.mini ? "S" : "Saturday" }</span>
        </div>;
    }
}
