/**
 * DailyInterestWidget Component
 */
import React from 'react';  
import Session  from '../../middleware/Session'; 

export default class DailyInterestWidget extends React.Component {

  constructor(props) {
    super(props);

    let user = Session.getSession('prg_lg');
    if (user == null) {
      window.location.href = "/";
    }

    this.state = {
      user: user,
      tempObjective: ''
    };

    this._handleKeyPress.bind(this);
  }

  getDateKey(date) {
    return date.getMonth() + date.getDate();
  }

  saveObjective(newObjective) { 
    let newText = this.getDateKey(new Date()) + ':' + newObjective;
    let dailyIntestVals = { daily_interest_text: newText};

    $.ajax({
      url: '/widgets/daily_interest/update',
      method: "POST",
      dataType: "JSON",
      data:dailyIntestVals,
      headers: { 'prg-auth-header':this.state.user.token },
      success: function (data, text) {
        if(data.status.code == 200 ){
          Session.createSession("prg_lg", data.user); 
          localStorage.setItem(this.getDateKey(new Date()), '');
          this.setState({ user: data.user, tempObjective: newObjective});
        }
      }.bind(this),
      error: function (request, status, error) {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      }.bind(this)
    });
  }

  changeObjective(event) {
    this.setState({tempObjective: event.target.value});
  }

  clearObjective() {
    let that = this;
    $('#interest-input').fadeOut(function() {
      that.saveObjective('');
    });
  }

  toggleFinishObjective() { 
    let dateKey = this.getDateKey(new Date());
    let newVal = localStorage.getItem(dateKey) == 'true' ? '' : 'true';
    localStorage.setItem(dateKey, newVal); // Use local storage to track whether task is completed
    this.setState({'force': true}); // force redraw
  }

  _handleKeyPress(e) {
    let that = this;
    if (e.key === 'Enter') { 
      $('#interest-input').fadeOut(function() {
        that.saveObjective(that.state.tempObjective);
      });
    }
  }
 
  render() { 
    let objective = this.state.user.settings.widgets.daily_interest_text;
    let objDate = objective.substring(0, objective.indexOf(':'));
    let objText = objective.substring(objective.indexOf(':') + 1);
    let curDateKey = this.getDateKey(new Date());
    let newObjective = !objDate || !objText || (objDate != curDateKey) || (objText.length == 0);
    let finished = localStorage.getItem(this.getDateKey(new Date()));

    return ( 
      <section className="main-task-holder">
        <div className="inner-wrapper">
          <h3 className="section-title">what do you want to <span className="larger">get done</span> today?</h3>
          {newObjective ? (
            <input id='interest-input' value={this.state.tempObjective} onChange={this.changeObjective.bind(this)} onKeyPress={this._handleKeyPress.bind(this)} type="text" className="form-control task-field" />
          ) : (
            <div id='interest-input'>
              <a onClick={this.toggleFinishObjective.bind(this)}><i className={'fa ' + (finished ? 'fa-check-square-o' : 'fa-square-o')}></i></a>
              <h4 className={finished == 'true' && 'strike'} >{ objText }</h4>
              <a onClick={this.clearObjective.bind(this)}><i className={'fa ' + (finished ? 'fa-plus' : 'fa-times')}></i></a>
            </div>
          )}
        </div>
      </section>
    )
  } 
}