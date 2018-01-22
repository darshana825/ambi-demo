
import React from 'react';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Lib from '../../middleware/Lib';
import Socket  from '../../middleware/Socket';
import Scroll from 'react-scroll';

export default class SharePopup extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            sharedUsers:[],
            owner:{},
            seeAllSharedUsers:false,
            scrollProp: 'hidden',
            isShowingModal : false,
            userToRemove: null,
            sharedFilterValue: ''
        };

        this.sharedUsers = [];
        this.sharedUsersWithoutFilter = [];
        this.owner = {};
        this.loadSharedUsers();
        this.onPermissionChanged = this.onPermissionChanged.bind(this);
        this.onRemoveSharedUser = this.onRemoveSharedUser.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.allSharedUsers = this.allSharedUsers.bind(this);
        this.getPopupRemoveUser = this.getPopupRemoveUser.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleScroll() {
        if(this.state.seeAllSharedUsers){
            this.setState({scrollProp : 'scroll'});
        }else{
            this.setState({scrollProp : 'hidden'});
        }

    }

    allSharedUsers(){

        let seeAllSharedUsers = this.state.seeAllSharedUsers;

        this.setState({seeAllSharedUsers : !seeAllSharedUsers}, function (){
            this.handleScroll();
        });
    }

    loadSharedUsers() {
        $.ajax({
            url: '/folders/shared-users',
            method: "POST",
            dataType: "JSON",
            data:{folder_id:this.props.folderData.folder_id},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {
                this.sharedUsers = data.sharedWith;
                this.sharedUsersWithoutFilter = data.sharedWith;
                this.owner = data.owner;
                this.setState({sharedUsers:data.sharedWith, owner:this.owner});
            }
        }.bind(this));
    }

    getSuggestions(value, data) {
        console.log(data);
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return data;
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    filterSharedUsers(folder_id, event) {
        //console.log("filterSharedUsers")
        let value = event.target.value;//console.log(value)
        var data = this.getSuggestions(value, this.sharedUsersWithoutFilter);//console.log(data)
        this.setState({sharedUsers: data});
        this.setState({sharedFilterValue:value});
    }

    onPermissionChanged(e, user) {

        console.log("onPermissionChanged")
        console.log(user)

        let _fieldValue = e.target.value;console.log(_fieldValue)

        if(user.shared_type != _fieldValue) {
            $.ajax({
                url: '/folder/shared-permission/change',
                method: "POST",
                dataType: "JSON",
                data:{folder_id:user.folder_id, shared_type:_fieldValue, user_id:user.user_id},
                headers: { 'prg-auth-header':this.state.loggedUser.token }
            }).done(function (data, text) {
                if(data.status.code == 200) {
                    this.loadSharedUsers();
                }
            }.bind(this));
        }
    }

    onRemoveSharedUser() {
        let user = this.state.userToRemove;
        $.ajax({
            url: '/folder/shared-user/remove',
            method: "POST",
            dataType: "JSON",
            data:{folder_id:user.folder_id, user_id:user.user_id},
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200) {}
        }.bind(this));
    }

    handleClick(user) {
        console.log("handleClick")
        console.log(user)
        this.setState({
            isShowingModal: true,
            userToRemove: user
        });
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopupRemoveUser(){
        let user = this.state.userToRemove;
        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="402px" style={{marginTop : "-100px", padding : "0"}}>
                        <div className="popup-holder">
                            <div className="notification-alert-holder delete-alert">
                                <div className="model-header">
                                    <h3 className="modal-title">remove user message</h3>
                                </div>
                                <div className="model-body">
                                    <p className="alert-content">are you sure you want to remove the shared user?</p>
                                </div>
                                <div className="model-footer">
                                    <button className="btn cancel-btn">No</button>
                                    <button className="btn delete-btn" onClick={this.onRemoveSharedUser.bind(this)}>Yes</button>
                                </div>
                            </div>
                        </div>  
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    scrollToShareUserPopup(id){
        if(id == "lastFolder" || id == "oneBeforLastFolder"){
            Scroll.directScroller.scrollTo("popover-user-share", {
                duration: 800,
                smooth: true
            });
        }
    }

    render(){

        let _folderData = this.props.folderData;
        let ownerImg = (this.state.owner.profile_image == "")? "/images/default-profile-pic.png" : this.state.owner.profile_image;
        let ownerName = this.state.owner.first_name;

        let i = (
            <Popover id="popover-user-share" className="share-folder-popover share-folder-new" positionTop="150px" >
                <SharePopupNewUsr  folderData={_folderData}/>
            </Popover>
        );

        let _allUsers = this.state.sharedUsers.map(function(user,key) {
            let profileImg = (user.profile_image == "") ? "/images/default-profile-pic.png" : user.profile_image;
            let name = user.first_name;

            return (
                <div key={key} className="user-row">
                    {
                        (user.shared_status == 3) ?
                            <div className="shared-user" key={key}>
                                <img className="user-image img-circle" src={profileImg} alt={name}/>

                                <div className="name-wrapper">
                                    <p className="name">{user.first_name} {user.last_name}</p>
                                    {
                                        (typeof user.school != 'undefined') ?
                                            <p className="name-title">{user.school}</p>
                                            :
                                            <p className="name-title">{user.company_name}</p>
                                    }
                                </div>
                                {
                                    (_folderData.owned_by == 'me') ?
                                        <div className="share-opt-holder clearfix">
                                            <div className="shared-privacy">
                                                <select className="privacy-selector"
                                                        onChange={(event)=>this.onPermissionChanged(event,user)}
                                                        value={user.shared_type}>
                                                    <option value="1">View Only</option>
                                                    <option value="2">View/Upload</option>
                                                </select>
                                            </div>
                                            <div className="action" onClick={(event)=>this.handleClick(user)}>
                                                <span className="remove-people"></span>
                                            </div>
                                        </div>
                                        :
                                        <div className="share-opt-holder clearfix">
                                            <div className="shared-privacy">
                                                <p className="request-pending">{(user.shared_type == "1") ? "Read Only" : "Read/Write"}</p>
                                            </div>
                                        </div>
                                }
                            </div> :
                            <div className="shared-user" key={key}>
                                <img className="user-image img-circle" src={profileImg} alt={name}/>

                                <div className="name-wrapper">
                                    <p className="name">{user.first_name} {user.last_name}</p>
                                    {
                                        (typeof user.school != 'undefined') ?
                                            <p className="name-title">{user.school}</p>
                                            :
                                            <p className="name-title">{user.company_name}</p>
                                    }
                                </div>
                                <div className="share-opt-holder clearfix">
                                    <div className="shared-privacy">
                                        <p className="request-pending">Request Pending</p>
                                    </div>
                                    {
                                        (_folderData.owned_by == 'me') ?
                                    <div className="action" onClick={()=>this.handleClick(user)}>
                                        <span className="remove-people"></span>
                                    </div> : null
                                    }
                                </div>
                            </div>
                    }
                </div>
            )
        }.bind(this));

        return(
            <div className="popup-holder">
                <section className="share-folder">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="header-wrapper">
                                    <h3 className="popup-title">people in this folder</h3>
                                    <input className="form-control search-people" type="text" placeholder="search" onChange={(event)=>this.filterSharedUsers(_folderData.folder_id, event)}/>
                                    <span className="search-ico"></span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        <div className="shared-user-wrapper">
                            <div className="shared-user">
                                <img className="user-image img-circle" src={ownerImg} alt={ownerName}/>
                                <div className="name-wrapper">
                                    <p className="name">{this.state.owner.first_name} {this.state.owner.last_name}</p>
                                    {
                                        (typeof this.state.owner.school != 'undefined') ?
                                            <p className="name-title">{this.state.owner.school}</p>
                                            :
                                            <p className="name-title">{this.state.owner.company_name}</p>
                                    }
                                </div>
                                <div className="shared-privacy">
                                    <p className="owner">(Owner)</p>
                                </div>
                            </div>
                            <div className="shared-users-container" style={{overflowY: this.state.scrollProp, border: "none", boxShadow: "none", maxHeight: "134px"}}>
                                {_allUsers}
                            </div>
                        </div>
                    </section>
                    {
                        (_folderData.owned_by == 'me' || this.state.sharedUsers.length > 2) ?
                            <section className="folder-footer">
                                <div className="footer-action-wrapper">
                                    {
                                        (_folderData.owned_by == 'me') ?
                                            <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i} onEntered={(e) => this.scrollToShareUserPopup(this.props.fldrId)}>
                                                <p className={(this.state.sharedUsers.length > 2) ? "add-people" : "add-people c"}>+ Add member</p>
                                            </OverlayTrigger> : null
                                    }
                                    {
                                        (this.state.sharedUsers.length > 2) ?
                                            <p className={(_folderData.owned_by == 'me') ? "see-all" : "see-all c"} onClick={this.allSharedUsers.bind(this)}>{(this.state.seeAllSharedUsers) ?
                                                "See Less" : "See All"}</p> : null
                                    }
                                </div>
                                {this.getPopupRemoveUser()}
                            </section> : null
                    }
                </section>
            </div>

        )
    }
}

export class SharePopupNewUsr extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            value: '',
            suggestions: [],
            addNewUserValue: '',
            isShowingModal: false,
            userToAdd: null
        };

        this.loadNewUsers = this.loadNewUsers.bind(this);
        this.shareFolder = this.shareFolder.bind(this);
        this._handleAddNewUser = this._handleAddNewUser.bind(this);
        this.getPopupAddUser = this.getPopupAddUser.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    _handleAddNewUser (e){
        if (e.target.value == "") {
            this.setState({suggestions: []});
        }else{
            this.setState({
                addNewUserValue: e.target.value
            },function (){
                this.loadNewUsers();
            });
        }
    }

    loadNewUsers() {
        let folder = this.props.folderData;
        let value = this.state.addNewUserValue;

        $.ajax({
            url: '/get-folder-users/'+folder.folder_id+'/'+value,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                if(data.status.code == 200){
                    //console.log(data.users)
                    this.setState({
                        suggestions: data.users
                    });
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });

    }

    shareFolder(user){

        let loggedUser = Session.getSession('prg_lg');
        let folder = this.props.folderData;
        let _folder = {
            folderId:folder.folder_id,
            userId:user.user_id
        };
        let sharedWithUsernames = [user.user_name];

        $.ajax({
            url: '/folders/share-folder',
            method: "POST",
            dataType: "JSON",
            data:_folder,
            headers: { 'prg-auth-header':loggedUser.token }
        }).done( function (data, text) {
            if(data.status.code == 200){

                let _notificationData = {
                    folder_id:data.folder_id,
                    notification_type:"share_folder",
                    notification_sender:loggedUser,
                    notification_receivers:sharedWithUsernames
                };

                Socket.sendFolderNotification(_notificationData);

                this.setState({
                    userToAdd: user,
                    isShowingModal: true
                }, function(){
                    this.getPopupAddUser();
                });
            }
        }.bind(this));

    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopupAddUser(){
        let user = this.state.userToAdd;
        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                    <ModalDialog onClose={this.handleClose.bind(this)} width="35%" style={{marginTop: "-100px"}}>
                        <div className="col-xs-12 shared-user-r-popup">
                            <p>{this.state.notebook} shared invitation sent to {user.first_name} {user.last_name} successfully...</p>
                            <button className="btn btn-popup">Ok</button>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        )
    }

    render() {

        const { value, suggestions } = this.state;
        let _this = this;
        console.log(suggestions);

        let _newUserList = suggestions.map(function(suggestion,key){

            let _images = suggestion.images;

            let profileImg = (_images.hasOwnProperty('profile_image') && _images.profile_image != 'undefined') ?
                (_images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : _images.profile_image.http_url
                : "/images/default-profile-pic.png";
            let name = suggestion.first_name;

            return(
                <div className="suggestion" key={key}>
                    <img className="user-image img-circle" src={profileImg} alt={name}/>

                    <div className="name-wrapper">
                        <p className="name">{suggestion.first_name} {suggestion.last_name}</p>
                    </div>
                    <div className="action" onClick={()=>_this.shareFolder(suggestion)}>
                        <span className="add-people"></span>
                    </div>
                </div>
            )

        });

        return (
            <div className="popup-holder" >
                <section className="share-folder-add-people-popup">
                    <div className="input-wrapper">
                        <span className="input-ico"></span>
                        <input type="text" className="form-control" placeholder="type name" onChange={this._handleAddNewUser}/>
                    </div>
                    <div className="suggestions-wrapper">
                        {_newUserList}
                    </div>
                    {this.getPopupAddUser()}
                </section>
            </div>
        )

    }

}