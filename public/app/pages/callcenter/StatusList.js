import React from 'react';
import Contact from "./Contact";

export default class StatusList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}

    }

    onCalling(user,callType) {
        this.props.onUserCall(user,callType);
    }

    render() {
        let _this = this;
        let statusList = this.props.userContacts.map(function (oGroupedContacts, key) {
            return (
                <div className="contact-group" key={key}>
                    <p className="group-name">{oGroupedContacts.letter}</p>

                    <div className="contact-wrapper">
                        {oGroupedContacts.users.map(function (oContact) {
                            return (
                                <Contact key={oContact.user_id} contact={oContact} type="contact" onCalling={_this.onCalling.bind(_this)}/>
                            )
                        })}
                    </div>
                </div>
            )
        })
        return (
            <div className="status-list contacts-list">
                <div className="list-wrapper">
                    {statusList}
                </div>
            </div>
        );
    }
}