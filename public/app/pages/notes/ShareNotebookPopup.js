import React, { Component } from 'react';
import { connect } from 'react-redux';
import Session from '../../middleware/Session';
import * as actions from './actions'; 
import { Popover, OverlayTrigger } from 'react-bootstrap';
import ShareNotebookAddUserPopup from './ShareNotebookAddUserPopup'
import ShareNotebookSharedUsers from './ShareNotebookSharedUsers'

export class ShareNotebookPopup extends React.Component{

  constructor(props) {
    super(props);
    this.state={
      user: Session.getSession('prg_lg'),
      sharedUsers: this.props.notebook.shared_users,
      seeAllSharedUsers:false,
      scrollProp: 'hidden',
      isShowingModal : false,
      userToRemove: null
    } 

    this.updateSharedUsers = this.updateSharedUsers.bind(this);
    this.resetSharedUsers = this.resetSharedUsers.bind(this);
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

  filterSharedUsers(event) {
    let query = event.target.value.toLowerCase();

    if (query.length > 0) {
      let matches = this.state.sharedUsers.filter(user =>
        (user.first_name + ' ' + user.last_name).toLowerCase().indexOf(query) !== -1
      ); 
      this.updateSharedUsers(matches);  
    } else {
      this.updateSharedUsers(this.props.notebook.shared_users);
    }
  }

  updateSharedUsers(newSharedUsers) { 
    this.setState({shared_users: newSharedUsers});
  }

  handleClick(user) {
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
                  <h3 className="modal-title">delete message</h3>
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

  scrollToSharePopup(id){
    // if(id == "lastNoteBK" || id == "oneBeforLastNoteBK"){
    //   Scroll.directScroller.scrollTo("popover-contained", {
    //     duration: 800,
    //     smooth: true
    //   });
    // }
  }

  resetSharedUsers() { 
    this.updateSharedUsers(this.props.notebook.shared_users);  
  }

  render(){

    let notebook = this.props.notebook;
    let isNotebookOwner = this.props.notebook.creator._id == this.state.user.id;

    let i = (
      <Popover id="popover-contained"  positionTop="150px" className="share-notebook-new">
        <ShareNotebookAddUserPopup notebook={notebook} connections={this.props.connections} resetSharedUsers={this.resetSharedUsers} />
      </Popover>
    );

    let profileImg = this.state.user.image_url || "/images/default-profile-pic.png"; 

    return (
      <section className="share-notebook-popup">
        <section className="notebook-header">
          <div className="row">
            <div className="col-sm-12">
              <div className="header-wrapper">
                <h3 className="popup-title">people in this notebook</h3>
                <input type="text" className="form-control search-people" placeholder="search" onChange={ this.filterSharedUsers.bind(this)} />
                  <span className="search-ico"></span>
              </div>
            </div>
          </div>
        </section>
        <section className="notebook-body">
          <div className="shared-user-wrapper">
            <div className="shared-user">
              <img className="user-image img-circle" src={profileImg} alt="User"/>
              <div className="name-wrapper">
                <p className="name">{notebook.creator.first_name + ' ' + notebook.creator.last_name}</p>
                <p className="name-title">
                  {(notebook.creator.working_experiences.length > 0) ? notebook.creator.working_experiences[0].company_name :
                    (notebook.creator.education_details.length > 0) ? notebook.creator.education_details[0].school : ""}
                </p>
              </div>
              <div className="shared-privacy">
                <p className="owner">(Owner)</p>
              </div>
            </div>  

            <ShareNotebookSharedUsers
             isOwner={isNotebookOwner}
             notebook={notebook}
             sharedUsers={notebook.shared_users}
             updateSharedUsers={this.updateSharedUsers}
             scrollProp={this.state.scrollProp} /> 
          </div>
        </section>
        { (isNotebookOwner || this.state.sharedUsers.length > 2) &&
          <section className="notebook-footer">
            <div className="footer-action-wrapper">
              { isNotebookOwner &&
                <OverlayTrigger container={this} trigger="click" placement="bottom" overlay={i} onEntered={ this.scrollToSharePopup.bind(this, this.props.notebook._id) }>
                  <p className={(this.state.sharedUsers.length > 2) ? "add-people" : "add-people c"}>+ Add member</p>
                </OverlayTrigger>
              }
              { (this.state.sharedUsers.length > 2) &&
                <p className={isNotebookOwner ? "see-all" : "see-all c"} onClick={this.allSharedUsers.bind(this)}>{(this.state.seeAllSharedUsers) ? "See Less" : "See All"}</p>
              }
            </div>
          </section>
        } 
      </section>
    )
  }
}

export default connect(null, actions)(ShareNotebookPopup);
