/**
 * Month view of the calender
 */
import React from 'react';
import Calender from './Calender';
import Session  from '../../middleware/Session';
import moment from 'moment';

export default class MonthView extends React.Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
          }

    render() {
        var selected = this.props.selected;
        return (
            <div>
                <Calender
                    selected={selected}
                    calendarOrigin={this.props.calendarOrigin}
                    groupId={(this.props.calendarOrigin == 2) ? this.props.groupId : null} // Only group calendar have group id
                    changeView={this.props.setDayView}/>
            </div>
        );
    }
}
