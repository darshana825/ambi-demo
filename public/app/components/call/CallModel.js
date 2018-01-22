/**
 * This is call center call model component
 */

import React from "react";
import {Popover, OverlayTrigger} from 'react-bootstrap';
import {Bit6CallState, CallChannel, ContactType, CallStage} from '../../config/CallcenterStats';
import InputField from '../elements/InputField';

export default class CallModel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSpeakerEnabled: true,
            isVideoBtnEnabled: false,
            isMicEnabled: true,
            selectedUser: null,
            isCallBtnEnabled: true,
            contactList: [],
            callerList: []
        };

        this.addToCallList = [];
        this.userList = null;
        this.contactList = this.props.targetUser.members;
        this.userNameChange = this.userNameChange.bind(this);
        this.addRemoveUser = this.addRemoveUser.bind(this);
    }

    onVideoBtnClick() {
        (this.props.bit6Call.options.video) ? this.props.toggleVideo(false) : this.props.toggleVideo(true);
    }

    onMicBtnClick() {
        (this.props.bit6Call.options.audio) ? this.props.toggleMic(false) : this.props.toggleMic(true);
    }

    onMinimizePopup() {
        this.setState({minimizeBar: true});
    }

    onPopupClose() {
        this.setState({minimizeBar: false});
    }

    switchUser(oUser) {
        this.setState({selectedUser: oUser});
    }

    userNameChange(e) {
        let contactList = [];

        if (e.target.value.length >= 1) {
            for (var key in this.contactList) {
                let uName = this.contactList[key].first_name + ' ' + this.contactList[key].last_name;
                if (uName.toLowerCase().indexOf(e.target.value) >= 0) {
                    this.contactList[key].name = uName;
                    contactList.push(this.contactList[key]);
                }
            }
        } else {
            contactList = [];
        }

        this.setState({userName: e.target.value, contactList: contactList});
    }

    addRemoveUser(action, contact, key) {
        let callerList = this.state.callerList,
            i;

        if (action == "add") {
            callerList.push(contact);
            this.addToCallList.push(key);
        } else {
            for (i = callerList.length - 1; i >= 0; i--) {
                if (callerList[i].user_id == contact.user_id) callerList.splice(i, 1);
            }

            let index = this.addToCallList.indexOf(key);
            if (index > -1) {
                this.addToCallList.splice(index, 1);
            }

        }

        this.setState({callerList: callerList});
    }

    isInArray(value, array) {
        return array.indexOf(value) > -1;
    }

    getVideoStage() {
        if (this.props.targetUser.type == ContactType.INDIVIDUAL) {
            if (this.props.remoteChannel === CallChannel.VIDEO && (this.props.bit6Call.state == Bit6CallState.OUTGOING.ANSWER || this.props.bit6Call.state == Bit6CallState.OUTGOING.RENEGOTIATION || this.props.bit6Call.state == Bit6CallState.INCOMING.ANSWER || this.props.bit6Call.state == Bit6CallState.INCOMING.RENEGOTIATION)) {
                return null;
            } else {
                return (<img src={(this.props.targetUser.images.profile_image.http_url) ? this.props.targetUser.images.profile_image.http_url : "images/default-profile-pic.png"}/>);
            }
        } else {
            return (
                <img
                    src={(this.props.targetUser.group_pic_link) ? this.props.targetUser.group_pic_link : "images/group/dashboard/grp-icon.png"}/>
            );
        }
    }

    dialCall() {
        this.props.dialCall(this.state.callerList);
    }

    render() {
        let _this = this;
        let i = (
            <Popover id="popover-contained" className="share-popover-contained callpopup popup-holder"
                     style={{maxWidth: "265px", zIndex: 9999, marginLeft: "18px"}}>
                <div className="call-center-new-participant">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input type="text" className="form-control" placeholder="Type name"/>
                </div>
            </Popover>
        );

        let _listContacts = this.state.contactList.map(function (contact, key) {
            return (
                <li className="user-block" key={key}>
                    <p className="user-name">{contact.name}</p>
                    <div className="icon-holder">
                        <i className={(_this.isInArray(key, _this.addToCallList)) ? "fa fa-plus active" : "fa fa-plus"}
                           onClick={(e) => _this.addRemoveUser("add", contact, key)}></i>
                        <i className="fa fa-minus" onClick={(e) => _this.addRemoveUser("remove", contact, key)}></i>
                    </div>
                </li>
            );
        });

        return (
            <div className="popup-holder">
                <div className="row">
                    <div className="col-sm-12">
                        {
                            (this.props.targetUser.type == ContactType.GROUP) ?
                                <div className="group-members-container col-sm-3">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Type name"
                                               value={this.state.userName} onChange={(e) => this.userNameChange(e)}/>
                                    </div>
                                    <ul className="user-block-holder">
                                        {_listContacts}
                                    </ul>
                                </div>
                                :
                                null

                        }
                        <div
                            className={(this.props.targetUser.type == ContactType.GROUP) ? "active-call-container col-sm-9" : "active-call-container"}>
                            <div className="top-nav">
                                <span className="close-ico" onClick={(e) => this.props.closePopup(e)}></span>
                                {
                                    (this.props.targetUser.type == ContactType.INDIVIDUAL) ?
                                        <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                            <span className="add-new-ico"></span>
                                        </OverlayTrigger>
                                        :
                                        null
                                }
                                <span className="minus-ico" onClick={(e) => this.props.minimizePopup(e)}></span>
                                <span className="expand-ico"></span>
                            </div>
                            <div className="active-user-block">
                                <div id="webcamStage">
                                    {
                                        this.getVideoStage()
                                    }
                                </div>
                                <div className="active-call-nav">
                                    <span
                                        className={(this.props.bit6Call.options.video) ? "video active" : "video"}
                                        onClick={this.onVideoBtnClick.bind(this)}></span>

                                    <span className={(this.props.bit6Call.options.audio) ? "mute" : "mute active"}
                                          onClick={this.onMicBtnClick.bind(this)}></span>

                                    <span className={(this.state.isSpeakerEnabled) ? "speaker" : "speaker active"}
                                    ></span>
                                    {
                                        (this.props.callStage == CallStage.DIAL_CALL || this.props.callStage == CallStage.ANSWER_CALL) ?
                                            <span className="hang-up" onClick={(e) => this.props.closePopup(e)}></span>
                                            :
                                            <span className="dial-call" onClick={(e) => this.dialCall(e)}></span>
                                    }

                                </div>
                                <p className="call-receiver-status">{(this.props.callStage == CallStage.DIAL_CALL) ? 'Dialling....' : ''}</p>
                            </div>
                            {
                                (this.props.targetUser.type == ContactType.INDIVIDUAL) ?
                                    <UserBlock switchUser={this.switchUser.bind(this)}
                                               targetUser={this.props.targetUser}
                                               loggedUser={this.props.loggedUser}
                                               bit6Call={this.props.bit6Call}
                                    />
                                    :
                                    null
                            }
                            <div className="call-timer">
                                <p className="call-status">On Call -</p>
                                <p className="call-time">00 : 00 : 10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class UserBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: this.props.loggedUser.user_name
        }
    }

    onUserClick(oUser) {
        console.log(this);
        // this.props.switchUser(oUser);
        this.setState({userName: oUser.user_name});
    }

    isUserActive(user) {
        return "user-block " + ((this.state.userName == user) ? "active" : null);
    }

    render() {
        //noinspection CheckTagEmptyBody
        let _this = this,
            _loggedUser = this.props.loggedUser,
            _targetUser = this.props.targetUser,
            _targetHtml = <div className={_this.isUserActive(_targetUser.user_name)}
                               onClick={_this.onUserClick.bind(_targetUser)}>
                <img src={_targetUser.images.profile_image.http_url}/>
                <span className="active-user"></span>
            </div>;

        return (
            <div className="participants">
                <div id="origin_webcamStage" className={this.isUserActive(_loggedUser.user_name)}
                     onClick={this.onUserClick.bind(_loggedUser)}>
                    {
                        (!this.props.bit6Call.options.video) ?
                            <img
                                src={(_loggedUser.profile_image) ? _loggedUser.profile_image : "/images/default-profile-pic.png"}/>
                            : null }
                    <div className="actions-wrapper">
                        <span className="video"></span>
                        <span className="mute"></span>
                    </div>
                    <span className="active-user"></span>
                </div>
                {_targetHtml}
            </div>
        )
    }
}