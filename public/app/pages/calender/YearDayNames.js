/**
 * Day Name Component 
 */
import React from 'react';

export default class YearDayNames extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            mini : this.props.mini,
        }; 
    }

    render() {
        return <div className="week names">
            <span className="day day-names">S</span>
            <span className="day day-names">M</span>
            <span className="day day-names">T</span>
            <span className="day day-names">W</span>
            <span className="day day-names">T</span>
            <span className="day day-names">F</span>
            <span className="day day-names">S</span>
        </div>
    }
}
