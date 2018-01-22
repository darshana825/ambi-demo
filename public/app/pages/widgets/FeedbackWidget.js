/**
 * FeedbackWidget Component
 */
import React from 'react';  
import Session  from '../../middleware/Session';

export default class FeedbackWidget extends React.Component {

  constructor(props) {
    super(props);

    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }

    let session = Session.getSession('prg_lg');

    this.state = {
      user: session,
      showPopup: false,
      subject: '',
      feedback: '',
    };
  }

  toggleFeedback() {
    console.log("toggleFeedback");
    let showPopup = !this.state.showPopup;
    this.setState({showPopup: showPopup});
  }

  changeSubject(event) {
    this.setState({subject: event.target.value});
  }

  changeFeedback(event) {
    this.setState({feedback: event.target.value});
  }

  save() {
    this.toggleFeedback();
    this.setState({subject: '', feedback: ''});
    return;
    let feedbackVals = { subject: this.state.subject, comments: this.state.comment};

    $.ajax({
      url: '/widgets/countdown/update',
      method: "POST",
      dataType: "JSON",
      data:feedbackVals,
      headers: { 'prg-auth-header':this.state.user.token },
      success: function (data, text) {
        console.log("response: " + JSON.stringify(data, null, 4));
        if(data.status.code == 200 ){
          // todo clear
          this.toggleFeedback();
        }
      }.bind(this),
      error: function (request, status, error) {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      }.bind(this)
    });
  }

  render() { 
    return ( 
      <div id="feedback-widget">   
        {this.state.showPopup &&
          <div className="popup">
            <p>Share feedback with Ambi</p>
            <h5>SUBJECT</h5>
            <input type="text" value={this.state.subject} onChange={this.changeSubject.bind(this)} />
            <h5 className='secondary-label'>FEEDBACK</h5>
            <textarea value={this.state.feedback} onChange={this.changeFeedback.bind(this)} />

            <button className='btn btn-primary' onClick={this.save.bind(this)}>submit</button>
          </div>
        }
        <div onClick={this.toggleFeedback.bind(this)}>
          <i className='fa fa-comment fa-2x'></i> 
        </div>
      </div> 
    )
  } 
}