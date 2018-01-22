/**
 * This component is use to handle Profile Header
 * This will contain Cover image, Profile image, Profile general Information,
 * Connection
 */
import React,{Component} from 'react';
import Session  from '../../middleware/Session';
import CoverImageUploader from '../../components/elements/CoverImageUploader';
import ProfileImageUploader from '../../components/elements/ProfileImageUploader';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import PubSub from 'pubsub-js';

export default class Header extends Component {

    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            //user:this.props.user,
            ProgressBarIsVisible : false
        };

        let _this = this;

    }

    render(){

        if(Object.keys(this.props.user).length ==0){
            return (<div> Loading ....</div>);
        }

        let read_only = (this.state.loggedUser.id == this.props.user.user_id)?false:true;
        let isOnFriendsProfile = (this.state.loggedUser.id != this.props.user.user_id && this.props.connectionStatus == 0) ? true : false;

        return (
            <div className="cover-container">
                <div className="cover-image-wrapper">
                    <CoverImage
                        dt={this.props.user}
                        readOnly={read_only}
                        onFriendsProfile={isOnFriendsProfile}
                        onUpdateProfileImages = {this.props.onUpdateProfileImages}
                        connectionStatus={this.props.connectionStatus}
                        onAddFriend = {this.props.onAddFriend}
                        onAcceptFriendRequest = {this.props.onAcceptFriendRequest}
                        onUnfriendUser = {this.props.onUnfriendUser}
                        usrId={this.props.usrId}
                        loggedUser={this.props.loggedUser}
                        onLoadMutualFriends  = {this.props.onLoadMutualFriends}
                    />
                </div>
                <ProfileInfo dt={this.props.user} readOnly={read_only} loadExperiences={this.props.loadExperiences} uname={this.props.uname} loadProfileData={this.props.loadProfileData} onUpdateProfileImages = {this.props.onUpdateProfileImages}/>
            </div>
        )
    }
}

/**
 * Show cover image
 * @param props
 */
export class CoverImage extends React.Component{
    constructor(props){
        super(props);
        let coverImg = (this.props.dt.images.cover_image)? this.props.dt.images.cover_image.http_url : "../images/profile/cover.png";
        this.state = {
            coverimgSrc : coverImg
        }
        this.coverImgUpdate = this.coverImgUpdate.bind(this);
        this.loggedUser = Session.getSession('prg_lg');
    }

    onLoadQuickChatMessage() {

        if(!this.props.onFriendsProfile) {
            return;
        }

        let friend_title = this.props.dt.user_name;
        let progTitle = 'proglobe' + friend_title;
        var FPM = "FRIEND_PROFILE_MESSAGING";

        let messagingObj = {
            date: "",
            id: "",
            latestMsg: "",
            message_id: "",
            proglobeTitle: progTitle,
            tabId: "",
            title: friend_title,
            user:this.props.dt
        };

        PubSub.publishSync(FPM, messagingObj);
    }

    onLoadVideoCall(t) {

        if(!this.props.onFriendsProfile) {
            return;
        }

        let friend_title = this.props.dt.user_name;
        let friend_uri = 'usr:proglobe' + friend_title;
        let progTitle = 'proglobe' + friend_title;
        let FPVC = "FRIEND_PROFILE_VIDEO_CALL";

        let messagingObj = {
            date: "",
            id: "",
            latestMsg: "",
            message_id: "",
            proglobeTitle: progTitle,
            tabId: "",
            title: friend_title,
            user: this.props.dt,
            uri: friend_uri,
            type: t
        };

        PubSub.publishSync(FPVC, messagingObj);
    }

    coverImgUpdate(data){

        this.setState({loadingBarIsVisible : true});
        let _this =  this;

        $.ajax({
            url: '/upload/cover-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':_this.loggedUser.token },
            data:{cover_img:data,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {

                    _this.setState({loadingBarIsVisible : false,coverimgSrc : data.user.cover_image});
                    Session.createSession("prg_lg", data.user);

                    var _pay_load = {};
                    _pay_load['__content'] = "";
                    _pay_load['__hs_attachment'] = true;
                    _pay_load['__post_mode'] = "CP";//cover update post
                    _pay_load['__profile_picture'] = data.cover_image;

                    $.ajax({
                        url: '/post/profile-image-post',
                        method: "POST",
                        dataType: "JSON",
                        headers: {'prg-auth-header': _this.loggedUser.token},
                        data: _pay_load,
                        cache: false,
                        contentType: "application/x-www-form-urlencoded",
                        success: function (data, text) {
                            if (data.status.code == 200) {
                                //document.location.reload(true)
                                _this.props.onUpdateProfileImages();
                            }
                        },
                        error: function (request, status, error) {
                            console.log(request.responseText);
                            console.log(status);
                            console.log(error);
                        }


                    });

                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

        this.setState({coverimgSrc : data});
    }

    render() {
        let bgImg = {
            backgroundImage: 'url('+this.state.coverimgSrc+')'
        }

        let full_name =  this.props.dt.first_name + " " +  this.props.dt.last_name;
        return (
            <div className="cover-image" style={bgImg}>
                {(this.props.readOnly)? null : <CoverImageUploader imgUpdated={this.coverImgUpdate} /> }
                <h1 className="profile-name">{full_name}</h1>
                    <div>
                        <div className="actions-wrapper">
                            <ConnectionStatus
                                connectionStatus={this.props.connectionStatus}
                                onAddFriend = {this.props.onAddFriend}
                                onAcceptFriendRequest = {this.props.onAcceptFriendRequest}
                                onUnfriendUser = {this.props.onUnfriendUser}
                                usrId={this.props.usrId}
                                loggedUser={this.props.loggedUser}/>
                            {(this.props.onFriendsProfile) ?
                                <div>
                                    <div className="action-event message" onClick={()=>this.onLoadQuickChatMessage()}>
                                        <span className="icon"></span><span className="text">message</span>
                                    </div>
                                    < div className = "action-event call" onClick={()=>this.onLoadVideoCall('CALL')}>
                                        <span className="icon"></span><span className="text">call</span>
                                        </div>
                                        <div className="action-event video" onClick={()=>this.onLoadVideoCall('VIDEO')}>
                                        <span className="icon"></span><span className="text">video</span>
                                    </div>
                                </div> : null
                            }
                        </div>
                        {
                            <ConnectionIndicator dt ={this.props.dt} readOnly={this.props.readOnly}/>
                        }
                    </div>

            </div>
        );
    }
}

/**
 * Show Connection count
 */
const ConnectionIndicator =(props)=> {
    let url = (props.readOnly) ? "/profile/" + props.dt.user_name + "/connections" : "/connections";
    return (
        <div className="mutual-connections">
            <a href={url}>
                <span className="icon"></span>
                <div className="mutual-count">
                    <span className="count">{props.dt.connection_count}</span>
                    <span className="des">connections</span>
                </div>
            </a>
        </div>
    );
};

/**
 * Show Mutual Friends count
 */
export class MutualConnectionIndicator extends React.Component {

    constructor(props){
        super(props);

    }
    loadMutualFriends() {
        if(this.props.mutualCount != undefined && this.props.mutualCount > 0) {
            this.props.onLoadMutualFriends()
        }
    }

    render() {
        return (
            <div>
                {
                    <div className="mutual-connections" onClick={this.loadMutualFriends}>
                        <span className="icon"></span>
                        <div className="mutual-count">
                            <span className="count">{this.props.mutualCount}</span>
                            <span className="text">mutual</span>
                            <span className="des">connections</span>
                        </div>
                    </div>
                }
            </div>
        )
    };
};


export class ConnectionStatus extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showUnfriendPopup : false
        }
        //0-already connected (nothing to display), 1-request sent (Display "Request Pending" label), 2-request received (Display "Accept" button), 3-can send request (Display "Add as a Connection" button)
    }

    loadUnfriendPopup() {
        this.setState({showUnfriendPopup: true});
    }

    doUnfriend(){
        this.props.onUnfriendUser(this.props.usrId);
        this.handleClose();
    }

    handleClose(){
        this.setState({showUnfriendPopup: false});
    }

    getPopupUnfriend(){
        return(
            <div>
                {this.state.showUnfriendPopup &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="402px" style={{marginTop : "-100px", padding : "0"}}>
                        <div className="popup-holder">
                            <div className="notification-alert-holder delete-alert">
                                <div className="model-header">
                                    <h3 className="modal-title">unfriend message</h3>
                                </div>
                                <div className="model-body">
                                    <p className="alert-content">are you sure you want to unfriend this friend?</p>
                                </div>
                                <div className="model-footer">
                                    <button className="btn cancel-btn" onClick={this.handleClose.bind(this)}>cancel</button>
                                    <button className="btn delete-btn" onClick={this.doUnfriend.bind(this)}>unfriend</button>
                                </div>
                            </div>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    renderMainStatus() {
        switch (this.props.connectionStatus) {
            case 0: return (
                (this.props.usrId != null)?
                    <div className="action-event unfriend" onClick={ this.loadUnfriendPopup.bind(this) }>
                        <span className="icon"></span><span className="text">unfriend</span>
                    </div> : null
            );
            case 1:return (
                <div className="action-event">
                    <span className="text">Request Pending</span>
                </div>
            );
            case 2:return (
                <div className="action-event" onClick={ () => this.props.onAcceptFriendRequest(this.props.usrId) }>
                    <span className="text">Accept</span>
                </div>
            );
            case 3:return (
                <div className="action-event" onClick={ () => this.props.onAddFriend(this.props.usrId) }>
                    <span className="text">Add as a Connection</span>
                </div>
            );
            default: return null;
        }
    }

    render(){
        return(
            <div>
                {this.renderMainStatus()}
                {this.getPopupUnfriend()}
            </div>
        )
    }
}

/**
 * Profile General in formations
 */
export class ProfileInfo extends React.Component{
    constructor(props){
        super(props);
        let _images = this.props.dt.images;
        let profileImg = _images.hasOwnProperty('profile_image') ? _images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : "/images/default-profile-pic.png" : "/images/default-profile-pic.png";
        profileImg = (profileImg != undefined && profileImg) ? profileImg : "/images/default-profile-pic.png";
        //let profileImg = (typeof  this.props.dt.images.profile_image.http_url != 'undefined')? this.props.dt.images.profile_image.http_url : this.props.dt.images.profile_image.file_name;
        let working_at = (this.props.dt.cur_working_at)? this.props.dt.cur_working_at:"";
        let designation = (this.props.dt.cur_designation)? this.props.dt.cur_designation:"";
        let exp_id = (this.props.dt.cur_exp_id)? this.props.dt.cur_exp_id:null;
        let desigFieldLength = designation.length;
        let officeFieldLength = working_at.length;
        let uname = this.props.uname;

        this.state = {
            profileImgSrc : profileImg,
            jobPostition : designation,
            office : working_at,
            desigFieldSize : desigFieldLength,
            officeFieldSize : officeFieldLength,
            saveEdit : false,
            exp_id : exp_id,
            uname:uname
        }
        this.profileImgUpdated = this.profileImgUpdated.bind(this);
        this.loggedUser = Session.getSession('prg_lg');
    }

    profileImgUpdated(data){
        this.setState({loadingBarIsVisible : true});

        let _this =  this;

        $.ajax({
            url: '/upload/profile-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':_this.loggedUser.token },
            data:{profileImg:data,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {

                    _this.setState({loadingBarIsVisible: false, profileImgSrc: data.user.profile_image});
                    Session.createSession("prg_lg", data.user);

                    var _pay_load = {};
                    _pay_load['__content'] = "";
                    _pay_load['__hs_attachment'] = true;
                    _pay_load['__post_mode'] = "PP";//profile update post
                    _pay_load['__profile_picture'] = data.profile_image;

                    $.ajax({
                        url: '/post/profile-image-post',
                        method: "POST",
                        dataType: "JSON",
                        headers: {'prg-auth-header': _this.loggedUser.token},
                        data: _pay_load,
                        cache: false,
                        contentType: "application/x-www-form-urlencoded",
                        success: function (data, text) {
                            if (data.status.code == 200) {
                                //document.location.reload(true)
                                _this.props.onUpdateProfileImages();
                            }
                        },
                        error: function (request, status, error) {
                            console.log(request.responseText);
                            console.log(status);
                            console.log(error);
                        }


                    });
                }
            },

            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

    }

    positonChange(e){
        let fieldName = e.target.name;
        let value = e.target.value;
        let fieldLength = value.length;

        if(fieldName == "designation"){
            this.setState({jobPostition : value, desigFieldSize : fieldLength});
            this.props.dt.cur_designation = value;
        }else{
            this.setState({office : value, officeFieldSize : fieldLength});
            this.props.dt.cur_working_at = value;
        }
    }

    editOccupation(){
        this.setState({saveEdit : true});
    }

    saveOccupation(){
        this.setState({saveEdit : false});

        let profileOccupation = {
            exp_id:this.state.exp_id,
            company_name:this.state.office,
            title:this.state.jobPostition,
            isProfile:true
        };
        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/work-experience/update',
            method: "POST",
            dataType: "JSON",
            data:profileOccupation,
            headers: { 'prg-auth-header':loggedUser.token },
            success: function (data, text) {
                if(data.status.code == 200){
                    this.props.loadExperiences();
                    this.props.loadProfileData();
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });

    }

    render() {
        let full_name =  this.props.dt.first_name + " " +   this.props.dt.last_name;

        return (
            <div className="info-container">
                <div className="row">
                    {
                        (this.state.jobPostition || this.state.office)?
                                <div className="col-sm-5 left-col curr-job-holder">
                                    <p className={(!this.state.saveEdit)? "designation-text" : "designation-text editable"} >{this.state.jobPostition}</p>
                                    <input type="text" name="designation" className={(!this.state.saveEdit)? "job-data" : "job-data editable"} size={this.state.desigFieldSize} value={this.props.dt.cur_designation} onChange={this.positonChange.bind(this)} readOnly={!this.state.saveEdit}/>
                                    <span className="combine-text">at</span>
                                    <p className={(!this.state.saveEdit)? "office-text" : "office-text editable"} >{this.state.office}</p>
                                    <input type="text" name="workplace" className={(!this.state.saveEdit)? "job-data" : "job-data editable"} size={this.state.officeFieldSize} value={this.props.dt.cur_working_at} onChange={this.positonChange.bind(this)} readOnly={!this.state.saveEdit}/>
                                    {
                                        (!this.props.readOnly)?
                                            (!this.state.saveEdit)?
                                            <span className="fa fa-pencil-square-o" onClick={this.editOccupation.bind(this)}></span>
                                            :
                                            <span className="fa fa-floppy-o" onClick={this.saveOccupation.bind(this)}></span>
                                        :
                                        null
                                    }
                                </div>
                        :
                        <div className="col-sm-5 left-col"></div>
                    }
                    <div className="col-sm-2 mid-col">
                        <div className="profile-mid-wrapper">
                            <div className="img-holder proImgHolder">
                                <img src={this.state.profileImgSrc}
                                    alt={full_name}
                                    className="img-responsive"/>
                                {(this.props.readOnly)? null : <ProfileImageUploader profileImgSrc={this.state.profileImgSrc} imgUpdated={this.profileImgUpdated} /> }
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-5 right-col">
                        <h3 className="lives-in">{this.props.dt.city_details}</h3>
                    </div>
                </div>
            </div>
        );
    }
}
