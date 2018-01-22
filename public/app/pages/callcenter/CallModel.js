/**
 * This is call center call model component
 */

import React from "react";
import {Popover, OverlayTrigger} from 'react-bootstrap';
import {CallType, CallChannel} from '../../config/CallcenterStats';
import InputField from '../../components/elements/InputField';

export default class CallModel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isCallBtnEnabled: true,
            isVideoBtnEnabled: true,
            isValoumeBtnEnabled: true,
            selectedUser: null
        };

        this.userList = null;
    }

    onCallBtnClick() {
        let isEnabled = this.state.isCallBtnEnabled;
        this.setState({isCallBtnEnabled: !isEnabled});
    }

    onVideoBtnClick() {
        let isEnabled = this.state.isVideoBtnEnabled;
        this.setState({isVideoBtnEnabled: !isEnabled});
    }

    onVolumeBtnClick() {
        let isEnabled = this.state.isValoumeBtnEnabled;
        this.setState({isValoumeBtnEnabled: !isEnabled});
    }

    onMinimizePopup() {
        this.setState({inCall: false, minimizeBar: true});
    }

    onPopupClose() {
        this.setState({inCall: false, minimizeBar: false});
    }

    switchUser(oUser) {
        this.setState({selectedUser: oUser});
    }

    render() {
        let i = (
            <Popover id="popover-contained" className="share-popover-contained callpopup popup-holder"
                     style={{maxWidth: "265px", zIndex: 9999, marginLeft: "18px"}}>
                <div className="call-center-new-participant">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input type="text" className="form-control" placeholder="Type name"/>
                </div>
            </Popover>
        );

        return (
            <div className="popup-holder">
                <div className="row">
                    <div className="col-sm-12">
                        <div className="group-members-container col-sm-3">
                            <div>
                                <InputField />
                            </div>
                            <div>
                                <ul>
                                    <li>Member 1</li>
                                    <li>Member 2</li>
                                    <li>Member 3</li>
                                    <li>Member 4</li>
                                </ul>
                            </div>
                        </div>
                        <div className="active-call-container col-sm-9">
                            <div className="top-nav">
                                <span className="close-ico" onClick={(e) => this.props.closePopup(e)}></span>
                                <OverlayTrigger rootClose trigger="click" placement="right" overlay={i}>
                                    <span className="add-new-ico"></span>
                                </OverlayTrigger>
                                <span className="minus-ico" onClick={(e) => this.props.minimizePopup(e)}></span>
                                <span className="expand-ico"></span>
                            </div>
                            <div className="active-user-block">
                                <div id="webcamStage">
                                    {   (this.props.callMode == CallChannel.AUDIO) ?
                                        <img src={this.props.targetUser.images.profile_image.http_url}/>
                                        : null }
                                </div>
                                <div className="active-call-nav">
                                    <span className={(this.state.isVideoBtnEnabled) ? "video active" : "video"}
                                          onClick={this.onVideoBtnClick.bind(this)}></span>
                                    <span className={(this.state.isCallBtnEnabled) ? "mute" : "mute active"}
                                          onClick={this.onCallBtnClick.bind(this)}></span>
                                    <span className={(this.state.isValoumeBtnEnabled) ? "speaker" : "speaker active"}
                                          onClick={this.onVolumeBtnClick.bind(this)}></span>
                                    <span className="hang-up" onClick={(e) => this.props.closePopup(e)}></span>
                                </div>
                                <p className="call-receiver-status">Dialling....</p>
                            </div>
                            {
                                <UserBlock switchUser={this.switchUser.bind(this)} targetUser={this.props.targetUser}
                                           loggedUser={this.props.loggedUser}/>
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
                    {   (this.props.callMode == CallType.AUDIO) ?
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