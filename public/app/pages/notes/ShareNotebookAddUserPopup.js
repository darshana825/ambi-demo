import React, { Component } from 'react';
import { connect } from 'react-redux';
import Session from '../../middleware/Session';
import * as actions from './actions'; 

class ShareNotebookAddUserPopup extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: Session.getSession('prg_lg'),
      value: '',
      suggestions: [], 
      isShowingModal: false, 
    };
  }

  shareNote(user){
    $.ajax({
      url: '/notes/share-notebook',
      method: "POST",
      dataType: "JSON",
      data:{notebookId: this.props.notebook._id, toShare: [user.user_id]},
      headers: { 'prg-auth-header':this.state.user.token }
    }).done(function (data, text) { 
      if (data.code == 200) {
        console.log("done adding user! -----");

        let that = this;
        setTimeout(function() { that.props.fetchNotebooks(that.state.user); setTimeout(function() { that.props.resetSharedUsers()}, 100); }, 100);

        this.runQuery('');
      }
    }.bind(this)); 
  } 

  handleSuggestChange(e) {
    let newVal = e.target.value; 
    this.runQuery(newVal); 
  }

  runQuery(newVal) {
    let query = newVal.trim().toLowerCase(); 

    let to_share = this.props.notebook.shared_users.map(function(shared_user) {
      return shared_user.user._id;
    });

    let matches = query.length === 0 ? [] : this.props.connections.filter(user =>
      (user.first_name + ' ' + user.last_name).toLowerCase().indexOf(query) !== -1 && !to_share.includes(user.user_id)
    );

    this.setState({value: newVal, suggestions: matches});
  }

  getPopupAddUser() { 
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
    let that = this;

    let _suggestions = suggestions.map(function(suggestion, key) {  
      let profileImg = suggestion.image_url || "/images/default-profile-pic.png";

      return(
        <div className="suggestion" key={key}>
          <img className="user-image img-circle" src={profileImg} alt="User"/>
          <div className="name-wrapper">
            <p className="name">{suggestion.first_name} {suggestion.last_name}</p>
          </div>
          <div className="action">
            <span className="add-people" onClick={that.shareNote.bind(that, suggestion)}></span>
          </div>
        </div>
      );
    });

    return (
      <div>
        <div className="popup-holder">
          <section className="share-notebook-add-people-popup">
            <div className="input-wrapper">
              <input type="text" className="form-control" value={this.state.value} placeholder="type name to add" id="type-to-add" name="value" onChange={this.handleSuggestChange.bind(this)}/>
            </div>
            <div className="suggestions-wrapper">
              {_suggestions}
            </div>
          </section>
        </div> 
        { this.getPopupAddUser() } 
      </div>
    )
  }
}

export default connect(null, actions)(ShareNotebookAddUserPopup);
