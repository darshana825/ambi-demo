import React, { Component } from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { connect } from 'react-redux'
import NoteList from './NoteList';
import Session from '../../middleware/Session';
import Autosuggest from 'react-autosuggest';
import * as actions from './actions';

class NewNotebook extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: Session.getSession('prg_lg'),
      suggestions: [],
      to_share: [],
      value: '',
      attemptedSubmit: false
    }
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  addNewNotebook() {
    let newNotebook = {name: this.state.notebookName, color: this.state.color};
    if (newNotebook.name == null || newNotebook.name.length == 0 || newNotebook.color == null) {
      this.setState({attemptedSubmit: true});
      return;
    }

    newNotebook.shared = this.state.to_share.map(function(user) {
      console.log(user);
      return user.user_id
    });

    this.props.createNotebook(this.state.user, newNotebook);
    let that = this;
    setTimeout(function() { that.props.fetchNotebooks(that.state.user); that.props.dismissModal(); }, 100);
  }

  colorPicker(color){
    this.setState({color: color});
  }

  onSuggestionChange(event, { newValue}) {
    if (newValue == null) newValue = '';
    console.log("new val: " + newValue);
    this.setState({value: newValue});
  }

  findMatches() {
    let query = this.state.value.trim().toLowerCase();
    let to_share = this.state.to_share;

    let matches = query.length === 0 ? [] : this.props.connections.filter(user =>
      (user.first_name + ' ' + user.last_name).toLowerCase().indexOf(query) !== -1 && !to_share.includes(user)
    );

    this.setState({suggestions: matches});
  }

  // Returns the value to display after selection, here we override to add new user to to_share list
  getSuggestionValue(suggestion) {
    console.log('Selected!');
    let to_share = this.state.to_share;

    if (!to_share.includes(suggestion)) {
      to_share.push(suggestion);
      this.setState({to_share: to_share})
    }

    return '';
  }

  removeShare(user) {
    let to_share = this.state.to_share;
    let index = to_share.indexOf(user);
    if (index !== -1) {
      to_share.splice(index, 1);
    }

    this.setState({to_share: to_share});
  }

  renderSuggestion(suggestion) {
    let defaultImage = "/images/default-profile-pic.png";
    let img = suggestion.image_url || defaultImage;

    return (
      <div className="suggestion" id={suggestion.user_id}>
        <img src={img} alt={suggestion.first_name} className="img-responsive img-circle" style={{maxWidth: '25px', float: 'left', marginRight: '20px'}} />
        <span>{suggestion.first_name + ' '+ suggestion.last_name}</span>
      </div>
    );
  }

  getAutoSuggest() {
    const { value, suggestions } = this.state;
    const inputProps = {
        placeholder: 'Find user...',
        value,
        onChange: this.onSuggestionChange.bind(this),
        className: 'form-control'
    };

    let that = this;
    return (
      <Autosuggest suggestions={suggestions}
      onSuggestionsFetchRequested={this.findMatches.bind(this)}
      onSuggestionsClearRequested={() => { that.setState({suggestions: []}) }}
      getSuggestionValue={this.getSuggestionValue.bind(this)}
      renderSuggestion={this.renderSuggestion.bind(this)}
      inputProps={inputProps} />
    );
  }

  render() {
    let colorChoices = [
      {'name': 'dark-green', code: '#038247'},
      {'name': 'dark-blue', code: '#000f75'},
      {'name': 'red', code: '#b21e53'},
      {'name': 'black', code: '#000000'},
      {'name': 'light-green', code: '#a6c74a'},
      {'name': 'light-blue', code: '#00a6ef'},
      {'name': 'pink', code: '#ed1e7a'},
      {'name': 'gray', code: '#bebfbf'}
    ];

    let that = this;
    let _colors = colorChoices.map(function(color, key) {
      let active = (color.code === that.state.color) ? ' active' : '';

      return (
        <div className={'color ' + color.name + active} id={color.code} data-name={color.name} onClick={that.colorPicker.bind(that, color.code)} key={key}>
          <i className="fa fa-check" aria-hidden="true"></i>
        </div>
      );
    });

    let _toShare = this.state.to_share.map(function(user, key) {
      let defaultImage = "/images/default-profile-pic.png";
      let img = user.image_url || defaultImage;

      return (
        <li key={key} style={{clear: 'both'}}>
          <img src={img} alt={user.first_name} className="img-responsive img-circle" style={{maxWidth: '25px', float: 'left', marginRight: '10px'}} />
          <i className='fa fa-times' onClick={that.removeShare.bind(that, user)} style={{float: 'right', marginTop: '4px'}}></i>
          {user.first_name} {user.last_name}
        </li>
      );
    });

    return(
      <div >
        <ModalContainer zIndex={9999}>
          <ModalDialog onClose={this.props.dismissModal} className="create-notebook modalPopup" width="438px">
            <div className="popup-holder">
              <section className="create-notebook-popup">
                <section className="notebook-header">
                  <div className="row">
                    <div className="col-sm-12">
                      <h2>Create New Notebook</h2>
                    </div>
                  </div>
                </section>
                <section className="notebook-body clearfix">
                  <div className="notebook-name">
                    <div className="col-sm-12 input-group name-holder">
                      <p>Name your notebook</p>
                      <input type="text" className="form-control" placeholder="type a category name..." value={this.state.notebookName}
                         name="notebookName"
                         onChange={this.handleChange.bind(this)}/>
                      { (this.state.notebookName == null || this.state.notebookName.length == 0) && this.state.attemptedSubmit &&
                          <span className="errorMsg">Please add a Notebook name</span>
                      }
                    </div>
                  </div>
                  <div className="notebook-color">
                    <div className="col-sm-12 input-group">
                      <p>Choose a color</p>
                      <div className="color-palette">
                        { _colors}
                      </div>
                      { (this.state.color == null && this.state.attemptedSubmit) &&
                          <span className="errorMsg">Please select Notebook color</span>
                      }
                    </div>
                  </div>
                  <div className="invite-people">
                    <div className="col-sm-12 input-group">
                      <p>Invite some people</p>
                      { this.getAutoSuggest() }
                      <div className="user-holder" style={{width: '100%'}}>
                        <ul style={{marginTop: '15px', width: '100%'}}>
                          { _toShare }
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="notebook-footer">
                  <div className="action-bar">
                    <button className="btn btn-add-notebook" onClick={this.addNewNotebook.bind(this)}>create notebook</button>
                  </div>
                </section>
              </section>
            </div>
          </ModalDialog>
        </ModalContainer>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, actions)(NewNotebook);
