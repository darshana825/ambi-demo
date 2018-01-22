/*
 * Individual contact in contact list
 */

import React from 'react';
import {UserMode, ContactType, CallChannel} from '../../config/CallcenterStats';

export default class Contact extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(contact, callChannel) {
        (contact.type == ContactType.INDIVIDUAL) ? this.props.startCall(contact, callChannel, false) : this.props.createCall(contact, callChannel, true);
    }

    render() {
        let _this = this;
        let contact = this.props.contact;

        let mood, call_type;

        if (contact.online_mode == UserMode.ONLINE.VALUE) {
            mood = "online";
        } else if (contact.online_mode == UserMode.WORK_MODE.VALUE) {
            mood = "work-mode";
        } else {
            mood = "offline";
        }

        if (contact.type == ContactType.MULTI) {
            call_type = "multi";
        } else if (contact.type == ContactType.GROUP) {
            call_type = "group";
        } else {
            call_type = "user";
        }

        let profilePic = null;

        if (contact.type == 1 && contact.images.profile_image.http_url) {
            profilePic = contact.images.profile_image.http_url;
        } else if (contact.type == 1 && !contact.images.profile_image.http_url) {
            profilePic = "images/default-profile-pic.png";
        } else if (contact.type == 2 && contact.group_pic_link) {
            profilePic = contact.group_pic_link;
        } else {
            profilePic = "images/group/dashboard/grp-icon.png";
        }

        return (
            <div className="contact-item">
                <div className="col-sm-6">
                    <div className="image-wrapper">
                        <img src={profilePic}/>
                        {(contact.type == 1) ? <span className={"status " + mood}></span> : null}
                    </div>
                    <div className="name-wrapper">
                        <div className="name-holder">
                            <p className="name">{(contact.type == 1) ? contact.first_name + " " + contact.last_name : contact.name_prefix}</p>
                        </div>
                        <p className="status">{(contact.type == 1) ? mood : null}</p>
                    </div>
                    <div className={"type-icon contact-type " + call_type}>
                        <span></span>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="call-ico-wrapper">
                        <button className="call-ico video" onClick={(event)=> {
                            _this.handleClick(contact, CallChannel.VIDEO)
                        }}></button>
                        <button className="call-ico phone" onClick={(event)=> {
                            _this.handleClick(contact, CallChannel.AUDIO)
                        }}></button>
                    </div>
                </div>
            </div>
        );
    }
}