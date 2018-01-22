import React from 'react';
import IncomingCall from './IncomingCall';

export default class CallHandler extends React.Component {
  constructor(props) {
    super(props);
  }

  notificationDomIdForConversation(c) {
    return '#notification__' + c.domId();
  }

  answerCall(inComingCallIndex) {
    this.props.answerCall(inComingCallIndex);
  }

  hangUpCall(inComingCallIndex) {
    this.props.hangUpIncomingCall(inComingCallIndex);
  }

  render() {
    return (
      <IncomingCall
        inComingCallInfo={this.props.inComingCallInfo}
        answerCall={this.answerCall.bind(this)}
        hangUpCall={this.hangUpCall.bind(this)}
      />
    )
  }
}
