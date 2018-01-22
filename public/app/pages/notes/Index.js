import React, { Component } from 'react';
import ReactDom from 'react-dom';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { connect } from 'react-redux';
import Session from '../../middleware/Session';
import {Alert} from '../../config/Alert';
import { Scrollbars } from 'react-custom-scrollbars';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import NotebookList from './NotebookList';
import NewNotebook from './NewNotebook';
import * as actions from './actions';

class Index extends Component {
  constructor(props) {
    super(props);

    let user = Session.getSession('prg_lg');
    if (user == null){
      window.location.href = "/";
    }

    this.state = {
      showAddNotebookModal: false,
      user: user,
      connections: []
    }

    this.loadConnections();

    this.props.fetchNotebooks(user);
    this.hideAddNotebookModal.bind(this);
  }

  loadConnections() {
    $.ajax({
      url: '/connection/me/unfriend',
      method: "GET",
      dataType: "JSON",
      headers: {'prg-auth-header': this.state.user.token}
    }).done(function (data) {
      if (data.status.code == 200) {
        console.log("Connections loaded");
        console.log(data.my_con);
        this.setState({connections: data.my_con});
      }
    }.bind(this));
  }

  hideAddNotebookModal() {
    console.log("dismiss modal");
    this.setState({ showAddNotebookModal: false });
  }

  showAddNotebookModal() {
    console.log("Showing add!");
    this.setState({ showAddNotebookModal: true });
  }

  render() {
    if (!this.props.notebooks) return (<h3>Loading...</h3>);

    return (
      <section className="notebook-container">
        <div className="container">
          <section className="notebook-header">
            <div className="row">
              <div className="col-sm-3">
                <h2>Notebooks</h2>
              </div>
              <div className="col-sm-5 menu-bar">
                <div className="notebook-type active">
                  <h4>my notebooks</h4>
                  <div className="highlighter"></div>
                </div>
                <div className="notebook-type">
                  <h4>group notebooks</h4>
                  <div className="highlighter"></div>
                </div>
              </div>
              <div className="col-sm-4 menu-buttons">
                <div className="search-notebook">
                  <div className="inner-addon">
                    <i className="fa fa-search"></i>
                    <input type="text" className="form-control" placeholder="search"/>
                  </div>
                </div>
                <div className="crt-notebook">
                  <button className="btn btn-crt-notebook" onClick={this.showAddNotebookModal.bind(this)}>
                    <i className="fa fa-plus"></i> New notebook
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="notebook-body">
            <NotebookList notebooks={this.props.notebooks} connections={this.state.connections} />
            {this.state.showAddNotebookModal && <NewNotebook connections={this.state.connections} dismissModal={this.hideAddNotebookModal.bind(this)}/>}
          </section>
        </div>
      </section>
    );
  }
}

function mapStateToProps(state) {
  console.log('mapstate to props ' + JSON.stringify(state, null, 4));
  let notebooks = state.notes.notebooks;
  if (notebooks) notebooks = notebooks.filter(function(val) { return val !== null; }); // Remove null vals

  return {
    notebooks: notebooks
  }
}


export default connect(mapStateToProps, actions)(Index);
