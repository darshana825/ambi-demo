import React, { Component } from 'react';
import { connect } from 'react-redux';
import Session from '../../middleware/Session';
import * as actions from './actions'; 

class ShareNotebookSharedUsers extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      user: Session.getSession('prg_lg'),
    }
  }

  removeUser(shared_user) {
    $.ajax({
      url: '/notebook/shared-user/remove',
      method: "POST",
      dataType: "JSON",
      data:{notebook_id:this.props.notebook._id, user_id:shared_user.user._id},
      headers: { 'prg-auth-header':this.state.user.token }
    }).done( function (data, text) {
      if (data.code == 200) {
        console.log("done removing shared user -----");

        // Update local cache
        let shared_users = this.props.sharedUsers;
        let index = shared_users.indexOf(shared_user);
        shared_users.splice(index, 1);

        this.props.updateSharedUsers(shared_users);
      }
    }.bind(this));
  }

  changePermission(event, shared_user) {
    console.log('Change:' + JSON.stringify(shared_user, null, 4));
    let mode =  event.target.value;

    $.ajax({
      url: '/notebook/shared-permission/change',
      method: "POST",
      dataType: "JSON",
      data:{notebook_id: this.props.notebook._id, user_id: shared_user.user._id, shared_mode: mode},
      headers: { 'prg-auth-header':this.state.user.token }
    }).done(function (data, text) { 
      if (data.code == 200) {
        console.log("done updating permissions! -----");

        // Update local cache
        let shared_users = this.props.sharedUsers;
        let index = shared_users.indexOf(shared_user);
        shared_users[index].mode = mode;

        this.props.updateSharedUsers(shared_users);
      }
    }.bind(this));
  }

  render() {
    let that = this;

    let _allUsers = this.props.sharedUsers.map(function(shared_user, key) {
      let user = shared_user.user; 
      let title = (user.working_experiences.length > 0) ? user.working_experiences[0].company_name :
                    ((user.education_details.length > 0) ? user.education_details[0].school : "");
      let img = user.profile_image || "/images/default-profile-pic.png";

      const STATUS_APPROVED = 3;
      const READ_ONLY = 1;

      return (
        <div className="user-row" key={key}>
          <div className="shared-user" key={key}>
            <img className="user-image img-circle" src={img} alt="User"/>
            <div className="name-wrapper">
              <p className="name">{ user.first_name + ' ' + user.last_name }</p> 
              <p className="name-title">{title}</p>  
            </div>
            { (shared_user.status == STATUS_APPROVED) ?
              <div>
                { that.props.isOwner ? 
                  <div className="share-opt-holder clearfix">
                    <div className="shared-privacy">
                      <select className="privacy-selector"
                        onChange={ (evt) => that.changePermission(evt, shared_user) }
                        defaultValue={shared_user.mode}>
                        <option value="1">Read Only</option>
                        <option value="2">Read/Write</option>
                      </select>
                    </div>
                    <div className="action">
                      <span className="remove-people" onClick={ that.removeUser.bind(that, shared_user) }></span>
                    </div>
                  </div> 
                  :
                  <div className="share-opt-holder clearfix">
                    <div className="shared-privacy">
                      <p className="request-pending">{(shared_user.mode == READ_ONLY) ? "Read Only" : "Read/Write"}</p>
                    </div> 
                  </div>
                }
              </div>
            : 
            <div className="share-opt-holder clearfix">
              <div className="shared-privacy">
                <p className="request-pending">Request Pending</p>
              </div>
              { that.props.isOwner &&
                <div className="action">
                  <span className="remove-people" onClick={ that.removeUser.bind(that, shared_user) }></span>
                </div>
              }
            </div> 
            }
          </div> 
        </div>
      )
    });

    return (
      <div className="notebook-alluser-wrapper" style={{overflowY: this.props.scrollProp, border: "none", boxShadow: "none", maxHeight: "134px"}}>
        { _allUsers }
      </div>
    );
  }
}

export default ShareNotebookSharedUsers;
