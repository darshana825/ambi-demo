/**
 * This is Connection view file that handle connections
 */
import React from 'react';
import Session  from '../../middleware/Session';
import UserBlockTileView from '../../components/elements/UserBlockTileView';
import UserBlockThumbView from '../../components/elements/UserBlockThumbView';
import Lib from '../../middleware/Lib';
import Slider from 'react-slick';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state ={
            friend_requests:[],
            friend_suggestions:[],
            my_connections:[],
            show_request_skip:false,
            show_suggestion_skip:false,
            switchTab: {
                connectionTab: "ALL_CONNECTIONS",
                myConnectionTab: "ALL_CONNECTIONS"
            }
        };

        this.loggedUser = Session.getSession('prg_lg');

        this.loadFriendRequests();
        this.loadFriendSuggestions();
        this.loadMyConnections();
        this.allFriendRequest = [];
        this.allFriendSugestions = [];

        this.switchType = this.switchType.bind(this);

    }

    switchType(connectionType, myConnectionType){
        if(connectionType != null){
            this.setState({
                switchTab:{connectionTab: connectionType}
            });
        }
        if(myConnectionType != null){
            this.setState({
                switchTab:{myConnectionTab: myConnectionType}
            });
        }
    }

    loadFriendRequests(){
        $.ajax({
            url: '/connection/requests',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ page_count: 3},
        }).done(function(data){
            if(data.status.code == 200){

                if( data.req_cons.length > 0) {
                    this.setState({friend_requests: data.req_cons});
                }

                // let _tmp_req_cons = [];
                // if( data.req_cons.length > 0){
                //     this.allFriendRequest = data.req_cons;
                //     let _end = (this.allFriendRequest.length < 3)?this.allFriendRequest.length:3;
                //     for(let a = 0 ; a < _end;a++){
                //         _tmp_req_cons.push(this.allFriendRequest[a]);
                //     }
                //
                // }
                // if(data.req_cons.length > 3){
                //     this.setState({show_request_skip:true})
                // }else{
                //     this.setState({show_request_skip:false})
                // }
                //
                // this.setState({friend_requests:_tmp_req_cons})
            }
        }.bind(this));
    }
    onAcceptFriendRequestSuccess(isAccept){
        this.loadFriendRequests();
        let _this =  this;
        window.setTimeout(function() {
            _this.loadMyConnections();
            console.log("am I .")
        }, 2000);

    }
    onFriendRequestSkip(user,_current_block_ids){
        var data = {
            current_active_data_block:this.state.friend_requests,
            full_data_set:this.allFriendRequest,
            current_block_ids:_current_block_ids,
            user_id:user.user_id
        };

        var _friend_request =  this.getUniqueDataObjects(data);
        this.setState({friend_requests:_friend_request});

    }

    getUniqueDataObjects(data){

        let _current_active_data_block = data.current_active_data_block;
        let _new_user_request_list = [];
        if(data.full_data_set.length > 2 ){
            for(let a = 0 ; a < data.full_data_set.length;a++){
                if(data.current_block_ids.indexOf(data.full_data_set[a].user_id) == -1){
                    _new_user_request_list.push(data.full_data_set[a]);
                }
            }
            //REPLACE NEW OBJECT
            let _skipped_user_position = data.current_block_ids.indexOf(data.user_id);
            let rand_number = Lib.getRandomInt(0,_new_user_request_list.length - 1);
            let new_user_request = _new_user_request_list[rand_number];
            _current_active_data_block.splice(_skipped_user_position,1,new_user_request);

            return _current_active_data_block;

        }
    }

    loadFriendSuggestions(){
        $.ajax({
            url: '/connection/suggestion',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){
                let _tmp_suggestions = [];

                if( data.connections.length > 0){

                    this.setState({friend_suggestions:data.connections});

                    // this.allFriendSugestions = data.connections;
                    //
                    // let _end = (this.allFriendSugestions.length < 3)?this.allFriendSugestions.length:3;
                    // for(let a = 0 ; a < _end;a++){
                    //     _tmp_suggestions.push(this.allFriendSugestions[a]);
                    // }

                }

                // if( data.connections.length > 3){
                //     this.setState({show_suggestion_skip:true})
                // }
                //
                // this.setState({friend_suggestions:_tmp_suggestions});

            }
        }.bind(this));
    }
    onAddFriendSuccess(){

        location.reload();
    }
    onFriendSuggestionSkip(user,_current_block_ids){

        var data = {
            current_active_data_block:this.state.friend_suggestions,
            full_data_set:this.allFriendSugestions,
            current_block_ids:_current_block_ids,
            user_id:user.user_id
        };

        var _tmp_suggestions = this.getUniqueDataObjects(data);
        this.setState({friend_suggestions:_tmp_suggestions});

    }

    loadMyConnections(){
        $.ajax({
            url: '/connection/me',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){


                this.setState({my_connections:data.my_con})

            }
        }.bind(this));
    }

    render(){
        const {
            friend_requests,
            friend_suggestions,
            my_connections,
            show_request_skip,
            show_suggestion_skip,
            switchTab
            }=this.state;


        return (


            <div>
                <section className="connections-container">
                    <div className="container">
                        <div className="connections-header">
                            <h2 className="connections-title my-profile">connections</h2>
                            <div className="tabs-wrapper">
                                <div className={switchTab.connectionTab == "ALL_CONNECTIONS" ? "connection-type active" : "connection-type"} onClick={() => this.switchType('ALL_CONNECTIONS', null)}>
                                    <h3>all connections</h3>
                                    <div className="highlighter"></div>
                                </div>
                                <div className={(switchTab.connectionTab == "RECENTLY_ADDED") ? "connection-type active" : "connection-type"} onClick={() => this.switchType('RECENTLY_ADDED', null)}>
                                    <h3>recently added</h3>
                                    <div className="highlighter"></div>
                                </div>
                                <div className={(switchTab.connectionTab == "COLLEGE") ? "connection-type active" : "connection-type"} onClick={() => this.switchType('COLLEGE', null)}>
                                    <h3>college</h3>
                                    <div className="highlighter"></div>
                                </div>
                            </div>
                            <div className="search-connection">
                                <div className="inner-addon">
                                    <i className="fa fa-search"></i>
                                    <input type="text" className="form-control" placeholder="search"/>
                                </div>
                            </div>
                        </div>


                        <NewConnections title={"friend requests"} connectionType="CONNECTION_REQUEST"
                                        connections={friend_requests} />
                        <NewConnections title={"people you might know"} connectionType="CONNECTION_SUGGESTION"
                                        connections={friend_suggestions} />
                        <MyConnections connections = {my_connections} />

                    </div>
                </section>
            </div>



        )

    }
}

export class NewConnections extends  React.Component {

    constructor(props){
        super(props)
        this.state ={
            connections: this.props.connections
        };
        this.loggedUser = this.props.loggedUser;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.connections !== this.state.connections) {
            this.setState({connections: nextProps.connections});
        }
    }

    acceptFriendRequest(user){
        $.ajax({
            url: '/connection/accept',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ sender_id: user.user_id},

        }).done(function(data){
            if(data.status.code == 200){
                this.props.onAcceptFriendRequestSuccess(true)

            }
        }.bind(this));

    }

    onAddFriend(user){
        let _connectedUsers = [];
        _connectedUsers.push(user.user_id)
        $.ajax({
            url: '/connection/send-request',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{ connected_users: JSON.stringify(_connectedUsers)},

        }).done(function(data){
            if(data.status.code == 200){
                this.props.onAddFriendSuccess(true);
            }
        }.bind(this));

    }

    skipRequest(user,_current_block_ids){
        this.props.onFriendRequestSkip(user,_current_block_ids)
    }


    render(){

        let _this = this, _current_block_ids =[];
        let user_elements = this.state.connections.map(function(friend,key){
            _current_block_ids.push(friend.user_id);

            return (
                <div key = {key}>
                    <UserBlockTileView user = {friend}
                                       onAccept = {user=>_this.acceptFriendRequest(user)}
                                       onAdd = {user=>_this.onAddFriend(user)}
                                       onSkip = {user=>_this.skipRequest(user,_current_block_ids)}
                                       showSkip = {_this.props.show_request_skip}
                                       connectionType = {_this.props.connectionType}/>
                </div>
            );
        });

        let settings = {
            dots: false,
            infinite: false,
            swipe: false,
            swipeToSlide:false,
            speed: 500,
            slidesToShow: 6,
            slidesToScroll: 1,
            nextArrow: <SampleNextArrow />,
            prevArrow: <SamplePrevArrow />
        };

        if(typeof this.props.connections.length == 'undefined' || this.props.connections.length == 0){
            return (<div />)
        }

        return (
            <div className="requests-wrapper">
                <div className="inner-header">
                    <h4 className="section-title">{this.props.title}</h4>
                </div>
                <div className="connection-requests clearfix">
                    <div className="requests">
                         <Slider {...settings}>
                             {user_elements}
                         </Slider>
                    </div>
                </div>
            </div>
        );

    }
}

export class SampleNextArrow extends React.Component {
    render() {
        let clsName;
        if(typeof this.props.className.split(" ")[2] != "undefined" && this.props.className.split(" ")[2] == "slick-disabled"){
            clsName = this.props.className.split(" ")[2] + "next";
        }else {
            clsName = "next";
        }
        return (
            <span {...this.props} className={clsName}></span>
        );
    }
}

export class SamplePrevArrow extends React.Component {
    render(){
        let clsName;
        if(typeof this.props.className.split(" ")[2] != "undefined" && this.props.className.split(" ")[2] == "slick-disabled"){
            clsName = this.props.className.split(" ")[2] + " previous";
        }else {
            clsName = "previous";
        }
        return (
            <span {...this.props} className={clsName}></span>
        );
    }
}

export class MyConnections  extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            loggedUser:Session.getSession('prg_lg'),
            connections: this.props.connections,

        };

        this.onSortConnectionsByName = this.onSortConnectionsByName.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.connections !== this.state.connections) {
            this.setState({connections: nextProps.connections});
        }
    }

    onSortConnectionsByName(e){
        let _fieldValue = e.target.value;
        let _this = this;

        $.ajax({
            url: '/connection/me/sort/'+_fieldValue,
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },

        }).done(function(data){
            if(data.status.code == 200){
                _this.setState({connections:data.my_con});
            }
        });
    }


    onUserSelect(user){
        location.href = "/profile/"+user.user_name;
    }

    render(){
        let _this = this;
        if(typeof _this.state.connections == 'undefined'){
            return (<div />)
        }
        let user_elements = _this.state.connections.map(function(friend,key){

            return (
                <UserBlockThumbView user = {friend}
                                    onClick = {user=>_this.onUserSelect(user)}
                                    key = {key}/>


            );
        });
        return(
            <div className="pg-my-connections-wrapper">
                <div className="row row-clr pg-connections-page-header2">
                    <div className="col-xs-10 col-xs-offset-1">
                        <div className="row">
                            <div className="col-sm-4 connection-title-holder">
                                <h2 className="pg-connections-page-header-title2">My Connections</h2>
                            </div>
                            <div className="col-sm-8">
                                <div className="pg-my-con-option-full-wrapper">
                                    <div className="pg-my-con-option pg-my-con-option-zoom">
                                        <select>
                                            <option>Zoom</option>
                                        </select>
                                    </div>
                                    <div className="pg-my-con-option pg-my-con-option-sort">
                                        <select onChange={(event)=>this.onSortConnectionsByName(event)}>
                                            <option selected="" disabled="">Sort by</option>
                                            <option value="name">Name</option>
                                            <option value="date">Date Connected</option>
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
                                                    <img src="images/grid.png" alt />
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


