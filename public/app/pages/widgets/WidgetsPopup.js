/**
 * WidgetsPopup Component
 */
import React from 'react';  
import Session  from '../../middleware/Session';
import ToggleButton from 'react-toggle-button'

export default class WidgetsPopup extends React.Component {

  constructor(props) {
    super(props);

    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }

    let session = Session.getSession('prg_lg')

    this.widgets = [{name: 'date/time', key:'date_and_time'}, {name: 'daily interest', key:'daily_interest'}, 
    {name: 'daily quotes', key:'daily_quotes'}, {name: 'weather', key:'weather'}, 
    {name: 'countdown', key:'countdown'}, {name: 'feedback', key:'feedback'}];

    this.state = {
      user: session,
    };
  }

  toggleWidget(widgetKey) {
    let widgetVals = this.state.user.settings.widgets;
    console.log("Before: " + JSON.stringify(widgetVals, null, 4));
    widgetVals[widgetKey] = !widgetVals[widgetKey];
    console.log("After: " + JSON.stringify(widgetVals, null, 4));

    $.ajax({
      url: '/widgets/update',
      method: "POST",
      dataType: "JSON",
      data:widgetVals,
      headers: { 'prg-auth-header':this.state.user.token },
      success: function (data, text) {
        console.log("response: " + JSON.stringify(data, null, 4));
        if(data.status.code == 200 ){
          Session.createSession("prg_lg", data.user); 

          this.setState({
            user: data.user
          });

          this.props.parentUpdateFn();
        }
      }.bind(this),
      error: function (request, status, error) {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      }.bind(this)
    });
  }

  render() { 

    let _sectionsMap = this.widgets.map(function(widget, key){
      return (
        <div key={key}>
          <div className="toggle-right">
            <ToggleButton
              value={ this.state.user.settings.widgets[widget.key] }
              inactiveLabel={''}
              activeLabel={''}
              colors={{
              active: {
                base: '#ed1e7a',
              },
              }}
              onToggle={this.toggleWidget.bind(this, widget.key)}
              />
            <h5>{widget.name}</h5>
          </div>
          {widget.key != 'feedback' && <hr />}
        </div>
      );
    }, this);

    return ( 
      <div className="widgets-popup"> 
        <h2>widgets</h2>
        { _sectionsMap }
      </div> 
    )
  } 
}