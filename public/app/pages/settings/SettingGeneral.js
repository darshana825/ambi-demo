/**
 * SettingsGeneral Component
 */
import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import Session  from '../../middleware/Session';
import ToggleButton from 'react-toggle-button'
import update from 'react-addons-update';

export default class SettingGeneral extends React.Component {

  constructor(props) {
    super(props);

    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }

    let curSession = Session.getSession('prg_lg')

    this.state = {
      userLoggedIn: curSession,
      userImgSrc: "/images/default-profile-pic.png",
      editAccount: false,
      accountErrorText: ''
    };

    this.optionSelected = this.optionSelected.bind(this);
  }

  componentDidMount(){
    if(this.state.userLoggedIn.profile_image){
      this.setState({userImgSrc : this.state.userLogedIn.profile_image});
    }
  }

  toggleAccountEdit() {
    this.setState((prevState, props) => {
      return {editAccount: !prevState.editAccount};
    });
  }


  updateOption(optionKey, val) {
    let values = this.state.userLoggedIn.settings;
    values[optionKey] = this.toggleOption(values[optionKey]);

    let user = this.state.userLoggedIn;
    $.ajax({
      url: '/settings/update',
      method: "POST",
      dataType: "JSON",
      data:values,
      headers: { 'prg-auth-header':user.token },
      success: function (data, text) { 
        if(data.status.code == 200 ){
          Session.createSession("prg_lg", data.user); 

          this.setState({
            userLoggedIn: data.user
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

  optionSelected(optionKey, optionVal) {
    // console.log("Comparing: " + this.state.userLoggedIn.settings[optionKey]);
    // console.log("To: " + this.optionToVal(optionVal));

    let storedVal = this.state.userLoggedIn.settings[optionKey];
    if (storedVal == 'true') storedVal = true;
    else if (storedVal == 'false') storedVal = false;

    return storedVal == this.optionToVal(optionVal);
  }

  optionToVal(optionVal) {
    if (optionVal == 'on') return true;
    else if (optionVal == 'off') return false;
    else if (optionVal == '12 hr') return 12;
    else if (optionVal == '24 hr') return 24;

    return optionVal;
  }

  toggleOption(optionVal) {
    if (optionVal == 12) return 24;
    else if (optionVal == 24) return 12;
    else if (optionVal == 'f') return 'c';
    else if (optionVal == 'c') return 'f';
    else if (optionVal == 'true') return false;
    else if (optionVal == 'false') return true;

    return !optionVal;
  }

  saveAccountEdit(e) { 
    e.preventDefault();
    console.log(this.refs);

    let values = {};
    values['first_name'] = this.refs['first_name'].value;
    values['last_name'] = this.refs['last_name'].value;
    values['user_name'] = this.refs['user_name'].value;

    if (this.refs['curPW'].value) {
      values['curPW'] = this.refs['curPW'].value;
      values['newPW'] = this.refs['newPW'].value;
      values['confirmPW'] = this.refs['confirmPW'].value;

      if (values['newPW'] != values['confirmPW']) {
        this.setState({ accountErrorText: 'new passwords do not match' });
        return;
      } else if (values['newPW'].length < 4) {
        this.setState({ accountErrorText: 'new password too short (min 4 chars)' });
        return;
      }
    }

    console.log("values: " + JSON.stringify(values));

    let user = this.state.userLoggedIn;

    $.ajax({
      url: '/account-info/update',
      method: "POST",
      dataType: "JSON",
      data:values,
      headers: { 'prg-auth-header':user.token },
      success: function (data, text) { 
        if(data.status.code == 200 ){
          Session.createSession("prg_lg", data.user);
          this.setState({
            editAccount: false,
            userLoggedIn: data.user,
            accountErrorText: ''
          });
        }

      }.bind(this),
      error: function (request, status, error) {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
        this.setState({ accountErrorText: 'password incorrect or username already in use' });
      }.bind(this)
    });
  }

  render() {
    let user = this.state.userLoggedIn;
    let options = user.settings;
    let optionVals = [
      {stateKey: 'sounds', label: 'sounds', option1: 'on', option2: 'off'},
      {stateKey: 'weather_format', label: 'weather units', option1: 'c', option2: 'f'},
      {stateKey: 'clock_format', label: 'clock format', option1: '12 hr', option2: '24 hr'},
      // {stateKey: 'homepage', label: 'make ambi my home page', option1: 'on', option2: 'off'},
      ];

    let _optionMap = optionVals.map(function(option, key) {
      return (
        <div key={option.stateKey}>
          <div className="toggle-right no-padding">
            <div className="radio-text">
              <span className={this.optionSelected(option.stateKey, option.option1) && 'active'} onClick={this.updateOption.bind(this, option.stateKey)}>{option.option1}</span> 
              &nbsp;<span className={this.optionSelected(option.stateKey, option.option2) && 'active'} onClick={this.updateOption.bind(this, option.stateKey)}>{option.option2}</span>  
            </div>
            <label>{option.label}</label>
          </div>
          <hr className="option-separator" />
        </div>
      );
    }, this, options);

    return (  
      <div className="setting-general">
        <img src={this.state.userImgSrc} className="img-responsive img-circle profile-photo" />
        <h3>{user.first_name + " " + user.last_name}</h3>
        <button type="button" className="edit-btn" onClick={this.toggleAccountEdit.bind(this)}>{this.state.editAccount ? 'cancel' : 'edit' }</button>
        <form id='editAccountForm' onSubmit={this.saveAccountEdit.bind(this)}>
          {this.state.editAccount && 
            <button type="submit" className="edit-btn save-btn" style={{marginRight: '5px'}}>save</button> 
          }
          <h4>account</h4>
          <div id="setting-general-account">
          {!this.state.editAccount && 
            <div>
              <label>name:</label><span>{user.first_name + " " + user.last_name}</span><br />
              <label>username:</label><span>{user.user_name}</span><br /> 
              <label>password:</label><span>***********</span><br />
            </div>
          }
          {this.state.editAccount && 
            <div>
              <span className='error'>{this.state.accountErrorText}{this.state.accountErrorText && <br />}</span>
              <label>first name:</label><input type="text" ref="first_name" defaultValue={user.first_name} />
              <label>last name:</label><input type="text" ref="last_name" defaultValue={user.last_name} />
              <label>username:</label><input type="text" ref="user_name" defaultValue={user.user_name} />
              <label>current password:</label><input type="text" ref="curPW" />
              <label>new password:</label><input type="text" ref="newPW" />
              <label>confirm password:</label><input type="text" ref="confirmPW" /> 
            </div>
          }
          </div>
        </form>
        <br />
        <h4>options</h4>
        <div id="setting-general-options">
          {_optionMap}
        </div>
      </div>
    ) 
  } 
}