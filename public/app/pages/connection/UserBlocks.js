/**
 * This is user block tile/thumb view component
 */
import React from 'react';
import Session  from '../../middleware/Session';

export class UserBlockTileView extends React.Component {
    constructor(props){
        super(props);

        this.onAcceptRequest = this.onAcceptRequest.bind(this);
        this.onRejectRequest = this.onRejectRequest.bind(this);
        this.onAddConnection = this.onAddConnection.bind(this);
        this.onSkipSuggestion = this.onSkipSuggestion.bind(this);
    }

    onAcceptRequest(user){
        this.props.onAcceptRequest(user);
    }

    onRejectRequest(user){
        this.props.onRejectRequest(user);
    }

    onAddConnection(user){
        this.props.onAddConnection(user);
    }

    onSkipSuggestion(){
        this.props.onSkipSuggestion(this.props.index);
    }

    render(){
        const user = this.props.user;
        const user_profile_image = (typeof user.images.profile_image.http_url != 'undefined' )? user.images.profile_image.http_url : "images/"+user.images.profile_image.file_name,
            full_name = user.first_name +" "+ user.last_name;

        return(
            <div className="connection-block">
                <div className="profile-image-wrapper">
                    <img src={user_profile_image} className="img-responsive img-circle profile-pic"/>
                    {
                        (this.props.connectionType == "CONNECTION_REQUESTS") ?
                            <span className="close-suggestion" onClick={ () => this.onRejectRequest(user) }></span> :
                        ((this.props.connectionType == "CONNECTION_SUGGESTIONS") && (this.props.isAllowToSkip))?
                            <span className="close-suggestion" onClick={ () => this.onSkipSuggestion() }></span> : null
                    }
                </div>
                <div className="block-content">
                    <h4 className="connection-name">{full_name}</h4>
                    <div className="sub-info-wrapper">
                        <p className="college">{(typeof user.cur_working_at !== "undefined" && user.cur_working_at !== "") ? user.cur_working_at : " "}</p>
                        <p className="college">{(typeof user.country !== "undefined" && user.country !== "") ? user.country : " "}</p>
                    </div>
                    {
                        (this.props.connectionType == "CONNECTION_REQUESTS") ?
                            <button className="btn btn-connect" onClick={ () => this.onAcceptRequest(user) }>accept</button>
                            : null
                    }
                    {
                        (this.props.connectionType == "CONNECTION_SUGGESTIONS")?
                            <button className="btn btn-connect" onClick={ () => this.onAddConnection(user) }>connect</button>
                            :null

                    }
                </div>
            </div>
        );
    }
}

export class UserBlockThumbView extends React.Component {
    constructor(props){
        super(props);
        this.loggedUser = Session.getSession('prg_lg');
        this.onLoadProfile = this.onLoadProfile.bind(this);
    }

    onLoadProfile(){
        window.location.href = "/profile/" + this.props.user.user_name;
    }

    render(){
        const user = this.props.user;
        const user_profile_image = (typeof user.images.profile_image.http_url != 'undefined' )? user.images.profile_image.http_url : "images/"+user.images.profile_image.file_name,
            full_name = (this.loggedUser.id == this.props.user.user_id) ? "You" : user.first_name +" "+ user.last_name;

        return (
            <div className="connection-block" onClick={this.onLoadProfile}>
                <img src={user_profile_image} className="img-responsive img-circle profile-pic"/>
                <h4 className="connection-name">{full_name}</h4>
            </div>
        );
    }
}