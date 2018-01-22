/**
 * Suggestions Block
 */
import React from 'react';

export default class SuggestionsList extends React.Component {

    constructor(props) {
        super(props);
        this.state ={}; 
    }

    render() {

        let _this = this;
        let suggestions = this.props.suggestions;
        let selectSuggestions = this.props.selectSuggestions;
        let items = this.props.suggestions.map(function(user,key){

            let _images = user.images;

            let profileImg = (_images.hasOwnProperty('profile_image') && _images.profile_image != 'undefined') ?
                (_images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : _images.profile_image.http_url
                : "/images/default-profile-pic.png";

            return (
                <li key={key} onClick={() => _this.props.selectSuggestions(user)} >
                    <div className="img-div">
                        <img src={profileImg} />
                    </div>
                    <p>{user.first_name} {user.last_name}</p>
                </li>
            );
        });

        return (
            <div className="suggestions-holder users">
                <ul>
                    {items}
                </ul>
            </div>
        )
    }
}
