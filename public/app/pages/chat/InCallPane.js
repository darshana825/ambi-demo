// TODO: Remove this comment. We know that this is InCallPane JS. look at the file name!
/**
 * This is In call Pane JS
 */

import React from 'react';
import Session  from '../../middleware/Session';
import Chat  from '../../middleware/Chat';

export default class InCallPane extends React.Component{
    constructor(pros){
        super(pros);
        if (Session.isSessionSet('prg_lg')) {
            this.b6 = Chat.b6;
            // TODO: Remove log message.
            console.log(this.b6);
            Chat.initChat(this.b6);
        }
    }

    answerVideo(){
        var opts = {audio: true, video: true};
        Chat.answerCall(opts);
    }

    answerAudio(){
        var opts = {audio: true, video: false};
        Chat.answerCall(opts);
    }

    reject(){
        Chat.rejectCall();
    }

    hangup(){
        Chat.hangupCall();
    }

    render() {

        return(
            <div>
                <div className="fh top-padding-20 hidden inCallPane-wrapper" id="detailPane">
                    <div className="row video-call-view col-sm-5" id="inCallPane">
                        <div className="fh">
                            <div className="row top-row" id="inCallPane_inner_div">
                                <div className="video-call-holder">
                                    <div className="row text-center" id="videoContainer">
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12 top-margin-20">
                                            <img src="" id="call_other_profile_image" className="img-responsive img-circle img-custom-large pull-left left-margin-30 hidden" />
                                            <span id="inCallOther">Video Call</span> <span id="onCall">on call...</span>
                                        </div>
                                        <div className="col-sm-12 top-margin-5">
                                            <div id="clock">
                                                <span id="hour">00</span>:<span id="min">00</span>:<span id="sec">00</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="hangup-outer">
                                    <button className="btn btn-danger" id="hangup" title="Stop Call" onClick={()=>this.hangup()}>
                                        <span className="fa fa-times"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="incomingCallAlert" tabIndex="1" role="dialog" aria-labelledby="myModalLabel" data-keyboard="false">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="alert fade in" id="incomingCall">
                                    <img src="/images/default-profile-pic.png" id="incoming_call_alert_other_profile_image" className="img-circle img-custom-medium bottom-margin-20" />
                                    <h4 id="incomingCallFrom">User is calling...</h4>
                                    <p>
                                        <button type="button" className="btn btn-success income-call" id="answerVideo" onClick={()=>this.answerVideo()}>Video</button>
                                        <button type="button" className="btn btn-success income-call" id="answerAudio" onClick={()=>this.answerAudio()}>Audio</button>
                                        <button type="button" className="btn btn-danger income-call" id="reject" onClick={()=>this.reject()}>Reject</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }

}