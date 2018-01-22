/**
 * Day Name Component
 */
import React from 'react';
import moment from 'moment';
import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

import Session from '../../middleware/Session';

export default class DayEventsList extends React.Component {

    constructor(props) {
        let user =  Session.getSession('prg_lg');
        super(props);
        this.state = {
            user : user
        };
    }

    createMarkup(htmlScript) {
        return (
            {__html: htmlScript}
        );
    }

    onRedirectProfile(_user) {
        if(_user.shared_status == 3 && _user.shared_user_name != undefined && _user.shared_user_name != "Unknown") {
            window.location.href = '/profile/'+_user.shared_user_name;
        }
    }

    render() {
        let _this = this;
        let  items = this.props.events.map(function(event,key){

            if(event.type == 2 || event.type == 3) {
                return;
            }

            let rawDescription = event.description;
            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            let contentState = convertFromRaw(event.description);
            let htmlC = stateToHTML(contentState);
            let startDateTime = moment(event.start_date_time).format('YYYY-MM-DD HH:mm');
            let usersString = [];
            let ownerString = '';
            let acceptedClass = 'event-description';
            let acceptedStyles = {};

            if(event.user_id ==  _this.state.user.id) {
                acceptedClass = 'event-description accepted';
                acceptedStyles = {
                    cursor: "pointer"
                };
            }

            if(event.shared_users.length > 0 ) {
                usersString = event.shared_users.map(function(user,userKey){

                    if(user.shared_status == 3 && _this.state.user.id == user.id ) {
                        acceptedClass = 'event-description accepted';
                    }
                    if(user.shared_status == 2) {
                        return null;
                    }
                    return  <span className={user.shared_status == 3 ? 'selected-people' : 'people-list'} key={userKey} onClick={_this.onRedirectProfile.bind(_this, user)}>
                                {_this.state.user.id == user.id ? 'me' : user.name}
                                {userKey+1 == event.shared_users.length ? '' : ', '}
                            </span>;
                });

                if(event.user_id != _this.state.user.id) {
                    ownerString = <span className='selected-people'>{event.owner_name}{event.shared_users.length > 0 ? ', ' : ''}</span>
                } else {
                    ownerString = <span className='selected-people'>me{event.shared_users.length > 0 ? ', ' : ''}</span>
                }
            } else {
                if(event.user_id == _this.state.user.id){
					usersString = <span className="people-list" >Only me</span>
				}else{
					usersString = <span className="people-list" >{event.owner_name}</span>
				}
            }

            let _endTime = '';
            if(event.event_end_time != undefined) {
                var calDate = moment(event.start_date_time).format('YYYY-MM-DD');
                _endTime = moment(calDate + ' ' + event.event_end_time, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
            }


            return (
                <li key={key} className={event._id == _this.props.selectedEvent ? 'bg-success' : ''}>
                    <i className="fa fa-circle" aria-hidden="true"></i>
                    <div className="description-holder" style={acceptedStyles}>
                        {/*<div className={acceptedClass} >{event.plain_text}</div>*/}
                        {event.user_id == _this.state.user.id && startDateTime > moment().format('YYYY-MM-DD HH:mm') ?
                                <div className={acceptedClass} dangerouslySetInnerHTML={_this.createMarkup(htmlC)} onClick={_this.props.clickEdit.bind(_this, event._id)}></div>
                                :
                                <div className={acceptedClass} dangerouslySetInnerHTML={_this.createMarkup(htmlC)}></div>
                        }
                        <div className="people-list-wrapper">
                            <span className="people-list">People on this event : </span>
                            {ownerString}{usersString}
                        </div>
                    </div>
                    {
                        _endTime != '' ?
                            <span className="event-time pull-right">{moment(event.start_date_time).format('hh:mm A') + " - " + moment(_endTime).format('hh:mm A')}</span>
                            :
                            <span className="event-time pull-right">{moment(event.start_date_time).format('LT')}</span>
                    }

                    {event.user_id == _this.state.user.id && startDateTime > moment().format('YYYY-MM-DD HH:mm') ?
                        <span>
                            <i onClick={_this.props.clickEdit.bind(_this, event._id)} className="fa fa-pencil pull-right action-icons edit-icon" aria-hidden="true"></i>
                            <i onClick={_this.props.delete.bind(_this, event._id)} className="fa fa-trash pull-right action-icons delete-icon" aria-hidden="true"></i>
                        </span>
                        : ''
                    }
                </li>
            );
        });

        return(
            <ul className="list-unstyled events-list-area-content-list list-area-content-list">
                {items}
            </ul>
        )
    }
}
