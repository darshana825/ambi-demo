import React from 'react';
import Session  from '../../middleware/Session';
import GroupHeader from './GroupHeader';
import Folders from './Folders';
import Discussion from './Discussion';
import Calendar from './Calendar';
import NoteBooks from './NoteBooks';
import TaskManager from './TaskManager';

export default class GroupsLayout extends React.Component {

    constructor(props) {

        let user = Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            groupLayout : 'discussion',
            user: user,
            group_name:'',
            group:{},
            membersCount: 0,
            randomMembers: [],
            members: []
        };

        this.loadMembers = this.loadMembers.bind(this);
        this.loadGroupData = this.loadGroupData.bind(this);
        this.setGroupLayout = this.setGroupLayout.bind(this);

    }

    componentWillMount() {
        this.loadGroupData();
        this.loadMembers();
    }

    /* This function returns all the active members of the group
     * additionally the number of members
     * Objects array of 12 random members( this amount is configurable )
     * are retured
     */
    loadMembers() {
        let data = JSON.stringify({ name_prefix : this.props.params.name});
        $.ajax({
            url: '/groups/get-members',
            method: "POST",
            dataType: "JSON",
            data: data,
            headers : { "prg-auth-header" : this.state.user.token },
            contentType: "application/json; charset=utf-8",
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.setState({randomMembers: data.members.random_members, membersCount: data.members.members_count, members: data.members});
            }
        }.bind(this));
    }

    loadGroupData() {
        var groupPrefix = this.props.params.name;
        let _data = {
            name_prefix : groupPrefix
        };
        $.ajax({
            url : '/groups/get-group',
            method : "POST",
            data : _data,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({group_name: groupPrefix, group: data.group});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
                this.setState({group_name: groupPrefix});
            }
        });
    }

    setGroupLayout(_value) {
        console.log("_value @ setGroupLayout", _value);
        this.setState({groupLayout:_value});
        this.loadGroupData();
        this.loadMembers();
    }

    loadLayoutPage() {

        switch(this.state.groupLayout) {
            case 'discussion':
                return (
                    <Discussion
                        myGroup={this.state.group}
                        onLoadMembers={this.loadMembers}
                        randomMembers={this.state.randomMembers}
                        membersCount={this.state.membersCount}
                        members={this.state.members}
                    />
                );
            case 'calendar':
                return (
                    <Calendar
                        myGroup={this.state.group}
                        randomMembers={this.state.randomMembers}
                        membersCount={this.state.membersCount}
                        members={this.state.members}
                    />
                );
            case 'chat':
                return null;
            case 'notebook':
                return (<NoteBooks myGroup={this.state.group}/>);
            case 'folder':
                return  (<Folders myGroup={this.state.group}/>);
            case 'task_manager':
                return  (<TaskManager myGroup={this.state.group}/>);
            default:
                return null;
        }
    }

    render() {
        return (

            <section className="group-container">
                <div className="container">
                    <GroupHeader myGroup={this.state.group} setGroupLayout={this.setGroupLayout} membersCount={this.state.membersCount} />
                    {this.loadLayoutPage()}
                </div>
            </section>

        );
    }

}
