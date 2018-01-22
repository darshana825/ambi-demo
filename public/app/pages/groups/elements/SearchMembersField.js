/**
 * The Index view of the group section
 */
import React from 'react';
import Autosuggest from 'react-autosuggest';
import Lib from '../../../middleware/Lib';

export default class SearchMembersField extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            members : [],
            value: '',
            suggestions: [],
            // sharedWithIds : [],
            sharedWithIds : this.props.sharedWithIds,
            placeholder : this.props.placeholder
        };

        this.users = [];
        // this.sharedWithIds = this.state.sharedWithIds ? this.state.sharedWithIds : [];
        this.sharedWithIds = [];
        this.members = [];

        this.removeUser = this.removeUser.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.sharedWithIds !== this.state.sharedWithIds && nextProps.sharedWithIds.length === 0) {
            this.sharedWithIds = [];
            this.members = [];
            this.setState({ sharedWithIds: this.sharedWithIds, members: []});
        }
    }

    removeUser(key){
        this.sharedWithIds.splice(key,1);
        this.members.splice(key,1);
        this.setState({sharedWithIds:this.sharedWithIds, members:this.members});
        this.props.handleSearchUser(this.sharedWithIds, this.members);
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    getSuggestionValue(suggestion) {

        let _default_img = "/images/default-profile-pic.png";
        let _images = suggestion.images;
        let profileImg = _images.hasOwnProperty('profile_image') ? (_images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : _default_img) : _default_img;

        if(this.sharedWithIds.indexOf(suggestion.user_id)==-1){

            var userObject = {
                "name" : suggestion.first_name+" "+suggestion.last_name,
            	"user_id" : suggestion.user_id,
             	"status" : 1, // ACCEPTED
                "profile_image" : profileImg
            }
            this.members.push(userObject);
            this.sharedWithIds.push(suggestion.user_id);
            this.setState({sharedWithIds:this.sharedWithIds, members:this.members, isAlreadySelected:false});
            this.props.handleSearchUser(this.sharedWithIds, this.members);
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }
        return "";
    }

    renderSuggestion(suggestion) {
        let _default_img = "/images/default-profile-pic.png";
        let _images = suggestion.images;
        let profileImg = _images.hasOwnProperty('profile_image') ? (_images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : _default_img) : _default_img;

        return (
            <div id={suggestion.user_id} className="suggestion-item">
                <img className="suggestion-img" src={profileImg} alt={suggestion.first_name} />
                <span>{suggestion.first_name+" "+suggestion.last_name}</span>
            </div>
        );
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue, isAlreadySelected:false });

        if(newValue.length > 1){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        }
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.users)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    render() {
        const { placeholder, value, suggestions } = this.state;
        const inputProps = {
            placeholder: placeholder,
            value,
            onChange: this.onChange,
            className: 'form-control'
        };
        let shared_with_list = [];
        if(this.state.members.length > 0){
            shared_with_list = this.state.members.map((member,key)=>{
                return <span key={key} className="user">{member.name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
            });
        }

        return (
            <div className="search-member-field-holder">
                <Autosuggest suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps} />
                { this.state.members.length > 0 ?
                        <div className="user-holder">{shared_with_list}</div> : null
                }
            </div>
        );
    }
}
