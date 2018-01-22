/**
 * The Group discussion page
 */
import React from 'react';
import Session  from '../../middleware/Session';

export default class GroupHeader extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            user : user,
            group : this.props.myGroup,
            members_count : this.props.membersCount,
            activeLayout : 'discussion'
        };
        this.setActiveLayout = this.setActiveLayout.bind(this);
    }

    setActiveLayout(_value) {
        this.props.setGroupLayout(_value);
        this.setState({activeLayout:_value});
    }


    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.myGroup != 'undefined' && nextProps.myGroup) {
            this.setState({group: nextProps.myGroup, members_count: nextProps.membersCount});
        }
    }


    render() {
        return (
            <section className="group-header">
                <div className="header-top">
                    <div className="banner">
                        <img src="../images/group/group-header-bg.png" alt="banner" className="banner-img" />
                    </div>
                    <div className="members-holder">
                        <span className="member-icon"></span>
                        <div className="mem-count">
                            <span className="member-count">{this.state.members_count}</span>
                            <p className="mem-text">Members</p>
                        </div>
                    </div>
                </div>
                <div className="header-bottom clearfix">
                    <div className="prof-img-holder">
                        <img src=   {this.state.group.group_pic_link ? this.state.group.group_pic_link : "../images/group/grp-profile-pic.png"} alt="grp-pic" />
                    </div>
                    <div className="left-nav-wrapper clearfix">
                        <div className={this.state.activeLayout=='discussion' ? "nav-item first-item group-discussion active" : "nav-item first-item group-discussion"} onClick={() => this.setActiveLayout('discussion')}>
                            <p className="nav-text">group discussion</p>
                        </div>
                        <div className={this.state.activeLayout=='calendar' ? "nav-item left-second group-calendar active" : "nav-item left-second group-calendar"} onClick={() => this.setActiveLayout('calendar')}>
                            <p className="nav-text">group calendar</p>
                        </div>
                        <div className={this.state.activeLayout=='chat' ? "nav-item left-middle group-chat active" : "nav-item left-middle group-chat"} onClick={() => this.setActiveLayout('chat')}>
                            <p className="nav-text">group chat</p>
                        </div>
                    </div>
                    <div className="right-nav-wrapper clearfix">
                        <div className={this.state.activeLayout=='notebook' ? "nav-item right-middle group-notebooks active" : "nav-item right-middle group-notebooks"} onClick={() => this.setActiveLayout('notebook')}>
                            <p className="nav-text">group notebooks</p>
                        </div>
                        <div className={this.state.activeLayout=='folder' ? "nav-item right-second group-folders active" : "nav-item right-second group-folders"} onClick={() => this.setActiveLayout('folder')}>
                            <p className="nav-text">group folders</p>
                        </div>
                        <div className={this.state.activeLayout=='task_manager' ? "nav-item last-item group-tasks active" : "nav-item last-item group-tasks"} onClick={() => this.setActiveLayout('task_manager')}>
                            <p className="nav-text">Task Manager</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
