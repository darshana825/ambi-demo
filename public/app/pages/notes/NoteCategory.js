// // THIS FILE IS ONLY HERE FOR REFERENCE
// import React from 'react';
// import ReactDom from 'react-dom';
// import {ModalContainer, ModalDialog} from 'react-modal-dialog';
// import Session from '../../middleware/Session';
// import {Alert} from '../../config/Alert';
// import { Scrollbars } from 'react-custom-scrollbars';
// import Lib    from '../../middleware/Lib';
// import RichTextEditor from '../../components/elements/RichTextEditor';
// import { Popover, OverlayTrigger } from 'react-bootstrap';
// import Socket  from '../../middleware/Socket';
// import Scroll from 'react-scroll';
//
// export default class NoteCategory extends React.Component{
//     constructor(props) {
//         super(props);
//
//         this.handleClick = e => {
//             console.log(e.target);
//             this.setState({ target: e.target, show: !this.state.show });
//         };
//
//         this.state = {
//             show: false ,
//             sharedStatus: false,
//             seeAllSharedUsers: false
//         };
//
//         this.userAdded = this.userAdded.bind(this);
//
//     }
//
//     userAdded(){
//         this.setState({
//             sharedStatus: true
//         });
//     }
//
//     render() {
//         let _this = this;
//         let notebooks = this.props.notebooks;
//         let showConfirm = this.props.showConfirm;
//         let showNotePopup = this.props.showNotePopup;
//         if (notebooks.length <= 0) {
//             return <div />
//         }
//         let i, x = 0;
//         let notebkId;
//
//         let _noteBooks = notebooks.map(function(notebook,key){
//             ++x;
//             if(x == notebooks.length){
//                 notebkId = "lastNoteBK";
//             }else if(x == notebooks.length - 1){
//                 notebkId = "oneBeforLastNoteBK";
//             }else{
//                 notebkId = x;
//             }
//             return (
//                 <NoteList key={notebook.notebook_id} notebook={notebook} showConfirm={showConfirm} showNotePopup={showNotePopup} notebkId={notebkId}/>
//             );
//         });
//
//         return (
//             <div>
//                 {_noteBooks}
//             </div>
//         );
//
//     }
// }
//
// export class SharePopup extends React.Component{
//     constructor(props) {
//         super(props);
//         this.state={
//             loggedUser:Session.getSession('prg_lg'),
//             sharedUsers:[],
//             seeAllSharedUsers:false,
//             scrollProp: 'hidden',
//             isShowingModal : false,
//             userToRemove: null
//         }
//         this.sharedUsers = [];
//         this.loadSharedUsers();
//         this.onPermissionChanged = this.onPermissionChanged.bind(this);
//         this.onRemoveSharedUser = this.onRemoveSharedUser.bind(this);
//         this.handleScroll = this.handleScroll.bind(this);
//         this.allSharedUsers = this.allSharedUsers.bind(this);
//         this.getPopupRemoveUser = this.getPopupRemoveUser.bind(this);
//         this.handleClick = this.handleClick.bind(this);
//         this.handleClose = this.handleClose.bind(this);
//     }
//
//     handleScroll() {
//         if(this.state.seeAllSharedUsers){
//             this.setState({scrollProp : 'scroll'});
//         }else{
//             this.setState({scrollProp : 'hidden'});
//         }
//
//     }
//
//     allSharedUsers(){
//
//         let seeAllSharedUsers = this.state.seeAllSharedUsers;
//
//         this.setState({seeAllSharedUsers : !seeAllSharedUsers}, function (){
//             this.handleScroll();
//         });
//     }
//
//     loadSharedUsers() {
//         $.ajax({
//             url: '/notebook/shared-users',
//             method: "POST",
//             dataType: "JSON",
//             data:{notebook_id:this.props.notebook.notebook_id},
//             headers: { 'prg-auth-header':this.state.loggedUser.token }
//         }).done( function (data, text) {
//             if(data.status.code == 200) {
//                 this.sharedUsers = data.results;
//                 this.setState({sharedUsers:data.results});
//             }
//         }.bind(this));
//
//
//     }
//
//     filterSharedUsers(notebook_id, event) {
//
//         let value = event.target.value;
//
//         if(value.length >= 1){
//             $.ajax({
//                 url: '/filter-shared-users/'+notebook_id+'/'+value,
//                 method: "GET",
//                 dataType: "JSON",
//                 success: function (data, text) {
//                     if(data.status.code == 200){
//                         this.setState({
//                             sharedUsers: data.users
//                         });
//                     }
//                 }.bind(this),
//                 error: function (request, status, error) {
//                     console.log(request.responseText);
//                     console.log(status);
//                     console.log(error);
//                 }.bind(this)
//             });
//         }else{
//             this.loadSharedUsers();
//         }
//     }
//
//     onPermissionChanged(e, user) {
//
//         let _fieldValue = e.target.value;
//
//         if(user.shared_type != _fieldValue) {
//             $.ajax({
//                 url: '/notebook/shared-permission/change',
//                 method: "POST",
//                 dataType: "JSON",
//                 data:{notebook_id:user.notebook_id, shared_type:_fieldValue, user_id:user.user_id},
//                 headers: { 'prg-auth-header':this.state.loggedUser.token }
//             }).done(function (data, text) {
//                 if(data.status.code == 200) {
//                     console.log("done updating permissions -----");
//                     this.loadSharedUsers();
//                 }
//             }.bind(this));
//         }
//     }
//
//     onRemoveSharedUser() {
//         let user = this.state.userToRemove;
//         $.ajax({
//             url: '/notebook/shared-user/remove',
//             method: "POST",
//             dataType: "JSON",
//             data:{notebook_id:user.notebook_id, user_id:user.user_id},
//             headers: { 'prg-auth-header':this.state.loggedUser.token }
//         }).done( function (data, text) {
//             if(data.status.code == 200) {
//                 console.log("done removing shared user -----");
//                 if(data.update_status) {
//                     this.props.onLoadNotes();
//                     this.loadSharedUsers();
//                 }
//             }
//         }.bind(this));
//     }
//
//     handleClick(user) {
//         this.setState({
//             isShowingModal: true,
//             userToRemove: user
//         });
//     }
//
//     handleClose() {
//         this.setState({isShowingModal: false});
//     }
//
//     getPopupRemoveUser(){
//         let user = this.state.userToRemove;
//         return(
//             <div>
//                 {this.state.isShowingModal &&
//                 <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
//                     <ModalDialog onClose={this.handleClose.bind(this)} width="402px" style={{marginTop : "-100px", padding : "0"}}>
//                         <div className="popup-holder">
//                             <div className="notification-alert-holder delete-alert">
//                                 <div className="model-header">
//                                     <h3 className="modal-title">delete message</h3>
//                                 </div>
//                                 <div className="model-body">
//                                     <p className="alert-content">are you sure you want to remove the shared user?</p>
//                                 </div>
//                                 <div className="model-footer">
//                                     <button className="btn cancel-btn">No</button>
//                                     <button className="btn delete-btn" onClick={this.onRemoveSharedUser.bind(this)}>Yes</button>
//                                 </div>
//                             </div>
//                         </div>
//
//                     </ModalDialog>
//                 </ModalContainer>
//                 }
//             </div>
//         )
//     }
//
//     scrollToSharePopup(id){
//         if(id == "lastNoteBK" || id == "oneBeforLastNoteBK"){
//             Scroll.directScroller.scrollTo("popover-contained", {
//                 duration: 800,
//                 smooth: true
//             });
//         }
//     }
//
//     render(){
//
//         let _notebook = this.props.notebook;
//         let i = (
//             <Popover id="popover-contained"  positionTop="150px" className="share-notebook-new">
//                 <SharePopupNewUsr notebook={_notebook} onShareuser={this.props.onUserAdd} onLoadNotes={this.props.onLoadNotes} />
//             </Popover>
//         );
//
//         let profileImg = (_notebook.owned_by == "me") ?
//             (this.state.loggedUser.hasOwnProperty('profile_image') && this.state.loggedUser.profile_image != 'undefined') ?
//                 (this.state.loggedUser.profile_image == "") ? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image
//                 : "/images/default-profile-pic.png"
//             :
//             (_notebook.notebook_user.hasOwnProperty('profile_image') && _notebook.notebook_user.profile_image != 'undefined') ?
//                 (_notebook.notebook_user.profile_image == "") ? "/images/default-profile-pic.png" : _notebook.notebook_user.profile_image
//                 : "/images/default-profile-pic.png";
//
//         return(
//
//             <section className="share-notebook-popup">
//                 <section className="notebook-header">
//                     <div className="row">
//                         <div className="col-sm-12">
//                             <div className="header-wrapper">
//                                 <h3 className="popup-title">people in this notebook</h3>
//                                 <input type="text" className="form-control search-people" placeholder="search" onChange={(event)=>this.filterSharedUsers(_notebook.notebook_id, event)} />
//                                     <span className="search-ico"></span>
//                             </div>
//                         </div>
//                     </div>
//                 </section>
//                 <section className="notebook-body">
//                     <div className="shared-user-wrapper">
//
//                         {
//                             (_notebook.owned_by == 'me')?
//
//                             <div className="shared-user">
//                                 <img className="user-image img-circle" src={profileImg} alt="User"/>
//                                 <div className="name-wrapper">
//                                     <p className="name">{this.state.loggedUser.first_name} {this.state.loggedUser.last_name}</p>
//                                     <p className="name-title">
//                                         {
//                                             (this.state.loggedUser.company_name != null) ? this.state.loggedUser.company_name :
//                                                 (this.state.loggedUser.school != null) ? this.state.loggedUser.school : ""
//                                         }
//                                     </p>
//                                 </div>
//                                 <div className="shared-privacy">
//                                     <p className="owner">(Owner)</p>
//                                 </div>
//                             </div> :
//
//                             <div className="shared-user">
//                                 <img className="user-image img-circle" src={profileImg} alt="User"/>
//                                 <div className="name-wrapper">
//                                     <p className="name">{_notebook.notebook_user.user_name}</p>
//                                     <p className="name-title">{_notebook.notebook_user.user_title}</p>
//                                 </div>
//                                 <div className="shared-privacy">
//                                     <p className="owner">(Owner)</p>
//                                 </div>
//                             </div>
//                         }
//
//                         <SharedUsers notebook={_notebook}
//                                      sharedUserList={this.state.sharedUsers}
//                                      changePermissions={this.onPermissionChanged.bind(this)}
//                                      removeSharedUser={this.getPopupRemoveUser.bind(this)}
//                                      handleClick={this.handleClick.bind(this)}
//                                      scrollProp={this.state.scrollProp}/>
//
//
//                     </div>
//                 </section>
//                 {
//                     (_notebook.owned_by == 'me' || this.state.sharedUsers.length > 2) ?
//                         <section className="notebook-footer">
//                             <div className="footer-action-wrapper">
//                                 {
//                                     (_notebook.owned_by == 'me') ?
//                                         <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i} onEntered={(e) => this.scrollToSharePopup(this.props.notebkId)}>
//                                             <p className={(this.state.sharedUsers.length > 2) ? "add-people" : "add-people c"}>+ Add member</p>
//                                         </OverlayTrigger> : null
//                                 }
//                                 {
//                                     (this.state.sharedUsers.length > 2) ?
//                                         <p className={(_notebook.owned_by == 'me') ? "see-all" : "see-all c"} onClick={this.allSharedUsers.bind(this)}>{(this.state.seeAllSharedUsers) ? "See Less" : "See All"}</p> : null
//                                 }
//
//                             </div>
//                         </section> : null
//                 }
//
//             </section>
//         )
//     }
// }
//
// export class SharePopupNewUsr extends React.Component{
//     constructor(props) {
//         super(props);
//         this.state={
//             value: '',
//             suggestions: [],
//             addNewUserValue: '',
//             notebook: '',
//             isShowingModal: false,
//             userToAdd: null
//         };
//
//         this.loadNewUsers = this.loadNewUsers.bind(this);
//         this.shareNote = this.shareNote.bind(this);
//         this._handleAddNewUser = this._handleAddNewUser.bind(this);
//         this.getPopupAddUser = this.getPopupAddUser.bind(this);
//         this.handleClose = this.handleClose.bind(this);
//     }
//
//     _handleAddNewUser (e){
//         this.setState({
//             addNewUserValue: e.target.value
//         },function (){
//             this.loadNewUsers();
//         });
//
//     }
//
//     loadNewUsers() {
//         let notebook = this.props.notebook;
//         let value = this.state.addNewUserValue;
//         if(value.length >= 1){
//             $.ajax({
//                 url: '/get-connected-users/'+notebook.notebook_id+'/'+value,
//                 method: "GET",
//                 dataType: "JSON",
//                 success: function (data, text) {
//                     if(data.status.code == 200){
//                         this.setState({
//                             suggestions: data.users
//                         });
//                     }
//                 }.bind(this),
//                 error: function (request, status, error) {
//                     console.log(request.responseText);
//                     console.log(status);
//                     console.log(error);
//                 }.bind(this)
//             });
//         }else{
//             this.setState({
//                 suggestions: []
//             });
//         }
//     }
//
//     shareNote(user){
//
//         let loggedUser = Session.getSession('prg_lg');
//         let notebook = this.props.notebook;
//         let _noteBook = {
//             noteBookId:notebook.notebook_id,
//             userId:user.user_id
//         };
//
//         $.ajax({
//             url: '/notes/share-notebook',
//             method: "POST",
//             dataType: "JSON",
//             data:_noteBook,
//             headers: { 'prg-auth-header':loggedUser.token }
//         }).done( function (data, text) {
//             if(data.status.code == 200){
//
//                 let _notificationData = {
//                     notebook_id:notebook.notebook_id,
//                     notification_type:"share_notebook",
//                     notification_sender:loggedUser,
//                     notification_receiver:user.user_name
//                 };
//
//                 Socket.sendNotebookNotification(_notificationData);
//
//                 this.setState({
//                     notebook: notebook.notebook_name,
//                     userToAdd: user,
//                     isShowingModal: true
//                 }, function(){
//                     this.getPopupAddUser();
//                     this.loadNewUsers();
//                 });
//
//
//                 this.props.onLoadNotes();
//                 this.props.onShareuser();
//             }
//         }.bind(this));
//
//     }
//
//     handleClose() {
//         this.setState({isShowingModal: false});
//     }
//
//     getPopupAddUser(){
//         let user = this.state.userToAdd;
//         return(
//             <div>
//                 {this.state.isShowingModal &&
//                 <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
//                     <ModalDialog onClose={this.handleClose.bind(this)} width="35%" style={{marginTop: "-100px"}}>
//                         <div className="col-xs-12 shared-user-r-popup">
//                             <p>{this.state.notebook} shared invitation send to {user.first_name} {user.last_name} successfully...</p>
//                             <button className="btn btn-popup">Ok</button>
//                         </div>
//                     </ModalDialog>
//                 </ModalContainer>
//                 }
//             </div>
//         )
//     }
//
//     render() {
//
//         const { value, suggestions } = this.state;
//         let _this = this;
//
//         let _suggestions = suggestions.map(function(suggestion,key){
//             if(suggestions.length <= 0){
//                 return <div/>
//             }
//
//             let profileImg = (suggestion.images.hasOwnProperty('profile_image') && suggestion.images.profile_image != 'undefined'
//             &&  suggestion.images.profile_image.hasOwnProperty('http_url') && suggestion.images.profile_image.http_url != 'undefined') ?
//                 (suggestion.images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : suggestion.images.profile_image.http_url
//                 : "/images/default-profile-pic.png";
//
//             return(
//
//                 <div className="suggestion" key={key}>
//                     <img className="user-image img-circle" src={profileImg} alt="User"/>
//                         <div className="name-wrapper">
//                             <p className="name">{suggestion.first_name} {suggestion.last_name}</p>
//                         </div>
//                         <div className="action">
//                             <span className="add-people" onClick={()=>_this.shareNote(suggestion)}></span>
//                         </div>
//                 </div>
//             );
//         });
//
//         return (
//             <div>
//                 <div className="popup-holder">
//                     <section className="share-notebook-add-people-popup">
//                         <div className="input-wrapper">
//                             <input type="text" className="form-control" placeholder="type name to add" id="type-to-add" onChange={this._handleAddNewUser}/>
//                         </div>
//                         <div className="suggestions-wrapper">
//                             {_suggestions}
//                         </div>
//                     </section>
//                 </div>
//
//                 {this.getPopupAddUser()}
//
//             </div>
//         )
//     }
//
//
// }
//
// export class  SharedUsers extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state={
//             sharedUsers: this.props.sharedUserList
//         }
//
//     }
//
//     render() {
//
//         let _this = this;
//         let _notebook = this.props.notebook;
//         let _allUsers = this.props.sharedUserList.map(function(user,key){
//
//             return (
//                 <div className="user-row">
//                     {
//                         (user.shared_status == 3) ?
//                             <div className="shared-user" key={key}>
//                                 <img className="user-image img-circle" src={user.profile_image} alt="User"/>
//                                 <div className="name-wrapper">
//                                     <p className="name">{user.user_name}</p>
//                                     {
//                                         (typeof user.school != 'undefined') ?
//                                             <p className="name-title">{user.school}</p>
//                                             :
//                                             <p className="name-title">{user.company_name}</p>
//                                     }
//                                 </div>
//                                 {
//                                     (_notebook.owned_by == 'me') ?
//
//                                         <div className="share-opt-holder clearfix">
//                                             <div className="shared-privacy">
//                                                 <select className="privacy-selector"
//                                                         onChange={(event)=>_this.props.changePermissions(event, user)}
//                                                         value={user.shared_type}>
//                                                     <option value="1">Read Only</option>
//                                                     <option value="2">Read/Write</option>
//                                                 </select>
//                                             </div>
//                                             <div className="action">
//                                                 <span className="remove-people"
//                                                       onClick={()=>_this.props.handleClick(user)}></span>
//                                             </div>
//                                             {_this.props.removeSharedUser()}
//                                         </div> :
//
//                                         <div className="share-opt-holder clearfix">
//                                             <div className="shared-privacy">
//                                                 <p className="request-pending">{(user.shared_type == "1") ? "Read Only" : "Read/Write"}</p>
//                                             </div>
//                                             {_this.props.removeSharedUser()}
//                                         </div>
//                                 }
//
//                             </div> :
//
//                             <div className="shared-user" key={key}>
//                                 <img className="user-image img-circle" src={user.profile_image} alt="User"/>
//                                 <div className="name-wrapper">
//                                     <p className="name">{user.user_name}</p>
//                                     {
//                                         (typeof user.school != 'undefined') ?
//                                             <p className="name-title">{user.school}</p>
//                                             :
//                                             <p className="name-title">{user.company_name}</p>
//                                     }
//                                 </div>
//
//                                 <div className="share-opt-holder clearfix">
//                                     <div className="shared-privacy">
//                                         <p className="request-pending">Request Pending</p>
//                                     </div>
//                                     {
//                                         (_notebook.owned_by == 'me') ?
//                                         <div className="action">
//                                         <span className="remove-people"
//                                               onClick={()=>_this.props.handleClick(user)}></span>
//                                         </div> : null
//                                     }
//                                     {_this.props.removeSharedUser()}
//                                 </div>
//
//                             </div>
//                     }
//                 </div>
//             )
//         });
//
//         return (
//             <div className="notebook-alluser-wrapper" style={{overflowY: this.props.scrollProp, border: "none", boxShadow: "none", maxHeight: "134px"}}>
//                 {_allUsers}
//             </div>
//         )
//     }
// }
//
// export class NoteList extends React.Component {
//
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             loggedUser:Session.getSession('prg_lg'),
//             isCollapsed : true,
//             show: false ,
//             sharedStatus: false
//         };
//
//         this.userAdded = this.userAdded.bind(this);
//     }
//
//     onNotebookExpand(){
//         let isCollapsed = this.state.isCollapsed;
//         this.setState({
//             isCollapsed : !isCollapsed
//         });
//     }
//
//     userAdded(){
//         this.setState({
//             sharedStatus: true
//         });
//     }
//
//     scrollToSharePopup(id){
//         if(id == "lastNoteBK" || id == "oneBeforLastNoteBK"){
//             Scroll.directScroller.scrollTo("popover-contained", {
//                 duration: 800,
//                 smooth: true
//             });
//         }
//     }
//
//     render (){
//
//         let notebook = this.props.notebook;
//         let showConfirm = this.props.showConfirm;
//         let showNotePopup = this.props.showNotePopup;
//         let _this = this;
//
//         let notebookClr = notebook.notebook_color;
//         let borderClr= "#828182";
//
//         let profileImg = (notebook.owned_by == "me") ?
//             (this.state.loggedUser.hasOwnProperty('profile_image') && this.state.loggedUser.profile_image != 'undefined') ?
//                 (this.state.loggedUser.profile_image == "") ? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image
//                 : "/images/default-profile-pic.png"
//             :
//             (notebook.notebook_user.hasOwnProperty('profile_image') && notebook.notebook_user.profile_image != 'undefined') ?
//                 (notebook.notebook_user.profile_image == "") ? "/images/default-profile-pic.png" : notebook.notebook_user.profile_image
//                 : "/images/default-profile-pic.png";
//
//         let i = (
//             <Popover id="popover-contained" className={(notebook.owned_by == 'me') ? "popup-holder share-notebook" : "popup-holder share-notebook other"} style={{width: "438px", marginLeft: "24px"}}>
//                 <SharePopup notebook={notebook} onUserAdd={this.userAdded} onLoadNotes={this.props.onLoadNotes} notebkId={this.props.notebkId}/>
//             </Popover>
//         );
//
//         switch(notebookClr) {
//             case "#ed1e7a":
//                 borderClr = "#f57fb4";
//                 break;
//             case "#00a6ef":
//                 borderClr = "#b3e4fa";
//                 break;
//             case "#a6c74a":
//                 borderClr = "#e6efcc";
//                 break;
//             case "#bebfbf":
//                 borderClr = "#dedfdf";
//                 break;
//             case "#000000":
//                 borderClr = "#828182";
//                 break;
//             case "#038247":
//                 borderClr = "#D2E3A4";
//                 break;
//             case "#000f75":
//                 borderClr = "#7fd2f7";
//                 break;
//             case "#b21e53":
//                 borderClr = "#b21e53";
//                 break;
//         }
//
//         return (
//
//             <div className={(this.state.isCollapsed)? "row notebook" : "row notebook see-all"}>
//                 <span className="notebook-overlay"></span>
//                 <div className="notebook-wrapper">
//                     <div className={notebook.notebook_name == "My Notes" ? "col-sm-2 my-notebook" : "col-sm-2"} style={{backgroundColor : notebook.notebook_color}}>
//
//                         <div className="notebook-cover-wrapper">
//                             <div className="notebook-cover">
//                                 <div className="content-wrapper">
//                                     <div className="logo-wrapper">
//                                         <img src={profileImg} className="img-rounded"/>
//                                         <div className="logo-shader"></div>
//                                         <div className="logo-shader"></div>
//                                     </div>
//                                     <h3 className="name-wrapper" style={{ fontWeight: 600 }}>{notebook.notebook_name}</h3>
//                                     {
//                                         (notebook.notebook_name != "My Notes")?
//                                         <OverlayTrigger rootClose trigger="click" placement="right" overlay={i} onEntered={(e) => this.scrollToSharePopup(this.props.notebkId)}>
//                                             <div className="share-notebook">
//                                             {
//                                                 (notebook.is_shared) ?
//                                                     <span className="sharedIcon"></span>
//                                                     :
//                                                     <span className="notebook-share-icon"></span>
//                                             }
//                                             </div>
//                                         </OverlayTrigger>
//                                         :
//                                         null
//                                     }
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="col-sm-10">
//
//                         <div className="row">
//                             <div className="notebook-content-wrapper">
//
//                                 <NoteThumb noteBook={notebook} catData={notebook.notes} catID={notebook.notebook_id} showConfirm={showConfirm}
//                                            showNotePopup={showNotePopup} borderClr={borderClr} notebookColor={notebook.notebook_color}/>
//
//
//                                 {(notebook.notes.length > 4) ? <div className="see-all" onClick={this.onNotebookExpand.bind(this)}>
//                                     <span className="expand"></span>
//                                     <p>{this.state.isCollapsed ? "See All" : "See Less"}</p>
//                                 </div> : null}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//         );
//     }
// }
//
// export class NoteThumb extends React.Component{
//
//     constructor(props) {
//         super(props);
//         this.state={
//             allNotesAreVisible: false
//         }
//
//         this.showMoreNotes.bind(this);
//     }
//
//     addNewNote(notebook_id){
//         this.props.showNotePopup(notebook_id,null, null);
//     }
//
//     editNote(notebook_id, note, notebook_obj){
//         this.props.showNotePopup(notebook_id,note, notebook_obj);
//     }
//
//     showConfirm(note_id){
//         this.props.showConfirm(note_id);
//     }
//
//     showMoreNotes(){
//         let visibilityState = this.state.allNotesAreVisible;
//         this.setState({allNotesAreVisible : !visibilityState});
//     }
//
//     render(){
//
//         let _this = this;
//         let _notebook_props = this.props.noteBook;
//         let _notes = this.props.catData;
//         let _notebook = this.props.catID;
//
//         let _notes_read_write = 2;
//
//         let _firstSetNotes = _notes.map(function(note,key){
//             let name = note.note_name;
//             if (name.length > 30) {
//                 name = name.substring(0,30)+'...';
//             }
//             if(key < 4) {
//                 return (
//                     <div className="notebook-col" id={note.note_id} key={key}>
//                         <div className="notebook-item" style={{borderColor : note.note_color}}>
//                             <a href="javascript:void(0)" onClick={()=>_this.editNote(_notebook,note,_notebook_props)}>
//                                 <div className="time-wrapper">
//                                     <p className="date-created">{note.updated_at.createdDate}</p>
//
//                                     <p className="time-created">{note.updated_at.createdTime}</p>
//                                 </div>
//                                 <div className="notebook-title-holder">
//                                     <p className="notebook-title">{name}</p>
//                                 </div>
//                             </a>
//                             <span className="note-delete-btn" onClick={()=>_this.showConfirm(note.note_id)}></span>
//                             <p className="note-owner" style={{color : note.note_color}}>{note.note_owner}</p>
//                         </div>
//                     </div>
//                 )
//             }
//         });
//
//         let _allNotes = _notes.map(function(note,key){
//             let name = note.note_name;
//             if (name.length > 30) {
//                 name = name.substring(0,30)+'...';
//             }
//             return (
//                 <div className="notebook-col" id={note.note_id} key={key}>
//                     <div className="notebook-item"  style={{boxShadow : "0 1px 3px " + note.note_color}}>
//                         <a href="javascript:void(0)" onClick={()=>_this.editNote(_notebook,note,_notebook_props)}>
//                             <div className="time-wrapper">
//                                 <p className="date-created">{note.updated_at.createdDate}</p>
//
//                                 <p className="time-created">{note.updated_at.createdTime}</p>
//                             </div>
//                             <div className="notebook-title-holder">
//                                 <p className="notebook-title">{name}</p>
//                             </div>
//                         </a>
//                         <span className="note-delete-btn" onClick={()=>_this.showConfirm(note.note_id)}></span>
//                         <p className="note-owner" style={{color : note.note_color}}>{note.note_owner}</p>
//                     </div>
//                 </div>
//             )
//         });
//
//         return(
//
//             <div className="notebook-items-wrapper">
//                 {
//                     (_notebook_props.shared_privacy == _notes_read_write)? <div className="notebook-col">
//                             <div className="notebook-item create-note" style={{borderColor: this.props.notebookColor}} onClick={()=>_this.addNewNote(_notebook)}>
//                                 <i className="fa fa-plus" style={{color: this.props.notebookColor}}></i>
//                                <p className="add-note-text" style={{color: this.props.notebookColor}}>Create a new note</p>
//                             </div>
//                         </div>:null
//                 }
//                 {_allNotes}
//             </div>
//
//         )
//
//     }
//
// }
