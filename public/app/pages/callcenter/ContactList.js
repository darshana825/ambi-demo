import React from 'react';
import Contact from "./Contact";

export default class ContactList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.contacts = [];
  }

  startCall(user, callChannel, isGroupContact) {
    this.props.startCall(user, callChannel, isGroupContact);
  }

  createCall(contact, callChannel) {
    this.props.createCall(contact, callChannel);
  }

  render() {
    let _this = this;

    let usersList = '';

    if (typeof this.props.userContacts !== 'undefined' && this.props.userContacts.length > 0) {
      usersList = this.props.userContacts.map(function (oGroupedContacts, index) {
        let key = 'contact_' + index;

        return (
          <div key={key} className="contact-group">
            <p className="group-name">{oGroupedContacts.letter}</p>

            <div className="contact-wrapper">
              {oGroupedContacts.users.map(function (oContact) {
                return (
                  <Contact key={oContact.user_name} contact={oContact} type="contact"
                           startCall={_this.startCall.bind(_this)}
                           createCall={_this.createCall.bind(_this)}/>
                )
              })}
            </div>
          </div>
        )
      });
    } else {
      usersList = (<h3 className="no-data">No contacts.</h3>);
    }

    return (
      <div className="contacts-list">
        {usersList}
      </div>
    );
  }
}