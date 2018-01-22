import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session from '../../middleware/Session';
import CallCenter from '../../middleware/CallCenter';
import IncomingCall from './IncomingCall';
import CallModel from './CallModel';
import {CallType} from '../../config/CallcenterStats';

export default class CallHandler extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loggedUser: Session.getSession('prg_lg'),
            targetUser: null,
            inComingCall: false,
            inProgressCall: false,
            callMode: CallType.AUDIO,
            minimizeBar: false,
            bit6Call: null,
            contacts: []
        };

        this.loadContactData();

        if (Session.isSessionSet('prg_lg')) {
            this.b6 = CallCenter.b6;
            this.initCall(this.b6);
        }
    }

    loadContactData() {
        let getContacts = CallCenter.getContacts();

        let _this = this;

        getContacts.done(function (data) {
            _this.setState({contacts: data.contacts});
        });
    }

    initCall(b6) {
        let _this = this;

        b6.on('incomingCall', function (c) {
            _this.onIncomingCall(c, b6);
        });

        b6.on('video', function (v, d, op) {
            _this.onVideoCall(v, d, op);
        });
    }

    // Let's say you want to display the video elements in DOM element '#container'
    // Get notified about video elements to be added or removed
    // v - video element to add or remove
    // d - Dialog - call controller. null for a local video feed
    // op - operation. 1 - add, 0 - update, -1 - remove
    onVideoCall(v, d, op) {
        console.log("====== video call ======");

        var vc = $('#webcamStage');
        if (op < 0) {
            vc[0].removeChild(v);
        }
        else if (op > 0) {
            v.setAttribute('class', d ? 'remote' : 'local');
            vc.append(v);
        }
        // Total number of video elements (local and remote)
        var n = vc[0].children.length;
        // Display the container if we have any video elements
        if (op != 0) {
            vc.toggle(n > 0);
        }
    }

    onIncomingCall(c, b6) {
        let _blockCall = this.checkWorkMode();

        if (!_blockCall) {
            console.log("Incoming call");

            let _callType = CallCenter.getCallType(c);

            let targetUser = this.getContactBySlug(c.other);

            this.setState({inComingCall: true, callMode: _callType, targetUser: targetUser, bit6Call: c});

        } else {
            console.log("Call blocked in work mode. Informing caller via messaging");
            this.hangupCall();
            this.sendCallBlockedMessage(c, b6);
        }
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

    loadAnswerCallPopUp(c) {
        // TODO load call answer buttons in the popup
        // TODO below answerCall() should be called from popup answer call button click
        // TODO can get call type(audio / video) by using below line
        const isVideoCall = c.options.video;

        var opts = {
            audio: true,
            video: isVideoCall
        };
        this.answerCall(c, opts);
    }

    checkWorkMode() {
        let _messages = false;

        if (Session.getSession('prg_wm') != null) {
            let _currentTime = new Date().getTime();
            let _finishTime = Session.getSession('prg_wm').endTime;

            if (_currentTime > _finishTime) {
                Session.destroy("prg_wm");
            } else {
                _messages = Session.getSession('prg_wm').messages;
            }
        }

        return _messages;
    }

    // Attach call state events to a RtcDialog
    attachCallEvents(c) {
        // Call progress
        c.on('progress', function () {
            // TODO show call progress details in popup
        });
        // Number of video feeds/elements changed
        c.on('videos', function () {
            // TODO show video call details in popup
        });
        // Call answered
        c.on('answer', function () {
            console.log('answered');
            // TODO show timer , call buttons
        });
        // Error during the call
        c.on('error', function () {
            // TODO show call error in popup
        });
        // Call ended
        c.on('end', function () {
            // TODO show call end details in popup
        });
    }

    notificationDomIdForConversation(c) {
        return '#notification__' + c.domId();
    }

    // Call when Reject button click
    rejectCall(c) {
        // Call controller
        if (c && c.dialog) {
            // Reject call
            c.dialog.hangup();
        }
    };

    // Call when Hangup button click
    hangupCall(b6) {
        console.log("hangup all active calls");
        // Hangup all active calls
        var x = b6.dialogs.slice();
        for (var i in x) {
            x[i].hangup();
        }
    };

    answerAudioMode() {
        this.setState({inComingCall: false, inProgressCall: true, audioMode: false, videoMode: true});

        let c = this.state.bit6Call;
        c.connect({audio: true, video: false});
    }

    answerVideoMode() {
        this.setState({inComingCall: false, inProgressCall: true, audioMode: true, videoMode: false});

        let c = this.state.bit6Call;
        c.connect({audio: true, video: true});
    }

    hangUpCall() {
        let c = this.state.bit6Call;
        c.hangup();
        this.setState({inComingCall: false});
    }

    onMinimizePopup() {
        this.setState({inProgressCall: false, minimizeBar: true});
    }

    onPopupClose() {
        this.setState({inProgressCall: false, minimizeBar: false});
    }

    componentDidMount() {
        console.log("CallHandler Rendering done");
    }

    getContactBySlug(slug) {
        let _this = this;
        let username = slug.split('usr:proglobe');

        for (let i = 0; i < _this.state.contacts.length; i++) {
            var letter = _this.state.contacts[i];

            for (let x = 0; x < letter.users.length; x++) {
                if (letter.users[x].user_name == username[1]) {
                    return letter.users[x];
                }
            }
        }
    }

    render() {
        if (this.state.inComingCall) {
            return (
                <IncomingCall
                    callMode={this.state.callMode}
                    answerAudio={this.answerAudioMode.bind(this)}
                    answerVideo={this.answerVideoMode.bind(this)}
                    hangUp={this.hangUpCall.bind(this)}
                />
            )
        } else if (this.state.inProgressCall) {
            return (
                <div>
                    <ModalContainer zIndex={9999}>
                        <ModalDialog className="modalPopup">
                            <CallModel
                                callMode={this.state.callMode}
                                loggedUser={this.state.loggedUser}
                                targetUser={this.state.targetUser}
                                closePopup={this.onPopupClose.bind(this)}
                                minimizePopup={this.onMinimizePopup.bind(this)}
                            />
                        </ModalDialog>
                    </ModalContainer>
                </div>
            );
        } else {
            return null;
        }
    }
}
