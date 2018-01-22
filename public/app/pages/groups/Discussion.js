/**
 * The Group discussion page
 */
import React from 'react';
import moment from 'moment';

import Session  from '../../middleware/Session';
import GroupHeader from './GroupHeader';

import SearchMembersField  from './elements/SearchMembersField';
import AddPostElement from '../../components/timeline/AddPostElement';
import ListPostsElement from '../../components/timeline/ListPostsElement';
import Toast from '../../components/elements/Toast';

import RichTextEditor from '../../components/elements/RichTextEditor';
import Lib    from '../../middleware/Lib';
import { Popover, OverlayTrigger } from 'react-bootstrap';

export default class Discussion extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        var group = this.props.myGroup;
        this.state = {
            user : user,
            uname : user.user_name,
            currentGroup : group,
            randomMembers : this.props.randomMembers,
            membersCount : this.props.membersCount,
            members : this.props.members,
            posts:[],
            currentDescription : group.description,
            showSave : false,
            descriptionMsg : "",
            descriptionMsgStatus : "warning",
            showDesToast : false,
            editedDescription:null
        };

        this.postType = 2; // [ PERSONAL_POST:1, GROUP_POST:2 ]
        this.postVisibleMode = 5; // [ PUBLIC:1, FRIEND_ONLY:2, ONLY_MY:3, SELECTED_USERS:4, GROUP_MEMBERS:5 ]
        this.currentDescription = group.description;

        this.currentGroup = this.state.currentGroup;
        this.saveDescription = this.saveDescription.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
        this.enableSaveDescription = this.enableSaveDescription.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        // Basically, whenever you assign parent's props to a child's state
        // the render method isn't always called on prop update
        if (nextProps.randomMembers !== this.state.randomMembers) {
            this.setState({ randomMembers: nextProps.randomMembers });
        }

        if (nextProps.membersCount !== this.state.membersCount) {
            this.setState({ membersCount: nextProps.membersCount });
        }

        if (nextProps.members !== this.state.members) {
            this.setState({ members: nextProps.members });
        }

        if (nextProps.myGroup !== this.state.currentGroup) {
            this.setState({ currentGroup: nextProps.myGroup, currentDescription : nextProps.myGroup.description});
            this.currentGroup = nextProps.myGroup;
            this.loadPosts(0);
        }
    }

    loadPosts(page){
        let user = Session.getSession('prg_lg');
        let _this =  this;

        var data = {
            __group_id: this.currentGroup._id,
            __post_type: this.postType,
            __pg: page,
            uname: this.state.uname,
            __own: "me"
        };
        $.ajax({
            url: '/pull/posts',
            method: "GET",
            dataType: "JSON",
            data:data,
            success: function (data, text) {
                if(data.status.code == 200){
                    this.setState({posts:data.posts})
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    onPostSubmitSuccess(data){
        let _posts = this.state.posts;
        _posts.unshift(data);
        this.setState({posts:_posts});
    }

    onPostDeleteSuccess() {
        console.log("onPostDeleteSuccess");
    }
    onLikeSuccess() {
        console.log("onLikeSuccess");
    }
    onLoadProfile() {
        console.log("onLoadProfile");
    }

    enableSaveDescription() {
        this.oldText = this.state.currentDescription;
        this.setState({showSave : true});
    }

    saveDescription() {
            var data = {
                __groupId: this.state.currentGroup._id,
                __description: this.state.editedDescription
            };

            $.ajax({
                url: '/groups/update-description',
                method: "POST",
                dataType: "JSON",
                data: JSON.stringify(data),
                headers : { "prg-auth-header" : this.state.user.token },
                contentType: "application/json; charset=utf-8",
            }).done(function (data, text) {
                if(data.status.code == 200){
                    this.setState({
                        showSave : false,
                      //  showDesToast: true,
                        descriptionMsg : "Saved the description successfully",
                        descriptionMsgStatus : 'success'
                    });
                } else {
                    this.setState({
                        showSave : false,
                     //   showDesToast: true,
                        descriptionMsg : "Error in saving the description",
                        descriptionMsgStatus : 'warning'
                    });
                }
            }.bind(this));
    }

    onToastClose() {
        this.setState({showDesToast: false});
    }

    handleDescription(event) {
        let _text  = Lib.sanitize(event.target.innerHTML);
        this.setState({editedDescription: _text});
    }

    render() {
        console.log(this.state.randomMembers);
        let workmodeClass = "";
        // let user = Session.getSession('prg_lg');
        const {user, uname}= this.state;
        return (
            <section className="group-content">
                <div className="sidebar col-sm-4">
                    <div className="grp-desc panel">
                        <h3 className="panel-title">{this.props.myGroup.name + " description"}</h3>
                        <div className="desc"
                            contentEditable={true}
                            onFocus={this.enableSaveDescription}
                            onBlur={this.saveDescription}
                            onInput={(event)=>{this.handleDescription(event)}}
                            placeholder="No description is added">
                            {this.state.currentDescription}
                        </div>
                        {this.state.showSave ?
                            <span className="save-btn" onInput={()=>{this.saveDescription()}}>save</span>
                        : ''}
                        {this.state.showDesToast ?
                            <Toast
                                msg={this.state.descriptionMsg}
                                onToastClose={this.onToastClose.bind(this)}
                                type={this.state.descriptionMsgStatus}
                            />
                            : ''}
                    </div>
                    <MembersWidget
                        members={this.state.members}
                        randomMembers={this.state.randomMembers}
                        membersCount={this.state.membersCount}
                        currentGroup={this.state.currentGroup}
                        onLoadMembers={this.props.onLoadMembers}
                    />
                    <CalendarWidget currentGroup={this.state.currentGroup} />
                </div>
                <div className="post-panel col-sm-8">
                    <div className="outer-wrapper clearfix">
                        <AddPostElement
                            workModeStyles={workmodeClass}
                            onPostSubmitSuccess={this.onPostSubmitSuccess.bind(this)}
                            uname = {uname}
                            profileUsr={user}
                            connectionStatus={this.state.connectionStatus}
                            postType={this.postType}
                            postVisibleMode={this.postVisibleMode}
                            members={this.state.members.members}
                            group={this.state.currentGroup}
                        />
                        <ListPostsElement
                            posts={this.state.posts}
                            uname = {uname}
                            onPostSubmitSuccess= {this.onPostSubmitSuccess.bind(this)}
                            onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                            onLikeSuccess = {this.onLikeSuccess.bind(this)}
                            onLoadProfile = {this.onLoadProfile.bind(this)}
                            postType={this.postType}
                            groupId={this.state.currentGroup._id}
                        />
                    </div>
                </div>
            </section>
        );
    }
}

/**
 * The Members Widget
 */
export class MembersWidget extends React.Component{

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        var group = this.props.currentGroup;
        this.state = {
            user : user,
            randomMembers : this.props.randomMembers,
            membersCount : this.props.membersCount,
            members : this.props.members,
            newMembers : [],
            sharedWithIds : [],
            group : group
        };

        this.addNewMembers = this.addNewMembers.bind(this);
        this.handleSearchUser = this.handleSearchUser.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        // Basically, whenever you assign parent's props to a child's state
        // the render method isn't always called on prop update
        if (nextProps.randomMembers !== this.state.randomMembers) {
            this.setState({ randomMembers: nextProps.randomMembers });
        }

        if (nextProps.membersCount !== this.state.membersCount) {
            this.setState({ membersCount: nextProps.membersCount });
        }

        if (nextProps.members !== this.state.members) {
            this.setState({ members: nextProps.members });
        }

        if (nextProps.currentGroup !== this.state.group) {
            this.setState({ group: nextProps.currentGroup });
        }
    }

    handleSearchUser(sharedWithIds, members){
        this.setState({newMembers: members, sharedWithIds : sharedWithIds});
    }

    addNewMembers() {

        var groupData = {
            __groupId : this.state.group._id,
            __members : this.state.newMembers
        };
        var _this = this;

        $.ajax({
            url: '/groups/add-members',
            method: "POST",
            dataType: "JSON",
            data: JSON.stringify(groupData),
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){
                var randomMembers = _this.state.randomMembers;
                var newRandomMembers = randomMembers.concat(_this.state.newMembers);
                this.props.onLoadMembers();
                _this.setState({newMembers: [], sharedWithIds: []});
            }
        }.bind(this));
    }

    render() {
        var userBlocks = '';
        var overflowCount = this.state.membersCount-this.state.randomMembers.length;
        var overflowCountStr = '+'+overflowCount.toString();
        var _this = this;

        let memberOverlayContent = (
            <Popover id="popover-contained"  positionTop="150px" className="remove-member-popup">
                <RemoveMemberPopup
                    groupData={this.state.group}
                    members={this.state.members}
                    randomMembers={this.state.randomMembers}
                    onLoadMembers={this.props.onLoadMembers}/>
            </Popover>
        );

        if(this.state.randomMembers.length > 0 ) {
            userBlocks = this.state.randomMembers.map(function(member,userKey){
                let _profile_image = member.profile_image != undefined && member.profile_image != "" ? member.profile_image : "/images/default-profile-pic.png";
                if(userKey+1 == _this.state.randomMembers.length && _this.state.randomMembers.length < _this.state.membersCount) {
                    return <div key={userKey+1} className="mem-img last-mem">
                        <img src={_profile_image} alt="mem" title={member.name} />
                        <div className="mem-count">
                            <span className="count">{overflowCountStr}</span>
                        </div>
                    </div>;
                } else {
                    return <div key={userKey+1} className="mem-img"><img src={member.profile_image} alt="mem" title={member.name} /></div>;
                }
            });
        }

        return (
            <div className="grp-members panel">
                <div className="panel-header clearfix">
                    {
                        /*(this.state.user.id == this.state.members.owner) ?
                            <OverlayTrigger rootClose trigger="click" placement="right" overlay={memberOverlayContent}>
                                <h3 className="panel-title" style={{cursor: 'pointer'}}>Group Members</h3>
                            </OverlayTrigger> :
                            <h3 className="panel-title">Group Members</h3>*/
                    }
                    <OverlayTrigger rootClose trigger="click" placement="right" overlay={memberOverlayContent}>
                        <h3 className="panel-title" style={{cursor: 'pointer'}}>Group Members</h3>
                    </OverlayTrigger>
                    <span className="mem-count">{this.state.membersCount} Members</span>
                </div>
                <div className="add-member clearfix">
                    <div className="search-field-holder">
                        <SearchMembersField
                            handleSearchUser={this.handleSearchUser}
                            placeholder="+ Add a member to this group..."
                            sharedWithIds={this.state.sharedWithIds}
                        />
                    </div>
                    <button
                        className="col-sm-2 btn btn-primary success-btn"
                        onClick={() => this.addNewMembers()}>
                        Add
                    </button>
                </div>
                <div className="all-members clearfix">
                    {userBlocks}
                </div>
            </div>
        );
    }
}

/**
 * The Calendar Widget
 */
export class CalendarWidget extends React.Component{

    constructor(props) {
        super(props);
        var currentGroup = this.props.currentGroup;
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user,
            currentDate : moment().format('YYYY-MM-DD'),
            currentGroup : currentGroup,
            events : []
        };

        this.loadEvents = this.loadEvents.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.previousDay = this.previousDay.bind(this);

        this.currentDate = this.state.currentDate;
        this.calendarOrigin = 2; // PERSONAL_CALENDAR || GROUP_CALENDAR
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentGroup !== this.state.currentGroup) {
            this.setState({ currentGroup: nextProps.currentGroup }, function () {
                this.loadEvents();
            });
        }
    }

    nextDay() {
        let nextDay = moment(this.state.currentDate).add(1,'days').format('YYYY-MM-DD');
        this.setState({currentDate : nextDay});
        this.currentDate = nextDay;
        this.loadEvents();
    }

    previousDay() {
        let prevDay = moment(this.state.currentDate).add(-1, 'days').format('YYYY-MM-DD');
        this.setState({currentDate : prevDay});
        this.currentDate = prevDay;
        this.loadEvents();
    }

    loadEvents() {

        var data = {
            day : this.currentDate,
            calendar_origin : this.calendarOrigin,
            group_id : this.state.currentGroup._id
        };

        $.ajax({
            url : '/calendar/day/all',
            method : "POST",
            data : data,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({events: data.events});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    render() {

        var events = [];
        var tasks = [];
        this.state.events.map(function(event,key){
			if(event.type == 1) {
				events.push(<li className="list-item">{event.plain_text}<span className="time">{event.event_time}</span></li>);
			} else {
                tasks.push(<li className="list-item">{event.plain_text}</li>);
            }
		});

        return (
            <div className="grp-day-panel panel">
                <div className="day-slide-header">
                    <div className="day-slider">
                        <p className="date">{moment(this.state.currentDate).format('dddd')}, {moment(this.state.currentDate).format('D')}</p>
                        <span className="fa fa-angle-left prev slide-btn" onClick={() => this.previousDay()}></span>
                        <span className="fa fa-angle-right next slide-btn" onClick={() => this.nextDay()}></span>
                    </div>
                </div>
                {/*<div className="date-selected clearfix">
                    <div className="date-wrapper pull-left">
                        <p className="day-name">{moment(this.state.currentDate).format('dddd')}</p>
                        <p className="day-num">{moment(this.state.currentDate).format('D')}</p>
                    </div>
                    <p className="month-name pull-right">{moment(this.state.currentDate).format('MMMM')}</p>
                </div>*/}
                <div className="event-task-holder">
                    <div className="event-wrapper clearfix inner-wrapper">
                        <div className="title-holder clearfix">
                            <i className="fa fa-calendar task-icon" aria-hidden="true"></i>
                            <h3 className="title">Event</h3>
                        </div>
                        <div className="events-list list">
                            <ul className="list-wrapper">
                                {events}
                            </ul>
                        </div>
                    </div>
                    <div className="task-wrapper clearfix inner-wrapper">
                        <div className="title-holder clearfix">
                            <span className="task-icon"></span>
                            <h3 className="title">Tasks</h3>
                        </div>
                        <div className="tasks-list list">
                            <ul className="list-wrapper">
                                {tasks}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export class RemoveMemberPopup extends React.Component{
    constructor(props) {
        super(props);

        this.state={
            user: Session.getSession('prg_lg'),
            seeAll: false,
            randomMembers: this.props.randomMembers,
            members: this.props.members,
            groupData: this.props.groupData
        }
    }

    componentWillReceiveProps(nextProps) {

        // Basically, whenever you assign parent's props to a child's state
        // the render method isn't always called on prop update
        if (nextProps.randomMembers !== this.state.randomMembers) {
            this.setState({ randomMembers: nextProps.randomMembers });
        }

        if (nextProps.members !== this.state.members) {
            this.setState({ members: nextProps.members });
        }

        if (nextProps.groupData !== this.state.groupData) {
            this.setState({ groupData: nextProps.groupData });
        }

    }

    toggleMemberList(){
        let _rql = this.state.seeAll;
        this.setState({
            seeAll: !_rql
        });
    }

    onRemoveMember(userId){

        let params = {
            _group_id: this.state.groupData._id,
            _member_id: userId
        }

        $.ajax({
            url: '/group/remove-member',
            method: "POST",
            dataType: "JSON",
            data: params,
            headers: { 'prg-auth-header':this.state.user.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {
                this.props.onLoadMembers();
            }
        }.bind(this));
    }

    render(){
        const {randomMembers, members, groupData} = this.state;
        console.log(randomMembers, "random", members , "mem", groupData, "grp");
        let _this = this;
        let _members = this.state.randomMembers.map(function(member,key){

            let _status = member.status == 1 ? "Request Pending" :
                    member.status == 2 ? "Request Rejected" :
                    member.status == 3 ? "Member" : "Removed";

            return (
                <div className="member-item" key={key}>
                    <div className="prof-img">
                        <img src={member.profile_image} className="img-responsive img-circle"/>
                    </div>
                    <div className="members-preview">
                        <h3 className="prof-name">{member.name}</h3>
                    </div>
                    <div className="controls">
                        {(_this.state.user.id == _this.state.members.owner) ?
                            ((_this.state.user.id == member.user_id) ? null : 
                                (member.status != 1 )?
                                <button className="btn btn-decline" onClick={()=>_this.onRemoveMember(member.user_id)}>remove</button>
                                :
                                <span>pending</span>
                            ) :
                            <span>{(_this.state.members.owner == member.user_id) ? "Owner" : _status }</span>
                        }
                    </div>
                </div>
            );
        });

        return (
            <div className="popup-holder">
                <section className="group-members-popover-holder">
                    <div className="inner-wrapper">
                        <div className="popover-header">
                            <p className="group-members">group members</p>
                        </div>
                        <div className={(this.state.seeAll) ? "members-list-holder see-all" : "members-list-holder"}>
                            {_members}
                        </div>

                        {
                            (_members.length > 4) ?
                                <div className="popover-footer">
                                    <p className="see-all" onClick={this.toggleMemberList.bind(this)}>{(this.state.seeAll)?"see less":"see all"}</p>
                                </div> : null
                        }
                    </div>
                </section>
            </div>
        );
    }
}
