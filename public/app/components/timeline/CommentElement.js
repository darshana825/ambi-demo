/**
 * This is Comment element that Handle Comment related front-end operations
 */
import React from 'react';
import Session from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import Lib    from '../../middleware/Lib'
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class CommentElement extends React.Component{
    constructor(props){
        super(props);
        this.state={
            postId:this.props.postId,
            loggedUser : Session.getSession('prg_lg'),
            showRemoveCommentPopup: false,
            deletedComment: '',
            comments: this.props.comments,
            postItem: this.props.postItem
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({comments: nextProps.comments, postItem:nextProps.postItem});
    }

    onCommentAdd(comment){
        if(comment.text != "" || comment.imgComment != null){
            let commentData ={
                __post_id:this.props.postId,
                __content:comment.text,
                __img:comment.imgComment
            }
            $.ajax({
                url: '/comment/composer',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data:commentData,
                success: function (data, text) {
                    if (data.status.code == 200) {

                        let _subscribeData = {
                            post_id:data.comment.post_id,
                            isOwnPost:false
                        };
                        Socket.subscribe(_subscribeData);

                        let _notificationData = {
                            post_id:data.comment.post_id,
                            notification_type:"comment",
                            notification_sender:this.state.loggedUser
                        };
                        Socket.sendNotification(_notificationData);

                        this.setState({text:""});
                        this.setState({imgComment:""});
                        document.getElementById('comment_input').innerHTML = "";
                        this.props.onCommentAddSuccess(this.state.postId);
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(status);x
                    console.log(error);
                }
            });
        }
    }

    onCommentDelete(){
        this.handleClose();
        $.ajax({
            url: '/comment/delete',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{data:JSON.stringify(this.state.deletedComment)},
            success: function (data, text) {
                if (data.status.code == 200) {
                    //console.log(data);
                    if(data.unsubscribe){
                        let _unsubscribeData = {
                            post_id:this.state.postId
                        };
                        Socket.unsubscribe(_unsubscribeData);
                    }
                    this.props.onCommentDeleteSuccess(this.state.postId);

                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }
        });
    }

    enableCommentDelete(_unformattedComment) {
        this.setState({deletedComment: _unformattedComment, showRemoveCommentPopup: true})
    }

    handleClose() {
        this.setState({deletedComment: '', showRemoveCommentPopup: false});
    }

    getPopupRemovePost(){
        return(
            <div>
                {this.state.showRemoveCommentPopup &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="402px" style={{marginTop : "-100px", padding : "0"}}>
                        <div className="popup-holder">
                            <div className="notification-alert-holder delete-alert">
                                <div className="model-header">
                                    <h3 className="modal-title">delete message</h3>
                                </div>
                                <div className="model-body">
                                    <p className="alert-content">are you sure you want to delete this comment?</p>
                                </div>
                                <div className="model-footer">
                                    <button className="btn cancel-btn" onClick={this.handleClose.bind(this)}>cancel</button>
                                    <button className="btn delete-btn" onClick={this.onCommentDelete.bind(this)}>delete</button>
                                </div>
                            </div>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render(){

        let opt={
            style:{display:"none"}
        }
        if(this.props.visibility){
            opt['style'] ={display:"block"}
        }

        if(typeof this.state.comments == 'undefined'){
            return (<div> Loading..... </div>);
        }

        let _this = this;
        const comments = this.state.postItem.post_comments.formattedResult.map((comment,key)=>{
            let unformattedComment = _this.state.postItem.post_comments.unformattedResult[key];
            return (<CommentItem comment={comment} key={key} unformattedComment={unformattedComment} loggedUser={_this.state.loggedUser} onCommentDelete = {_this.enableCommentDelete.bind(this)}/>)
        });

        return (
            <div className="comments-container clearfix" {...opt}>
                <div className="comments-list">
                    {comments}
                </div>
                <PostCommentAction
                    onCommentAdd = {this.onCommentAdd.bind(this)}
                    loggedUser = {this.state.loggedUser}/>
                {this.getPopupRemovePost()}
            </div>

        );
    }
}


/**
 * Singel comment item
 * @param comment
 * @returns {XML}
 * @constructor
 */
const CommentItem =({comment,unformattedComment,loggedUser,onCommentDelete}) =>{

    let _loggedUser = loggedUser;
    let _profile = comment.commented_by;
    let _profile_image = (typeof _profile.images.profile_image != 'undefined')?_profile.images.profile_image.http_url:"";
    let commented_by = _profile.first_name +" "+ _profile.last_name;
    return(
        <div className="comment">
            {_loggedUser.id == _profile.user_id?<i className="fa fa-times pg-comment-delete-icon" onClick={(event)=>{onCommentDelete(unformattedComment)}}/>:null}
                <div className="user-title-wrapper">
                    <div className="user-image-holder">
                        <img src={_profile_image} alt={commented_by} className="img-responsive img-circle"/>
                    </div>
                    <div className="user-name-container">
                        <span className="name">{commented_by}</span>
                        <span className="posted-time">{comment.date.time_a_go}</span>
                    </div>
                </div>
                <div className="comment-inner-wrapper">
                    <p className="comment-text">{comment.comment}</p>
                    {
                        (comment.attachment.length >= 1)?
                            <div className="pg-newsfeed-post-upload-image">
                                <img src = {comment.attachment.http_url}/>
                            </div>
                            :
                            null
                    }
                    <div className="controls">
                        <span className="control like">Like</span>
                        <span className="control reply">Reply</span>
                    </div>
                </div>
            </div>
    );
}




export class  PostCommentAction extends React.Component{
    constructor(props){
        super(props)
        this.state={
            text:"",
            imgComment: null
        };
        this.selectImage = this.selectImage.bind(this);
    }
    onContentAdd(event){
        let _text  = Lib.sanitize(event.target.innerHTML)
        this.setState({text:_text});

    }
    onCommentEnter(event){

        this.props.onCommentAdd(this.state);
        this.setState({text:""});
        this.setState({imgComment:null});
    }

    selectImage(e){
        let files = e.target.files,
            imageType = new RegExp("image");

        if(files[0].size > 2097152){
            alert("File you selected is too large.");
        }else if(!imageType.test(files[0].type)){
            alert("You can only attach an image as a comment");
        }else{
            let reader = new FileReader();
            reader.onload = () => {
                this.setState({imgComment: reader.result});
            };
            reader.readAsDataURL(files[0]);
            e.target.value = '';
        }
    }

    removeImage(){
        this.setState({imgComment: null});
    }

    render(){
        let logged_user = Session.getSession('prg_lg');
        let profile_image = (logged_user.profile_image != '')? logged_user.profile_image : "/images/default-profile-image.png";
        return(
            <div className="input-comment">
                <div className="user-image-holder">
                    <img src={profile_image} alt={logged_user.first_name +" "+ logged_user.last_name} className="img-responsive img-circle"/>
                </div>
                <div className="input-wrapper input-content">
                    <div id="comment_input" contentEditable={true}
                        className="form-control input-comment"
                        onInput={this.onContentAdd.bind(this)}
                        placeholder="write a comment...">
                    </div>
                    <label htmlFor="cmntImgUpload" className="img-comment">
                        <i className="fa fa-camera"></i>
                    </label>
                    <input type='file' id="cmntImgUpload" onChange={(event)=>{this.selectImage(event)}} />
                    {
                        (this.state.imgComment)?
                            <div className="comment-img-holder">
                                <img src={this.state.imgComment} className="img-responsive" />
                                <i className="fa fa-times close-icon" onClick={this.removeImage.bind(this)}></i>
                            </div>
                        :
                        null
                    }
                    <span className="emoji"></span>
                    <div className="pg-newsfeed-new-comment-icon-wrapper">
                        <a href="javascript:void(0)"
                           onClick={this.onCommentEnter.bind(this)}
                           className="pg-status-post-btn">Add</a>
                    </div>
                </div>
            </div>
        )
    }

}
