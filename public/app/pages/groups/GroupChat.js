/**
 * The Index view of the caleder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import CallCenter from '../../middleware/CallCenter';
import Chat from '../../middleware/Chat';
import moment from 'moment';


export default class GroupChat extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            active_group:''
        };

        this.b6 = CallCenter.b6;

    }

    componentDidMount(){
        this.getGroupById(112233); //TODO this should be calling by the component
    }

    /**
     * create a chat group
     * @param group
     */
    createBit6GroupChat(group) {
        console.log("came to createBit6GroupChat");
        console.log(this.state.active_group);
        if(typeof group == 'undefined' || typeof group._id == 'undefined') {
            return;
        }
        const _data = {
            id:'group:proglobe' + group._id, //bit6 chat group id will be equal to db group id
            name:"group:proglobe" + group.name,
            group_name:"group:proglobe" + group.name,
            owner_name:Session.getSession('prg_lg').user_name,
            owner_id:Session.getSession('prg_lg').id,
            members: group.members
        }
        Chat.initGroupChat1(this.b6, _data, function(err, resultSet) {
            if(err) {
                console.log("error");
            } else {
                console.log("group created");
                console.log(resultSet);
            }

        });
    }

    /**
     * Remove entire bit6 chat group
     * @param group
     */
    removeBit6ChatGroupById(group) {
        if(!this.isGroupOwner(group)) {
            return;
        }

        Chat.removeEntireGroup(this.b6, group.id);
    }

    /**
     * Add a member to a chat group
     * @param member
     * @param group
     */
    addMemberToChatGroup(member, group) {

        if(!this.isGroupOwner(group)) {
            return;
        }

        Chat.addAnotherMemberToGroupChat(this.b6, member, group, 16);
    }

    /**
     * Remove a member from the chat group
     * @param member
     * @param group
     */
    removeMemberFromChatGroup(member, group) {

        if(!this.isGroupOwner(group)) {
            return;
        }

        Chat.removeMemberFromGroupChat(this.b6, member, group);
    }

    /**
     * leave current from a chat group
     * @param group
     */
    leaveChatGroup(group) {
        Chat.leaveFromGroupChat(this.b6, group);
    }

    /**
     * join user to a group
     * @param group
     */
    joinChatGroup(group) {
        //let gg = Chat.getGroupById(this.b6, group);
        Chat.joinGroupChat(this.b6, group);
        //TODO Check if the session user is a member or owner of this group
        // if(typeof gg != 'undefined' && typeof gg.id != 'undefined' && gg) {
        //     let members = gg.members;
        //     if(typeof members == 'undefined' || !members) {
        //       return;
        //     }
        //     for(let usrObj in members) {
        //         if(usrObj.id.split('proglobe')[1] == Session.getSession('prg_lg').user_name) {
        //             Chat.joinGroupChat(this.b6, group);
        //         }
        //     }
        // }
    }


    /**
     * verify if  user is the admin n owner of this group
     * @param id
     */
    isGroupOwner(id) {
        let gg = Chat.getGroupById(this.b6, id);
        //TODO verify group created_by with session user. Then if user is the admin n owner of this group only allow to remove the group
        console.log("bit6 owner >", gg.me.identity.split('proglobe')[1]);
        console.log("logged user >", Session.getSession('prg_lg').user_name);

        return gg.meta.owner_name.split('proglobe')[1] == Session.getSession('prg_lg').user_name;
        //return true;
    }

    /**
     * get db group by id and set to state
     * @param id
     */
    getGroupById(id) {
        //TODO get group from db


        let grpMembr1 = {
            name:'test1.test1.95194',
            user_id:'57b54c97cf9bf97507f49d3a',
            status:3,
            permissions:1,
            join_date: moment().format('YYYY-MM-DD')
        }
        let grpMembr2 = {
            name:'test2.me.42436',
            user_id:'57d7d7c80e7d811f094ca2c3',
            status:3,
            permissions:1,
            join_date: moment().format('YYYY-MM-DD')
        }

        var group = {
            _id:'1qaz2wsx3edc4rfv5tgb6yhn7ujm',
            type: 1,
            name: 'group_chat',
            description: 'testing group chat',
            color: 'reg',
            group_pic_link: '',
            created_by: '57ac2195cd230e11097e0fb1',
            members: [grpMembr1, grpMembr2],
            created_at: moment().format('YYYY-MM-DD'),
            updated_at: moment().format('YYYY-MM-DD')
        };

        this.setState({active_group:group});
    }

    onMakeGroup() {
        console.log("came to onMakeGroup");

        this.createBit6GroupChat(this.state.active_group);
    }

    onLoadGroup() {
        console.log("came to onLoadGroup");
        let _groupId = "vuj6xSeeGxuIpry6xCLkLV";
        let gg = Chat.getGroupById(this.b6, _groupId);
        console.log("group loaded > ", gg);
        console.log(gg);
    }

    onDeleteGroup() {
        console.log("came to onDeleteGroup");
        let _groupId = "TUAxQ1QHGe1GMVlU2JR7OV";

        this.removeBit6ChatGroupById(_groupId);
    }

    onAddMember() {
        console.log("came to onAddMember");
        let _groupId = "vuj6xSeeGxuIpry6xCLkLV";

        let grpMembr = {
            name:'pra1.sad.36901',
            user_id:'57ce6f44eab4d65510d60304',
            status:3,
            permissions:1,
            join_date: moment().format('YYYY-MM-DD')
        }

        this.addMemberToChatGroup(grpMembr, _groupId);
    }

    onRemoveMember() {
        console.log("came to onRemoveMember");
        let _groupId = "vuj6xSeeGxuIpry6xCLkLV";

        let grpMembr = {
            name:'pra1.sad.36901',
            user_id:'57ce6f44eab4d65510d60304',
            status:3,
            permissions:1,
            join_date: moment().format('YYYY-MM-DD')
        }

        this.removeMemberFromChatGroup(grpMembr, _groupId);
    }


    render() {

        return (

                /*<div>
                    <div className="col-sm-3" onClick={() => this.onMakeGroup()}>
                        <h2>Create group</h2>
                    </div>
                    <div className="col-sm-3" onClick={() => this.onLoadGroup()}>
                        <h2>Load group</h2>
                    </div>
                    <div className="col-sm-3" onClick={() => this.onDeleteGroup()}>
                        <h2>Remove group</h2>
                    </div>
                    <div className="col-sm-3" onClick={() => this.onAddMember()}>
                        <h2>Add Member</h2>
                    </div>
                    <div className="col-sm-3" onClick={() => this.onRemoveMember()}>
                        <h2>Remove Member</h2>
                    </div>
                    <div className="col-sm-3" onClick={() => this.leaveChatGroup("vuj6xSeeGxuIpry6xCLkLV")}>
                        <h2>Leave Chat</h2>
                    </div>
                    <div className="col-sm-3" onClick={() => this.joinChatGroup("vuj6xSeeGxuIpry6xCLkLV")}>
                        <h2>Join Chat</h2>
                    </div>
                </div>*/
                null


        );
    }
}
