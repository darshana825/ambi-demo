/*
 * Individual call record in recent list
 */

import React from 'react';
import {UserMode, ContactType, CallStatus, CallChannel, CallType} from '../../config/CallcenterStats';

export default class Recent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(user, callType) {
        this.props.onCalling(user, callType);
    }

    render() {
        let _this = this;
        let contact = this.props.contact;

        let mood;

        if (contact.online_mode == UserMode.ONLINE.VALUE) {
            mood = "online";
        } else if (contact.online_mode == UserMode.WORK_MODE.VALUE) {
            mood = "work-mode";
        } else {
            mood = "offline";
        }

        return (
            <div className={"row contact-item " + contact.call_status}>{/* if its a miss call add class:  missed*/}
                <div className="col-sm-6">
                    <div className="image-wrapper">
                        <img src={contact.images.profile_image.http_url}/>
                        <span className={"status " + mood}></span>
                    </div>
                    <div className="name-wrapper">
                        <div className="name-holder">
                            <p className="name">{contact.first_name + " " + contact.last_name}</p>
                            {(contact.calls) ?
                                <span className="num-calls">{"(" + contact.calls + ")"}</span>
                                :
                                null
                            }
                        </div>
                        <p className="status">{mood}</p>
                    </div>
                    <div className="contact-type">
                        <span
                            className={"call-type-icon " + contact.call_channel}></span>{/* class are: video || phone */}
                        <p className="call-time">{contact.time}</p>
                        <p className="call-time">{(contact.call_type == CallType.INCOMING) ? 'IN':'OUT'}</p>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="call-ico-wrapper">
                        <button className="call-ico video" onClick={(event)=> {
                            _this.handleClick(contact, "video")
                        }}></button>
                        <button className="call-ico phone" onClick={(event)=> {
                            _this.handleClick(contact, "audio")
                        }}></button>
                    </div>
                </div>
            </div>
        );
    }
}