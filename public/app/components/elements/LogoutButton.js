import React from 'react';
import Session  from '../../middleware/Session';
import CallCenter from '../../middleware/CallCenter';

export default class LogoutButton extends React.Component{
	constructor(props){
		super(props);

		this.onButtonClick = this.onButtonClick.bind(this);
		this.b6 = CallCenter.b6;
	}
	
	onButtonClick(){
		Session.destroy('prg_lg');
		console.log("bit6 session closing");
        this.b6.session.isAuthenticated = false;
		this.b6.session.logout();
		location.reload();

	}

	render() {
		return (
            <a href="#" className="pgs-main-btn-login" onClick={this.onButtonClick}>{this.props.value}</a>
		);
	}
}
