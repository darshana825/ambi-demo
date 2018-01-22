import React from 'react';
import async from 'async';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import SigninHeader from '../../components/header/SigninHeader';
import FooterHolder from '../../components/footer/FooterHolder';
import Toast from '../../components/elements/Toast';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import CommunicationsProvider from "../../middleware/CommunicationsProvider";
import AmbiDashboard  from '../dashboard/AmbiDashboard';
import QuickChatHandler from '../chat/QuickChatHandler';
import SettingsPopup from '../settings/SettingsPopup';
import WorkMode from '../workmode/Index';
import WorkModePopup from '../workmode/WorkModePopup';
import WorkModeMiddleWare  from '../../middleware/WorkMode';
import NotificationPop from '../notifications/NotificationPop';
import PubSub from 'pubsub-js';
import Chat from '../../middleware/Chat';
import VideoChatPopOver from '../chat/VideoChatPopOver';
import {Config} from '../../config/Config';
import CallCenter from '../../middleware/CallCenter';
import CallModel from '../../components/call/CallModel';
import WmCountdown from '../../components/elements/WmCountdown';

/** Call-Center related dependencies **/
import * as jsonwebtoken from 'jsonwebtoken';
import {
  CallChannel,
  CallType,
  CallStatus,
  UserMode,
  ContactType,
  CallStage,
  ContactResponse
} from '../../config/CallcenterStats';
import TwilioVideoProvider from '../../middleware/TwilioVideoProvider';
import CallProvider from '../../middleware/CallProvider';
import ContactProvider from '../../middleware/ContactProvider';

import CallModel2 from '../../components/call/CallModel2';
import CallHandler  from '../../components/call/CallHandler';
import CallInitiator from '../../components/call/InitiateCallIndicator';

export default class AmbiLayout extends React.Component {
  constructor(props) {
    super(props);

    let _this = this;

    //bit6 will work on https
    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }
    if (window.location.protocol == 'http:') {
      var url_arr = window.location.href.split('http');
      window.location.href = 'https' + url_arr[1];
    }

    let _rightBottom = false;
    let _socialNotifications = false;

    this.checkWorkModeInterval = null;

    this.b6 = CallCenter.b6;

    if (Session.getSession('prg_wm') != null) {
      let _currentTime = new Date().getTime();
      let _finishTime = Session.getSession('prg_wm').endTime;

      if (_currentTime > _finishTime) {
        Session.destroy("prg_wm");
      } else {
        let _this = this;
        _rightBottom = Session.getSession('prg_wm').rightBottom;
        _socialNotifications = Session.getSession('prg_wm').socialNotifications;
        if (_rightBottom == true || _socialNotifications == true) {
          this.checkWorkModeInterval = setInterval(function () {
            _this.checkWorkMode()
          }, 1000);
        }
      }
    }

    let loggedUser = Session.getSession('prg_lg');
    let twilioAccessToken = Session.getSession('twilio-access-token')

    if (loggedUser) {
      CallProvider.authToken = loggedUser.token;
    }

    if (twilioAccessToken) {
      TwilioVideoProvider.twilioToken = twilioAccessToken.token;
    }

    this.state = {
      chatBubble: [],
      userLoggedIn: loggedUser,
      rightBottom: _rightBottom,
      socialNotifications: _socialNotifications,
      isShowingModal: false,
      isShowingWMP: false,
      showNotificationsPopup: false,
      notifiType: "",
      notificationCount: "",
      isNavHidden: false,
      toastMessage: {
        visible: false,
        message: '',
        type: ''
      },
      dummyChatArray: [],
      loadedChatBubbleId: 0,
      isNewChatLoaded: false,
      my_connections: [],
      connection_requests: [],
      showSettingsPopup: false,
      wmTimerActive: false,
      _prg_wm: null,

      // bit6Call States
      bit6Call: null,
      targetUser: null, // Individual User or Group
      callChannel: null,
      callStage: null,
      incomingCallerName: null,
      callRecord: null,

      inComingCalls: [],
      callInitiationInProgress: false,
      callInProgress: false,
      onGoingCallModel: false,
      initiatingCall: null,
      onGoingCall: null,
      twilioRoom: null,
      onGoingCallTime: 0,
      onGoingCallMedia: {
        audio: false,
        video: false
      }
    }
    ;

    // Call Record
    this.callRecord = {
      targets: []
    };

    this.contacts = [];

    this.quickChatUsers = [];
    this.chatProvider = CommunicationsProvider.getChatProvider();

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    //this.doVideoCall = this.doVideoCall.bind(this);
    //this.doAudioCall = this.doAudioCall.bind(this);
    this.onToastClose = this.onToastClose.bind(this);

    this.checkWorkMode();
    this.loadConnectionRequests();

    this.onTwilioMessageAdded = this.onTwilioMessageAdded.bind(this);
  }

  componentWillMount() {
    let _this = this;
    let FVM = "FRIEND_PROFILE_MESSAGING";
    let FPVC = "FRIEND_PROFILE_VIDEO_CALL";
    let VIDEO_CALL = "VIDEO";

    PubSub.subscribe(FVM, function (msg, data) {

      let chatExists = false;
      if (_this.quickChatUsers.length > 0) {
        for (let con in _this.quickChatUsers) {
          if (_this.quickChatUsers[con].title == data.title) {
            chatExists = true;
          }
        }
      }

      if (!chatExists) {
        _this.quickChatUsers.push(data);
        _this.setState({chatBubble: _this.quickChatUsers});
      }
    });

    PubSub.subscribe(FPVC, function (msg, data) {

      if (data.type == VIDEO_CALL) {
        //_this.doVideoCall(data);
        _this.startCall(data.user, CallChannel.VIDEO)
      } else {
        //_this.doAudioCall(data);
        _this.startCall(data.user, CallChannel.AUDIO)
      }

    });
  }

  componentDidMount() {
    this.getWorkModeData();
    let that = this, _prg_wm = WorkModeMiddleWare.getWorkMode();
    $(window).click(function (e) {
      let targ = $(e.target);

      if (that.state.showSettingsPopup && !targ.is('.settings-icon') && !targ.parents().andSelf().is('.settings-popup')) {
        that.setState({showSettingsPopup: false}); // Hide settings popup when clicking outside
      }
    });

    this.setState({wmTimerActive: _prg_wm.is_work_mode_active});

    CallProvider.receiveIncomingCalls(function (inComingCall) {
      that.addIncomingCall(inComingCall)
    });

    CallProvider.outGoingCallAnswered(function (answeredCall, answeredUserName) {
      let onGoingCall = that.state.onGoingCall

      if (CallProvider.isCurrentlyOnGoingCall(onGoingCall.call.callId, answeredCall.call.callId)) {
        let contactIndex = CallProvider.getIndexByKeyValue(onGoingCall.contacts, 'userName', answeredUserName)

        if (contactIndex > -1) {
          let updatedContact = CallProvider.updateTargetContact(onGoingCall.contacts[contactIndex], {
            twilioIdentity: answeredCall.twilioIdentity,
            response: ContactResponse.ANSWERED
          })

          onGoingCall.contacts[contactIndex] = updatedContact

          onGoingCall.callStage = CallStage.ANSWERED

          that.setState({onGoingCall: onGoingCall})
        }
      }
    })

    CallProvider.onGoingCallHangedUp(function (hangedUpCall, hangedUpUsername) {
      console.log('onGoingCallHangedUp')

      let onGoingCall = that.state.onGoingCall

      if (onGoingCall) {
        if (CallProvider.isCurrentlyOnGoingCall(onGoingCall.call.callId, hangedUpCall.call.callId)) {
          let contactIndex = CallProvider.getIndexByKeyValue(onGoingCall.contacts, 'userName', hangedUpUsername)

          if (contactIndex > -1) {
            onGoingCall.contacts[contactIndex].response = ContactResponse.REJECTED

            if (CallProvider.getIndexByKeyValue(onGoingCall.contacts, 'response', ContactResponse.ANSWERED) === -1) {
              let twilioRoom = that.state.twilioRoom

              twilioRoom.disconnect()

              that.setState({callInProgress: false, onGoingCall: null, twilioRoom: null})
            } else {
              that.setState({onGoingCall: onGoingCall})
            }
          }
        }
      } else {
        let inComingCalls = that.state.inComingCalls

        let inComingCallIndex = CallProvider.getIndexByKeyValue(inComingCalls, 'callId', hangedUpCall.call.callId)
        inComingCalls.splice(inComingCallIndex, 1)

        that.setState({inComingCalls: inComingCalls})
      }
    })

    CallProvider.onCallRejected(function (rejectedCall, rejectedUsername) {
      console.log('call rejected')


      let onGoingCall = that.state.onGoingCall

      if (onGoingCall) {
        if (CallProvider.isCurrentlyOnGoingCall(onGoingCall.call.callId, rejectedCall.call.callId)) {
          let contactIndex = CallProvider.getIndexByKeyValue(onGoingCall.contacts, 'userName', rejectedUsername)

          if (contactIndex > -1) {
            onGoingCall.contacts[contactIndex].response = ContactResponse.REJECTED

            if (CallProvider.getIndexByKeyValue(onGoingCall.contacts, 'response', ContactResponse.ANSWERED) === -1) {
              let twilioRoom = that.state.twilioRoom

              twilioRoom.disconnect()

              that.setState({callInProgress: false, onGoingCall: null, twilioRoom: null})
            } else {
              that.setState({onGoingCall: onGoingCall})
            }
          }
        }
      }

    })
  }

  addIncomingCall(inComingCall) {
    let incomingCalls = this.state.inComingCalls;
    inComingCall.call.callType = CallType.INCOMING

    let originContactIndex = CallProvider.getIndexByKeyValue(inComingCall.contacts, 'originContact', true)
    let localContactIndex = CallProvider.getIndexByKeyValue(inComingCall.contacts, 'userName', this.state.userLoggedIn.user_name)

    inComingCall.contacts[localContactIndex].localContact = true
    inComingCall.contacts[originContactIndex].localContact = false
    incomingCalls.push(inComingCall);

    this.setState({inComingCalls: incomingCalls});
  }

  showIncomingCall() {
    let _this = this;

    return _this.state.inComingCalls.map(function (inComingCall, index) {
      inComingCall.callIndex = index

      let key = 'incoming_call' + index

      return (
        <div key={key}>
          <ModalContainer zIndex={9999}>
            <ModalDialog className="modalPopup">
              <CallHandler
                inComingCallInfo={inComingCall}
                answerCall={_this.answerCall.bind(_this)}
                hangUpIncomingCall={_this.hangUpIncomingCall.bind(_this)}
              />
            </ModalDialog>
          </ModalContainer>
        </div>
      )
    });
  }

  getWorkModeData() {
    let _this = this;
    $.ajax({
      url: '/work-mode/get',
      method: "GET",
      dataType: "JSON",
      headers: {'prg-auth-header': this.state.userLoggedIn.token}
    }).done(function (data, text) {
      if (data.status.code == 200) {
        _this.setState({_prg_wm: data.work_mode});
        WorkModeMiddleWare.checkWorkMode(data.work_mode);
      }
    }.bind(this));
  }

  doVideoCall(callObj) {
    Chat.startOutgoingCall(callObj.uri, true);
  };

  doAudioCall(callObj) {
    Chat.startOutgoingCall(callObj.uri, false);
  };

  checkWorkMode() {
    if (Session.getSession('prg_wm') != null) {
      let _currentTime = new Date().getTime();
      let _finishTime = Session.getSession('prg_wm').endTime;

      if (_currentTime > _finishTime) {
        console.log("TIME UP from Default Layout")
        this.setState({rightBottom: false, socialNotifications: false})
        Session.destroy("prg_wm");
        clearInterval(this.checkWorkModeInterval);
        this.checkWorkModeInterval = null;
      }
    } else {
      this.setState({rightBottom: false, socialNotifications: false});
      clearInterval(this.checkWorkModeInterval);
      this.checkWorkModeInterval = null;
    }
  }

  // loads an existing chat
  loadTwilioQuickChat(conv) {
    if (typeof this.quickChatUsers.length != 'undefined' && this.quickChatUsers.length >= 3) {
      alert("Maximum quick chat window limit is reached.");
      return;
    }

    let chatExists = false;
    if (this.quickChatUsers.length > 0) {
      for (let con in this.quickChatUsers) {
        // check channels by id to see if a chat is already open.
        if (this.quickChatUsers[con].channel.sid === conv.channel.sid) {
          chatExists = true;
        }
      }
    }

    if (!chatExists) {
      this.quickChatUsers.push(conv);
      let convId = conv.channel.sid;
      // listen for message added events.
      conv.channel.on('messageAdded', this.onTwilioMessageAdded);

      this.setState({chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
    }
  }

  onTwilioMessageAdded(message) {
    var quickChatUsers = this.quickChatUsers;
    for (let i = 0; i < this.quickChatUsers.length; i++) {
      let currentConversation = this.quickChatUsers[i];
      if (currentConversation.channel.sid === message.channel.sid) {
        this.quickChatUsers[i].messages.items.push(message);
        this.setState({
          quickChatUsers: this.quickChatUsers
        });
      }
    }
  }

  // TODO: Remove this function, since we've moved to Twilio for quick chat.
  loadQuickChat(conv) {
    if (typeof this.quickChatUsers.length != 'undefined' && this.quickChatUsers.length >= 3) {
      alert("Maximum quick chat window limit is reached.");
      return;
    }

    var chatExists = false;
    if (this.quickChatUsers.length > 0) {
      for (let con in this.quickChatUsers) {
        if (this.quickChatUsers[con].title == conv.title) {
          chatExists = true;
        }
      }
    }

    if (!chatExists) {
      this.quickChatUsers.push(conv);
      let convId = "usr:" + conv.proglobeTitle;
      this.setState({chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
    }
  }

  loadNewTwilioQuickChat(conv) {
    if (!this.state.isNewChatLoaded && this.quickChatUsers.length < 3) {
      this.quickChatUsers.push(conv);
      let convId = "usr:" + conv.proglobeTitle;
      this.setState({isNewChatLoaded: true, chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
    }
  }

  closeChatBubble(conversation) {
    let bbList = this.state.chatBubble;
    if (typeof bbList != 'undefined' && bbList.length > 0) {
      let index = this.getBubbleIndex(conversation);
      let isNewChatLoaded = this.state.isNewChatLoaded;
      if (index > -1) {
        bbList.splice(index, 1);
      }
      this.quickChatUsers = [];
      this.quickChatUsers = bbList;
      if (conversation.id === "NEW_CHAT_MESSAGE") {
        isNewChatLoaded = !isNewChatLoaded;
      } else {
        // not a new convo, remove listener from the conversation.
        conversation.channel.removeAllListeners("messageAdded");
      }
      this.setState({chatBubble: this.quickChatUsers, isNewChatLoaded: isNewChatLoaded});
    }
  }

  getBubbleIndex(conversation) {
    let bbList = this.state.chatBubble;
    for (let my_con in bbList) {
      if (conversation.channel) { // check if it's an existing conversation. if it's a new conversation it will look like {id: "NEW_CHAT_MESSAGE"}
        if (conversation.channel.sid === bbList[my_con].channel.sid) {
          return my_con;
        }
      } else if (conversation.id) {
        if (conversation.id === "NEW_CHAT_MESSAGE") {
          return my_con;
        }
      }
    }
    return -1;
  }

  handleClick() {
    // this.setState({isShowingModal: true});
    this.setState({isShowingWMP: true});
  }

  handleClose() {
    this.setState({isShowingModal: false, isShowingWMP: false});
  }

  onWorkmodeClick() {
    this.handleClick();
  }

  onNotifiTypeClick(type, count) {
    this.setState({showNotificationsPopup: true, notifiType: type, notificationCount: count});
  }

  onNotifiClose() {
    this.setState({showNotificationsPopup: false, notifiType: ""});
  }

  updateNotificationPopCount(c) {
    this.setState({notificationCount: c});
  }

  onNavCollapse() {
    console.log("called");
    let isVissible = this.state.isNavHidden;
    this.setState({isNavHidden: !isVissible});
  }

  onToastClose() {
    let _toastMessage = {
      visible: false,
      message: '',
      type: ''
    };

    this.setState({toastMessage: _toastMessage});
  }

  onToastOpen(_toast) {
    this.setState({toastMessage: _toast});
  }

  loadDummyQuickChat(_id) {
    console.log("came to load dummy chat >>", _id);
    let _chat = this.state.dummyChatArray;
    if (_chat.indexOf(_id) == -1) {
      _chat.push(_id);
      this.setState({dummyChatArray: _chat});
    }
  }

  closeDummyQuickChat(_id) {
    console.log("came to load dummy chat >>", _id);
    let _chat = this.state.dummyChatArray;
    let _index = _chat.indexOf(_id)
    if (_chat.indexOf(_id) != -1) {
      _chat.splice(_index, 1);
      this.setState({dummyChatArray: _chat});
    }
  }

  setNewChatToList(_conv, convObj) {
    // This is the place where a new chat is finally created.
    if (_conv.id) {
      if (_conv.id === "NEW_CHAT_MESSAGE") {
        // Create a new channel and join the newly created channel.
        let otherUserId = convObj;
        let newChannel = null;
        this.chatProvider.createChannel(otherUserId)
          .then((createdChannel) => {
            return createdChannel.join(); // Join the newly created channel
          })
          .then((joinedChannel) => { // invite other user to the newly created channel.
            newChannel = joinedChannel;

            // Listen out for new messages on the channel
            joinedChannel.on('messageAdded', this.onTwilioMessageAdded);
            return joinedChannel.getMessages()
          })
          .then((messageResult) => {
            return new Promise((resolve, reject) => {
              let twilioConversation = {
                channel: newChannel,
                messages: messageResult
              };
              // Need to invite the other user to join the channel so that they can chat.
              newChannel.invite(otherUserId)
                .then(() => {
                  resolve(twilioConversation);
                })
                .catch((error) => {
                  console.log("Error inviting user to channel", otherUserId);
                  reject(error);
                });

            });
          })
          .then((twilioConversationResult) => {
            // update UI accordingly
            this.closeChatBubble(_conv);
            // Let's try pushing the new channel instead.
            this.quickChatUsers.push(twilioConversationResult);
            let convId = twilioConversationResult.channel.sid;
            this.setState({chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
          });
      }
    } else {
      this.closeChatBubble(_conv);
      this.quickChatUsers.push(convObj);
      let convId = convObj.channel.sid;
      this.setState({chatBubble: this.quickChatUsers, loadedChatBubbleId: convId});
    }
  }

  toggleSettingsPopup() {
    let _ssp = this.state.showSettingsPopup;
    this.setState({
      showSettingsPopup: !_ssp,
    });
  }

  loadMyConnections() {
    $.ajax({
      url: '/connection/me/unfriend',
      method: "GET",
      dataType: "JSON",
      headers: {'prg-auth-header': this.state.userLoggedIn.token}
    }).done(function (data) {
      if (data.status.code == 200) {
        this.setState({my_connections: data.my_con});
      }
    }.bind(this));
  }

  loadConnectionRequests() {
    $.ajax({
      url: '/connection/requests',
      method: "POST",
      dataType: "JSON",
      headers: {'prg-auth-header': this.state.userLoggedIn.token},
      data: {page_count: 10},
    }).done(function (data) {
      if (data.status.code == 200) {
        this.setState({connection_requests: data.req_cons});
      }
    }.bind(this));
  }

  resetConnections() {
    this.loadMyConnections();
  }

  sendCallBlockedMessage(c, b6) {
    let _uri = c.other;
    console.log(_uri);
    let _msg = "On work mode";
    let user = Session.getSession('prg_lg');
    b6.session.displayName = user.first_name + " " + user.last_name;
    b6.compose(_uri).text(_msg).send(function (err) {
      if (err) {
        console.log('error', err);
      }
      else {
        console.log("msg sent");
      }
    });
  }

  /*
   This is the common function for all child components (folder, calendar etc.. )
   from any index.js file call 'this.props.parentCommonFunction'
   */
  commonForAllChildrenComponents() {
    console.log("commonForAllChildrenComponents called ** ");
  }

  /* CallCenter Methods */

  initCall(b6) {
    let _this = this;

    b6.on('incomingCall', function (c) {
      _this.onIncomingCall(c, b6);
    });

    b6.on('video', function (v, d, op) {
      _this.onVideoCall(v, d, op);
    });
  }

  startCall(contacts, channel, isGroupContact) {
    let _this = this
    let loggedInUser = _this.state.userLoggedIn
    let roomIdentity = TwilioVideoProvider.createRoomIdentity()
    let callContacts = []

    if (isGroupContact) {
      callContacts = contacts.reduce(function (callContactsList, contact) {
        callContactsList.push(CallProvider.createCallContactSchema(contact, false, false))
        return callContactsList
      }, [])
    } else {
      callContacts.push(CallProvider.createCallContactSchema(contacts, false, false))
    }

    loggedInUser['contact_name'] = ContactProvider.createContactName(loggedInUser.first_name, loggedInUser.last_name)

    callContacts.push(CallProvider.createCallContactSchema(loggedInUser, true, true))

    let newCall = CallProvider.createNewCallSchema()

    newCall.contacts = callContacts
    newCall.call.callId = 123
    newCall.call.roomName = roomIdentity
    newCall.call.callChannel = channel
    newCall.call.contactType = contacts.type

    let twilioRoomOption = {
      roomName: roomIdentity,
      twilioToken: TwilioVideoProvider.twilioToken,
      audioOnly: (channel === CallChannel.AUDIO)
    }

    let onGoingCallMedia = _this.state.onGoingCallMedia

    if (channel === CallChannel.VIDEO) {
      onGoingCallMedia.video = true
      onGoingCallMedia.audio = true
    } else {
      onGoingCallMedia.audio = true
    }


    // Create call-Record
    let callRecord = {
      contact: contacts,
      callChannel: channel,
      targets: [{user_id: contacts.user_id}],
      dialedAt: new Date().toISOString()
    }

    _this.setState({callInitiationInProgress: true, initiatingCall: newCall})

    CallProvider.saveCallRecord(callRecord).done(function () {
      TwilioVideoProvider.joinRoom(twilioRoomOption, room => {
        console.log('localRoom', room)

        let localContactIndex = CallProvider.getIndexByKeyValue(newCall.contacts, 'originContact', true)

        newCall.contacts[localContactIndex].twilioIdentity = room.localParticipant.identity

        CallProvider.dialCall(newCall, function () {
          setTimeout(function () {
            let onGoingCall = _this.state.onGoingCall

            if (onGoingCall) {
              if (CallProvider.getIndexByKeyValue(onGoingCall.contacts, 'response', ContactResponse.ANSWERED) === -1) {
                _this.hangUpCall()
              }
            }
          }, 15000)
        })

        _this.setState({
          callInProgress: true,
          onGoingCall: newCall,
          twilioRoom: room,
          onGoingCallMedia: onGoingCallMedia,
          callInitiationInProgress: false,
          initiatingCall: null
        })

        _this.attachRoomEvents(room)
      })
    })


    /*let opts = {
     audio: true,
     video: false,
     screen: false
     };

     if (Channel == CallChannel.VIDEO) opts.video = true;

     console.log('call channel', Channel);

     // Start the outgoing call
     let to = CallCenter.getBit6Identity(TargetUser);
     var c = this.b6.startCall(to, opts);

     this.attachCallEvents(c);

     this.callRecord.contact = TargetUser;
     this.callRecord.callChannel = Channel;
     this.callRecord.targets.push({user_id: TargetUser.user_id});
     this.callRecord.dialedAt = new Date().toISOString();

     let _this = this;

     CallCenter.addCallRecord(this.callRecord).done(function (oData) {
     _this.setState({
     callInProgress: true,
     callChannel: Channel,
     targetUser: TargetUser,
     bit6Call: c,
     callStage: CallStage.DIAL_CALL,
     callRecord: oData.call_record
     });

     c.connect(opts);

     console.log('start call', c);
     });*/
  }

  startGroupCall(Group) {
    var _this = this;

    var bit6PrivateGroup = CallCenter.getBit6PrivateGroup(this.b6.groups, this.state.userLoggedIn);

    async.waterfall([
      function joinMembersToGroup(callback) {
        async.each(Group, function (member, joinMemberCallback) {
          var bit6Identity = CallCenter.getBit6Identity(member);

          _this.b6.inviteGroupMember(bit6PrivateGroup, bit6Identity, 'user', function (error) {
            (error) ? joinMemberCallback(error) : joinMemberCallback();
          });

        }, function (error) {
          (error) ? callback(error) : callback(null);
        });
      },
      function startGroupCall(callback) {
        var privateGroup = _this.b6.getGroup(bit6PrivateGroup.id);

        let opts = {
          audio: true,
          video: false,
          screen: false
        };

        //   console.log('group', privateGroup);


        setTimeout(function () {

          var c = _this.b6.startCall('grp:' + privateGroup.id, opts);

          _this.attachCallEvents(c);

          c.connect(opts);

          console.log('call', c);

          callback(null);

        }, 4000);


        //callback(null);
      }
    ], function (error) {
      console.log('done');
    });
  }

  createGroupCall(contact, callChannel) {
    /*var _this = this;

     var bit6PrivateGroup = CallCenter.getBit6PrivateGroup(this.b6.groups, this.state.userLoggedIn);

     console.log(bit6PrivateGroup);

     async.waterfall([
     function removeGroupMembers(callback) {
     async.each(bit6PrivateGroup.members, function (member, kickMemberCallback) {
     if (member.id != CallCenter.getBit6Identity(_this.state.userLoggedIn)) {
     _this.b6.kickGroupMember(bit6PrivateGroup.id, member.id, function (error) {
     (error) ? kickMemberCallback(error) : kickMemberCallback();
     });
     } else {
     kickMemberCallback();
     }
     }, function (error) {
     console.log(_this.b6.groups);
     (error) ? callback(error) : callback(null);
     });
     },
     function getGroupMembers(callback) {
     CallCenter.getGroupMembers(contact._id).done(function (Group) {
     callback(null, Group);
     });
     }
     ], function (error, Group) {
     if (!error) {
     Group.type = ContactType.GROUP;

     var bit6Call = {
     options: {video: false, audio: false},
     remoteOptions: {video: false}
     };

     var GroupMembers = Group.members.reduce(function (members, member) {
     if (member.user_id != _this.state.userLoggedIn.id) {
     members.push(member);
     }

     return members;
     }, []);

     Group.members = GroupMembers;

     _this.setState({
     callInProgress: true,
     targetUser: Group,
     bit6Call: bit6Call,
     callChannel: callChannel,
     callStage: CallStage.CREATE_CALL
     });
     }
     });*/
  }

  answerCall(inComingCallIndex) {
    let _this = this
    let loggedInUser = _this.state.userLoggedIn
    let inComingCall = this.state.inComingCalls[inComingCallIndex]
    let inComingCalls = this.state.inComingCalls

    inComingCalls.splice(inComingCallIndex, 1)

    let twilioRoomOption = {
      roomName: inComingCall.call.roomName,
      twilioToken: TwilioVideoProvider.twilioToken,
      audioOnly: (inComingCall.call.callChannel === CallChannel.AUDIO)
    }

    _this.setState({callInitiationInProgress: true, initiatingCall: inComingCall})

    TwilioVideoProvider.joinRoom(twilioRoomOption, room => {
      console.log('localRoom', room)
      // TODO : optimize to handle notifying multi-users about new participant & do the same for group-cal
      inComingCall.callStage = CallStage.ANSWERED

      _this.setState({
        callInitiationInProgress: false,
        initiatingCall: null,
        inComingCalls: inComingCalls,
        callInProgress: true,
        onGoingCall: inComingCall,
        twilioRoom: room
      })

      CallProvider.inComingCallAnswered(inComingCall, loggedInUser.user_name)

      _this.attachRoomEvents(room)
    })


    //  console.log(IncomingCallChannel);
    /*let Call = this.state.bit6Call;


     if (IncomingCallChannel == CallChannel.AUDIO) {
     Call.connect({audio: true, video: false});
     } else {
     Call.connect({audio: true, video: true});
     }

     this.setState({
     inComingCall: false,
     callInProgress: true,
     callChannel: IncomingCallChannel,
     bit6Call: Call,
     callStage: CallStage.ANSWER_CALL
     });*/
  }

  hangUpCall() {
    let onGoingCall = this.state.onGoingCall
    let loggedInUser = this.state.userLoggedIn
    let twilioRoom = this.state.twilioRoom

    CallProvider.hangUpCall(onGoingCall, loggedInUser.user_name)

    twilioRoom.disconnect()

    this.setState({callInProgress: false, onGoingCall: null, twilioRoom: null})
  }

  hangUpIncomingCall(inComingCallIndex) {
    let inComingCalls = this.state.inComingCalls
    let loggedInUser = this.state.userLoggedIn

    CallProvider.rejectCall(inComingCalls[inComingCallIndex], loggedInUser.user_name)

    inComingCalls.splice(inComingCallIndex, 1)

    this.setState({inComingCalls: inComingCalls})
    /* let Call = this.state.bit6Call;
     Call.hangup();

     this.setState({inComingCall: false, bit6Call: null, callChannel: null, targetUser: null, callStage: null});*/
  }

  attachRoomEvents(room) {
    let _this = this;

    let audioTracksContainer = $('.CallMode')
    let videoTracksContainer = $('.CallModel .popup-holder .cc-large-popup')
    let localContact = $('.localContactPreview')

    let localTracks = Array.from(room.localParticipant.tracks.values())

    localTracks.forEach(function (track) {
      if (!TwilioVideoProvider.isAudioTrack(track.kind)) {
        localContact.append(track.attach())
      }
    })

    room.on('participantConnected', contact => {
      console.log('participantConnected', contact)
    })

    room.on('trackAdded', track => {
      console.log('trackAdded', track)
      if (TwilioVideoProvider.isAudioTrack(track.kind)) {
        audioTracksContainer.append(track.attach())
      } else {
        videoTracksContainer.append(track.attach())
      }
    });

    room.on('trackRemoved', track => {
      let detachedElements = track.detach();

      detachedElements.forEach(function (element) {
        console.log(element)
        element.remove()
      })
    })

    room.on('trackEnabled', track => {
      console.log('trackEnabled', track)
      if (TwilioVideoProvider.isAudioTrack(track)) {
        audioTracksContainer.append(track.attach())
      } else {
        videoTracksContainer.append(track.attach())
      }
    })

    room.on('trackDisabled', track => {
      console.log('trackDisabled', track)

      let detachedElements = track.detach();

      console.log('detachedElements', detachedElements)

      detachedElements.forEach(function (element) {
        console.log(element)

        element.remove()
      })
    })

    room.on('participantDisconnected', contact => {
      console.log('participantDisconnected', contact)
    })

    room.on('disconnected', function () {
      console.log('disconnected')
    })
  }

  // Attach call state events to a RtcDialog
  attachCallEvents(c) {
    var _this = this;

    c.on('progress', function () {
      console.log('progress', c);
      _this.setState({bit6Call: c});
    });

    c.on('videos', function () {
      console.log('videos', c);
      _this.setState({bit6Call: c});
      // TODO show video call details in popup
    });

    c.on('answer', function () {
      console.log('answer', c);
      _this.setState({
        bit6Call: c,
        callChannel: (c.remoteOptions.video) ? CallChannel.VIDEO : CallChannel.AUDIO,
        callStage: CallStage.ANSWER_CALL
      });

      if (_this.state.callRecord.user_id == _this.state.userLoggedIn.id) {
        CallCenter.updateCallRecord(_this.state.callRecord._id, CallStatus.ANSWERED).done(function (callRecordUpdateRes) {
          _this.setState({callRecord: callRecordUpdateRes.call_record});
        });
      }

      // TODO show timer , call buttons
    });

    c.on('error', function () {
      console.log('error', c);
      _this.setState({bit6Call: c});
      // TODO show call error in popup
    });

    c.on('end', function () {
      console.log('end', c);

      if (_this.state.callRecord) {
        if (_this.state.callRecord.user_id == _this.state.userLoggedIn.id) {
          if (_this.state.callStage) {
            if (_this.state.callStage == CallStage.DIAL_CALL && _this.state.bit6Call.state == 'req') {
              /*  CallCenter.updateCallRecord(_this.state.callRecord._id, CallStatus.CANCELLED).done(function (callRecordUpdateRes) {

               });*/
            }
          }
        }
      }

      _this.setState({
        inComingCall: false,
        callInProgress: false,
        targetUser: null,
        callMode: CallChannel.AUDIO,
        callStage: null
      });

      // TODO show call end details in popup
    });
  }

  onVideoCall(v, d, op) {
    var vc = $('#webcamStage');

    if (op < 0) {
      if ($(v).hasClass('remote')) {
        this.setState({callChannel: CallChannel.AUDIO});
      }

      vc[0].removeChild(v);
    }

    else if (op > 0) {
      v.setAttribute('class', d ? 'remote' : 'local');
      vc.append(v);

      if ($(v).hasClass('remote')) {
        this.setState({callChannel: CallChannel.VIDEO});
      }
    }
    // Total number of video elements (local and remote)

    var n = vc[0].children.length;
    // Display the container if we have any video elements
    if (op != 0) {
      vc.toggle(n > 0);
    }

    //  this.setState({bit6Call: d});
  }

  onIncomingCall(c, b6) {
    console.log('incoming call', c);
    let _blockCall = this.checkWorkMode();

    this.attachCallEvents(c);

    if (!_blockCall) {
      console.log("Incoming call");
      let CallChannel = CallCenter.getCallChannel(c);
      let TargetUser = this.getContactBySlug(c.other);

      this.setState({
        inComingCall: true,
        callChannel: CallChannel,
        targetUser: TargetUser,
        incomingCallerName: c.invite.sender_name,
        bit6Call: c
      });
    } else {
      console.log("Call blocked in work mode. Informing caller via messaging");
      this.hangupCall();
      this.sendCallBlockedMessage(c, b6);
    }
  }

  getContactBySlug(slug) {
    let _this = this;
    let username = slug.split(Config.BIT6_IDENTITY_USER_SLUG);

    for (let i = 0; i < _this.contacts.length; i++) {
      var letter = _this.contacts[i];

      for (let x = 0; x < letter.users.length; x++) {
        if (letter.users[x].user_name == username[1]) {
          return letter.users[x];
        }
      }
    }
  }

  toggleAudio(enableAudio) {
    let room = this.state.twilioRoom

    let localTracks = Array.from(room.localParticipant.tracks.values())

    localTracks.forEach(function (track) {
      if (TwilioVideoProvider.isAudioTrack(track.kind)) {
        if (enableAudio) {
          track.enable()
        } else {
          track.disable()
        }
      }
    })

    /* var oCall = this.state.bit6Call;
     oCall.connect({audio: bMic});
     this.setState({callMode: (bMic) ? CallChannel.VIDEO : CallChannel.AUDIO, bit6Call: oCall});*/
  }

  toggleVideo(enableVideo) {
    let _this = this
    let room = this.state.twilioRoom
    let onGoingCall = this.state.onGoingCall

    let localTracks = Array.from(room.localParticipant.tracks.values())

    function getVideoTracks(track) {
      return !TwilioVideoProvider.isAudioTrack(track.kind)
    }

    let isThereVideoTracks = localTracks.some(getVideoTracks)

    if (isThereVideoTracks) {
      localTracks.forEach(function (track) {
        if (!TwilioVideoProvider.isAudioTrack(track.kind)) {
          if (enableVideo) {

            onGoingCall.call.callChannel = CallChannel.VIDEO

            let localContact = $('.localContactPreview')

            localContact.append(track.attach())

            track.enable()

            _this.setState({onGoingCall: onGoingCall})
          } else {
            track.disable()

            let detachedElements = track.detach();

            detachedElements.forEach(function (element) {
              element.remove();
            })

            onGoingCall.call.callChannel = CallChannel.AUDIO

            _this.setState({onGoingCall: onGoingCall})
          }
        }
      })
    } else {
      let twilioRoomOption = {
        roomName: onGoingCall.call.roomName,
        twilioToken: TwilioVideoProvider.twilioToken
      }

      TwilioVideoProvider.joinRoom(twilioRoomOption, (room) => {
        _this.attachRoomEvents(room)

        onGoingCall.call.callChannel = CallChannel.VIDEO

        _this.setState({twilioRoom: room, onGoingCall: onGoingCall})
      })
    }


    /*let isThereVideoTracks = localTracks.some(getVideoTracks)

     console.log(localTracks)
     console.log(room.localParticipant)

     if (isThereVideoTracks) {
     localTracks.forEach(function (track) {
     if (!TwilioVideoProvider.isAudioTrack(track.kind)) {
     if(enableVideo){
     track.enable()
     onGoingCall.call.callChannel = CallChannel.VIDEO
     _this.setState({onGoingCall: onGoingCall})
     }else{
     onGoingCall.call.callChannel = CallChannel.AUDIO
     _this.setState({onGoingCall: onGoingCall})
     }

     (enableVideo) ? track.enable() : track.disable()
     }
     })
     } else {
     TwilioVideoProvider.createVideoTrack(function (track) {
     let localContact = $('.localContactPreview')
     localContact.append(track.attach())

     onGoingCall.call.callChannel = CallChannel.VIDEO
     _this.setState({onGoingCall: onGoingCall})
     })
     }*/


    /*localTracks.forEach(function (track) {
     if (!TwilioVideoProvider.isAudioTrack(track.kind)) {
     (enableVideo) ? track.enable() : track.disable()
     }
     })

     Video.createLocalVideoTrack().then(function(track) {
     var videoElement = track.attach();
     document.getElementById('my-container').appendChild(videoElement);
     });*/

    /*    var oCall = this.state.bit6Call;
     oCall.connect({video: bVideo});
     this.setState({callMode: (bVideo) ? CallChannel.VIDEO : CallChannel.AUDIO, bit6Call: oCall});*/
  }

  onMinimizeCallModal() {
    this.setState({callInProgress: false, minimizeBar: true});
  }

  onCloseCallModal() {
    this.state.bit6Call.hangup();
    //this.setState({callInProgress: false, minimizeBar: false, bit6Call: null});
    this.setState({callInProgress: false, minimizeBar: false, onGoingCall: null});
  }

  wmTimer(state) {
    console.log(state + "state layout")
    this.setState({wmTimerActive: state});
  }

  render() {
    let currPage = "";
    if (this.props.children) {
      currPage = this.props.children.props.route.name;
    }
    let dashbrdClass = (this.props.children) ? "sub-page" : "";

    let _this = this;

    var childrenWithProps = React.Children.map(this.props.children, function (child) {
      return React.cloneElement(child, {
        parentCommonFunction: _this.commonForAllChildrenComponents.bind(_this),
        startCall: _this.startCall.bind(_this),
        createCall: _this.createGroupCall.bind(_this),
        loadConnectionRequests: _this.loadConnectionRequests.bind(_this)
      });
    });

    return (
      <div className="app-holder">
        <SigninHeader quickChat={this.loadQuickChat.bind(this)}
                      loadTwilioQuickChat={this.loadTwilioQuickChat.bind(this)}
                      dummyQuickChat={this.loadDummyQuickChat.bind(this)}
                      loadNewTwilioQuickChat={this.loadNewTwilioQuickChat.bind(this)}
                      resetConnections={this.resetConnections.bind(this)}
                      my_connections={this.state.my_connections}
                      connection_requests={this.state.connection_requests}
        />
        <section
          className={(!this.state.isNavHidden) ? "body-container " + dashbrdClass : "body-container nav-hidden"}>
          {childrenWithProps || <AmbiDashboard />}
        </section>
        {
          this.showIncomingCall()
        }
        {
          (this.state.callInitiationInProgress) ?
            <ModalContainer zIndex={9999}>
              <ModalDialog className="modalPopup callInititationModal">
                <CallInitiator call={this.state.initiatingCall}></CallInitiator>
              </ModalDialog>
            </ModalContainer>
            :
            null
        }
        {
          (this.state.callInProgress) ?

            /*            <div>
             <ModalContainer zIndex={9999}>
             <ModalDialog className="modalPopup">
             <CallModel
             remoteChannel={this.state.callChannel}
             bit6Call={this.state.bit6Call}
             loggedUser={this.state.userLoggedIn}
             targetUser={this.state.targetUser}
             toggleMic={this.toggleMic.bind(this)}
             toggleVideo={this.toggleVideo.bind(this)}
             callStage={this.state.callStage}
             dialCall={this.startGroupCall.bind(this)}
             closePopup={this.onCloseCallModal.bind(this)}
             minimizePopup={this.onMinimizeCallModal.bind(this)}/>
             </ModalDialog>
             </ModalContainer>
             </div>*/
            <ModalContainer zIndex={9999}>
              <ModalDialog className="modalPopup CallModel">
                <CallModel2
                  call={this.state.onGoingCall}
                  hangUpCall={this.hangUpCall.bind(this)}
                  closePopup={this.onCloseCallModal.bind(this)}
                  toggleVideo={this.toggleVideo.bind(this)}
                  toggleAudio={this.toggleAudio.bind(this)}
                  minimizePopup={this.onMinimizeCallModal.bind(this)}
                  onGoingCallMedia={this.state.onGoingCallMedia}
                />
              </ModalDialog>
            </ModalContainer>

            :
            null
        }
        {
          /*this.state.isShowingModal &&
           <ModalContainer zIndex={9999}>
           <ModalDialog width="65%" className="workmode-popup-holder">
           <div className="workmode-popup-wrapper">
           <WorkMode />
           <i className="fa fa-times close-icon" aria-hidden="true"
           onClick={this.handleClose.bind(this)}></i>
           </div>
           </ModalDialog>
           </ModalContainer>*/
        }
        {
          this.state.isShowingWMP &&
          <ModalContainer zIndex={9999}>
            <ModalDialog className="workmode-popup-holder">
              <div className="workmode-popup-wrapper">
                <WorkModePopup closePopUp={this.handleClose.bind(this)}
                               showMessage={this.onToastOpen.bind(this)}
                               wmTimerActive={this.wmTimer.bind(this)}/>
                <i className="fa fa-times close-icon" aria-hidden="true"
                   onClick={this.handleClose.bind(this)}></i>
              </div>
            </ModalDialog>
          </ModalContainer>
        }
        {
          (this.state.showNotificationsPopup) ?
            <NotificationPop notifiType={this.state.notifiType} notifyCount={this.state.notificationCount}
                             onNotifiClose={this.onNotifiClose.bind(this)}/>
            :
            null
        }
        <QuickChatHandler chatList={this.state.chatBubble}
                          bubClose={this.closeChatBubble.bind(this)}
                          isNavHidden={this.state.isNavHidden}
                          loadedChatBubbleId={this.state.loadedChatBubbleId}
                          my_connections={this.state.my_connections}
                          setNewChatToList={this.setNewChatToList.bind(this)}/>
        {
          (this.state.showSettingsPopup) ? <SettingsPopup zIndex={9999}/> : null
        }

        {/*<QuickChatDummy dummyChatList={this.state.dummyChatArray} closeQuickChat={this.closeDummyQuickChat.bind(this)} isNavHidden={this.state.isNavHidden}/>*/}
        <VideoChatPopOver />
        <FooterHolder blockBottom={this.state.rightBottom}
                      blockSocialNotification={this.state.socialNotifications}
                      onWorkmodeClick={this.onWorkmodeClick.bind(this)}
                      onNotifiTypeClick={this.onNotifiTypeClick.bind(this)}
                      onUpdateNotifiPopupCount={this.updateNotificationPopCount.bind(this)}
                      currPage={currPage}
                      onNavCollapse={this.onNavCollapse.bind(this)}
                      isWmTimerActive={this.state.wmTimerActive}/>

        <span onClick={this.toggleSettingsPopup.bind(this)}
              className={(!this.state.isNavHidden) ? "settings-icon" : "settings-icon slideUp"}></span>
        {
          (this.state.toastMessage.visible) ?
            <Toast msg={this.state.toastMessage.message} type={this.state.toastMessage.type}
                   onToastClose={this.onToastClose.bind(this)}/>//types: success, warning
            :
            null
        }
        <WmCountdown isVisibleSection={false} isWmTimerActive={this.state.wmTimerActive}/>
      </div>
    );
  }
}
