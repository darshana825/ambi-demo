/**
 * This is connections list component
 */
import React from 'react';
import {UserBlockThumbView} from './UserBlocks';

export default class ConnectionsList extends React.Component{
    constructor(props){
        super(props);
    }

    render(){

        const connections = this.props.connections;
        let _this = this;
        let userBlockThumb = connections.map(function(connection,key){
            return (
                <div key={key} >
                    <UserBlockThumbView user={connection}/>
                </div>
            );
        });

        return(
            <div className="connections-list list-view">
                {
                    (connections.length > 0) ? userBlockThumb :
                        <h3 className="no-connections">there are no connections to display</h3>
                }
            </div>
        );
    }
}