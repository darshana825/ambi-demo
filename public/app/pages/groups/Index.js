/**
 * The Index view of the group section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Folders  from './Folders';
import Session  from '../../middleware/Session';
import GroupChat  from './GroupChat';
import GroupProfileImageUploader from '../../components/elements/GroupProfileImageUploader';

import SearchMembersField  from './elements/SearchMembersField';

import { Popover } from 'react-bootstrap';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            user : user,
            firstStepOpen : false,
            secondStepOpen : false,
            defaultType : 1,
            groups : [],
            communities: [],
            creatingGroupNow: false
        };
    }

    componentWillMount() {
        var groupPrefix = this.props.params.name;
        let _data = {};
        $.ajax({
            url : '/groups/get-groups',
            method : "POST",
            data : _data,
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    let sortedGroups = this.sortByKeyDES(data.groups, 'created_at');
                    this.setState({groups: sortedGroups});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    sortByKeyDES(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    }

    openFirstStep() {
        this.closeSecondStep();
        this.setState({firstStepOpen : true});
    }

    closeFirstStep() {
        this.setState({firstStepOpen : false});
    }

    openSecondStep() {
        this.closeFirstStep();
        this.setState({secondStepOpen : true });
    }

    closeSecondStep() {
        this.setState({secondStepOpen : false});
    }

    setType(type) {
        this.setState({defaultType : type});
    }

    createGroup(groupData) {

        this.closeSecondStep();
        this.closeFirstStep();
        // adding the values got from the first step
        groupData['_type'] = this.state.defaultType;

        if(this.state.creatingGroupNow != true) {
            console.log("selected type", groupData['_type']);
            this.setState({creatingGroupNow: true});

            console.log(groupData);
            $.ajax({
                url: '/groups/add',
                method: "POST",
                dataType: "JSON",
                data: JSON.stringify(groupData),
                headers : { "prg-auth-header" : this.state.user.token },
                contentType: "application/json; charset=utf-8",
            }).done(function (data, text) {
                if(data.status.code == 200){
                    this.setState({creatingGroupNow: false});
                    if(data.result.name_prefix) {
                        window.location = '/groups/'+data.result.name_prefix;
                    }
                }
            }.bind(this));

        } else {
            console.log("Creating the group", groupData);
        }

    }

    render() {
        var groupBlock = '';
        if(this.state.groups.length > 0 ) {
            groupBlock = this.state.groups.map(function(group,userKey){
                return <a className="list-item clearfix" href={'groups/'+group.name_prefix}>
                    <img src={group.group_pic_link ? group.group_pic_link : "images/group/dashboard/grp-default-icon.png"} alt="Group icon" className="pull-left" />
                    <p className="list-item-title">{group.name}</p>
                </a>
            });
        }
        return (
            <section className="group-dashboard-container">
                <div className="container">
                    <section className="group-dashboard-header">
                        <div className="row">
                            <div className="col-sm-6">
                                <h2>groups</h2>
                            </div>
                            <div className="col-sm-6 action-holder">
                                <div className="header-actions-wrapper">
                                    <div className="crt-grp">
                                        <button className="btn btn-crt-grp" onClick={this.openFirstStep.bind(this)}><i className="fa fa-plus"></i> new group</button>
                                    </div>
                                    <div className="search-group">
                                    <span className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        <input type="text" className="form-control" placeholder="search" />
                                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="group-content">
                        <div className="group-body">
                            <GroupsList handleNext={this.openSecondStep.bind(this)} handleType={this.setType.bind(this)} groups={this.state.groups}
                                        groupType={"my-groups"}/>
                            <GroupsList handleNext={this.openSecondStep.bind(this)} handleType={this.setType.bind(this)} groups={this.state.communities}
                                        groupType={"my-communities"}/>
                        </div>
                    </section>
                </div>
                {this.state.firstStepOpen ?
                    <CreateStepOne
                        handleClose={this.closeFirstStep.bind(this)}
                        handleNext={this.openSecondStep.bind(this)}
                        handleType={this.setType.bind(this)}
                    />
                    : null
                }
                {this.state.secondStepOpen ?
                    <CreateStepTwo
                        handleClose={this.closeSecondStep.bind(this)}
                        handleBack={this.openFirstStep.bind(this)}
                        handleCreate={this.createGroup.bind(this)}
                    />
                    : null
                }
            </section>
        );
    }
}

export class GroupsList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            user: Session.getSession('prg_lg'),
            isCollapsed: true,
            groups: this.props.groups
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.groups !== this.state.groups) {
            this.setState({ groups: nextProps.groups });
        }
    }

    onGroupExpand(){
        let isCollapsedState = this.state.isCollapsed;
        this.setState({isCollapsed : !isCollapsedState});
    }

    setType(type) {
        this.props.handleType(type);
        this.props.handleNext();
    }

    render() {

        let _this = this;
        let groupType = this.props.groupType;

        let groupCls = (groupType == "my-groups") ? "my-groups" : "my-communities";
        let _type = (groupType == "my-groups") ? 1 : 2;

        var groupBlock = '';
        if(this.state.groups.length > 0 ) {
            groupBlock = this.state.groups.map(function(group,key){
                let group_pic = group.group_pic_link ? group.group_pic_link : "/images/group/dashboard/grp-default-icon.png";
                const wallpaper = {
                    backgroundImage: 'url(' + group_pic + ')'
                };
                return (
                    <div className="group-col" key={key}>
                        <a className="list-item clearfix" href={'groups/'+group.name_prefix}>
                            <div className="group-item">
                                <div className="group-title-holder">
                                    <span className="group-image-holder" style={wallpaper}></span>
                                    <p className="group-title">{group.name}</p>
                                </div>
                                <div className="group-member-wrapper">
                                    {(group.created_by == _this.state.user.id) ?
                                        <p className="group-member">owner</p> : <p className="group-member">member</p> }
                                </div>
                            </div>
                        </a>
                    </div>
                )
            });
        }

        return (
            <div className={(_this.state.isCollapsed) ? "row group " + groupCls : "row group see-all " + groupCls}>
                <div className="group-wrapper">
                    <div className="col-sm-2">
                        <div className="group-cover-wrapper">
                            <div className="group-cover">
                                <div className="content-wrapper">
                                    <div className="logo-wrapper">
                                        <img src="/images/group/dashboard/my-groups.png" className="img-rounded"/>
                                    </div>
                                    {
                                        (groupType == "my-groups") ? <h3>my groups</h3> : <h3>my communities</h3>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-10">
                        <div className="row">
                            {
                                (groupType == "my-communities") ?
                                    <div className="coming-soon-overlay">
                                        <p className="title">coming soon!</p>
                                    </div> : null
                            }
                            <div className="group-content-wrapper">
                                <div className="group-items-wrapper">
                                    <div className="group-col">
                                        <div className="group-item create-group-fl" onClick={(type)=>{this.setType(_type)}}>
                                            <i className="fa fa-plus"></i>
                                            {
                                                (groupType == "my-groups") ? <p>create a group</p> : <p>add new community</p>
                                            }
                                        </div>
                                    </div>
                                    {groupBlock}
                                </div>
                                {
                                    (_this.state.groups.length > 4) ?
                                        <div className="see-all" onClick={_this.onGroupExpand.bind(this)}>
                                            <i className={"fa fa-chevron-circle-right " + groupCls} aria-hidden="true"></i>
                                            {
                                                (_this.state.isCollapsed) ? <p>see all</p> : <p>see less</p>
                                            }
                                        </div> : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * Popup 1 - The group creation
 */
export class CreateStepOne extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            activeType : 0,
            moveNextWarning: false
        };
    }

    setType(type) {
        this.setState({activeType : type, moveToNextWarning: false});
        this.props.handleType(type);
    }

    handleNext(){

        if(this.state.activeType == 0){
            this.setState({moveToNextWarning : true});
        }

        if(this.state.activeType == 1){
            this.props.handleNext();
        } else if (this.state.activeType == 2){
            this.props.handleClose();
        }
    }

    render() {
        return (
            <ModalContainer onClose={this.props.handleClose}>
                <ModalDialog onClose={this.props.handleClose} className="modalPopup create-group-type-container">
                    <div className="popup-holder">
                        <div className="create-group-type-popup">
                            <div className="model-header">
                                <h3 className="modal-title">Create a group</h3>
                                <p className="sub-title">discuss, collaborate, connect, and manage tasks, all in one place. ambi groups is your go-to place for team work.</p>
                            </div>
                            <div className="model-body clearfix">
                                <p className="group-type">which kind of group would you like to create?</p>
                                <div className="option-container">
                                    <div  className={this.state.activeType == 1 ? 'selected option' : 'option'}>
                                        <input type="radio" name="group" id="group-select" />
                                        <label for="group-select" onClick={(type)=>{this.setType(1)}}>
                                            <div className="select-content clearfix">
                                                <span className="type-icon group"></span>
                                                <div className="type-content">
                                                    <h3 className="type-title">group</h3>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className={this.state.activeType == 2 ? 'selected option' : 'option'}>
                                        <input type="radio" name="group" id="community-select" />
                                        <label for="group-select" onClick={(type)=>{this.setType(2)}}>
                                            <div className="select-content clearfix">
                                                <span className="type-icon community"></span>
                                                <div className="type-content">
                                                    <h3 className="type-title">community</h3>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {
                                    (this.state.moveToNextWarning) ? <p className="warning">please select a group!</p> : null
                                }
                            </div>
                            <div className="model-footer">
                                {
                                    (this.state.activeType == 2) ?
                                        <button className="btn btn-create-group" style={{backgroundColor: "#b0b3bc"}} onClick={this.handleNext.bind(this)}>coming soon</button> :
                                            <button className="btn btn-create-group" onClick={this.handleNext.bind(this)}>next</button>
                                }
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}

/**
 * Popup 1 - The group creation
 */
export class CreateStepTwo extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            groupColor : '',
            groupName : '',
            groupDescription : '',
            members : [],
            sharedWithIds : [],
            groupProfileImgSrc : '',
            groupProfileImgId : '',
            warningStateName: false,
            warningStateColor: false,
            warningStateImage: false,
            uploadingImage: "init",
            uploadingImageAlert: ''
        };

        this.sharedWithIds = [];
        this.members = [];
        this.loggedUser = Session.getSession('prg_lg');

        this.setName = this.setName.bind(this);
        this.setDescription = this.setDescription.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.imgUpdated = this.imgUpdated.bind(this);
        this.handleSearchUser = this.handleSearchUser.bind(this);
    }

    setColor(color) {
        this.setState({ groupColor : color, warningStateColor: false});
    }

    setName(event) {
        this.setState({groupName : event.target.value, warningStateName : false});
    }

    setDescription(event) {
        this.setState({groupDescription : event.target.value});
    }

    handleCreate(event) {
        event.preventDefault();

        if(this.state.groupName == '' || this.state.groupName.length == 0){
            this.setState({ warningStateName : true});
        }
        if(this.state.groupColor == '' || this.state.groupColor.length == 0){
            this.setState({ warningStateColor : true});
        }
        if(this.state.uploadingImage == 'uploading' || this.state.uploadingImage == 'uploading-error'){
            this.setState({
                warningStateImage : true,
                uploadingImageAlert: 'please wait until the group image is getting uploaded.'
            });
        }

        if((this.state.groupName != '' || this.state.groupName.length != 0) &&
            (this.state.groupColor != '' || this.state.groupColor.length != 0) &&
            (this.state.uploadingImage == "init" || this.state.uploadingImage == "uploading-done")) {
            this.setState({ warningStateName : false, warningStateColor: false});

            var groupData = {
                _name : this.state.groupName,
                _description : this.state.groupDescription,
                _color : this.state.groupColor,
                _members : this.state.members,
                _group_pic_link : this.state.groupProfileImgSrc,
                _group_pic_id : this.state.groupProfileImgId
            }
            this.props.handleCreate(groupData);
        }
    }

    handleSearchUser(sharedWithIds, members){
        this.setState({sharedWithIds: sharedWithIds, members: members});
    }

    imgUpdated(data){

        this.setState({
            warningStateImage: true,
            uploadingImage : "uploading",
            uploadingImageAlert: ''
        });

        let _this =  this;
        $.ajax({
            url: '/groups/upload-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':_this.loggedUser.token },
            data:{image:data,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {
                    _this.setState({
                        uploadingImage : "uploading-done",
                        warningStateImage: false,
                        groupProfileImgSrc : data.upload.http_url,
                        groupProfileImgId : data.upload.document_id
                    });
                }
            },
            error: function (request, status, error) {
                _this.setState({
                    warningStateImage: true,
                    uploadingImage : "uploading-error",
                    uploadingImageAlert: 'there was an error occurred. Please upload again.'
                });
            }
        });
    }

    colorPicker(e){
        let colorCls = e.target.getAttribute('data-color');
        this.setState({groupColor : colorCls, isFolderClrEmpty: false});
    }

    isActive(value){
        return ((value===this.state.groupColor) ? 'palette active': 'palette');
    }

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: 'Type a name...',
            value,
            onChange: this.onChange,
            className: 'form-control'
        };
        let shared_with_list = [];
        if(this.state.members.length > 0){
            shared_with_list = this.state.members.map((member,key)=>{
                return <span key={key} className="user">{member.name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
            });
        }

        const uploadScript = (

                (this.state.uploadingImage == "uploading") ?
                    <span><i className="fa fa-spinner fa-spin"></i> uploading</span>
                :
                (this.state.uploadingImage == "uploading-done") ?
                    <span><i className="fa fa-check"></i> upload new</span>
                :
                (this.state.uploadingImage == "uploading-error") ?
                    <span><i className="fa fa-thumbs-down"></i> upload new</span>
                :
                    <span>upload new</span>

        )

        /*return (
            <ModalContainer>
                <ModalDialog className="modalPopup">
                    <div className="popup-holder">
                        <div className="create-group-popup">
                            <div className="model-header">
                                <h3 className="modal-title">Create a group</h3>
                                <span className="close-icon" onClick={this.props.handleClose}></span>
                            </div>
                            <div className="model-body clearfix">
                                <section className="folder-body">
                                    <div className="form-group">
                                        <label for="grpname">Group name</label>
                                        <input type="text" className="form-control" id="grpname" onChange={this.setName}/>
                                    </div>
                                    <div className="form-group invite-people clearfix">
                                        <label>Members</label>
                                        <SearchMembersField
                                            handleSearchUser={this.handleSearchUser}
                                            placeholder=""
                                            sharedWithIds={this.state.sharedWithIds}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label for="desc">Description</label>
                                        <textarea className="form-control" rows="5" id="desc" onChange={this.setDescription}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <p className="label">Choose a colour</p>
                                        <div className="color-palette">
                                            <div  className={this.state.groupColor == '#ed0677' ? 'active pink' : 'pink'} onClick={(color)=>{this.setColor('#ed0677')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#1b9ed9' ? 'active light-blue' : 'light-blue'} onClick={(color)=>{this.setColor('#1b9ed9')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#a2c73e' ? 'active light-green' : 'light-green'} onClick={(color)=>{this.setColor('#a2c73e')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#b01d5a' ? 'active red' : 'red'} onClick={(color)=>{this.setColor('#b01d5a')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#091652' ? 'active dark-blue' : 'dark-blue'} onClick={(color)=>{this.setColor('#091652')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#bbbdbe' ? 'active gray' : 'gray'} onClick={(color)=>{this.setColor('#bbbdbe')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#067d41' ? 'active dark-green' : 'dark-green'} onClick={(color)=>{this.setColor('#067d41')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <p className="label">Group icon</p>
                                        <div className="btn-holder clearfix">
                                            <div className="btn-default choose-btn upload-btn btn">
                                                <GroupProfileImageUploader className="btn-default upload-btn btn" profileImgSrc={this.state.groupProfileImgSrc} imgUpdated={this.imgUpdated} />
                                                Upload New
                                            </div>

                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="model-footer">
                                <div className="footer-btn btn-holder">
                                    <button className="btn btn-default back-btn" onClick={this.props.handleBack}>Back</button>
                                    <button className="btn btn-default cancel-btn" onClick={this.props.handleClose}>Cancel</button>
                                    <button className="btn btn-default success-btn" onClick={this.handleCreate}>Create</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );*/

        return (
            <ModalContainer onClose={this.props.handleClose}>
                <ModalDialog onClose={this.props.handleClose} className="modalPopup create-group-popup-container">
                    <div className="popup-holder">
                        <div className="create-group-popup">
                            <div className="model-header">
                                <h3 className="modal-title">Create a group</h3>
                                <span className="close-icon" onClick={this.props.handleClose}></span>
                            </div>
                            <div className="model-body clearfix">
                                <section className="group-body">
                                    <div className="form-group">
                                        <label for="grpname">name your group</label>
                                        <input type="text" className="form-control" id="grpname" onChange={this.setName} placeholder="what’s your group called?"/>
                                        {
                                            (this.state.warningStateName) ? <span className="errorMsg">please enter a group name</span> : null
                                        }
                                    </div>
                                    <div className="form-group invite-people clearfix">
                                        <label>invite some people</label>
                                        <SearchMembersField
                                            handleSearchUser={this.handleSearchUser}
                                            placeholder="type a name"
                                            sharedWithIds={this.state.sharedWithIds}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label for="desc">enter a group description</label>
                                        <textarea className="form-control" rows="5" id="desc" onChange={this.setDescription} placeholder="what’s the purpose of this group?"></textarea>
                                    </div>
                                    <div className="form-group">
                                        <p className="label">choose a colour</p>
                                        <div className="color-palette">
                                            <div className={this.state.groupColor == '#038247' ? 'color-block dark-green active' : 'color-block dark-green'} onClick={(color)=>{this.setColor('#038247')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#000f75' ? 'color-block dark-blue active' : 'color-block dark-blue'} onClick={(color)=>{this.setColor('#000f75')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#b21e53' ? 'color-block red active' : 'color-block red'} onClick={(color)=>{this.setColor('#b21e53')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#000000' ? 'color-block black active' : 'color-block black'} onClick={(color)=>{this.setColor('#000000')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#a6c74a' ? 'color-block light-green active' : 'color-block light-green'} onClick={(color)=>{this.setColor('#a6c74a')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#00a6ef' ? 'color-block light-blue active' : 'color-block light-blue'} onClick={(color)=>{this.setColor('#00a6ef')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#ed1e7a' ? 'color-block pink active' : 'color-block pink'} onClick={(color)=>{this.setColor('#ed1e7a')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                            <div className={this.state.groupColor == '#bfbfbf' ? 'color-block gray active' : 'color-block gray'} onClick={(color)=>{this.setColor('#bfbfbf')}}>
                                                <i className="fa fa-check" aria-hidden="true"></i>
                                            </div>


                                        </div>
                                        {
                                            (this.state.warningStateColor) ? <span className="errorMsg">please choose a group color</span> : null
                                        }
                                    </div>
                                    <div className="form-group">
                                        <p className="label">Group icon</p>
                                        <div className="btn-holder clearfix">
                                            <button className="btn btn-upload">
                                                <GroupProfileImageUploader className="btn-default upload-btn btn"
                                                                           profileImgSrc={this.state.groupProfileImgSrc} imgUpdated={this.imgUpdated} />
                                                {uploadScript}
                                            </button>
                                        </div>
                                        {
                                            (this.state.warningStateImage) ?
                                                (this.state.uploadingImage == "uploading" || this.state.uploadingImage == "uploading-error") ?
                                                    <span className="errorMsg">{this.state.uploadingImageAlert}</span>
                                                    : null : null
                                        }
                                    </div>
                                </section>
                            </div>
                            <div className="model-footer">
                                <button className="btn btn-create-group" onClick={this.handleCreate}>Create</button>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </ModalContainer>
        );
    }
}
