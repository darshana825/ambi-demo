/**
 * CountdownWidget Component
 */
import React from 'react';  
import Session  from '../../middleware/Session';
import DateTime from 'react-datetime';


export default class CountdownWidget extends React.Component {

  constructor(props) {
    super(props);

    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }

    let session = Session.getSession('prg_lg');

    this.state = {
      user: session,
      showPopup: false,
      date: new Date(session.settings.widgets.countdown_date),
      eventName: session.settings.widgets.countdown_event,
      countdownVal: '',
      countdownLabel: '',
      validDate: false
    };

    this.calculateCountdown.bind(this);
    this.tick = this.tick.bind(this);
    this.dropdownSelected = this.dropdownSelected.bind(this);
    this.numericRangeForDropdown = this.numericRangeForDropdown.bind(this);
  }

  componentDidMount() {
    this.tick();
    this.interval = setInterval(() => this.tick(), 31000);

    let that = this;
    $(window).click(function(e) {
      let targ = $(e.target);

      if (that.state.showPopup && !targ.parents().andSelf().is('#countdown-widget') && !targ.parents().andSelf().is('.popup')) {
        that.setState({showPopup: false}); // Hide countdown when clicking outside
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    this.calculateCountdown(this.state.eventName, this.state.date);
  }

  changeEventName(event) {
    this.calculateCountdown(event.target.value, this.state.date);
  }

  calculateCountdown(eventName, newDate) {
    let diff = (newDate.getTime() - new Date().getTime()) / 1000; // millis to secs

    var label = '';
    var val = '';
    if (diff >= 60 * 60 * 24) {
      label = 'd';
      val = diff / (60 * 60 * 24);
    } else if (diff >= 60 * 60) {
      label = 'h';
      val = diff / (60 * 60);
    } else if (diff >= 0) {
      label = 'm';
      val = diff / 60;
    } else {
      // negative
    }

    let isDiffDate = newDate.getTime() != new Date(this.state.user.settings.widgets.countdown_date).getTime();
    let isDiffEventName = this.state.user.settings.widgets.countdown_event != eventName;
    let valid = this.isValidDate(newDate) &&  eventName != '' && (isDiffDate || isDiffEventName);
    this.setState({eventName: eventName, countdownLabel: label, countdownVal: Math.round(val), validDate: valid});
  }

  toggleDetails() {
    console.log("toggleDetails");
    let showPopup = !this.state.showPopup;
    this.setState({showPopup: showPopup});
  }

  isValidDate(date){
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);
    return date.getTime() > yesterday.getTime();
  }

  save(valid) {
    if (!valid) return;
    let date = this.state.date;

    if (!this.isValidDate(date)) return;

    let countdownVals = { countdown_date: date, countdown_event: this.state.eventName};

    $.ajax({
      url: '/widgets/countdown/update',
      method: "POST",
      dataType: "JSON",
      data:countdownVals,
      headers: { 'prg-auth-header':this.state.user.token },
      success: function (data, text) {
        if(data.status.code == 200 ){
          Session.createSession("prg_lg", data.user); 

          this.setState({
            user: data.user,
            date: date,
            eventName: this.state.eventName, 
            validDate: false
          });

          this.toggleDetails();
        }
      }.bind(this),
      error: function (request, status, error) {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      }.bind(this)
    });
  }

  dropdownSelected(value, keyName) {
    let curDate = this.state.date;
    console.log(keyName + ': ' + value);

    if (keyName == 'days') {
      curDate.setDate(value);
    } else if (keyName == 'mins') {
      curDate.setMinutes(value);
    } else if (keyName == 'month') {
      curDate.setMonth(value);
    } else if (keyName == 'years') {
      curDate.setFullYear(value);
    } else if (keyName == 'hours') {
      let hours = curDate.getHours() >= 12 ? value + 12 : value;
      curDate.setHours(hours);
    } else if (keyName == 'timeSpecifier') {
      let hours = curDate.getHours() % 12;
      if (value == 'pm') {
        hours += 12;
      }
      curDate.setHours(hours);
    }

    this.setState({date: curDate});
    this.calculateCountdown(this.state.eventName, curDate);
  }

  numericRangeForDropdown(start, max, keyName) {
    let array = [];
    for (var i = start; i <= max; i++) {
      array.push(i);
    }

    let that = this;
    return array.map(function(number, key) {
      return (<li key={keyName + number}><a onClick={that.dropdownSelected.bind(that, number, keyName)}>{number}</a></li>);
    }); 
  }

  render() { 
    let rawMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let _months = rawMonths.map(function(mon, key) {
      return (<li key={key}><a onClick={this.dropdownSelected.bind(this, key, 'month')}>{mon}</a></li>);
    }, this); 
    let _days = this.numericRangeForDropdown(1, 31, 'days');
    let _hours = this.numericRangeForDropdown(1, 12, 'hours');
    let _minutes = this.numericRangeForDropdown(0, 59, 'mins');
    let _years = this.numericRangeForDropdown(2017, 2021, 'years');

    let curDate = this.state.date;
    let curDay = curDate.getDate();
    let curMonth = rawMonths[curDate.getMonth()];
    let curYear = curDate.getFullYear();

    let curHour = curDate.getHours();
    let curTimeSpecifier = 'am';
    if (curHour >= 12) {
      curTimeSpecifier = 'pm';
      curHour = curHour - 12;
    }
    let curMinute = curDate.getMinutes();

    return ( 
      <div id="countdown-widget">
        <div onClick={this.toggleDetails.bind(this)}>
          <h3>{this.state.countdownVal}<span>{this.state.countdownLabel}</span></h3>
          <h5>{this.state.eventName.toUpperCase() || 'set event'}</h5>
        </div>
        {this.state.showPopup &&
          <div className="popup">
            <div className='popup-padding'>
              <h4 className='center'>Countdown</h4>
              <p className='center'>Count down the days to an important date.</p>
              <h5>NAME</h5>
              <input type="text" value={this.state.eventName} onChange={this.changeEventName.bind(this)} />
              <h5 className='date-label'>DATE</h5>
              <div className="dropdown inline-block">
                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{ curMonth }
                <span className="caret"></span></button>
                <ul className="dropdown-menu">
                  { _months }
                </ul>
              </div>
              <div className="dropdown inline-block">
                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{ curDay }
                <span className="caret"></span></button>
                <ul className="dropdown-menu">
                  <div className='scrollable-dropdown'>
                    { _days }
                  </div>
                </ul>
              </div>
              <div className="dropdown inline-block">
                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{ curYear }
                <span className="caret"></span></button>
                <ul className="dropdown-menu">
                  { _years }
                </ul>
              </div>
              <h5 className='date-label'>TIME</h5>
              <div className="dropdown inline-block">
                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{ curHour }
                <span className="caret"></span></button>
                <ul className="dropdown-menu">
                  { _hours }
                </ul>
              </div>
              <div className="dropdown inline-block">
                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{ curMinute }
                <span className="caret"></span></button>
                <ul className="dropdown-menu">
                  <div className='scrollable-dropdown'>
                    { _minutes }
                  </div>
                </ul> 
              </div>
              <div className="dropdown inline-block">
                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">{ curTimeSpecifier }
                <span className="caret"></span></button>
                <ul className="dropdown-menu">
                  <li><a onClick={this.dropdownSelected.bind(this, 'pm', 'timeSpecifier')}>pm</a></li> 
                  <li><a onClick={this.dropdownSelected.bind(this, 'am', 'timeSpecifier')}>am</a></li> 
                </ul>
              </div>
              <br />
            </div>
            { /*<DateTime value={this.state.date} onChange={this.dateChanged.bind(this)} isValidDate={ this.isValidDate } /> */ }
            <button className={'btn btn-lg btn-save ' + (this.state.validDate && 'valid-date')} onClick={this.save.bind(this, this.state.validDate)}>set event</button>
          </div>
        }
      </div> 
    )
  } 
}