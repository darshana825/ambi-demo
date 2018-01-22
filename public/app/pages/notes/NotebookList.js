import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactS3Uploader from "react-s3-uploader";
import NoteList from './NoteList';
import ProfileImageUploader from '../../components/elements/ProfileImageUploader';
import Session from '../../middleware/Session';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import * as actions from './actions';
import ShareNotebookPopup from './ShareNotebookPopup'
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

class NotebookList extends Component {
  constructor(props) {
    super(props);
    // console.log("Props: " + JSON.stringify(this.props, null, 4));

    this.state = {
      user:Session.getSession('prg_lg'),

      isCollapsed : true,
      show: false ,
      sharedStatus: false,
      seeAllSharedUsers: false,
      isShowingUploader: false,
      showConfirm: false
    };
    // this.handleUploadClick = this.handleUploadClick.bind(this);
    // this.onUploadProgress = this.onUploadProgress.bind(this);
    // this.onUploadError = this.onUploadError.bind(this);
    // this.onUploadFinish = this.onUploadFinish.bind(this);
    // this.onClick = this.onClick.bind(this);

  };

  // // TODO: remove dead code.
  // onUploadProgress(uploadProgressResult) {
  //   console.log("NotebookList uploadProgressResult: ", uploadProgressResult);
  // }
  //
  // // TODO: remove dead code.
  // onUploadError(uploadErrorResult) {
  //   console.log("NotebookList uploadErrorResult: ", uploadErrorResult);
  // }
  //
  // onUploadFinish(result) {
  //     console.log("NotebookList onUploadFinish result: ", result);
  // }
  //
  // handleUploadClick(e) {
  //     let fileInput = this.refs.notesS3Uploader;
  //     fileInput.click();
  // }

  onNotebookExpand(){
    let isCollapsed = this.state.isCollapsed;
    this.setState({ isCollapsed : !isCollapsed });
  }

  userAdded(){
    this.setState({ sharedStatus: true });
  }

  scrollToSharePopup(id){
    if(id === "lastNoteBK" || id === "oneBeforLastNoteBK"){
      Scroll.directScroller.scrollTo("popover-contained", {
        duration: 800,
        smooth: true
      });
    }
  }

  showConfirm(notebookId) {
    this.setState({ showConfirm: true, notebookId: notebookId });
  }

  closeConfirmPopup() {
    this.setState({ showConfirm:false, notebookId: '' });
  }

  deleteNotebook() {
    console.log("Deleting notebook: " + this.state.notebookId);

    $.ajax({
        url: '/notebook/delete',
        method: "POST",
        dataType: "JSON",
        data: { notebookId: this.state.notebookId},
        headers: { 'prg-auth-header': this.state.user.token }
      }).done(function (data, text) {
        if (data.code == 200) {
          console.log("Deleted Notebook");

          let that = this;
          setTimeout(function() { that.props.fetchNotebooks(that.state.user); that.closeConfirmPopup() }, 100);
        }
      }.bind(this));
  }

  getConfirmationNotebookPopup() {
    return(
      <div>
        {this.state.showConfirm &&
        <ModalContainer zIndex={9999}>
          <ModalDialog width="402px" style={{marginTop : "-100px", padding : "0"}}>
            <div className="popup-holder">
              <div className="notification-alert-holder delete-alert">
                <div className="model-header">
                  <h3 className="modal-title">delete message</h3>
                </div>
                <div className="model-body">
                  <p className="alert-content">are you sure you want to delete this notebook?</p>
                </div>
                <div className="model-footer">
                  <button className="btn cancel-btn" onClick={this.closeConfirmPopup.bind(this)}>cancel</button>
                  <button className="btn delete-btn" onClick={this.deleteNotebook.bind(this)}>delete</button>
                </div>
              </div>
            </div> 
          </ModalDialog>
        </ModalContainer>
        }
      </div>
    );
  }

  getSharePopover(notebook) {
    return (
      <Popover id="popover-contained" className={(notebook.creator == this.state.user.id) ? "popup-holder share-notebook" : "popup-holder share-notebook other"} style={{width: "438px", marginLeft: "24px"}}>
        <ShareNotebookPopup notebook={notebook} connections={this.props.connections} />
      </Popover>
    );
  }

  render() {
    let notebooks = this.props.notebooks;
    if (notebooks == null) return (<h3>Loading...</h3>);

    let profileImg = '/images/default-profile-pic.png';

    //TODO: add profileimageuploader component to change the imageof the notebook

    let borderColorMap = {
      "#ed1e7a":"#f57fb4",
      "#00a6ef":"#b3e4fa",
      "#a6c74a":"#e6efcc",
      "#bebfbf":"#dedfdf",
      "#000000":"#828182",
      "#038247":"#D2E3A4",
      "#000f75":"#7fd2f7",
      "#b21e53":"#b21e53"
    };


    // let profileImg = (notebook.owned_by === "me") ?
    //   (this.state.loggedUser.hasOwnProperty('profile_image') && this.state.loggedUser.profile_image != 'undefined') ?
    //     (this.state.loggedUser.profile_image === "") ? "/images/default-profile-pic.png" : this.state.loggedUser.profile_image
    //     : "/images/default-profile-pic.png"
    //   :
    //   (notebook.notebook_user.hasOwnProperty('profile_image') && notebook.notebook_user.profile_image != 'undefined') ?
    //     (notebook.notebook_user.profile_image === "") ? "/images/default-profile-pic.png" : notebook.notebook_user.profile_image
    //     : "/images/default-profile-pic.png";

    let collapsed = false;
    let that = this;

    let _notebooksMap = notebooks.map(function(notebook, key) {
      notebook.name = notebook.name || notebook._id;
      notebook.border_color = borderColorMap[notebook.color] || '#f57fb4';
      notebook.is_shared = notebook.creator._id != that.state.user.id;
      notebook.is_owner = notebook.creator._id == that.state.user.id;  

      return (

        //onclick reacts3 uploader needs to fire however when attempting to call an outside method the component keeps breaking

        // testFunc() {
        //   console.log("testFunc");
        // }
        <div className={collapsed ? "row notebook" : "row notebook see-all"} key={key}>
          <span className="notebook-overlay"></span>
          <div className="notebook-wrapper">
            <div className={notebook.name == "My Notes" ? "col-sm-2 my-notebook" : "col-sm-2"} style={{backgroundColor : notebook.color}}>

              <div className="notebook-cover-wrapper" >
                <div className="notebook-cover">
                  <div className="content-wrapper">
                    <div className="logo-wrapper">
                      <img src={profileImg}
                        className="img-rounded"

                      />
                      {/* <label ref="notesS3Uploader">
                          <ReactS3Uploader
                              signingUrl="/s3/sign"
                              signingUrlMethod="GET"
                              accept="image/*"
                              onProgress={this.onUploadProgress.bind(this)}
                              onError={this.onUploadError.bind(this)}
                              onFinish={this.onUploadFinish.bind(this)}
                              signingUrlHeaders={{ additional: {
                                  "Access-Control-Allow-Origin": "*"
                              } }}
                              uploadRequestHeaders={{
                                  "Access-Control-Allow-Origin": "*"
                              }}
                              contentDisposition="auto"
                              />
                      </label> */}
                      <div className="logo-shader"></div>
                      <div className="logo-shader"></div>
                    </div>
                    <h3 className="name-wrapper" style={{ fontWeight: 600 }}>{notebook.name}</h3>
                    { (notebook.name != "My Notes") &&
                      <OverlayTrigger rootClose trigger="click" placement="right" overlay={ that.getSharePopover(notebook) } >
                        <div className="share-notebook">
                        { (notebook.is_shared) ?
                          <span className="sharedIcon"></span>
                          :
                          <span className="notebook-share-icon"></span>
                        }
                        </div>
                      </OverlayTrigger>
                    }
                  </div>
                </div>
              </div>

              { notebook.is_owner && (notebook.name != "My Notes") &&
                <i className="fa fa-minus notebook-delete-btn" aria-hidden="true" onClick={ that.showConfirm.bind(that, notebook._id) } ></i>      
              }
            </div>
            {/* { this.state.isShowingUploader ? <h1>I am a test</h1> : null } */}
            {/* <ReactS3Uploader /> */}
            <div className="col-sm-10">
              <div className="row">
                <div className="notebook-content-wrapper">
                  <NoteList notebook={notebook} />
                  { /* Notebook expand thing should be in notelist */ }
                  {
                    // (notebook.notes.length > 4) &&
                    // <div className="see-all" onClick={this.onNotebookExpand.bind(this)}>
                    //   <span className="expand"></span>
                    //   <p>{collapsed ? "See All" : "See Less"}</p>
                    // </div>
                  }
                </div>
              </div>
            </div>
          </div>
          { that.getConfirmationNotebookPopup() }
        </div>
      );
    });

    return (
      <div>
        {_notebooksMap}
      </div>
    );
  }
}

export default connect(null, actions)(NotebookList);
