import React from 'react';
import Session  from '../../middleware/Session';

class Dashboard extends React.Component {

	render(){
		let session = Session.getSession('prg_lg');

		let date = new Date();
	    let hrs = date.getHours();

	    let greating;

	    if (hrs < 12){
			greating = 'Good Morning';
		}else if (hrs >= 12 && hrs <= 17){
			greating = 'Good Afternoon';
		}else if (hrs >= 17 && hrs <= 24){
			greating = 'Good Evening';
		}

		return (
			<div className="loggedUserView pg-page" id="pg-dashboard-page">
                <div className="row row-clr" id="pg-dashboard-banner-area">
                    <img src="images/logo-large-middle.png" className="img-responsive center-block" id="pg-dashboard-banner-area-logo-img" />
                    <h2 id="pg-dashboard-banner-area-title-wish">{greating}, {session.first_name + " " + session.last_name}</h2>
                    <h1 id="pg-dashboard-banner-area-title-what-to-do">What shall we do today?</h1>
                </div>
            </div>
		)
	}


}


export default Dashboard;
