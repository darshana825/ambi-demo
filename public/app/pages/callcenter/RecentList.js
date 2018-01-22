import React from 'react';
import Recent from "./Recent";

export default class RecentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onCalling(user, callType) {
        this.props.onUserCall(user, callType);
    }

    render() {
        let _this = this;

        let recentList = '';

        if (typeof this.props.callRecords !== 'undefined' && this.props.callRecords.length > 0) {
            recentList = this.props.callRecords.map(function (oCallRecord, key) {
                return (
                    <div className="contact-group" key={key}>
                        <div className="list-wrapper">
                            <Recent key={oCallRecord._id} contact={oCallRecord} type="recent"
                                    onCalling={_this.onCalling.bind(_this)}/>
                        </div>
                    </div>
                )
            });
        } else {
            recentList = (<h3 className="no-data">No recent calls.</h3>);
        }

        return (
            <div className="recent-list contacts-list">
                {recentList}
            </div>
        );
    }
}