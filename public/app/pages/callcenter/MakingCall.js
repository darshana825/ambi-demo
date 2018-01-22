import React from "react";

export default class MakingCall extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    reject(){
        return false;
    }

    dialing(){
        return(
            <div className="dialling-panel">
                <div className="alert fade in" id="incomingCall">
                    <img src="/images/default-profile-pic.png"
                            id="incoming_call_alert_other_profile_image"
                            className="img-circle img-custom-medium bottom-margin-20"/>
                    <h4 id="incomingCallFrom">Calling...</h4>
                    <p>
                        <button type="button" className="btn btn-success income-call" id="answerVideo"
                                onClick={()=>this.answerVideo()}>Video
                        </button>
                        <button type="button" className="btn btn-success income-call" id="answerAudio"
                                onClick={()=>this.answerCall()}>Audio
                        </button>
                        <button type="button" className="btn btn-danger income-call" id="reject"
                                onClick={()=>this.reject()}>Reject
                        </button>
                    </p>
                </div>
            </div>
        )
    }
    
    failed(){
        return(
            <div className="dialling-panel">
                <div className="alert fade in" id="incomingCall">
                    <h4 id="incomingCallFrom">Call failed...</h4>
                    <p>
                        <button type="button" className="btn btn-success income-call" id="answerVideo"
                                onClick={()=>this.answerVideo()}>Video
                        </button>
                        <button type="button" className="btn btn-success income-call" id="answerAudio"
                                onClick={()=>this.answerCall()}>Audio
                        </button>
                        <button type="button" className="btn btn-danger income-call" id="reject"
                                onClick={()=>this.reject()}>Reject
                        </button>
                    </p>
                </div>
            </div>
        )
    }

    render(){
        return(
            <div className="modal" id="incomingCallAlert" tabIndex="1" role="dialog"
                    aria-labelledby="myModalLabel"
                    data-keyboard="false">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            {this.dialing()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}