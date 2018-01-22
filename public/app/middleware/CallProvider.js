import {
  CallChannel,
  CallType,
  CallChannelNames,
  ContactResponse,
  ContactType,
  CallStage
} from '../config/CallcenterStats'
import Socket from './Socket'
import AjaxProvider from './AjaxProvider'

class CallProvider extends AjaxProvider {

  constructor() {
    super()
    this.authToken = null
    this.socket = Socket.socket
  }

  saveCallRecord(newCall) {
    return this.post('/call/add-record', true, {callRecord: newCall})
  }

  updateCallRecord(recordID, updates) {
    return this.post('/call/update-record', true, {recordID: recordID, updates: updates})
  }

  updateTargetContact(target, updates) {

    for (let key in updates) {
      switch (key) {
        case 'userName':
          target[key] = updates[key]
        case 'contactName':
          target[key] = updates[key]
        case 'twilioIdentity' :
          target[key] = updates[key]
        case 'response':
          target[key] = updates[key]
      }
    }

    return target
  }

  getIndexByKeyValue(list, key, value) {
    function isKeyValueExist(item) {
      return item[key] === value;
    }

    return list.findIndex(isKeyValueExist)
  }

  createCallContactSchema(contact, originContact, localContact) {
    let callContactSchema = {
      userName: contact.user_name,
      contactName: contact.contact_name,
      profilePicture: null,
      twilioIdentity: contact.twilio_identity,
      localContact: localContact,
      originContact: originContact,
      response: null,
      audioEnabled: false,
      videoEnabled: false
    }

    if (originContact) {
      callContactSchema.profilePicture = contact.profile_image
    } else {
      callContactSchema.profilePicture = contact.images.profile_image.http_url
    }

    return callContactSchema
  }

  createNewCallSchema() {
    return {
      callStage: CallStage.DIALING,
      contacts: [],
      call: {
        callId: null,
        roomName: null,
        callChannel: null,
        contactType: null,
        callType: CallType.OUTGOING
      }
    }
  }

  getCallRecords() {
    return this.get('/call/get-records', true)
  }

  getCallChannel(call) {
    if (call.options.audio && !call.options.video) {
      return CallChannel.AUDIO;
    } else if (call.options.audio && call.options.video) {
      return CallChannel.VIDEO;
    } else {
      return false;
    }
  }

  isGroupContact(type) {
    return (type === ContactType.GROUP)
  }

  isOutGoingCall(callType) {
    return (callType === CallType.OUTGOING)
  }

  getCallChannelName(channel) {
    return (channel === CallChannel.AUDIO) ? CallChannelNames.AUDIO : CallChannelNames.VIDEO
  }

  isContactAnswered(response) {
    return (response === ContactResponse.ANSWERED)
  }

  isCurrentlyOnGoingCall(onGoingCallId, callId) {
    return (onGoingCallId === callId)
  }

  // Dial Outgoing call
  dialCall(outGoingCall, callBack) {
    this.socket.emit('call dial-call', outGoingCall)
    callBack()
  }

  // Hang-Up ongoing call
  hangUpCall(onGoingCall, hangedUpUsername) {
    this.socket.emit('call hangup', onGoingCall, hangedUpUsername)
  }

  // Reject incoming call
  rejectCall(inComingCall, rejectedtUsername) {
    this.socket.emit('call reject', inComingCall, rejectedtUsername)
  }

  // Answer Call
  inComingCallAnswered(answeredCall, answeredUserName) {
    this.socket.emit('call incoming-answered', answeredCall, answeredUserName)
  }

  // Add Contact to Ongoing call - we can remove this if dialCall method suffice this feature
  inviteToCall(invitingCall) {
    this.socket.emit('call invite-to-call', invitingCall)
  }

  receiveIncomingCalls(callBack) {
    this.socket.on('incoming-call', function (inComingCall) {
      callBack(inComingCall)
    })
  }

  outGoingCallAnswered(callBack) {
    this.socket.on('outgoing-call-answered', function (inComingCall, answeredUserName) {
      callBack(inComingCall, answeredUserName)
    })
  }

  onGoingCallHangedUp(callBack) {
    this.socket.on('call-hanged-up', function (hangedUpCall, hangedUpUsername) {
      callBack(hangedUpCall, hangedUpUsername)
    })
  }

  onCallRejected(callBack) {
    this.socket.on('call-rejected', function (rejectedUpCall, rejectedUsername) {
      callBack(rejectedUpCall, rejectedUsername)
    })
  }

  onCallError(callBack) {
    this.socket.on('call-error', function (call) {
      callBack(call)
    })
  }
}

export default new CallProvider
