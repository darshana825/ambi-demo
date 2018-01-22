import React from 'react';
import CallProvider  from '../../middleware/CallProvider';

export default class IncomingCall extends React.Component {

  constructor(props) {
    super(props);
  }

  answerCall(inComingCallIndex) {
    this.props.answerCall(inComingCallIndex);
  }

  hangUp(inComingCallIndex) {
    this.props.hangUpCall(inComingCallIndex);
  }

  render() {
    let inComingCall = this.props.inComingCallInfo
    let incComingContact = inComingCall.contacts[CallProvider.getIndexByKeyValue(inComingCall.contacts, 'originContact', true)]
    let callChannelName = CallProvider.getCallChannelName(inComingCall.call.callChannel)

    console.log('inComingCall', inComingCall)

    return (
      <div className="popup-holder">
        <div className="incoming-call-wrapper">
          <div className="popup-header">
            <h3 className="title">incoming {callChannelName} call</h3>
          </div>
          <div className="popup-body">
            <div className="calling-options">
              <span className="hangup-call" onClick={()=>this.hangUp(inComingCall.callIndex)}></span>
              <div className="calling-agent">
                <div className="outer-wrapper">
                  <img src={incComingContact.profilePicture} className="img-circle profile-pic"/>
                </div>
              </div>
              <span className="answer-call" onClick={()=>this.answerCall(inComingCall.callIndex)}></span>
            </div>
            <h3 className="agent-name">{incComingContact.contactName}</h3>
            <p3 className="footer-title">calling you...</p3>
          </div>
        </div>
        <audio src="/audio/incoming_call_tone.mp3" autoPlay />
      </div>
    )
  }
}