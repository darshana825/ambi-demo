import React from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import Session  from '../../middleware/Session';
import Lib from '../../middleware/Lib';

export default class FriendRequestList extends React.Component {
    constructor(props) {
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state = {
            seeAll: false,
            loggedUser: Session.getSession('prg_lg'),
            show_request_skip:false,
            show_suggestion_skip:false,
            showFriendRequestNotification: this.props.showFriendRequests,
            my_connections: this.props.my_connections,
            friend_requests: this.props.connection_requests
        };

        this.allFriendRequest = [];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({my_connections: nextProps.my_connections, showFriendRequestNotification: nextProps.showFriendRequests, friend_requests: nextProps.connection_requests});

        if(typeof nextProps.connection_requests != "undefined" && this.state.friend_requests != nextProps.connection_requests){
            this.props.setFriendRequestCount(nextProps.connection_requests.length);
        }
    }

    toggleRequestList(){
        let _rql = this.state.seeAll;
        this.setState({
            seeAll: !_rql
        });
    }

    acceptFriendRequest(userReq){
        $.ajax({
            url: '/connection/accept',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ sender_id: userReq.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                window.location.href = "/connections";
            }
        }.bind(this));

    }

    declineFriendRequest(userReq){
        $.ajax({
            url: '/connection/decline',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ sender_id: userReq.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                window.location.href = "/connections";
            }
        }.bind(this));
    }

    render() {

        let _this = this;
        let _requestsMap = null;

        if(this.state.friend_requests != undefined) {
            _requestsMap = this.state.friend_requests.map(function(request ,key){
                return (
                    <RequestItem
                        friend_req={request}
                        key={key}
                        acceptRequest={_this.acceptFriendRequest.bind(_this)}
                        declineRequest={_this.declineFriendRequest.bind(_this)}
                    />
                );
            });
        }

        return (
            (this.state.showFriendRequestNotification ?
                <section className="friends-popover-holder">
                    <div className="inner-wrapper">
                        <div className="popover-header">
                            <p className="friend-requests">friend requests</p>
                            <p className="find-friends">find friends</p>
                        </div>
                        <div className={(this.state.seeAll) ? "friends-list-holder see-all" : "friends-list-holder"}>
                            {_requestsMap}
                        </div>

                            <div className="popover-footer">
                                {
                                    (this.state.friend_requests.length > 7) ?
                                        <p className="see-all" onClick={this.toggleRequestList.bind(this)}>
                                            {(this.state.seeAll) ? "see less" : "see all"}
                                        </p>
                                        :
                                        null
                                }
                            </div>

                    </div>
                </section>
                :
                null
            )

        );
    }
}

export class RequestItem extends React.Component {
    constructor(props) {
        super(props);
    }

    acceptFriendRequest() {
        this.props.acceptRequest(this.props.friend_req);
    }

    declineFriendRequest() {
        this.props.declineRequest(this.props.friend_req);
    }

    render (){

        let friend_req = this.props.friend_req;
        let _default_img = "/images/default-profile-pic.png";
        let _images = friend_req.images;
        let profileImg = _images.hasOwnProperty('profile_image') ? (_images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : _default_img) : _default_img;
        //let profileImg = friend_req.images.profile_image.http_url;
        let profName = friend_req.first_name + " " +friend_req.last_name;
        let subTitle = friend_req.mutual_connection_count + " mutual Friends";
        let requestedTime = Lib.getRelativeTime(friend_req.created_time);

        return (
            <div className="friends-item">
                <div className="prof-img">
                    <img src={profileImg} className="img-responsive" />
                </div>
                <div className="friends-preview">
                    <h3 className="prof-name">{profName}</h3>
                    <p className="sub-title">{subTitle}</p>
                    <p className="requested-time">{requestedTime}</p>
                </div>
                <div className="controls">
                    <button className="btn btn-decline" onClick={this.declineFriendRequest.bind(this)}>
                        <span className="ico"></span> decline</button>
                    <button className="btn btn-accept" onClick={this.acceptFriendRequest.bind(this)}>
                        <span className="ico"></span> accept</button>
                </div>
            </div>
        );
    }

}
