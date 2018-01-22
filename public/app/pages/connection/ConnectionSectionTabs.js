/**
 * This is connection section tabs component
 * eg: all connections, recently added...
 */
import React from 'react';

export default class ConnectionSectionTabs extends  React.Component {
    constructor(props){
        super(props);
        this.state ={
            activeTab: this.props.activeTab,
            connectionTabs: this.props.connectionTabs
        };
        this.switchTab = this.switchTab.bind(this);
    }

    switchTab(tabName){
        this.props.switchTab(tabName);
        this.setState({
            activeTab: tabName
        });
    }

    render() {
        const {activeTab, connectionTabs} = this.state;

        let _this = this;
        let _tabs = connectionTabs.map(function(tab,key){
            let clsName = (activeTab == tab) ? "connection-type active" : "connection-type";
            return (
                <div className={clsName} onClick={() => _this.switchTab(tab)} key={key}>
                    <h3>{tab}</h3>
                    <div className="highlighter"></div>
                </div>
            );
        });

        return (
            <div className="tabs-wrapper">
                {_tabs}
            </div>
        )
    }

}