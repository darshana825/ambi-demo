/**
 * This is call center index component
 */

import React from 'react';
import {Popover, OverlayTrigger} from 'react-bootstrap';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

import asnyc from 'async';

import {CallChannel, CallType, CallStatus, UserMode, ContactType} from '../../config/CallcenterStats';

import Session from '../../middleware/Session';
import ContactProvider from '../../middleware/ContactProvider';
import CallProvider from '../../middleware/CallProvider';

import ContactList from "./ContactList";
import RecentList from "./RecentList";
import StatusList from "./StatusList";


export default class Index extends React.Component {
  constructor(props) {
    super(props);

    let loggedUser = Session.getSession('prg_lg');

    if (loggedUser == null) {
      window.location.href = "/";
    }

    ContactProvider.authToken, CallProvider.authToken = Session.getSession('prg_lg').token;

    this.state = {
      loggedUser: loggedUser,
      targetUser: null,
      userContacts: [],
      callRecords: {all: [], missed: [], individual: [], groups: [], multi: []},
      userStatus: loggedUser.online_mode,
      activeMainCat: "",
      activeSubCat: "",
      showModal: false,
      minimizeBar: false,
      searchValue: "",
      isStatusVisible: false,
      activeTabData: null,
      recentCalls: []
    };

    this.allContacts = [];
    this.currUserList = null;
  }

  getContacts(cat, subCat) {
    this.setActiveTabData(cat, subCat);
    this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
  }

  getCallRecords(cat, subCat) {
    this.setActiveTabData(cat, subCat);
    this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
  }

  getContactsByStatus(cat, subCat) {
    this.setActiveTabData(cat, subCat);
    this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
  }

  setActiveTabData(cat, subCat) {
    if (cat == "contact" && subCat == "all") {
      this.setState({activeTabData: this.state.userContacts});
    } else if (cat == "contact" && subCat == "individual") {
      let dataSet = [],
        usersSet = [],
        letter = "";

      let aContacts = this.state.userContacts;

      for (var key in aContacts) {
        letter = aContacts[key].letter;
        for (var subKey in aContacts[key].users) {
          let type = aContacts[key].users[subKey].type;
          if (type == ContactType.INDIVIDUAL) {
            usersSet.push(aContacts[key].users[subKey]);
          }
        }
        if (usersSet.length >= 1) {
          dataSet.push({"letter": letter, "users": usersSet});
          usersSet = [];
        }
      }

      this.setState({activeTabData: dataSet});
    } else if (cat == "contact" && subCat == "groups") {
      let dataSet = [],
        usersSet = [],
        letter = "";

      let aContacts = this.state.userContacts;

      for (var key in aContacts) {
        letter = aContacts[key].letter;
        for (var subKey in aContacts[key].users) {
          let type = aContacts[key].users[subKey].type;
          if (type == ContactType.GROUP) {
            usersSet.push(aContacts[key].users[subKey]);
          }
        }
        if (usersSet.length >= 1) {
          dataSet.push({"letter": letter, "users": usersSet});
          usersSet = [];
        }
      }

      this.setState({activeTabData: dataSet});
    } else if (cat == "recent" && subCat == "all") {
      this.setState({activeTabData: this.state.recentCalls});
    } else if (cat == "recent" && subCat == "missed") {

      var aRecentCalls = this.state.recentCalls;

      var data = [];

      for (var i = 0; i < aRecentCalls.length; i++) {
        if (aRecentCalls[i].call_status == 'missed') {
          data.push(aRecentCalls[i]);
        }
      }

      this.setState({activeTabData: data});

    } else if (cat == "recent" && subCat == "individual") {

      this.setState({activeTabData: this.state.recentCalls});

    } else if (cat == "recent" && subCat == "groups") {

    } else if (cat == "recent" && subCat == "multi") {

    } else if (cat == "status" && subCat == "online") {
      let dataSet = [],
        usersSet = [],
        letter = "";

      let aContacts = this.state.userContacts;

      for (var key in aContacts) {
        letter = aContacts[key].letter;
        for (var subKey in aContacts[key].users) {
          let onlineStatus = aContacts[key].users[subKey].online_mode;
          if (onlineStatus == UserMode.ONLINE.VALUE) {
            usersSet.push(aContacts[key].users[subKey]);
          }
        }
        if (usersSet.length >= 1) {
          dataSet.push({"letter": letter, "users": usersSet});
          usersSet = [];
        }
      }

      this.setState({activeTabData: dataSet});
    } else if (cat == "status" && subCat == "work_mode") {
      let dataSet = [],
        usersSet = [],
        letter = "";

      let aContacts = this.state.userContacts;

      for (var key in aContacts) {
        letter = aContacts[key].letter;
        for (var subKey in aContacts[key].users) {
          let onlineStatus = aContacts[key].users[subKey].online_mode;
          if (onlineStatus == UserMode.WORK_MODE.VALUE) {
            usersSet.push(aContacts[key].users[subKey]);
          }
        }
        if (usersSet.length >= 1) {
          dataSet.push({"letter": letter, "users": usersSet});
          usersSet = [];
        }
      }

      this.setState({activeTabData: dataSet});
    }

    this.setState({activeMainCat: cat, activeSubCat: subCat, searchValue: ""});
  }

  processCallRecords(aCallRecords) {
    let callRecords = [];

    for (var i = 0; i < aCallRecords.length; i++) {
      let callChannel = null;
      let callType = null;
      let call_status = null;
      let time = null;
      let dd = null;

      let date = new Date(aCallRecords[i].call_started_at);
      let hh = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();

      (hh > 12) ? dd = 'PM' : dd = 'AM';
      (m < 10) ? m = '0' + m : m = m;
      (hh < 10) ? hh = '0' + hh : hh = hh;

      if (hh > 12) {
        hh = hh - 12;
      }
      time = hh + ':' + m + ' ' + dd;

      (aCallRecords[i].call_channel == CallChannel.VIDEO) ? callChannel = 'video' : callChannel = 'phone';
      (aCallRecords[i].call_type == CallType.INCOMING) ? callType = CallType.INCOMING : callType = CallType.OUTGOING;

      if (aCallRecords[i].call_status == CallStatus.MISSED) {
        if (aCallRecords[i].call_type == CallType.INCOMING) {
          call_status = 'missed';
        }
      } else if (aCallRecords[i].call_status == CallStatus.ANSWERED) {
        call_status = 'answered';
      } else if (aCallRecords[i].call_status == CallStatus.REJECTED) {
        call_status = 'rejected';
      } else if (aCallRecords[i].call_status == CallStatus.CANCELLED) {
        call_status = 'cancelled';
      }

      if (callType == CallType.INCOMING) {
        callRecords.push({
          user_id: aCallRecords[i].origin_user.user_id,
          first_name: aCallRecords[i].origin_user.first_name,
          last_name: aCallRecords[i].origin_user.last_name,
          user_name: aCallRecords[i].origin_user.user_name,
          calls: 1,
          time: time,
          call_type: callType,
          call_channel: callChannel,
          call_status: call_status,
          online_mode: aCallRecords[i].origin_user.online_mode,
          images: aCallRecords[i].origin_user.images
        });
      } else {
        callRecords.push({
          user_id: aCallRecords[i].receivers_list[0].user_id,
          first_name: aCallRecords[i].receivers_list[0].first_name,
          last_name: aCallRecords[i].receivers_list[0].last_name,
          user_name: aCallRecords[i].receivers_list[0].user_name,
          calls: 1,
          time: time,
          call_type: callType,
          call_channel: callChannel,
          call_status: call_status,
          online_mode: aCallRecords[i].receivers_list[0].online_mode,
          images: aCallRecords[i].receivers_list[0].images
        });
      }
    }

    return callRecords;
  }

  startCall(user, callChannel) {
    this.props.startCall(user, callChannel);
  }

  createCall(contact, callChannel) {
    this.props.createCall(contact, callChannel);
  }

  headerNavRecent() {
    let mainCat = this.state.activeMainCat;
    let subCat = this.state.activeSubCat;

    return (
      <div className="rw-contact-menu sub-menu">
        <div className={(subCat == "all") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getCallRecords("recent", "all")
        }}>All <span className="selector"></span></div>
        <div className={(subCat == "missed") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getCallRecords("recent", "missed")
        }}>Missed <span className="selector"></span></div>
        <div className={(subCat == "individual") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getCallRecords("recent", "individual")
        }}>Individual <span className="selector"></span></div>
        <div className={(subCat == "groups") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.loadContactData("recent", "groups")
        }}>Groups <span className="selector"></span></div>
        <div className={(subCat == "multi") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.loadContactData("recent", "multi")
        }}>Multi <span className="selector"></span></div>
      </div>
    )
  }

  headerNavContact() {
    let mainCat = this.state.activeMainCat;
    let subCat = this.state.activeSubCat;

    return (
      <div className="rw-contact-menu sub-menu">
        <div className={(subCat == "all") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getContacts("contact", "all")
        }}>All <span className="selector"></span></div>
        <div className={(subCat == "individual") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getContacts("contact", "individual")
        }}>Individual <span className="selector"></span></div>
        <div className={(subCat == "groups") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getContacts("contact", "groups")
        }}>Groups <span className="selector"></span></div>
      </div>
    )
  }

  headerNavStatus() {
    let mainCat = this.state.activeMainCat;
    let subCat = this.state.activeSubCat;

    return (
      <div className="rw-contact-menu sub-menu">
        <div className={(subCat == "online") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getContactsByStatus("status", "online")
        }}>Online <span className="selector"></span></div>
        <div className={(subCat == "busy") ? "col-sm-2-4 active" : "col-sm-2-4" } onClick={(event)=> {
          this.getContactsByStatus("status", "work_mode")
        }}>Work-Mode <span className="selector"></span></div>
      </div>
    )
  }

  onUserStateUpdate(mode) {
    this.refs.overlay.hide();
    this.setState({userStatus: mode, isStatusVisible: false});

    let userName = this.state.loggedUser.user_name;

    let allContacts = this.state.userContacts;
    let contactsUsernames = [];

    for (var key in allContacts) {
      for (var subKey in allContacts[key].users) {
        let type = allContacts[key].users[subKey].type;
        if (type == ContactType.INDIVIDUAL) {
          contactsUsernames.push(allContacts[key].users[subKey].user_name);
        }
      }
    }

    console.log('contactsUsernames', contactsUsernames);

    ContactProvider.updateUserMode(mode).done(function (data) {
      if (data.status.code == 200) {
        Session.updateSession('prg_lg', 'online_mode', data.onlineMode);
        ContactProvider.changeUserMode(contactsUsernames, userName, data.onlineMode);
      }
    });
  }

  onUserStatusClick() {
    this.setState({isStatusVisible: true});
  }

  getUserStatusClass(userStatus) {
    if (userStatus == UserMode.ONLINE.VALUE) {
      return 'online';
    } else if (userStatus == UserMode.WORK_MODE.VALUE) {
      return 'work-mode';
    } else {
      return 'offline';
    }
  }

  headerNav() {
    let mainCat = this.state.activeMainCat;
    let subCat = this.state.activeSubCat;

    const popoverClickRootClose = (
      <Popover id="popover-trigger-click-root-close" className="user-status-popover">
        <section className="cc-online-status-popup">
          <div className="status-type" onClick={(event)=> {
            this.onUserStateUpdate(UserMode.ONLINE.VALUE)
          }}>
            <span className="status online"></span>
            <p className="type">{UserMode.ONLINE.TITLE}</p>
          </div>
          <div className="status-type" onClick={(event)=> {
            this.onUserStateUpdate(UserMode.WORK_MODE.VALUE)
          }}>
            <span className="status work-mode"></span>
            <p className="type">{UserMode.WORK_MODE.TITLE}</p>
          </div>
          <div className="status-type" onClick={(event)=> {
            this.onUserStateUpdate(UserMode.OFFLINE.VALUE)
          }}>
            <span className="status offline"></span>
            <p className="type">{UserMode.OFFLINE.TITLE}</p>
          </div>
          <div className="mood-msg status-type">
            <span className="status addIcon"></span>
            <p>Edit Mood Message</p>
          </div>
        </section>
      </Popover>
    );

    return (
      <div className="inner-header clearfix">
        <div className="col-sm-6 user-status">
          <div className="image-wrapper">
            <img
              src={(this.state.loggedUser.hasOwnProperty('profile_image') && this.state.loggedUser.profile_image) ?
                this.state.loggedUser.profile_image : "/images/default-profile-pic.png"}/>
            <OverlayTrigger ref="overlay" trigger="click" rootClose placement="right"
                            overlay={popoverClickRootClose}>
                            <span className={"status user-mode " + this.getUserStatusClass(this.state.userStatus)}
                                  onClick={this.onUserStatusClick.bind(this)}></span>
            </OverlayTrigger>
          </div>
          <div className="name-wrapper">
            <p className="name">{this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name}</p>
            <p className="status">{this.getUserStatusClass(this.state.userStatus)}</p>
          </div>
        </div>
        <div className="col-sm-6 tab-wrapper">
          <div className="rw-contact-menu main-menu clearfix">
            <div className={(mainCat == "recent") ? "col-sm-4 active" : "col-sm-4" }
                 onClick={(event)=> {
                   this.getCallRecords("recent", "all")
                 }}>Recent
            </div>
            <div className={(mainCat == "contact") ? "col-sm-4 active" : "col-sm-4" }
                 onClick={(event)=> {
                   this.getContacts("contact", "all")
                 }}>Contact
            </div>
            <div className={(mainCat == "status") ? "col-sm-4 active" : "col-sm-4" }
                 onClick={(event)=> {
                   this.getContactsByStatus("status", "online")
                 }}>Status
            </div>
          </div>
          {(mainCat == "recent") ? this.headerNavRecent() : null}
          {(mainCat == "contact") ? this.headerNavContact() : null}
          {(mainCat == "status") ? this.headerNavStatus() : null}
        </div>
      </div>
    )
  }

  handleShowModal() {
    this.setState({showModal: true});
  }

  onSearch(e) {
    let val = e.target.value,
      userContacts = this.currUserList,
      dataSet = [],
      usersSet = [],
      letter = null;
    this.setState({searchValue: val});

    for (var key in userContacts) {
      letter = userContacts[key].letter;

      for (var subKey in userContacts[key].users) {
        let name = userContacts[key].users[subKey].first_name + " " + userContacts[key].users[subKey].last_name;
        if (name.includes(val)) {
          usersSet.push(userContacts[key].users[subKey]);
        }
      }

      if (usersSet.length >= 1) {
        if (this.state.activeMainCat == "recent") {
          dataSet.push({"users": usersSet});
        } else {
          dataSet.push({"letter": letter, "users": usersSet});
        }
        usersSet = [];
      }
    }

    if (val == "") {
      this.setState({userContacts: this.currUserList});
    } else {
      this.setState({userContacts: dataSet});
    }
  }

  componentDidMount() {
    let _this = this;

    asnyc.waterfall([
      function getContacts(callback) {
        ContactProvider.getContacts().done(function (data) {
          if (data.status.code == 200) {
            for (var key in data.contacts) {
              for (var subKey in data.contacts[key].users) {
                let type = data.contacts[key].users[subKey].type;
                if (type == ContactType.INDIVIDUAL) {
                  _this.allContacts.push(data.contacts[key].users[subKey]);
                }
              }
            }

            callback(null, data.contacts);
          } else {
            callback(data.status);
          }
        });
      },
      function getCallRecords(Contacts, callback) {
        CallProvider.getCallRecords().done(function (data) {
          if (data.status.code == 200) {
            callback(null, Contacts, data.call_records);
          } else {
            callback(data.status);
          }
        });
      }
    ], function (error, Contacts, CallRecords) {
      if (!error) {
        _this.setState({userContacts: Contacts, recentCalls: _this.processCallRecords(CallRecords)});
        _this.setActiveTabData('recent', 'all');
      }
    });

    ContactProvider.onContactChangeMode(function (modeChangedContact) {
      let allContacts = _this.state.userContacts;

      let contactModeUpdatedContacts = allContacts.reduce(function (updatedContactGroups, contactGroup) {
        let users = contactGroup.users.reduce(function (updatedUsers, user) {
          if (user.user_name === modeChangedContact.user_name) {
            user.online_mode = modeChangedContact.mode;
          }

          updatedUsers.push(user);
          return updatedUsers;
        }, [])

        contactGroup.users = users;

        updatedContactGroups.push(contactGroup);
        return updatedContactGroups;
      }, []);

      let allCallRecords = _this.state.recentCalls;

      let contactModeUpdatedCallRecords = allCallRecords.reduce(function (updatedCallRecords, callRecord) {
        if (callRecord.user_name === modeChangedContact.user_name) {
          callRecord.online_mode = modeChangedContact.mode;
        }

        updatedCallRecords.push(callRecord);

        return updatedCallRecords;
      }, []);

      _this.setState({callRecords: contactModeUpdatedCallRecords, userContacts: contactModeUpdatedContacts});
    });
  }

  render() {

    let mainCat = this.state.activeMainCat,
      subCat = this.state.activeSubCat;

    return (
      <section className="call-center-container sub-container">
        <div className="container">
          <section className="call-center-header">
            <div className="row">
              <div className="col-sm-4">
                <h2>Call Center</h2>
              </div>
              <div className="col-sm-8">
                <div className="actions-wrapper">
                  <div className="search-call">
		                                <span className="inner-addon">
		                                    <i className="fa fa-search"></i>
		                                    <input type="text" className="form-control" placeholder="Search"
                                               value={this.state.searchValue} onChange={this.onSearch.bind(this)}/>
		                                </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="call-center-inner-holder">
            {this.headerNav()}
            {
              (mainCat == "recent") ?
                <RecentList callRecords={this.state.activeTabData}
                            onUserCall={this.startCall.bind(this)}/>
                :
                null
            }
            {
              (mainCat == "contact") ?
                <ContactList userContacts={this.state.activeTabData}
                             startCall={this.startCall.bind(this)}
                             createCall={this.createCall.bind(this)}/>
                :
                null
            }
            {
              (mainCat == "status") ?
                <StatusList userContacts={this.state.activeTabData}
                            onUserCall={this.startCall.bind(this)}/>
                :
                null
            }
          </section>
          {
            (this.state.minimizeBar) ?
              <div className="callModelMinimized clearfix">
                <span className="user-name">test</span>
                <div className="opt-wrapper">
                  <i className="fa fa-caret-square-o-up" onClick={(e) => this.onPopupMaximize(e)}></i>
                  <i className="fa fa-times" onClick={(e) => this.onPopupClose(e)}></i>
                </div>
              </div>
              :
              null
          }
        </div>
      </section>
    );
  }
}

