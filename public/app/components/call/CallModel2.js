/**
 * This is call center call model component
 */

import React from "react"
import classNames from "classnames"
import {CallStage, CallChannel} from '../../config/CallcenterStats'
import {Popover, OverlayTrigger} from 'react-bootstrap'

import CallProvider from '../../middleware/CallProvider';

export default class CallModel2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      callPopUpClasses: classNames(this.callLargePouUpClassNames(this.props.call)),
      callingEffectBackgroundIndex: 0,
      audio: true,
      video: false
    }
  }

  componentDidMount() {
    if (this.props.call.callStage === CallStage.DIALING) {
      this.callingEffect()
    }

    let call = this.props.call

    if (call.call.callChannel === CallChannel.AUDIO) {
      this.setState({audio: true, video: false})
    } else {
      this.setState({audio: true, video: true})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.call.callStage === CallStage.ANSWERED) {
      let classes = classNames(this.callLargePouUpClassNames(nextProps.call))
      this.setState({callPopUpClasses: classes})
    }
  }

  onMinimizePopup() {
    this.setState({minimizeBar: true});
  }

  onPopupClose() {
    this.setState({minimizeBar: false});
  }

  onHangUpCall() {
    this.props.hangUpCall()
  }

  onToggleAudio() {
    this.props.toggleAudio(!this.state.audio)
    this.setState({audio: !this.state.audio})
  }

  onToggleVideo() {
    this.props.toggleVideo(!this.state.video)
    this.setState({video: !this.state.video})
  }

  callLargePouUpClassNames(call) {

    let classes = {'cc-large-popup': true, 'clearfix': true}

    if (CallProvider.isGroupContact(call.call.contactType)) {
      classes['group-call'] = true
    } else {
      classes['single-person-call'] = true
    }

    if (call.callStage === CallStage.ANSWERED) {
      classes['single-person-call'] = false
    }

    if (call.call.callChannel === CallChannel.AUDIO) {
      classes['on-audio-call'] = true
    } else {
      classes['on-video-call'] = true
    }

    return classes
  }

  callingEffect() {
    let _this = this
    let call = _this.props.call

    let img = _this.state.callingEffectBackgroundIndex

    if (img != 3) {
      img++
    } else {
      img = 0
    }

    document.getElementById('effect-wrapper').style.backgroundImage = "url('/images/call-center/v2/calling-effect/st_" + img + ".png')";

    _this.setState({
      callingEffectBackgroundIndex: img
    })

    setTimeout(function () {
      if ((call.callStage === CallStage.DIALING)) {
        _this.callingEffect();
      }
    }, 550);
  }

  listDialingContactNames(contacts, callingContactType) {
    if (CallProvider.isGroupContact(callingContactType)) {
      return contacts.map(function (contact, index) {
        let key = 'dc_' + index
        return (
          <span key={key}>
              calling {contact.contactName}…
          </span>
        )
      })
    } else {
      return contacts.map(function (contact, index) {
        let key = 'dc_' + index

        if (!contact.localContact) {
          return (
            <div key={key}>
              <div className="receiver-wrapper">
                <div className="dialling-effect" id="effect-wrapper">
                  <img src={contact.profilePicture} alt="" className="receiver img-circle"/>
                </div>
              </div>
              <p className="popup-des">
                calling {contact.contactName}…
              </p>
            </div>
          )
        }
      })
    }
  }

  listAudioCallContacts(contacts) {
    return contacts.map(function (contact, index) {
      let key = 'ac_' + index

      if (!contact.localContact) {
        return (
          <div key={key}>
            <div className="receiver-wrapper">
              <img src={contact.profilePicture} className="receiver img-rounded"/>
              <p className="receiver-name">{contact.contactName}</p>
            </div>
          </div>
        )
      }
    })
  }

  listContacts(contacts) {
    return contacts.map(function (contact, index) {
      let key = 'contact_' + index

      if (!contact.localContact) {
        return (
          <div key={key} className="invitee-block">
            <img src={contact.profilePicture} alt=""
                 className="img-responsive img-rounded invitee"/>
          </div>
        )
      }
    })
  }

  render() {
    let call = this.props.call
    let onGoingCallMedia = this.props.onGoingCallMedia

    let localUser = call.contacts[CallProvider.getIndexByKeyValue(call.contacts, 'localContact', true)]

    return (
      <div className="popup-holder">
        <div className={this.state.callPopUpClasses}>
          <div className="popup-header-container">
            <div className="top-header">
{/*
              <p className="call-title">04:55 | test tittle</p>
*/}
            </div>
            <span className="btn-settings"></span>

            <div className="invitees-wrapper">
              <div className="invitees-container">
                {this.listContacts(call.contacts)}
              </div>
              <span className="btn-invite-people"></span>
            </div>
          </div>
          <div className="popup-body-container">
            <div className="flex-container">
              { (call.callStage === CallStage.DIALING) ? this.listDialingContactNames(call.contacts, call.call.contactType) : null}
              { (call.callStage === CallStage.ANSWERED && call.call.callChannel === CallChannel.AUDIO) ? this.listAudioCallContacts(call.contacts) : null }
            </div>
          </div>
          <div className="popup-footer-container clearfix">
            <div className="actions-wrapper">
              <span onClick={()=>this.onToggleVideo()}
                    className={(this.state.video) ? 'icon btn-video active' : 'icon btn-video'}></span>
              <span onClick={(event)=>this.onToggleAudio()} className="icon btn-mic"></span>
              <span className="icon btn-desktop"></span>
              <span className="icon btn-hang-up" onClick={(event) => this.onHangUpCall()}></span>
            </div>
            <div className="call-wrapper localContactPreview">
              {
                (call.call.callChannel === CallChannel.AUDIO) ?
                  <img src={localUser.profilePicture} className="caller-ico img-rounded"/>
                  :
                  null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
