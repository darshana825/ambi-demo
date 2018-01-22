/**
 * List Posts element is for list all posts from the service.
 */

import React from 'react';
import InfiniteScroll from  'react-infinite-scroll';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import Lib    from '../../middleware/Lib';
import CommentElement from './CommentElement';
import ProgressBar from '../elements/ProgressBar';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Alert} from '../../config/Alert';
import Scroll from 'react-scroll';
const ListPostsElement  = ({posts,uname,onPostSubmitSuccess,onPostDeleteSuccess,onLikeSuccess,onLoadProfile, onReloadPosts, postType, groupId})=>{

        var postType = (postType ? postType : 1); // PERSONAL_POST :1, GROUP_POST:2
        var groupId = (groupId ? groupId : null);
        if(posts.length <= 0){
            return (<div />)
        }

        let _postElement = posts.map((post,key)=>{

            return (<SinglePost
                        postItem = {post}
                        key={key}
                        postIndex={key}
                        onPostSubmitSuccess ={(post)=>onPostSubmitSuccess(post)}
                        onPostDeleteSuccess = {onPostDeleteSuccess}
                        onLikeSuccess = {onLikeSuccess}
                        onLoadProfile = {onLoadProfile}
                        onReloadPosts = {onReloadPosts}
                        postType={postType}
                        groupId={groupId}/>)

        });

        return (
                <div className="post-list-wrapper" >
                    {
                        _postElement
                    }

                </div>

        );

}
export default ListPostsElement;



class SinglePost extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            postItem: this.props.postItem,
            profile: this.props.postItem.created_by,
            showCommentPane: false,
            comments: [],
            unformattedComments: [],
            // liked_users: this.props.postItem.liked_user,
            liked_users: typeof(this.props.postItem.liked_user) != "undefined" ? this.props.postItem.liked_user : [],
            isShowingModal: false,
            iniTextisVisible: false,
            text: "",
            shareBtnEnabled: true,
            isShowingVideoModal: false,
            isShowingImgModal: false,
            videoUrl: "",
            currentImage: 0,
            postIndex:this.props.postIndex,
            groupId:this.props.groupId ? this.props.groupId : null,
            postType:this.props.postType,
            deletePost: '',
            deletePostIndex: '',
            showRemovePostPopup: false
        };
        this.loggedUser= Session.getSession('prg_lg');

        this.lifeEvent="";
        this.sharedPost = false;
        this.imgList = [];

        this.openLightbox = this.openLightbox.bind(this);
    }

    componentDidMount(){
        let url = window.location.pathname.split('/');
        let id = url[url.length-1];
        let scroller = Scroll.directScroller;

        if (url.length == 4) {
            scroller.scrollTo(id, {
                duration: 1500,
                delay: 100,
                smooth: true,
                offset: -52
            })
        }
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.postItem !== this.state.postItem) {
            this.setState({ postItem: nextProps.postItem });
        }

        if (nextProps.postItem.liked_user !== this.state.liked_users) {
            this.setState({ liked_users: typeof(nextProps.postItem.liked_user) != "undefined" ? nextProps.postItem.liked_user : []});
        }

        if (nextProps.postIndex !== this.state.postIndex) {
            this.setState({ postIndex: nextProps.postIndex });
        }

        if (nextProps.postType !== this.state.postType) {
            this.setState({ postType: nextProps.postType });
        }

        if (nextProps.groupId !== this.state.groupId) {
            this.setState({ groupId: nextProps.groupId });
        }
    }

    onLikeClick(index){
        let _this = this;
        $.ajax({
            url: '/like/composer',
            method: "POST",
            dataType: "JSON",
            data:{__post_id:_this.state.postItem.post_id},
            headers: { 'prg-auth-header':_this.loggedUser.token },
            success: function (data, text) {

                var me = {
                    "name" : "You",
                    "profile_image" : "you",
                    "user_id" : _this.loggedUser.id,
                    "user_name" : _this.loggedUser.user_name
                };
                var likedUsers = _this.state.liked_users;
                likedUsers.push(me);
                _this.setState({liked_users : likedUsers});
                let _notificationData = {
                    post_id:data.like.post_id,
                    notification_type:"like",
                    notification_sender:_this.loggedUser
                };
                Socket.sendNotification(_notificationData);
                _this.props.onLikeSuccess(index);

            },
            error: function (request, status, error) {
                console.log("Alert.ALREADY_LIKED");
            }
        });
    }

    onShareClick(event){
        this.setState({isShowingModal : true});
    }
    onCommentClick(event){
        //if(this.state.showCommentPane){
        //    this.setState({showCommentPane:false});
        //}else{
        //    this.loadComment();
        //}
        let _commentStt = this.state.showCommentPane;
        this.setState({showCommentPane: !_commentStt});
    }
    loadComment(postId){
        let _this =  this;
        $.ajax({
            url: '/pull/comments',
            method: "GET",
            dataType: "JSON",
            data:{__pg:0,__post_id:this.state.postItem.post_id},
            headers: { 'prg-auth-header':this.loggedUser.token},
            success: function (data, text) {
                if(data.status.code == 200){
                    this.setState({
                        comments:data.comments.formattedResult,
                        unformattedComments:data.comments.unformattedResult,
                        showCommentPane:true,
                        comment_count:data.comments.length
                    })
                }
                //_this.props.onReloadPosts();
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }
    onCommentAddSuccess(){
        //this.loadComment();
        this.props.onReloadPosts();
    }
    onCommentDeleteSuccess(){
        //this.loadComment();
        this.props.onReloadPosts();
    }
    handleClose() {
        this.setState({isShowingModal: false, isShowingVideoModal:false, isShowingImgModal:false, showRemovePostPopup: false, deletePost: '', deletePostIndex: ''});
    }
    onContentAdd(event){
        let _text  = Lib.sanitize(event.target.innerHTML);
        let visibilityStat = (_text)? false : true;
        this.setState({text:_text, iniTextisVisible: visibilityStat});

    }
    onSharedPost(event){

        let post_data ={
            __content :this.state.text,
            __pid:this.state.postItem.post_id,
            __own:this.state.postItem.created_by.user_id,
            __post_type:this.state.postType,
            __group_id: this.state.groupId
        }
        let _this = this;
        this.setState({shareBtnEnabled:false});
        $.ajax({
            url: '/post/share',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:post_data,
            success:function(data){

                if (data.status.code == 200) {


                    let _subscribeData = {
                        post_id:data.post.post_id,
                        isOwnPost:true
                    };

                    Socket.subscribe(_subscribeData);

                    let _notificationData = {
                        post_id:data.post.shared_post_id,
                        notification_type:"share",
                        notification_sender:this.loggedUser
                    };

                    Socket.sendNotification(_notificationData);

                    if(!data.post.friends_post_sharing) {
                        _this.props.onPostSubmitSuccess(data.post);
                    }

                    //if(post_data.__own == _this.loggedUser.id ){
                    //    _this.props.onPostSubmitSuccess(data.post);
                    //
                    //}
                    _this.setState({
                        text:"",
                        isShowingModal:false,
                        iniTextisVisible:false,
                        shareBtnEnabled:true
                    });
                    document.getElementById('input').innerHTML = "";

                }
            }.bind(this)
        });
        setTimeout(_this.props.onReloadPosts, 2000);
    }
    handleAjaxSuccess(data){

        if (data.status.code == 200) {
            this.props.onPostSubmitSuccess(data.post);
            this.setState({
                text:"",
                isShowingModal:false,
                iniTextisVisible:false
            });
            document.getElementById('input').innerHTML = "";

        }
    }

    onVideoPlay(upload){
        this.setState({isShowingVideoModal:true, videoUrl:upload.http_url})
    }

    getVideoPopup(){

        return(
            <div>
                {this.state.isShowingVideoModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>

                    <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                        <div className="share-popup-holder">
                            <video width="100%" height="440" controls>
                                <source src={this.state.videoUrl} type="video/mp4"/>
                            </video>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )

    }

    loadDeletePostPopup(post, index) {
        this.setState({deletePost: post, deletePostIndex: index, showRemovePostPopup: true});
    }

    onPostDelete(){

        $.ajax({
            url: '/post/delete',
            method: "POST",
            dataType: "JSON",
            data:{__post_id:this.state.deletePost.post_id},
            headers: { 'prg-auth-header':this.loggedUser.token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                let _unsubscribeData = {
                    post_id:this.state.deletePost.post_id,
                    unsubscribedUsers:data.unsubscribeUsers
                };
                Socket.unsubscribeUsers(_unsubscribeData);
                this.props.onPostDeleteSuccess(this.state.deletePostIndex);
                this.setState({deletePost: '', deletePostIndex: '', showRemovePostPopup: false});
            }
        }.bind(this));

    }

    getPopupRemovePost(){
        return(
            <div>
                {this.state.showRemovePostPopup &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="402px" style={{marginTop : "-100px", padding : "0"}}>
                        <div className="popup-holder">
                            <div className="notification-alert-holder delete-alert">
                                <div className="model-header">
                                    <h3 className="modal-title">delete message</h3>
                                </div>
                                <div className="model-body">
                                    <p className="alert-content">are you sure you want to delete this post?</p>
                                </div>
                                <div className="model-footer">
                                    <button className="btn cancel-btn" onClick={this.handleClose.bind(this)}>cancel</button>
                                    <button className="btn delete-btn" onClick={this.onPostDelete.bind(this)}>delete</button>
                                </div>
                            </div>
                        </div>  
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }


    getPopup(){

        var _this = this;
        const _post = this.state.postItem;
        let post_content = "";
        let img_div_class = "image-col-wrapper pg-newsfeed-post-upload-image";
        if (_post.post_mode == "NP" ){
            post_content = _post.content;
        }else if(_post.post_mode == "LE"){
            post_content = _post.life_event;
            this.lifeEvent = post_content.toLowerCase().replace(/ /g,"-");
        }else if(_post.post_mode == "SP"){
            post_content = _post.content;
        }else if(_post.post_mode == "AP"){
            post_content = _post.content;
        }else if(_post.post_mode == "PP"){//profile update post
            post_content = _post.content;
            img_div_class += " profile-update";
        }

        let _profile = _post.created_by;
        let postImgLength = _post.upload.length;
        let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
            _profile.images.profile_image.http_url:"";


        let _show_share_button = (_profile.user_id != this.loggedUser.id)?true:false;

        var uploaded_files = _post.upload.map((upload,key)=>{
            // if(key <= 2){
            //     let _url = "";
            //     if(upload.file_type == "mp4"){
            //         _url = upload.thumb_http_url;
            //     } else{
            //         _url = upload.http_url
            //     }
            //     return (
            //         <div className={img_div_class} key={key}>
            //             <img src = {_url} className="img-responsive post-img" />{
            //             (upload.file_type == "mp4")?<i className="fa fa-play-circle-o post-video-play" aria-hidden="true"></i>:null
            //         }
            //             {(key == 3 && postImgLength > 4)? <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 4)}</p></div> : null}
            //         </div>
            //     )
            // }

            let _url = "";
            if(upload.file_type == "mp4"){
                _url = upload.thumb_http_url;
            } else{
                _url = upload.http_url
            }
            // _this.imgList.push(_url);

            if(key <= 2){
                return (
                    <div className={img_div_class} key={key}>

                        {(key == 2 && postImgLength > 3) ?
                            <img src = {_url} className="img-responsive post-img" />
                        :
                            <a className="post-img-container"
                                href={_url}
                                key={key}
                                onClick={(e) => _this.openLightbox(key, e)}>
                                <span className="img-helper"></span>
                                <img src = {_url} className="img-responsive post-img" />
                            </a>
                        }
                        {(upload.file_type == "mp4") ?
                            <i className="fa fa-play-circle-o post-video-play" aria-hidden="true" onClick = {(event)=>{_this.onVideoPlay(upload)}}></i>
                        :null }
                        {(key == 2 && postImgLength > 3) ?
                            <a className="post-img-container"
                                href={_url}
                                key={key}
                                onClick={(e) => _this.openLightbox(key, e)}>
                                <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 3)}</p></div>
                            </a>
                        : null }
                    </div>
                )
            } else {
                return(
                    <a className="post-img-container"
                        href={_url}
                        key={key}
                        onClick={(e) => _this.openLightbox(key, e)}>
                    </a>
                )
            }
        });

        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>

                    <ModalDialog onClose={this.handleClose.bind(this)} width="750px">
                        <div className="share-popup-holder">
                            <AddPostElementPopupText onContentAdd = {event=>this.onContentAdd(event)}
                                                     iniTextisVisible = {this.state.iniTextisVisible}
                                                    loggedUser = {this.loggedUser}
                                                     btnEnabled = {this.state.shareBtnEnabled}
                                                     onSubmitPost = {event=>this.onSharedPost(event)}/>

                            <div className="row row-clr pg-newsfeed-section-common-content-post-info share-popup-post-view">
                                <div className="pg-user-pro-pic">
                                    <img src={profile_image} alt={_profile.first_name + " " + _profile.last_name} className="img-responsive img-circle"/>
                                </div>
                                <div className="pg-user-pro-info">
                                    <h5 className="pg-newsfeed-profile-name">{_profile.first_name + " " + _profile.last_name}</h5>
                                    <p className="pg-newsfeed-post-time">{_post.date.time_a_go}</p>
                                    {
                                        (_post.location)?
                                            <span className="location_text">at - {_post.location} </span>:
                                            null
                                    }
                                </div>
                                <div className="row row-clr pg-newsfeed-common-content-post-content">
                                    <p className="pg-newsfeed-post-description">{post_content}</p>
                                </div>

                                <div id="image_display" className="image-container">
                                    <div className="row">
                                        {uploaded_files}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    onPrevClick(){
        this.setState({
            currentImage: this.state.currentImage - 1
        });
    }

    onNextClick(){
        this.setState({
            currentImage: this.state.currentImage + 1
        });
    }

    getImgPopup(){
        const _post = this.state.postItem;
        const _postIndex = this.state.postIndex;
        const _is_i_liked = _post.is_i_liked;

        return(
            <div>
                {this.state.isShowingImgModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999} width="70%">
                    <ModalDialog onClose={this.handleClose.bind(this)} className="imgPop-holder">
                        <div className="share-popup-holder feed-container">
                            <div className="img-holder">
                                <img src={this.imgList[this.state.currentImage]} className="img-responsive"/>
                            </div>
                            {
                                (this.state.currentImage != 0)?
                                    <i className="fa fa-chevron-left left-arrow arrow" onClick={this.onPrevClick.bind(this)}></i>
                                    :
                                    null
                            }

                            {
                                (this.imgList.length != this.state.currentImage + 1)?
                                    <i className="fa fa-chevron-right right-arrow arrow" onClick={this.onNextClick.bind(this)}></i>
                                    :
                                    null
                            }
                            <div className="wall-post">
                                <div className="post-footer">
                                    <PostActionBar comment_count={_post.comment_count}
                                                   post_index = {_postIndex}
                                                   onLikeClick = {this.onLikeClick.bind(this)}
                                                   onShareClick = {event=>this.onShareClick()}
                                                   onCommentClick = {event=>this.onCommentClick()}
                                                   OnLikeHover = {event=>this.loadLikedUsers()}
                                                   is_i_liked = {_is_i_liked}
                                                   liked_users = {this.state.liked_users}
                                                   show_share_button ={true}/>


                                {/*
                                    (typeof this.state.liked_users != 'undefined' &&  this.state.liked_users.length > 0)?
                                        <LikeSummery
                                            visibility={true}
                                            likes ={this.state.liked_users}/>
                                        :null
                                */}

                                {
                                    (this.state.showCommentPane) ?
                                        <div className="comment-inner-wrapper">
                                            <CommentElement
                                            visibility = {this.state.showCommentPane}
                                            postId = {_post.post_id}
                                            postItem = {_post}
                                            comments = {this.state.comments}
                                            onCommentAddSuccess = {this.onCommentAddSuccess.bind(this)}
                                            onCommentDeleteSuccess = {this.onCommentDeleteSuccess.bind(this)}/>
                                        </div>
                                        : ""
                                }
                                </div>
                            </div>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    openLightbox (index, event) {
        event.preventDefault();
        this.setState({
            currentImage: index,
            isShowingImgModal: true,
        });
    }

    addtoImgList(data){
        this.imgList = data;
    }

    render(){
        if(typeof  this.state.postItem == 'undefined'){
            return(<div />);
        }
        let _this = this;
        const _post = this.state.postItem;
        if(_post.post_mode != "SP"){
            this.imgList = [];
        }
        let img_div_class = "image-col-wrapper pg-newsfeed-post-upload-image",
            wallPostCls = (_post.created_by.user_id != _post.post_owned_by.user_id) ? "pg-timeline-white-box wall-post posted-on" : "pg-timeline-white-box wall-post";
        if(_post.post_mode == "PP"){//profile update post
            img_div_class += " profile-update";
        }

        const _postIndex = this.state.postIndex;
        const _is_i_liked = _post.is_i_liked;

        let _profile = _post.created_by;
        let postImgLength = _post.upload.length;
        let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
            _profile.images.profile_image.http_url:"";

        let loggedUserProPic = (this.loggedUser.profile_image)? this.loggedUser.profile_image : "/images/default-profile-image.png";

        var uploaded_files = _post.upload.map((upload,key)=>{
            let _url = "";
            if(upload.file_type == "mp4"){
                _url = upload.thumb_http_url;
            } else{
                _url = upload.http_url
            }
            _this.imgList.push(_url);
            if(key <= 2){
                return (
                    <div className={img_div_class} key={key}>

                        {(key == 2 && postImgLength > 3) ?
                            <img src = {_url} className="img-responsive post-img" />
                        :
                            <a className="post-img-container"
                                href={_url}
                                key={key}
                                onClick={(e) => this.openLightbox(key, e)}>
                                <span className="img-helper"></span>
                                <img src = {_url} className="img-responsive post-img" />
                            </a>
                        }
                        {(upload.file_type == "mp4") ?
                            <i className="fa fa-play-circle-o post-video-play" aria-hidden="true" onClick = {(event)=>{this.onVideoPlay(upload)}}></i>
                        :null }
                        {(key == 2 && postImgLength > 3) ?
                            <a className="post-img-container"
                                href={_url}
                                key={key}
                                onClick={(e) => this.openLightbox(key, e)}>
                                <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 3)}</p></div>
                            </a>
                        : null }
                    </div>
                )
            } else {
                return(
                    <a className="post-img-container"
                        href={_url}
                        key={key}
                        onClick={(e) => this.openLightbox(key, e)}>
                    </a>
                )
            }
        });
        return (
            <div className={wallPostCls} id={_post.post_id}>
                {this.loggedUser.id == _profile.user_id?<i className="fa fa-times pg-status-delete-icon" onClick={(event)=>{this.loadDeletePostPopup(_post,_postIndex)}}/>:null}
                <div className="pg-newsfeed-section-common-content-post-info">
                    <div className="post-header">
                        <div className="user-title-wrapper">
                            <div className="user-image-holder">
                                <PostProfilePic post={_post}
                                                profile={_profile}
                                                onLoadProfile = {this.props.onLoadProfile}/>
                            </div>
                            <div className="user-name-container">
                                <PostOwner
                                    post={_post}
                                    profile={_profile}
                                    onLoadProfile = {this.props.onLoadProfile}
                                    loggedUser={this.loggedUser}/>

                                <PostTitlePrefix
                                    post={_post}
                                    loggedUser={this.loggedUser}
                                    onLoadProfile = {this.props.onLoadProfile}/>

                                <span className="posted-time">{_post.date.time_a_go}</span>
                            </div>
                        </div>

                        {
                            (_post.created_by.user_id != _post.post_owned_by.user_id) ?
                                <div>
                                    <span className="posted-on"></span>
                                    <div className="user-title-wrapper">
                                        <div className="user-image-holder">
                                            <img src={_post.created_by.images.profile_image.http_url} className="img-responsive img-circle"/>
                                        </div>
                                        <div className="user-name-container">
                                            <span className="name" onClick={()=>onLoadProfile(_post.created_by.user_name)}>
                                                {" " + _post.created_by.first_name + " " + _post.created_by.last_name}
                                            </span>
                                        </div>
                                    </div>
                                </div> : null
                        }

                        <LocationPostTitle post={_post}
                                            loggedUser={this.loggedUser}/>
                        <span className="post-options"></span>
                    </div>

                    <div className="pg-newsfeed-common-content-post-content post-body">
                        <PostContentBody post={_post}
                                            loggedUser={this.loggedUser}/>

                    </div>

                    <div id="image_display" className="image-container">
                        <div className="row">
                            {uploaded_files}
                        </div>
                    </div>

                    <SharedPostBody post={_post}
                                    loggedUser={this.loggedUser}
                                    onLoadProfile = {this.props.onLoadProfile}
                                    imgList = {this.addtoImgList.bind(this)}
                                    openLightbox = {this.openLightbox.bind(this)} />

                    <div className="post-footer">
                        <PostActionBar comment_count={_post.comment_count}
                                        post_index = {_postIndex}
                                        onLikeClick = {this.onLikeClick.bind(this)}
                                        onShareClick = {event=>this.onShareClick()}
                                        onCommentClick = {event=>this.onCommentClick()}
                                        OnLikeHover = {event=>this.loadLikedUsers()}
                                        is_i_liked = {_is_i_liked}
                                        liked_users = {this.state.liked_users}
                                        share_count ={_post.share_count}
                                        show_share_button ={true}
                                        userProPic = {loggedUserProPic}
                        />

                        {
                            /*(typeof this.state.liked_users != 'undefined' &&  this.state.liked_users.length > 0)?
                                <LikeSummery
                                    visibility={true}
                                    likes ={this.state.liked_users}/>
                                :null*/
                        }

                        {
                            (this.state.showCommentPane) ? <CommentElement
                                visibility = {this.state.showCommentPane}
                                postId = {_post.post_id}
                                postItem = {_post}
                                comments = {this.state.comments}
                                onCommentAddSuccess = {this.onCommentAddSuccess.bind(this)}
                                onCommentDeleteSuccess = {this.onCommentDeleteSuccess.bind(this)}/>
                            : ""
                        }
                    </div>

                    {this.getPopup()}
                    {this.getVideoPopup()}
                    {this.getImgPopup()}
                    {this.getPopupRemovePost()}
                </div>
            </div>
        );
    }
}



/**
 * Post Action bar
 * @param onLike
 * @param onShare
 * @param onComment
 * @constructor
 */
const PostActionBar =({comment_count,post_index,onLikeClick,onShareClick,onCommentClick,liked_users,is_i_liked,show_share_button,userProPic,share_count})=>{
    let __opt ={};
    if(is_i_liked){
        __opt['style'] = {color:"#61b3de", "pointerEvents": "none",cursor: "default"}
    }
    let shareActiveClass = (share_count > 0)? "action-event share active" : "action-event share";
    let commentActiveClass = (comment_count > 0)? "action-event comment active" : "action-event comment";
    let logged_user = Session.getSession('prg_lg');
    let proImg = (logged_user.profile_image != '')? logged_user.profile_image : "/images/default-profile-image.png";
    return (
        <div>
            <div className="display-container clearfix">
                <div className="pull-left">
                    <div className="action-event like active">
                        {
                            (liked_users)?
                                (liked_users.length > 0)?
                                <span className="icon"></span>
                                : null
                            : null
                        }
                        {
                            (liked_users)?
                                (liked_users.length == 1)?
                                    <span>
                                        <span className="img-container">
                                            <span className="user-image">
                                                <img src={(liked_users[0].profile_image == "you")? proImg : liked_users[0].profile_image} className="img-responsive img-circle" />
                                            </span>
                                        </span>
                                        <span className="text">{liked_users[0].name.split(" ")[0]}</span>
                                    </span>
                                :
                                    null
                            :null
                        }
                        {
                            (liked_users)?
                            (liked_users.length == 2)?
                                <span>
                                    <span className="img-container">
                                        <span className="user-image">
                                            <img src={(liked_users[0].profile_image == "you")? proImg : liked_users[0].profile_image} className="img-responsive img-circle" />
                                        </span>
                                        <span className="user-image">
                                            <img src={(liked_users[1].profile_image == "you")? proImg : liked_users[1].profile_image} className="img-responsive img-circle" />
                                        </span>
                                    </span>
                                    <span className="text">{liked_users[0].name.split(" ")[0] + " and " + liked_users[1].name.split(" ")[0]}</span>
                                </span>
                            :
                                null
                            :null
                        }
                        {
                            (liked_users)?
                                (liked_users.length == 3)?
                                    <span>
                                        <span className="img-container">
                                            <span className="user-image">
                                                <img src={(liked_users[0].profile_image == "you")? proImg : liked_users[0].profile_image} className="img-responsive img-circle" />
                                            </span>
                                            <span className="user-image">
                                                <img src={(liked_users[1].profile_image == "you")? proImg : liked_users[1].profile_image} className="img-responsive img-circle" />
                                            </span>
                                            <span className="user-image">
                                                <img src={(liked_users[2].profile_image == "you")? proImg : liked_users[2].profile_image} className="img-responsive img-circle" />
                                            </span>
                                        </span>
                                        <span className="text">{liked_users[0].name.split(" ")[0] + ", " + liked_users[1].name.split(" ")[0] + " and " + liked_users[2].name.split(" ")[0]}</span>
                                    </span>
                                :
                                    null
                            :null
                        }
                        {
                            (liked_users)?
                                (liked_users.length > 3)?
                                    <span>
                                        <span className="img-container">
                                            <span className="user-image">
                                                <img src={(liked_users[0].profile_image == "you")? proImg : liked_users[0].profile_image} className="img-responsive img-circle" />
                                            </span>
                                            <span className="user-image">
                                                <img src={(liked_users[1].profile_image == "you")? proImg : liked_users[1].profile_image} className="img-responsive img-circle" />
                                            </span>
                                            <span className="user-image">
                                                <img src={(liked_users[2].profile_image == "you")? proImg : liked_users[2].profile_image} className="img-responsive img-circle" />
                                            </span>
                                        </span>
                                        <span className="text">{liked_users[0].name.split(" ")[0] + ", " + liked_users[1].name.split(" ")[0] + ", " + liked_users[2].name.split(" ")[0] + " and " + (liked_users.length - 3) + " other's"}</span>
                                    </span>
                                :
                                    null
                            :null
                        }
                    </div>
                </div>
                <div className="pull-right">
                    <div className={commentActiveClass} onClick ={(event)=>{onCommentClick(event)}}>
                        <span className="icon"></span>
                        <span className="text">{comment_count}</span>
                    </div>
                    <div className={shareActiveClass}>
                        <span className="icon"></span>
                        <span className="text">{share_count}</span>
                    </div>
                </div>
            </div>
            <div className="actions-container clearfix">
                <div className="action-event like" onClick ={(event)=>{onLikeClick(post_index)}}>
                    <span className="icon"></span> <span className="text">Like</span>
                </div>
                <div className="action-event comment" onClick ={(event)=>{onCommentClick(event)}}>
                    <span className="icon"></span> <span className="text">Comment</span>
                </div>
                {
                    (show_share_button)?
                    <div className="action-event share" onClick ={(event)=>{onShareClick(event)}}>
                        <span className="icon"></span> <span className="text">Share</span>
                    </div>
                    : null
                }
            </div>
        </div>
    );
};

/**
 * Display Like Sumery
 * @param likes
 * @returns {XML}
 * @constructor
 */
const LikeSummery=({likes,visibility}) =>{
    let opt={
        style:{display:"none"}
    }
    if(visibility){
        opt['style'] ={display:"block"}
    }

    return (
        <div className="pg-newsfeed-common-content-like-status" {...opt}>
            <div className="comment-wrapper-section">
                <p className="pg-newsfeed-common-content-like-status-paragraph">
                    <a href="javascript:void(0)" className="pg-newsfeed-common-content-like-status-profile-links">{likes[0].name}</a>
                    {
                        (likes.length == 2)?
                            <a href="javascript:void(0)" className="pg-newsfeed-common-content-like-status-profile-links"> and  {likes[1].name}</a>
                            :(likes.length > 2)?
                                <a href="javascript:void(0)" className="pg-newsfeed-common-content-like-status-profile-links"> and {likes.length}</a>
                            :null

                    } like this...
                </p>
            </div>
        </div>
    )
};




const AddPostElementPopupText =({loggedUser,onContentAdd,onSubmitPost,btnEnabled})=>{

    let logged_user = Session.getSession('prg_lg');
    let proImg = (logged_user.profile_image != '')? logged_user.profile_image : "/images/default-profile-image.png";
    let full_name = logged_user.first_name + " " +logged_user.last_name;

    return (
        <div id="pg_content_1" className="row row_clr pg-newsfeed-post-content tab_info clearfix">
            <div className="pg-user-pro-pic">
                <img src={proImg} alt={full_name} className="img-responsive img-circle" />
            </div>

            <div className="editerHolder">
                <div id="input" contentEditable={true}
                     className="containable-div"
                     onInput={(event)=>{onContentAdd(event)}}></div>
            </div>
            {
                (btnEnabled)?
                    <a href="javascript:void(0)" onClick={(event)=>onSubmitPost(event)} className="pg-status-post-btn btn btn-default">share</a>
                    :<a href="javascript:void(0)"  className="pg-status-post-btn btn btn-default">share</a>
            }

        </div>
    )
};

const SharedPostTitle = ({loggedUser,post,onLoadProfile}) =>{

    if(post.post_mode == "SP"){
        return (
            (post.created_by.user_id == post.shared_post.created_by.user_id)?
                <span className="own-post-share">shared own post</span>
                :
                <span className="user-title-wrapper">
                    <span className="shared-text">shared</span>
                    <span className="user-name-container post-owner">
                        <span className="name" onClick={()=>onLoadProfile(post.shared_post.created_by.user_name)}>{" "+post.shared_post.created_by.first_name + " " + post.shared_post.created_by.last_name + "'s"}</span>
                        <span className="shared-text">post</span>
                    </span>
                </span>
        )
    }
    return (<span />);
};

const PostTitlePrefix = ({loggedUser,post, onLoadProfile}) =>{

    if(post.post_type == 2 && post.post_mode != "SP"){
        return (
            <span className="user-title-wrapper">
                <span className="shared-text">posted on</span>
                <span className="user-name-container post-owner">
                    <span className="name">{post.group.name}</span>
                </span>
            </span>
        )
    } else if(post.post_mode == "SP"){
        return (
            (post.created_by.user_id == post.shared_post.created_by.user_id)?
                <span className="own-post-share">shared own post</span>
            :
            <span className="user-title-wrapper">
                <span className="shared-text">shared</span>
                <span className="user-name-container post-owner">
                    <span className="name" onClick={()=>onLoadProfile(post.shared_post.created_by.user_name)}>{" "+post.shared_post.created_by.first_name + " " + post.shared_post.created_by.last_name + "'s"}</span>
                    <span className="shared-text">post</span>
                </span>
            </span>
        )
    }
    return (<span />);

};

const PostContentBody = ({loggedUser,post})=>{
    if(post.post_mode == "LE"){
        let lifeEvent = post.life_event.toLowerCase().replace(/ /g,"-");
        return (
            <div className="life-event-holder">
                <img src={"/images/life-events/" + lifeEvent + ".png"} alt={post.life_event} className="event-img"/>
                <p className="life-event-title">{post.life_event}</p>
            </div>
        )
    }
    return <p className="post-description">{post.content}</p>;

};

const PostOwner = ({post,profile,onLoadProfile,loggedUser}) => {
    if(post.post_owned_by != undefined){
        return (
            (post.created_by.user_id == post.post_owned_by.user_id)?
                <span className="name" onClick={()=>onLoadProfile(profile.user_name)} >{profile.first_name + " " + profile.last_name + " "}
                    <UpdatedProPic post={post} loggedUser={loggedUser}/>

                </span>
                :
                <span className="name" onClick={()=>onLoadProfile(post.post_owned_by.user_name)}>
                    {post.post_owned_by.first_name + " " + post.post_owned_by.last_name + " "}
                </span>
        );
    }else{
        return(
            <span className="name" onClick={()=>onLoadProfile(profile.user_name)}>{profile.first_name + " " + profile.last_name + " "} </span>
        );
    }

};

const PostProfilePic = ({post,profile,onLoadProfile}) => {
    if(post.post_owned_by != undefined){
        let _images = post.post_owned_by.images;
        let profileImg = _images.hasOwnProperty('profile_image') ? _images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : "/images/default-profile-pic.png" : "/images/default-profile-pic.png";
        profileImg = (profileImg != undefined && profileImg) ? profileImg : "/images/default-profile-pic.png";
        return (
            (post.created_by.user_id == post.post_owned_by.user_id)?
                <img onClick={()=>onLoadProfile(post.post_owned_by.user_name)} src={profileImg} alt={profile.first_name + " " + profile.last_name} className="img-responsive img-circle"/>
                :
                <img onClick={()=>onLoadProfile(post.post_owned_by.user_name)} src={profileImg} alt={post.post_owned_by.first_name + " " + post.post_owned_by.last_name} className="img-responsive img-circle"/>
        );
    }else{
        return(
            <img onClick={()=>onLoadProfile(post.created_by.user_name)} src={post.created_by.images.profile_image.http_url} alt={profile.first_name + " " + profile.last_name} className="img-responsive img-circle"/>
        );
    }

};

export const LocationPostTitle = ({loggedUser,post})=>{
    if(post.post_mode == "LP"){
        return (
            <span className="location_text">at - {post.location} </span>
        )
    }
    return (<span />);
}

export const UpdatedProPic = ({loggedUser,post})=>{
    if(post.post_mode == "PP"){
        return (
            <span className="own-post-share">has updated profile picture.</span>
        )
    }
    if(post.post_mode == "CP"){
        return (
            <span className="own-post-share">has updated cover picture.</span>
        )
    }
    return (<span />);
}


const SharedPostBody = ({loggedUser,post,onLoadProfile,imgList,openLightbox}) => {

    var _this = this,
        _imgList = [];
    if(post.post_mode != "SP"){
        return (<span />);
    }

    let sharedPost = post.shared_post;
    let _profile = sharedPost.created_by;
    let postImgLength = sharedPost.upload.length;
    let profile_image =  (typeof _profile.images.profile_image != 'undefined')?
        _profile.images.profile_image.http_url:"";

    let img_div_class = "image-col-wrapper pg-newsfeed-post-upload-image";
    if(post.post_mode == "PP"){//profile update post
        img_div_class += " profile-update";
    }

    const onImageClick = (key, e) => {
        openLightbox(key, e);
        imgList(_imgList);
    };

    let uploaded_files = sharedPost.upload.map((upload,key)=>{
        // if(key <= 3){
        //     return (
        //         <div className="pg-newsfeed-post-upload-image" key={key}>
        //             <img src = {upload.http_url}/>
        //             {
        //                 (key == 3 && postImgLength > 4)?
        //                     <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1">
        //                         <p>{"+" + (postImgLength - 4)}</p>
        //                     </div> :
        //                 null
        //             }
        //         </div>
        //     )
        // }

        let _url = "";
        if(upload.file_type == "mp4"){
            _url = upload.thumb_http_url;
        } else{
            _url = upload.http_url
        }
        _imgList.push(_url);

        if(key <= 2){
            return (
                <div className={img_div_class} key={key}>

                    {(key == 2 && postImgLength > 3) ?
                        <img src = {_url} className="img-responsive post-img" />
                    :
                        <a className="post-img-container"
                            href={_url}
                            key={key}
                            onClick={(e) => onImageClick(key, e)}>
                            <span className="img-helper"></span>
                            <img src = {_url} className="img-responsive post-img" />
                        </a>
                    }
                    {(upload.file_type == "mp4") ?
                        <i className="fa fa-play-circle-o post-video-play" aria-hidden="true" onClick = {(event)=>{_this.onVideoPlay(upload)}}></i>
                    :null }
                    {(key == 2 && postImgLength > 3) ?
                        <a className="post-img-container"
                            href={_url}
                            key={key}
                            onClick={(e) => onImageClick(key, e)}>
                            <div className="pg-post-img-hover pg-profile-img-hover pg-profile-img-hover-1"><p>{"+" + (postImgLength - 3)}</p></div>
                        </a>
                    : null }
                </div>
            )
        } else {
            return(
                <a className="post-img-container"
                    href={_url}
                    key={key}
                    onClick={(e) => onImageClick(key, e)}>
                </a>
            )
        }
    });

    return (
        <div className="inner-post">
            <div className="wall-post">
                <div className="post-header">
                    <div className="user-title-wrapper">
                        <div className="user-image-holder">
                            <img onClick={()=>onLoadProfile(_profile.user_name)} src={profile_image} alt={_profile.first_name + " " + _profile.last_name} className="img-responsive img-circle"/>
                        </div>
                        <div className="user-name-container">
                            <span className="name">{_profile.first_name + " " + _profile.last_name}</span>
                        </div>
                        {
                            (sharedPost.location)?
                                <LocationPostTitle post={sharedPost}
                                                   loggedUser={loggedUser}/>
                            :
                                null
                        }
                    </div>
                </div>
                <div className="post-body">
                    <PostContentBody post={sharedPost}
                                     loggedUser={loggedUser}/>
                    <div id="image_display" className="image-container">
                        <div className="row row_clr pg-newsfeed-post-uploads-images  clearfix">
                            {uploaded_files}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

};
