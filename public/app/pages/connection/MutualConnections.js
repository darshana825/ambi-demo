/**
 * This is Connection view file that handle mutual connections
 */
import React from 'react';
import Session  from '../../middleware/Session';
import UserBlockTileView from '../../components/elements/UserBlockTileView';
import UserBlockThumbView from '../../components/elements/UserBlockThumbView';
import Lib from '../../middleware/Lib';
export default class Index extends React.Component{
    constructor(props){
        super(props);
        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state ={
            uname:this.getUrl(),
            my_connections:[],
            user:{}
        };

        this.loggedUser = Session.getSession('prg_lg');

        this.loadProfileData = this.loadProfileData.bind(this);
        this.loadMutualConnection = this.loadMutualConnection.bind(this);
        this.loadProfileData();

    }

    getUrl(){
        return  this.props.params.uname;
    }

    loadProfileData(){
        let _this = this;
        $.ajax({
            url: '/get-profile/'+this.state.uname,
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.setState({user:data.profile_data}, function () {
                       _this.loadMutualConnection(this.state.user.user_id);
                    });
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });

    }

    loadMutualConnection(user_id){
        let _this = this;
        $.ajax({
            url: '/connection/get-mutual/'+user_id,
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){
                _this.setState({my_connections:data.mutual_cons});
            }
        });
    }

    render(){
        const {
            my_connections
        }=this.state;


        return (

            <div className="pg-page" id="pg-connections-page">
                <div className="pg-connections-wrapper">
                    {
                        (my_connections.length > 0)?
                            <MutualConnections my_connections = {my_connections}/>
                            :null
                    }

                </div>
            </div>
        )

    }
}

export class MutualConnections  extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            my_connections:[],

        };


    }


    onUserSelect(user){
        location.href = "/profile/"+user.user_name;
    }

    render(){
        if(typeof this.props.my_connections == 'undefined'){
            return (<div />)
        }
        let _this = this;
        let user_elements = this.props.my_connections.map(function(friend,key){

            return (
                <UserBlockThumbView user = {friend}
                                    onClick = {user=>_this.onUserSelect(user)}
                                    key = {key}/>


            );
        });
        return(
            <div className="pg-my-connections-wrapper mutual">
                <div className="row row-clr pg-connections-page-header2">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="row">
                            <div className="col-sm-4 connection-title-holder">
                                <h2 className="pg-connections-page-header-title2">Mutual Connections</h2>
                            </div>
                            <div className="col-sm-8">
                                <div className="pg-my-con-option-full-wrapper">
                                    <div className="pg-my-con-option pg-my-con-option-zoom">
                                        <select>
                                            <option>Zoom</option>
                                        </select>
                                    </div>
                                    <div className="pg-my-con-option pg-my-con-option-sort">
                                        <select>
                                            <option>Sort by</option>
                                        </select>
                                    </div>
                                    <div className="pg-my-con-option pg-my-con-option-filter">
                                        <select>
                                            <option>Filter by</option>
                                        </select>
                                    </div>
                                    <div className="pg-my-con-option pg-my-con-option-view">
                                        <div className="pb-t-note-head-list pb-t-note-head-list-replica">
                                            <div className="pb-t-note-head-list-item pb-t-note-head-active">
                                                <a href="#">
                                                    <img src="../../images/grid.png" alt />
                                                </a>
                                            </div>
                                            <div className="pb-t-note-head-list-item">
                                                <a href="#"><i className="fa fa-bars" /></a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pg-my-con-option pg-my-con-option-search">
                                        <input type="text" placeholder="Search..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row row-clr">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="wrap">
                            {user_elements}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
