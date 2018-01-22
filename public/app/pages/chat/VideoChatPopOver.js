import React from 'react';
import Session  from '../../middleware/Session';
import moment from 'moment';
import Socket  from '../../middleware/Socket';
import WorkMode  from '../../middleware/WorkMode';

export default class VideoChatPopOver extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loggedUser:Session.getSession('prg_lg'),
            showPopup: false,
            _prg_wm: WorkMode.getWorkMode()
        }

        this.togglePopOver = this.togglePopOver.bind(this);
        this.checkWorkMode();
    }

    togglePopOver() {
        // let _state = this.state.showPopup;
        // this.setState({showPopup: !_state});
        console.log('uncomment this for side bar functionality');
    }

    checkWorkMode(){
        let _this = this;
        Socket.listenToWorkModeStatus(function (data) {
            _this.setState({_prg_wm: data});
        });
    }

    render () {
        const {loggedUser, _prg_wm} = this.state;
        let holder_class = (_prg_wm)? "video-chat-wrapper wm-active" : "video-chat-wrapper";

             return (
                <section className={holder_class}>
                    <div className={this.state.showPopup ? "inner-container clearfix opened" : "inner-container clearfix"}>
                        <span className="open-chat-window" onClick={this.togglePopOver.bind(this)}></span>
                        { this.state.showPopup ?
                            <div className="active-chat-holder clearfix">
                            <div className="chat-header">
                                <span className="close-chat" onClick={this.togglePopOver.bind(this)}></span>
                                <span className="maximize-chat"></span>
                            </div>
                                {
                                    (_prg_wm.calls)?
                                        <div className="wm-content">
                                            <div className="participants-container">
                                                <div className="participant active" style={{backgroundImage: "url(images/video-chat/user_1.png)"}}>
                                                    <div className="action-bar">
                                                        <span className="video-control"></span>
                                                        <span className="voice-control"></span>
                                                        <span className="call-control"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="content-wrapper clearfix">
                                                <img src="../images/work-mode/wm-ambi-icon.png" className="pull-left" />
                                                <p className="content pull-left">{loggedUser.first_name + "! Remember you're on work mode! Don't get distracted"}!</p>
                                            </div>
                                            <h3 className="title-text">what would you like to do?</h3>
                                            <div className="btn-holder">
                                                <span className="btn grey" onClick={this.togglePopOver.bind(this)}>get back to work</span>
                                                <span className="btn blue" onClick={()=> {WorkMode.workModeAction("unblock", "calls")}}>make a call</span>
                                                <span className="btn pink" onClick={()=> {WorkMode.workModeAction("done")}}>i’m done!</span>
                                            </div>
                                        </div>
                                    :
                                    <div>
                                        <div className="participants-container">
                                            <div className="participant active" style={{backgroundImage: "url(images/video-chat/user_1.png)"}}>
                                                <div className="action-bar">
                                                    <span className="video-control"></span>
                                                    <span className="voice-control"></span>
                                                    <span className="call-control"></span>
                                                </div>
                                            </div>
                                            <div className="participant" style={{backgroundImage: "url(images/video-chat/user_2.png)"}}>
                                                <div className="action-bar">
                                                    <span className="video-control"></span>
                                                    <span className="voice-control"></span>
                                                    <span className="call-control"></span>
                                                </div>
                                            </div>
                                            <div className="participant" style={{backgroundImage: "url(images/video-chat/user_3.png)"}}>
                                                <div className="action-bar">
                                                    <span className="video-control"></span>
                                                    <span className="voice-control"></span>
                                                    <span className="call-control"></span>
                                                </div>
                                            </div>
                                            <div className="participant" style={{backgroundImage: "url(images/video-chat/user_4.png)"}}>
                                                <div className="action-bar">
                                                    <span className="video-control"></span>
                                                    <span className="voice-control"></span>
                                                    <span className="call-control"></span>
                                                </div>
                                            </div>
                                            <div className="participant new">
                                                <img src="images/video-chat/user.png" className="user-image" />
                                                <p className="label">add someone</p>
                                            </div>
                                            </div>
                                            <div className="chat-footer">
                                                <div className="call-time">
                                                    <p className="label">active call time</p>
                                                    <p className="time">01.27</p>
                                                </div>
                                            <div className="action-bar">
                                                <span className="search"></span>
                                                <span className="add-new"></span>
                                            </div>
                                        </div>
                                    </div>
                                }
                        </div> : null
                        }
                    </div>
                </section>
             )
    }
}
