import React from 'react';

export default class InitiateCallIndicator extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let call = this.props.call
    let contacts = call.contacts

    let callContacts = contacts.map(function (contact) {
      if (!contact.localContact) {
        return (
          <span className="tag">{contact.contactName}</span>
        )
      }
    })

    return (
      <div className="popup-holder">
        <div className="cc-short-popup missed-call clearfix">
          <div class="popup-header-container">
          </div>
          <div className="popup-body-container">
            <p className="popup-des">
              Initiating call with
              <div>
                {callContacts}
              </div>
            </p>
          </div>
          <div className="popup-footer-container clearfix">

          </div>
        </div>
      </div>
    )
  }
}