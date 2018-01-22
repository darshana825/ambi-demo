/**
 * This is connection section component
 * eg: 1=> connection requests (requests + suggestions) 2=> connections list
 */
import React from 'react';
import ConnectionSectionTabs from './ConnectionSectionTabs';
import NewConnections from './NewConnections';
import ConnectionsList from './ConnectionsList';

export default class ConnectionSection extends  React.Component {
    constructor(props){
        super(props);
        this.state = {
            searchParam: ''
        }

        this.switchTab = this.switchTab.bind(this);
        this.searchConnection = this.searchConnection.bind(this);
    }

    switchTab(tabName){
        this.setState({searchParam: ''});
        this.props.switchTab(this.props.sectionType, tabName);
    }

    searchConnection(paramName){
        this.setState({searchParam: paramName.target.value});
        this.props.searchConnection(this.props.sectionType, paramName.target.value);
    }

    render(){
        const sectionType = this.props.sectionType, connectionsType = this.props.connectionsType;
        const {friend_requests, friend_suggestions, connectionsList} = this.props;

        let connectionTabs = [], headerCls = "", titleCls = "";
        if(sectionType == "REQUESTS"){
            connectionTabs = [
                "all connections", "recently added", "college"
            ];
            headerCls = "connections-header"; titleCls = "connections-title my-profile";
        }

        if(sectionType == "CONNECTIONS_LIST"){
            if(connectionsType == "OWN"){
                connectionTabs = [
                    "all connections", "recently added", "college"
                ];
                headerCls = "connections-header my-connections"; titleCls = "connections-title my-profile";
            }else {
                connectionTabs = [
                    "all connections", "mutual friends"
                ];
                headerCls = "connections-header"; titleCls = "connections-title";
            }
        }
        return(
            <section className="connections-container">
                <div className="container">
                    <div className={headerCls}>
                        <h2 className={titleCls}>{this.props.sectionTitle}</h2>
                        <ConnectionSectionTabs activeTab="all connections" connectionTabs={connectionTabs} switchTab={this.switchTab} />

                        <div className="search-connection">
                            <div className="inner-addon">
                                <i className="fa fa-search"></i>
                                <input type="text" className="form-control" placeholder="search" onChange={this.searchConnection} value={this.state.searchParam}/>
                            </div>
                        </div>
                    </div>
                    {
                        (sectionType == "REQUESTS") ?
                            <div>
                                <NewConnections title="friend requests" sectionType="CONNECTION_REQUESTS" connections={friend_requests}
                                                onAcceptRequest={this.props.onAcceptRequest} onRejectRequest={this.props.onRejectRequest} />
                                <NewConnections title="people you might know" sectionType="CONNECTION_SUGGESTIONS" connections={friend_suggestions}
                                                onSkipSuggestion={this.props.onSkipSuggestion} onAddConnection={this.props.onAddConnection} />
                            </div> :
                        (sectionType == "CONNECTIONS_LIST") ?
                            <div>
                                <ConnectionsList connections={connectionsList} />
                            </div>
                        : null
                    }
                </div>
            </section>
        );
    }
}