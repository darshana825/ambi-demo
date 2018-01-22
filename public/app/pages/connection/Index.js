/**
 * This is connection index component
 */
import React from 'react';
import ShuffleArray from 'shuffle-array';
import Moment from 'moment';
import Session  from '../../middleware/Session';
import ConnectionSection from './ConnectionSection'

export default class Index extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            friend_requests: [], friend_requestsTEMP: [],
            friend_suggestions: [], friend_suggestionsTEMP: [],
            connectionsList: [], connectionsListTEMP: [],
            filterOps: {
                requestFilter: '',
                connectionListFilter: ''
            },
            request_user: {}
        };

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.loggedUser = Session.getSession('prg_lg');

        this.loadFriendRequests = this.loadFriendRequests.bind(this);
        this.loadFriendSuggestions = this.loadFriendSuggestions.bind(this);
        this.loadConnectionsList = this.loadConnectionsList.bind(this);
        this.onAddConnection = this.onAddConnection.bind(this);
        this.onAcceptRequest = this.onAcceptRequest.bind(this);
        this.onRejectRequest = this.onRejectRequest.bind(this);
        this.onSkipSuggestion = this.onSkipSuggestion.bind(this);
        this.switchTab = this.switchTab.bind(this);
        this.searchConnection = this.searchConnection.bind(this);
        this.loadUserProfileData = this.loadUserProfileData.bind(this);

        if(typeof this.props.params.uname != "undefined"){
            this.request_user_name = this.props.params.uname;
            this.loadUserProfileData();
        }else {
            this.request_user_name = null;
            this.loadFriendRequests();
            this.loadFriendSuggestions();
            this.loadConnectionsList();
        }
    }

    loadFriendRequests(){
        let filterOption = this.state.filterOps.requestFilter;
        $.ajax({
            url: '/connection/requests',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ page_count: 3, filter: filterOption},
        }).done(function(data){
            if(data.status.code == 200){
                if( data.req_cons.length > 0) {
                    this.setState({friend_requests: data.req_cons, friend_requestsTEMP: data.req_cons});
                }else {
                    this.setState({friend_requests: [], friend_requestsTEMP: []});
                }
            }
        }.bind(this));
    }

    loadFriendSuggestions(){
        $.ajax({
            url: '/connection/suggestion',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token }
        }).done(function(data){
            if(data.status.code == 200){
                if( data.connections.length > 0){
                    this.setState({friend_suggestions: ShuffleArray(data.connections), friend_suggestionsTEMP: ShuffleArray(data.connections)});
                }else {
                    this.setState({friend_suggestions: [], friend_suggestionsTEMP: []});
                }
            }
        }.bind(this));
    }

    loadConnectionsList(){
        let filterOption = this.state.filterOps.connectionListFilter, _data = {};
        if(filterOption == "recently added"){
            let then = Moment().subtract(1, 'months').format(), now = Moment().format(),
                filterQuery = "connected_at:["+ then + " TO " + now + " ]";
            _data['q'] = filterQuery;
        }
        if(this.request_user_name != null && this.request_user_name != this.loggedUser.user_name){
           _data['user_id'] = this.state.request_user.user_id;
        }
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data: _data
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({connectionsList:data.my_con, connectionsListTEMP:data.my_con});
            }
        }.bind(this));
    }

    loadMutualConnectionsList(){
        let _data = {};
        if(this.request_user_name != null && this.request_user_name != this.loggedUser.user_name){
           _data['uid'] = this.state.request_user.user_id;
        }
        $.ajax({
            url: '/connection/get-mutual',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data: _data
        }).done(function(data){
            if(data.status.code == 200){
                this.setState({connectionsList:data.mutual_cons, connectionsListTEMP:data.mutual_cons});
            }
        }.bind(this));
    }

    onAddConnection(user){
        let _connectedUsers = [user.user_id];
        $.ajax({
            url: '/connection/send-request',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ connected_users: JSON.stringify(_connectedUsers)},

        }).done(function(data){
            if(data.status.code == 200){
                this.loadFriendSuggestions();
            }
        }.bind(this));
    }

    onAcceptRequest(user){
        let _this = this;
        $.ajax({
            url: '/connection/accept',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ sender_id: user.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.loadFriendRequests();
                this.props.loadConnectionRequests();
                setTimeout(function(){ _this.loadConnectionsList(); }, 2000);
            }
        }.bind(this));
    }

    onRejectRequest(user) {
        $.ajax({
            url: '/connection/decline',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ sender_id: user.user_id}
        }).done(function(data){
            if(data.status.code == 200){
                this.loadFriendRequests();
                this.props.loadConnectionRequests();
            }
        }.bind(this));
    }

    onSkipSuggestion(index){
        let suggestions = this.state.friend_suggestions;
        suggestions.splice(index, 1);
        this.setState({friend_suggestions: suggestions});
    }

    loadUserProfileData(){
        let _this = this;
        $.ajax({
            url: '/get-profile/'+this.request_user_name,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.setState({request_user:data.profile_data},
                        (function(){_this.loadConnectionsList();}).bind(_this));
                }
            }.bind(this)
        });
    }

    switchTab(sectionType, tabName){
        let _this = this;
        if(sectionType == "REQUESTS"){
            let _filterOps = this.state.filterOps;
            _filterOps['requestFilter'] = tabName;
            this.setState(
                {filterOps: _filterOps}, (function(){
                    _this.loadFriendRequests();
                }).bind(_this)
            );
        }

        if(sectionType == "CONNECTIONS_LIST"){
            let _filterOps = this.state.filterOps;
            _filterOps['connectionListFilter'] = tabName;

            this.setState(
                {filterOps: _filterOps}, (function(){
                    if(tabName == "all connections" || tabName == "recently added"){
                        _this.loadConnectionsList();
                    }
                    if(tabName == "mutual friends"){
                        _this.loadMutualConnectionsList();
                    }
                }).bind(_this)
            );
        }
    }

    searchConnection(sectionType, paramName){
        let _this = this, _url = '';
        if(sectionType == "REQUESTS"){
            let connectionRequests = this.state.friend_requests, connectionSuggestions = this.state.friend_suggestions, filteredRequests = [], filteredSuggestions = [];
            for(let i = 0; i < connectionRequests.length; i++){
                let fullName = connectionRequests[i].first_name + " " + connectionRequests[i].last_name,
                    lwr_fullName = fullName.toLowerCase(), lwr_paramName = paramName.toLowerCase();

                if (lwr_fullName.includes(lwr_paramName)) {
                    filteredRequests.push(connectionRequests[i]);
                }
            }
            for(let i = 0; i < connectionSuggestions.length; i++){
                let fullName = connectionSuggestions[i].first_name + " " + connectionSuggestions[i].last_name,
                    lwr_fullName = fullName.toLowerCase(), lwr_paramName = paramName.toLowerCase();

                if (lwr_fullName.includes(lwr_paramName)) {
                    filteredSuggestions.push(connectionSuggestions[i]);
                }
            }
            this.setState({
                friend_requestsTEMP: filteredRequests,
                friend_suggestionsTEMP: filteredSuggestions
            });
        }
        if(sectionType == "CONNECTIONS_LIST"){
            let connectionsList = this.state.connectionsList, connectionsListFiltered = [];
            for(let i = 0; i < connectionsList.length; i++){
                let fullName = connectionsList[i].first_name + " " + connectionsList[i].last_name,
                    lwr_fullName = fullName.toLowerCase(), lwr_paramName = paramName.toLowerCase();

                if (lwr_fullName.includes(lwr_paramName)) {
                    connectionsListFiltered.push(connectionsList[i]);
                }
            }
            this.setState({
                connectionsListTEMP: connectionsListFiltered
            });
        }
    }

    render() {
        const {friend_requestsTEMP, friend_suggestionsTEMP, connectionsListTEMP, request_user, filterOps} = this.state;
        let profileName = "friend's connection";
        if(this.request_user_name != null && typeof request_user.first_name != "undefined"){
            profileName = request_user.first_name + "'s connections";
        }
        return (
            <div>
                {
                    (this.request_user_name == null) ?
                        <div>
                            <ConnectionSection sectionType="REQUESTS" sectionTitle="connections" friend_requests={friend_requestsTEMP}
                                               friend_suggestions={(filterOps.requestFilter == '' || filterOps.requestFilter == "all connections") ? friend_suggestionsTEMP : []}
                                               onAcceptRequest={this.onAcceptRequest} onRejectRequest={this.onRejectRequest}
                                               onSkipSuggestion={this.onSkipSuggestion} onAddConnection={this.onAddConnection} switchTab={this.switchTab} searchConnection={this.searchConnection} />
                            <ConnectionSection sectionType="CONNECTIONS_LIST" connectionsType={"OWN"} sectionTitle="my connections" connectionsList={connectionsListTEMP}
                                                switchTab={this.switchTab} searchConnection={this.searchConnection} />
                            </div> :
                            <ConnectionSection sectionType="CONNECTIONS_LIST" connectionsType={"OTHER"} sectionTitle={profileName}
                                               connectionsList={connectionsListTEMP} switchTab={this.switchTab} searchConnection={this.searchConnection} />
                }
            </div>
        );
    }
}