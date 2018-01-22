/**
 * The Group discussion page
 */
import React from 'react';
import moment from 'moment';
import _grep from 'grep-from-array';

import Session  from '../../middleware/Session';
import Lib    from '../../middleware/Lib';

import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class TaskManager extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        var group = this.props.myGroup;
        this.state = {
            user : user,
            currentGroup : group,
            defaultPriorityTab : 0, // Priority 0[All] | Priority 1 | Priority 2 | Priority 3,
            newTasks : [],
            newTasksCount : 0,
            existingTasks: [],
            rawTasks: [],
            isModelOpen : false,
            emptyPriorityTaskID : "",
            emptyPriorityGrpID : "",
            emptyPriorityIDSelected : 3,
            tabList : {"all" : 0, "first" : 0, "second" : 0, "third" : 0}
        };

        this.month = moment().startOf("day");
        this.calendarOrigin = 2; // PERSONAL_CALENDAR || GROUP_CALENDAR
        this.changePriorityTab = this.changePriorityTab.bind(this);
        this.loadNewTasks = this.loadNewTasks.bind(this);
        this.loadEvents = this.loadEvents.bind(this);
    }

    componentWillMount() {
        this.loadNewTasks();
        this.loadEvents();
    }

    openModel(taskId, grpID) {
        this.setState({isModelOpen : true, emptyPriorityTaskID : taskId, emptyPriorityGrpID : grpID});
    }

    closeModel() {
        this.setState({isModelOpen : false, emptyPriorityIDSelected : 3});
    }

    loadNewTasks() {
        let postData = {
            start_date: moment().format('YYYY-MM-DD'),
            events_type : 3, // 1 - event | 2 - todo | 3 - task
            group_id : this.state.currentGroup._id,
            calendar_origin : this.calendarOrigin,
            status : 1 // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
        };

        $.ajax({
            url : '/calendar/task/new-list',
            method : "GET",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({newTasks: data.events, newTasksCount : data.event_count});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    loadEvents() {
        let _this = this;
        let postData = {
            start_date: moment().format('YYYY-MM-DD'),
            events_type : 3, // 1 - event | 2 - todo | 3 - task
            group_id : this.state.currentGroup._id,
            calendar_origin : this.calendarOrigin
        };

        $.ajax({
            url : '/calendar/task/priority-list',
            method : "GET",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({existingTasks: data.events, rawTasks: data.events}, function(){
                        _this.changePriorityTab(_this.state.defaultPriorityTab);
                    });
                    this.tabListSum(data.events);
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });

    }

    tabListSum(_events){
        let p1, p2, p3,
            userLoggedIn = this.state.user;
            p1 = p2 = p3 = 0;
            
        for(var key in _events){
            if(_events[key].priority == 0){
                for(let i in _events[key].shared_users){
                    if(_events[key].shared_users[i].id == userLoggedIn.id){
                        if(_events[key].shared_users[i].priority == 1){
                            p1++;
                        }
                        if(_events[key].shared_users[i].priority == 2){
                            p2++;
                        }
                        if(_events[key].shared_users[i].priority == 3){
                            p3++;
                        }
                    }
                }
            }else{
                if(_events[key].priority == 1){
                    p1++;
                }
                if(_events[key].priority == 2){
                    p2++;
                }
                if(_events[key].priority == 3){
                    p3++;
                }
            }
        }

        this.setState({tabList : {"all" : _events.length, "first" : p1, "second" : p2, "third" : p3}});
    }

    componentWillReceiveProps(nextProps) {}

    changePriorityTab(priority) {
        let rawTasks = this.state.rawTasks;
        if(priority == 0){
            this.setState({existingTasks: rawTasks, defaultPriorityTab : priority});
        }else {
            let formattedTasks = [], userLoggedIn = this.state.user;

            for(let i=0; i < rawTasks.length; i++){
                if(rawTasks[i].priority == priority){
                    formattedTasks.push(rawTasks[i]);
                }

                if(rawTasks[i].priority == 0){
                    if(rawTasks[i].user_id != userLoggedIn.id) {
                        let shared_user = _grep(rawTasks[i].shared_users, function (e) {
                            return e.id.toString() == userLoggedIn.id.toString();
                        });

                        if(shared_user[0].priority == priority){
                            formattedTasks.push(rawTasks[i]);
                        }
                    }
                }
            }
            this.setState({existingTasks: formattedTasks, defaultPriorityTab : priority});
        }

    }

    taskCompletion(_task) {

        let user = this.state.user;

        if(_task.user_id == user.id) {
            this.taskFullCompletion(_task, user.token);
        } else {
            this.taskSharedCompletion(_task, user.token);
        }

    }

    taskFullCompletion(_task, _token) {

        let user =  this.state.user;
        let postData = {
            id : _task._id,
            status : (_task.status == 1 ? 2 : 1 )  //1 - PENDING STATUS, 2 - COMPLETED STATUS
        };

        $.ajax({
            url: '/calendar/event/completion',
            method: "POST",
            dataType: "JSON",
            data: postData,
            headers : { "prg-auth-header" : _token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.loadEvents();
            }
        }.bind(this));
    }

    taskSharedCompletion(_task, _token) {

        let user =  this.state.user;
        let postData = {
            id : _task._id,
            shared_user_id: user.user_id,
            status : 4 //TASK COMPLETED STATUS
        };
        $.ajax({
            url: '/calendar/shared/event/completion',
            method: "POST",
            dataType: "JSON",
            data: postData,
            headers : { "prg-auth-header" : _token },
        }).done(function (data, text) {
            if(data.status.code == 200){
                this.loadEvents();
            }
        }.bind(this));
    }

    setPriority(_id){
        this.setState({emptyPriorityIDSelected : _id});
    }

    saveSetPriority(){
        var postData = {
            event_id : this.state.emptyPriorityTaskID,
            group_id: this.state.emptyPriorityGrpID,
            priority : this.state.emptyPriorityIDSelected,
            status : 'REQUEST_ACCEPTED', // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
        };

        $.ajax({
            url : '/calendar/task/respond',
            method : "POST",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.closeModel();
                    this.loadNewTasks();
                    this.loadEvents();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    prioritySetPopup(){
        let selected = this.state.emptyPriorityIDSelected;

        return(
            <div>
                {this.state.isModelOpen &&
                <ModalContainer zIndex={9999}>
                    <ModalDialog width="402px" style={{marginTop : "-100px", padding : "0"}}>
                        <div className="popup-holder">
                            <div className="notification-alert-holder priority-set-popup">
                                <div className="model-header">
                                    <h3 className="modal-title">set task priority to</h3>
                                </div>
                                <div className="model-body clearfix">
                                    <div className={selected == 1 ? "col-sm-4 priority-col selected" : "col-sm-4 priority-col"} onClick={(e) => this.setPriority(1)}>
                                        <span className="selected-icon"></span>
                                        <p>priority 01</p>
                                    </div>
                                    <div className={selected == 2 ? "col-sm-4 priority-col selected" : "col-sm-4 priority-col"} onClick={(e) => this.setPriority(2)}>
                                        <span className="selected-icon"></span>
                                        <p>priority 02</p>
                                    </div>
                                    <div className={selected == 3 ? "col-sm-4 priority-col selected" : "col-sm-4 priority-col"} onClick={(e) => this.setPriority(3)}>
                                        <span className="selected-icon"></span>
                                        <p>priority 03</p>
                                    </div>
                                </div>
                                <div className="model-footer">
                                    <button className="btn cancel-btn" onClick={this.closeModel.bind(this)}>cancel</button>
                                    <button className="btn delete-btn" onClick={this.saveSetPriority.bind(this)}>set</button>
                                </div>
                            </div>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    render() {
        let priorityList = '';

        switch (this.state.defaultPriorityTab) {
            case 3:
                priorityList = <PriorityTaskList priority="3" currentGroup={this.state.currentGroup} existingTasks={this.state.existingTasks} taskCompletion={this.taskCompletion.bind(this)}/>
                break;
            case 2:
                priorityList = <PriorityTaskList priority="2" currentGroup={this.state.currentGroup} existingTasks={this.state.existingTasks} taskCompletion={this.taskCompletion.bind(this)}/>
                break;
            case 1:
                priorityList = <PriorityTaskList priority="1" currentGroup={this.state.currentGroup} existingTasks={this.state.existingTasks} taskCompletion={this.taskCompletion.bind(this)}/>
                break;
            default:
                priorityList = <PriorityTaskList priority="0" currentGroup={this.state.currentGroup} existingTasks={this.state.existingTasks}  taskCompletion={this.taskCompletion.bind(this)}/>
        }

        let _this = this;
        let newTaskList = this.state.newTasks.map(function(event,key){
            return <NewTask
                        key={key}
                        task={event}
                        loadNewTasks={() => _this.loadNewTasks()}
                        loadPriorityTask={_this.changePriorityTab}
                        group={_this.state.currentGroup}
                        emptyPriority={_this.openModel.bind(_this)}
                        addToExisting={() => _this.loadEvents()}
            />
        });

        return (
            <section className="group-tasks-content group-content">
                <section className="new-task-holder">
                    <div className="section-header">
                        <h3 className="section-title">New tasks <span className="task-notifi">({this.state.newTasksCount})</span></h3>
                    </div>
                    { this.state.newTasks.length > 0 ?
                        newTaskList
                    :
                        <div className="new-task-wrapper clearfix"><p>There are no new tasks assigned to you</p></div>
                    }
                </section>
                <section className="priority-task-holder">
                    <div className="section-header clearfix">
                        <h3 className="section-title pull-left">Existing task priorities</h3>
                        <div className="tab-holder">
                            <p
                                className={this.state.defaultPriorityTab == 0 ? "active tab priority-00" : "tab priority-00"}
                                onClick={() => this.changePriorityTab(0)}>
                                All Tasks
                                {
                                    (this.state.tabList.all != 0)?
                                        <span className="all-tasks">{this.state.tabList.all}</span>
                                    :
                                        null
                                }
                            </p>
                            <p
                                className={this.state.defaultPriorityTab == 1 ? "active tab priority-01" : "tab priority-01"}
                                onClick={() => this.changePriorityTab(1)}>
                                Priority 1
                                {
                                    (this.state.tabList.first != 0)?
                                        <span className="all-tasks">{this.state.tabList.first}</span>
                                        :
                                        null
                                }
                            </p>
                            <p
                                className={this.state.defaultPriorityTab == 2 ? "active tab priority-02" : "tab priority-02"}
                                onClick={() => this.changePriorityTab(2)}>
                                Priority 2
                                {
                                    (this.state.tabList.second != 0)?
                                        <span className="all-tasks">{this.state.tabList.second}</span>
                                        :
                                        null
                                }
                            </p>
                            <p
                                className={this.state.defaultPriorityTab == 3 ? "active tab priority-03" : "tab priority-03"}
                                onClick={() => this.changePriorityTab(3)}>
                                Priority 3
                                {
                                    (this.state.tabList.third != 0)?
                                        <span className="all-tasks">{this.state.tabList.third}</span>
                                        :
                                        null
                                }
                            </p>
                        </div>
                    </div>
                    {priorityList}
                </section>
                {this.prioritySetPopup()}
            </section>
        );
    }
}

/**
 * New task element
 */
export class NewTask extends React.Component{

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user
        };

        this.acceptTask = this.acceptTask.bind(this);
        this.declineTask = this.declineTask.bind(this);
    }

    declineTask(taskId) {

        var postData = {
            event_id:taskId,
            group_id: this.state.group._id,
            status : 'REQUEST_REJECTED', // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
        };

        $.ajax({
            url : '/calendar/task/respond',
            method : "POST",
            data : postData,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.props.loadNewTasks();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    acceptTask(taskId, groupID, taskPriority) {
        if(taskPriority == 0){
            this.props.emptyPriority(taskId, groupID);
        }else{
            var postData = {
                event_id : taskId,
                group_id: this.props.group._id,
                status : 'REQUEST_ACCEPTED', // REQUEST_PENDING: 1, REQUEST_REJECTED: 2, REQUEST_ACCEPTED: 3
            };
            this.props.loadNewTasks();
            $.ajax({
                url : '/calendar/task/respond',
                method : "POST",
                data : postData,
                dataType : "JSON",
                headers : { "prg-auth-header" : this.state.user.token },
                success : function (data, text) {
                    if (data.status.code == 200) {
                        this.props.loadNewTasks();
                        this.props.addToExisting();
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(error);
                }
            });            
        }

    }

    render() {
        let task = this.props.task;

        return (
            <div className="new-task-wrapper clearfix">
                <div className="task-info col-sm-7">
                    <div className="pro-pic pull-left">
                        <img src={task.user_image} className="img-responsive img-circle" />
                    </div>
                    <div className="task-assigned pull-left clearfix">
                        <p className="task-owner pull-left">{task.user_name}</p>
                        <span className="assign-txt pull-left">Assigned:</span>
                        <p className="task pull-left">{task.plain_text}</p>
                    </div>
                </div>
                <div className="task-time col-sm-2">
                    <p className="time">Finish by <span className="end-time">{moment(task.start_date_time).format('dddd, h.mma')}</span></p>
                </div>
                <div className="task-action col-sm-3">
                    <button className="btn btn-decline" onClick={() => this.declineTask(task._id)}>Decline</button>
                    <button className="btn btn-accept" onClick={() => this.acceptTask(task._id, task.group_id, task.priority)}>Accept</button>
                </div>
            </div>
        );
    }
}

/**
 * Priority tasks list element
 */
export class PriorityTaskList extends React.Component{

    constructor(props) {
        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            user : user,
            tasks : this.props.existingTasks,
            currentGroup : this.props.currentGroup,
            priority : this.props.priority
        };

        this.calendarOrigin = 2; // PERSONAL_CALENDAR || GROUP_CALENDAR
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            tasks: nextProps.existingTasks
        });
    }

    render() {
        let _this = this;
        let taskList = this.state.tasks.map(function(task,key){
            return <PriorityTask task={task} taskCompletion={(e) => _this.props.taskCompletion(task)} key={key} />
        });

        return (
            <div className="priority-task-list">
                {this.state.tasks.length > 0 ?
                    taskList
                : (this.props.priority == 0) ?
                    <p>There are no tasks listed in the queue</p>
                :
                    <p>There are no tasks under priority {this.props.priority}</p>
                }
            </div>
        );
    }
}


/**
 * Priority task element
 */
export class PriorityTask extends React.Component{

    constructor(props) {
        let user =  Session.getSession('prg_lg');
        super(props);
        this.state = {
            task : this.props.task,
            user : user
        };
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.task != this.state.task) {
            this.setState({task : nextProps.task});
        }
    }

    render() {
        let {task} = this.state,
            _this = this,
            memberList = <span className="mem-name">Only me</span>;

        if(task.shared_users.length > 0) {
            memberList = _this.state.task.shared_users.map(function(member,key){
                return <span className="mem-name" key={key}>{_this.state.task.shared_users.length > key ? member.name : member.name}</span>
            });
        }

        return (
            <div className={(task.status == 1)? "task-wrapper active clearfix" : "task-wrapper completed clearfix"}>
                <div className={(task.status == 2)? "task-info ticked col-sm-8" : "task-info col-sm-8"}>
                    <div className="checkbox-wrapper" onClick={(e) => this.props.taskCompletion(task)}>
                        {
                            (task.status == 2)?
                                <i className="fa fa-check" aria-hidden="true"></i>
                            :
                                null
                        }
                    </div>
                    <p className="task-title">{task.plain_text}</p>
                    <p className="task-members clearfix">People on this task : {memberList}</p>
                </div>
                <div className="task-time pull-left">
                    <p className="time">Finish by <span className="end-time">{moment(task.start_date_time).format('dddd, h.mma')}</span></p>
                </div>
            </div>
        );
    }
}
