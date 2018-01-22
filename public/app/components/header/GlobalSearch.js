/**
 * Search Component
 */
import React from 'react';
import Autosuggest from 'react-autosuggest';
import Lib from '../../middleware/Lib';

export default class GlobalSearch extends React.Component{
    constructor(props) {
        super(props);

        this.state={
            value: '',
            suggestions: [],
            suggestionsList : {}
        };

        this.users = [];
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp(escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    onChange(event, { newValue }) {

        this.setState({ value: newValue });

        if(newValue.length == 1){
            $.ajax({
                url: '/get-users/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        } else if(newValue.length > 1 && this.users.length < 10){
            $.ajax({
                url: '/get-users/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
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
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.users),
            suggestionsList : this.getSuggestions(value, this.users)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    getSuggestionValue(suggestion) {
        return suggestion.first_name+" "+suggestion.last_name;
    }

    renderSuggestion(suggestion) {
        console.log(suggestion);

        let _default_img = "/images/default-profile-pic.png";
        let _images = suggestion.images;
        let img = _images.hasOwnProperty('profile_image') ? (_images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : _default_img) : _default_img;

        if (typeof img == 'undefined'){
            img = _default_img;
        }

        return (
            <a href="javascript:void(0)" onClick={()=>this.loadProfile(suggestion.user_name)}>
                <div className="suggestion" id={suggestion.user_id}>
                    <div className="img-holder">
                        <img src={img} alt={suggestion.first_name} className="img-responsive" />
                    </div>
                    <span>{suggestion.first_name+" "+suggestion.last_name}</span>
                </div>
            </a>
        );
    }

    loadProfile(user_name){
        window.location.href ='/profile/'+user_name
    }

    render(){
        const { value, suggestions, suggestionsList } = this.state;

        const inputProps = {
            placeholder: 'search',
            value,
            onChange: this.onChange,
            className: 'form-control'
        };

        return(
            <div className="search-holder">
                <Autosuggest suggestions={suggestions}
                                 onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                 onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                 getSuggestionValue={this.getSuggestionValue}
                                 renderSuggestion={this.renderSuggestion}
                                 inputProps={inputProps} />
                {
                    (value.length <= 0) ? <i className="fa fa-search" aria-hidden="true"></i> : null
                }
            </div>
        );
    }
}
