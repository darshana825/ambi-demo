/**
 * Week Component
 */
import React from 'react';
import moment from 'moment';
import Session from '../../middleware/Session';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

export default class Week extends React.Component {

    constructor(props) {
        super(props);
        this.state ={};
    }

    createMarkup(htmlScript) {
        return (
        {__html: htmlScript}
        );
    }
    
    render() {
        var days = [],
            date = this.props.date,
            month = this.props.month,
            events = this.props.events;

        for (var i = 0; i < 7; i++) {

            var day = {
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date,
                daily_events:this.getEventsForTheDay(date)
            };

            let startDateTime = moment(day.date).format('YYYY-MM-DD');

            days.push(<span key={day.date.toString()}
                            className={"day" + (day.isToday ? " today" : "") + (day.isCurrentMonth ? "" : " different-month") + (day.date.isSame(this.props.selected) ? " selected" : "")}
                            onDoubleClick={(startDateTime >= moment().format('YYYY-MM-DD'))? this.props.select.bind(null, day) : false}>
                        {this.renderNormalDate(day)}
                        <DailyEvents daily_events={day.daily_events} isGroupCall={this.props.isGroupCall}/>
                    </span>);
            date = date.clone();
            date.add(1, "d");

        }

        return <div className="week" key={days[0].toString()}>
            {days}
        </div>
    }

    renderNormalDate(day) {
        return(
                <div className="squre">{day.number}</div>
        );
    }

    getEventsForTheDay(date) {
        let _events = [];
        for(let c in this.props.events) {
            let e_date = moment(this.props.events[c].start_date_time).format('YYYY-MM-DD');
            let c_date = date.format('YYYY-MM-DD');

            if(c_date == e_date) {
                _events.push(this.props.events[c]);
            }
        }
        return _events;
    }
}

export class DailyEvents extends React.Component {
    constructor(props) {
        super(props);

        this.loggedUser = Session.getSession('prg_lg');
        this.isPending = this.isPending.bind(this);
    }

    render() {
        let countString = 0,
            events = this.props.daily_events;
        
        if(events != "undefined"){
            if(this.props.isGroupCall){
                countString = events.length > 3 ? events.length - 3 : 0;
            }else{
                for(let i in events) {
                    if(events[i].type != 3){
                        countString++;
                    }
                }
            }
        }

        return(
            <div className="items">
                {countString > 0 ? <span className="event-counts">+{countString} Events</span> : null }
                {this.renderSelectedDate()}
            </div>
        );
    }

    isPending(event) {
        if(event.user_id == this.loggedUser.id) {
            return false;
        }
        for(let _suser in event.shared_users) {
            if(event.shared_users[_suser].user_id == this.loggedUser.id && event.shared_users[_suser].shared_status == 1) {
                return true;
            }
        }
        return false;
    }

    createMarkup(htmlScript) {
        return (
        {__html: htmlScript}
        );
    }

    renderSelectedDate() {
        let count = 0, _this = this;
        let _events = this.props.daily_events.map(function(event,key){
            let rawDescription = event.description;

            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            let contentState = convertFromRaw(event.description);
            let htmlC = stateToHTML(contentState);
            let _text = event.description.blocks[0].text;

            if(_this.props.isGroupCall){
                count++;
                if(count > 3) {
                    return;
                }
                return(
                    <li className={_this.isPending(event) == false ? event.type == 1 ? "color-1" : "color-3" : "pending"}
                        key={key} dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></li>
                );
            }else{
                if(event.type != 3){
                    count++;
                    if(count > 3) {
                        return;
                    }
                    return(
                        <li className={_this.isPending(event) == false ? event.type == 1 ? "color-1" : "color-3" : "pending"}
                            key={key} dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></li>
                    );
                }
            }        
        });

        return(
            <div className="event-area">
                <ul>
                    {_events}
                </ul>
            </div>
        );
    }
}
