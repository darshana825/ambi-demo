/**
 * This is profile index component
 */
import React from 'react';
import Header from './Header';
import Classes from './Classes';
import EducationalInfo from './EducationalInfo';
import WorkExperience from './WorkExperience';
import SkillsAndInterests from './SkillsAndInterests';
import Intro from './Intro';
import AddPostElement from '../../components/timeline/AddPostElement';
import ListPostsElement from '../../components/timeline/ListPostsElement'
import Session  from '../../middleware/Session';
import _ from 'lodash';
import Lib from '../../middleware/Lib';

export default class Index extends React.Component{

    constructor(props) {
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state={
            loggedUser:Session.getSession('prg_lg'),
            uname:this.getUrl(),
            user:{},
            data:{},
            posts:[],
            post_id:this.getPostId(),
            profileOwnerID: "",
            connectionStatus:0, //0-already connected (nothing to display), 1-request sent (Display "Request Pending" label), 2-request received (Display "Accept" button), 3-can send request (Display "Add as a Connection" button)
            usrId:null
        };
        if(this.state.loggedUser.user_name != this.state.uname){
            this.checkConnection(this.state.uname);
        }
        this.loadExperiences = this.loadExperiences.bind(this);
        this.loadProfileData = this.loadProfileData.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.onAddFriend = this.onAddFriend.bind(this);
        this.onAcceptFriendRequest = this.onAcceptFriendRequest.bind(this);
        this.onUnfriendUser = this.onUnfriendUser.bind(this);
        this.onLoadMutualFriends = this.onLoadMutualFriends.bind(this);
        this.onUpdateProfileImages = this.onUpdateProfileImages.bind(this);
        this.loadExperiences();
        this.loadProfileData();
        this.loadPosts(0);

        this.postType = 1; // [ PERSONAL_POST:1, GROUP_POST:2 ]
        this.postVisibleMode = 1; // [ PUBLIC:1, FRIEND_ONLY:2, ONLY_MY:3, SELECTED_USERS:4, GROUP_MEMBERS:5 ]
    }

    onAcceptFriendRequest(user_id){
        $.ajax({
            url: '/connection/accept',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ sender_id: user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.setState({connectionStatus:0});
            }
        }.bind(this));

    }

    onUnfriendUser(user_id){
        $.ajax({
            url: '/connection/unfriend',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ sender_id: user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.setState({connectionStatus:3});
            }
        }.bind(this));

    }

    onAddFriend(user_id){
        let _connectedUsers = [];
        _connectedUsers.push(user_id)
        $.ajax({
            url: '/connection/send-request',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{ connected_users: JSON.stringify(_connectedUsers)},

        }).done(function(data){
            if(data.status.code == 200){
                this.setState({connectionStatus:1});
            }
        }.bind(this));

    }

    checkConnection(uname){
        $.ajax({
            url: '/check-connection/'+uname,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                //console.log(data);
                if(data.status.code == 200){
                    var _connectionStatus = 0;

                    if(!data.alreadyConnected){
                        if(data.alreadyConnected){
                            _connectionStatus = 0;
                        } else if(data.alreadyRequestSent){
                            _connectionStatus = 1;
                        } else if(data.alreadyRequestReceived){
                            _connectionStatus = 2;
                        } else{
                            _connectionStatus = 3;
                        }
                    }

                    this.setState({
                        connectionStatus:_connectionStatus,
                        usrId:data.profile_user_id,
                        profileOwnerID: data.profile_user_id
                    });
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });

    }
    getPostId(){
        return  this.props.params.post;
    }
    getUrl(){
        return  this.props.params.uname;
    }
    onPostSubmitSuccess(data){
        let _posts = this.state.posts;
        _posts.unshift(data);
        this.setState({posts:_posts});
    }
    onPostDeleteSuccess(index){
        let _posts = this.state.posts;
        _posts.splice(index,1);
        this.setState({posts:_posts});
    }
    loadPosts(page){

        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/pull/posts',
            method: "GET",
            dataType: "JSON",
            data:{__pg:page,uname:_this.state.uname,__own:"me"},
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
    loadProfileData(){
        $.ajax({
            url: '/get-profile/'+this.state.uname,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.setState({user:data.profile_data});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

    }
    loadExperiences(){
        $.ajax({
            url: '/work-experiences/'+this.state.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.state.uname},
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.setState({data:data.user});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    };

    onLikeSuccess(index){
        let _posts = this.state.posts;
        _posts[index].is_i_liked=true;
        this.setState({posts:_posts});
    }

    componentDidMount(){
        window.setInterval(function () {
            this.updatePostTime();
        }.bind(this), 10000);
    }

    updatePostTime(){
        let _posts = this.state.posts;
        let _updatedPosts = [];
        for(var i = 0; i < _posts.length; i++){
            var data = _posts[i];
            var _timeAgo = Lib.timeAgo(data.date.time_stamp)
            data.date.time_a_go = _timeAgo;
            _updatedPosts.push(data);
        }

        this.setState({posts:_updatedPosts});
    }

    onLoadProfile(user_name){
        window.location.href = '/profile/'+user_name;
    }

    onLoadMutualFriends(){
        window.location.href = '/connections/mutual/'+this.state.uname;
    }

    onUpdateProfileImages() {
        this.loadProfileData();
        let _this = this;

        function doCallPost(_time) {
            setTimeout(function() {
                _this.loadPosts(0);
            }, _time);
        }

        doCallPost(1000);
        doCallPost(3000);
        doCallPost(5000);
    }

    onReloadPosts() {
        this.loadPosts(0);
    }

    render(){
        let profileName;

        if(this.state.profileOwnerID){
            profileName = this.state.user.first_name + " " + this.state.user.last_name;
        }else{
            profileName = this.state.loggedUser.first_name + " " + this.state.loggedUser.last_name;
        }

        return (
            <section className="profile-container">
                <div className="container">
                    <Header
                        uname={this.state.uname}
                        user={this.state.user}
                        loadExperiences={this.loadExperiences}
                        loadProfileData={this.loadProfileData}
                        connectionStatus={this.state.connectionStatus}
                        onAddFriend = {this.onAddFriend}
                        onAcceptFriendRequest = {this.onAcceptFriendRequest}
                        onUnfriendUser = {this.onUnfriendUser}
                        usrId={this.state.usrId}
                        onLoadMutualFriends = {this.onLoadMutualFriends}
                        onUpdateProfileImages = {this.onUpdateProfileImages}
                    />
                    {/*<div className="row row-clr">
                        <div className="container">
                            <div className="profile-content-container" id="middle-content-wrapper">
                                <div className="col-xs-6" id="profile-middle-container-left-col">
                                    <div id="pg-profile-middle-container-left-col-details">
                                        <div className="row row-clr pg-profile-content">
                                            <div className="row row-clr pg-profile-heading">
                                                <h1>{profileName + "'s"} Resume</h1>
                                            </div>
                                            {
                                                (this.state.connectionStatus == 3)?
                                                    <div className="locked-screen-holder">
                                                        <h3 className="locked-title"><i className="fa fa-lock" aria-hidden="true"></i>Resume is locked.</h3>
                                                        <p className="locked-msg">{profileName} is not a friends of yours yet. Send him a friend request by clicking "Add as a Connection" button.</p>
                                                    </div>
                                                :
                                                    <div>
                                                        <Intro uname={this.state.uname} user={this.state.user} loadProfileData={this.loadProfileData}/>
                                                        <EducationalInfo uname={this.state.uname} />
                                                        <WorkExperience uname={this.state.uname} data={this.state.data} loadExperiences={this.loadExperiences} loadProfileData={this.loadProfileData}/>
                                                        <SkillsAndInterests uname={this.state.uname} />
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xs-6" id="newsfeed-middle-container-right-col">
                                    {
                                        (this.state.connectionStatus == 3)?
                                            <div className="row row-clr pg-locked-profile-content">
                                                <div className="row row-clr pg-profile-heading">
                                                    <h1>{profileName + "'s"} Personal Feed</h1>
                                                </div>
                                                <div className="locked-screen-holder">
                                                    <h3 className="locked-title"><i className="fa fa-lock" aria-hidden="true"></i>Personal Feed is locked.</h3>
                                                    <p className="locked-msg">{profileName} is not a friends of yours yet. Send him a friend request by clicking "Add as a Connection" button.</p>
                                                </div>
                                            </div>
                                        :
                                            <div>
                                                <AddPostElement
                                                    onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                                    uname = {this.state.uname}
                                                    profileUsr={this.state.user}
                                                    connectionStatus={this.state.connectionStatus}
                                                    postType={this.postType}
                                                    postVisibleMode={this.postVisibleMode}
                                                />
                                                <ListPostsElement posts={this.state.posts}
                                                    uname = {this.state.uname}
                                                    onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                                    onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                                                    onLikeSuccess = {this.onLikeSuccess.bind(this)}
                                                />
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>*/}
                    <div className="feed-container">
                        <div className="row">
                            <div className="col-sm-4">
                                <div className="about-me-section">
                                    <p className="info-header">{profileName + "'s"} resume</p>
                                    {
                                        (this.state.connectionStatus == 1 || this.state.connectionStatus == 2 || this.state.connectionStatus == 3)?
                                            <div className="locked-screen-holder">
                                                <h3 className="locked-title"><i className="fa fa-lock" aria-hidden="true"></i>Resume is locked.</h3>
                                                <p className="locked-msg">{profileName} is not a friends of yours yet. Send him a friend request by clicking "Add as a Connection" button.</p>
                                            </div>
                                        :
                                            <div>
                                                <Intro uname={this.state.uname} user={this.state.user} loadProfileData={this.loadProfileData}/>
                                                <Classes uname={this.state.uname} />
                                                <EducationalInfo uname={this.state.uname} />
                                                <WorkExperience uname={this.state.uname} data={this.state.data} loadExperiences={this.loadExperiences} loadProfileData={this.loadProfileData}/>
                                                <SkillsAndInterests uname={this.state.uname} />
                                            </div>
                                    }
                                </div>
                            </div>
                            <div className="col-sm-8">
                                <div className="outer-wrapper clearfix">
                                    {
                                        (this.state.connectionStatus == 1 || this.state.connectionStatus == 2 || this.state.connectionStatus == 3)?
                                            <div className="row row-clr pg-locked-profile-content">
                                                <div className="row row-clr pg-profile-heading">
                                                    <h1>{profileName + "'s"} Personal Feed</h1>
                                                </div>
                                                <div className="locked-screen-holder">
                                                    <h3 className="locked-title"><i className="fa fa-lock" aria-hidden="true"></i>Personal Feed is locked.</h3>
                                                    <p className="locked-msg">{profileName} is not a friends of yours yet. Send him a friend request by clicking "Add as a Connection" button.</p>
                                                </div>
                                            </div>
                                        :
                                            <div>
                                                <AddPostElement
                                                    onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                                    uname = {this.state.uname}
                                                    profileUsr={this.state.user}
                                                    connectionStatus={this.state.connectionStatus}
                                                    postType={this.postType}
                                                    postVisibleMode={this.postVisibleMode}
                                                />
                                                <ListPostsElement
                                                    posts={this.state.posts}
                                                    uname = {this.state.uname}
                                                    onPostSubmitSuccess ={this.onPostSubmitSuccess.bind(this)}
                                                    onPostDeleteSuccess = {this.onPostDeleteSuccess.bind(this)}
                                                    onLikeSuccess = {this.onLikeSuccess.bind(this)}
                                                    onReloadPosts = {this.onReloadPosts.bind(this)}
                                                />
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

}
// export default  Index;
