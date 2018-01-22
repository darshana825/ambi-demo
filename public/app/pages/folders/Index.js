/**
 * This is folders index class that handle all
 */

import React from 'react';
import Session from '../../middleware/Session';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { Scrollbars } from 'react-custom-scrollbars';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import Lib from '../../middleware/Lib';
import Socket  from '../../middleware/Socket';
import FolderList from './FoldersList';
import moment from 'moment';


export default class Index extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state={
            loggedUser : Session.getSession('prg_lg'),
            isShowingModal : false,
            CFName : "",
            CFColor : "",
            clrChosen : "",
            isFolderNameEmpty : false,
            isFolderClrEmpty: false,
            isAlreadySelected:false,
            value: '',
            suggestions: [],
            suggestionsList : {},
            sharedWithIds : [],
            sharedWithNames : [],
            sharedWithUsernames : [],
            folders : [],
            group_folders : [],
            addFolder : true,
            folderValue:'',
            folderSuggestions:[],
            groupFolderSuggestions:[],
            folderSuggestionsList:{},
            groupFolderSuggestionsList:{},
            selectedFileFolder:[],
            selectedGroupFileFolder:[],
            onSelect: false,
            f_type: 'MY_FOLDER'
        };

        this.users = [];
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.sharedWithUsernames = [];
        this.loadFolderRequest = true;
        this.defaultFolder = [];
        this.folders = [];
        this.group_folders = [];

        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.loadFolders = this.loadFolders.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.onFolderChange = this.onFolderChange.bind(this);
        this.onFolderSuggestionsFetchRequested = this.onFolderSuggestionsFetchRequested.bind(this);
        this.onFolderSuggestionsClearRequested = this.onFolderSuggestionsClearRequested.bind(this);
        this.getFolderSuggestionValue = this.getFolderSuggestionValue.bind(this);
        this.renderFolderSuggestion = this.renderFolderSuggestion.bind(this);
        this.showSelectedFileFolder = this.showSelectedFileFolder.bind(this);
        this.changeFolderType = this.changeFolderType.bind(this);
        this.loadGroupFolders = this.loadGroupFolders.bind(this);
        this.doSortingByUpdateTime = this.doSortingByUpdateTime.bind(this);

    }

    componentDidMount(){
        this.checkDefaultFolder();
    }

    componentWillUnmount(){
        this.loadFolderRequest = false;
    }

    checkDefaultFolder(){

        if(this.defaultFolder.length == 0){
            let _dF = {
                CFName:"My Folder",
                CFColor:"#00a6ef"
            };
            this.defaultFolder.push(_dF);

            $.ajax({
                url: '/folders/get-count',
                method: "GET",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token}
            }).done( function (data, text){
                if(data.status.code == 200 && this.loadFolderRequest){
                    if(data.count == 0){
                        this.setState({CFName:"My Folder", CFColor:"#00a6ef"});
                        this.addDefaultFolder();
                    } else{
                        this.loadFolders();
                    }
                }
            }.bind(this));

        }
    }

    loadFolders(){

        $.ajax({
            url: '/folders/get-all',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done( function (data, text){
            if(data.status.code == 200 && this.loadFolderRequest){
                let folders = data.folders;
                this.setState({folders: folders});
            }
        }.bind(this));

    }

    loadGroupFolders(){

        $.ajax({
            url: '/group-folders/all/',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done( function (data, text){

            if(data.status.code == 200){
                this.group_folders = data.folders;
                this.setState({group_folders: this.group_folders});
            }

        }.bind(this));
    }

    addDefaultFolder(){

        if(this.loadFolderRequest && this.defaultFolder.length == 1){

            $.ajax({
                url: '/folders/add-new',
                method: "POST",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token},
                data: {
                    folder_name: this.state.CFName,
                    folder_color: this.state.CFColor,
                    shared_with: this.state.sharedWithIds,
                    isDefault: 1,
                    folder_type:0
                }
            }).done( function (data, text){
                if (data.status.code == 200 && this.loadFolderRequest) {
                    this.setState({CFName : "", CFColor : ""});
                    let folders = [data.folder];
                    this.setState({folders: folders});
                }
            }.bind(this));
        }

    }

    removeUser(key){
        this.sharedWithIds.splice(key,1);
        this.sharedWithNames.splice(key,1);
        this.sharedWithUsernames.splice(key,1);
        this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, sharedWithUsernames:this.sharedWithUsernames});
    }

    getSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.first_name+" "+data.last_name));
    }

    getSuggestionValue(suggestion) {
        if(this.sharedWithIds.indexOf(suggestion.user_id)==-1){
            this.sharedWithIds.push(suggestion.user_id);
            this.sharedWithNames.push(suggestion.first_name+" "+suggestion.last_name);
            this.sharedWithUsernames.push(suggestion.user_name);
            this.setState({sharedWithIds:this.sharedWithIds, sharedWithNames:this.sharedWithNames, sharedWithUsernames:this.sharedWithUsernames, isAlreadySelected:false})
        } else{
            this.setState({isAlreadySelected:true});
            console.log("already selected" + this.state.isAlreadySelected)
        }

        return "";
    }

    renderSuggestion(suggestion) {
        let _images = suggestion.images;

        let profileImg = (_images.hasOwnProperty('profile_image') && _images.profile_image != 'undefined') ?
            (_images.profile_image.http_url == "") ? "/images/default-profile-pic.png" : _images.profile_image.http_url
            : "/images/default-profile-pic.png";
        return (
            <div id={suggestion.user_id} className="suggestion-item">
                <img className="suggestion-img" src={profileImg} alt={suggestion.first_name} />
                <span>{suggestion.first_name+" "+suggestion.last_name}</span>
            </div>
        );
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue, isAlreadySelected:false });

        if(newValue.length == 1){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        } else if(newValue.length > 1 && this.users.length < 10){
            $.ajax({
                url: '/connection/search/'+newValue,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        this.users = data.suggested_users;
                        this.setState({
                            suggestions: this.getSuggestions(newValue, this.users),
                            suggestionsList : this.getSuggestions(newValue, this.users)
                        });
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        }
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value, this.users),
            suggestionsList : this.getSuggestions(value, this.users)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    getFolderSuggestions(value, data) {
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.name));
    }

    showSelectedFileFolder(suggestion){

        this.setState({onSelect:true});
        if(suggestion.type == "folder"){
            $.ajax({
                url: '/folder/get-folder/'+suggestion.folder_id,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        if(this.state.f_type == "MY_FOLDER") {
                            this.setState({selectedFileFolder:data.folder, selectedGroupFileFolder:[], onSelect:false})
                        } else {
                            this.setState({selectedGroupFileFolder:data.folder, selectedFileFolder:[], onSelect:false})
                        }
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        } else{
            $.ajax({
                url: '/folder/get-document/'+suggestion.folder_id+'/'+suggestion.document_id,
                method: "GET",
                dataType: "JSON",
                success: function (data, text) {
                    if(data.status.code == 200){
                        if(this.state.f_type == "MY_FOLDER") {
                            this.setState({selectedFileFolder:data.folder, selectedGroupFileFolder:[], onSelect:false})
                        } else {
                            this.setState({selectedGroupFileFolder:data.folder, selectedFileFolder:[], onSelect:false})
                        }
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }.bind(this)
            });
        }
    }

    getFolderSuggestionValue(suggestion) {
        return suggestion.name;
    }

    renderFolderSuggestion(suggestion) {
        return (
            <a href="javascript:void(0)" onClick={()=>this.showSelectedFileFolder(suggestion)}>
                <div className="suggestion" >
                    <span>{suggestion.name}</span>
                </div>
            </a>
        );
    }

    onFolderChange(event, { newValue }) {

        this.setState({folderValue:newValue});

        if(!this.state.onSelect){
            this.setState({selectedFileFolder:[], selectedGroupFileFolder:[]})
            let isGroup = 'N';
            if(this.state.f_type == "GROUP_FOLDER"){
                isGroup = 'Y';
            }

            if(newValue.length == 1){

                $.ajax({
                    url: '/folder/search/'+isGroup+'/'+newValue,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {
                        if(data.status.code == 200){
                            if(this.state.f_type == "MY_FOLDER") {
                                this.folders = data.suggested_folders;
                                this.setState({
                                    folderSuggestions: this.getFolderSuggestions(newValue, this.folders),
                                    folderSuggestionsList : this.getFolderSuggestions(newValue, this.folders)
                                });
                            } else {
                                this.group_folders = data.suggested_folders;
                                this.setState({
                                    groupFolderSuggestions: this.getFolderSuggestions(newValue, this.group_folders),
                                    groupFolderSuggestionsList : this.getFolderSuggestions(newValue, this.group_folders)
                                });
                            }
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(request.responseText);
                        console.log(status);
                        console.log(error);
                    }.bind(this)
                });
            } else if(newValue.length > 1 && this.folders.length < 10){

                $.ajax({
                    url: '/folder/search/'+isGroup+'/'+newValue,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {
                        if(data.status.code == 200){
                            if(this.state.f_type == "MY_FOLDER") {
                                this.folders = data.suggested_folders;
                                this.setState({
                                    folderSuggestions: this.getFolderSuggestions(newValue, this.folders),
                                    folderSuggestionsList : this.getFolderSuggestions(newValue, this.folders)
                                });
                            } else {
                                this.group_folders = data.suggested_folders;
                                this.setState({
                                    groupFolderSuggestions: this.getFolderSuggestions(newValue, this.group_folders),
                                    groupFolderSuggestionsList : this.getFolderSuggestions(newValue, this.group_folders)
                                });
                            }
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(request.responseText);
                        console.log(status);
                        console.log(error);
                    }.bind(this)
                });
            }
        }

    }

    onFolderSuggestionsFetchRequested({ value }) {
        if(this.state.f_type == "MY_FOLDER") {
            this.setState({
                folderSuggestions: this.getFolderSuggestions(value, this.folders),
                folderSuggestionsList : this.getFolderSuggestions(value, this.folders)
            });
        } else {
            this.setState({
                groupFolderSuggestions: this.getFolderSuggestions(value, this.group_folders),
                groupFolderSuggestionsList : this.getFolderSuggestions(value, this.group_folders)
            });
        }
    }

    onFolderSuggestionsClearRequested() {
        this.setState({folderSuggestions:[], folderSuggestionsList: [], groupFolderSuggestions:[], groupFolderSuggestionsList:[], suggestions: []})
    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({isShowingModal: false, isFolderNameEmpty : false, isFolderClrEmpty : false, CFName : "", CFClrClass : "",
            clrChosen : "", isAlreadySelected:false, value: '', suggestions: [], suggestionsList : {}, sharedWithIds : [],
            sharedWithNames : [], sharedWithUsernames : [], addFolder: true, CFColor : ""});

        this.users = [];
        this.sharedWithIds = [];
        this.sharedWithNames = [];
        this.sharedWithUsernames = [];
    }

    handleNameChange(e){
        let value = e.target.value;
        if(!/[^a-zA-Z0-9 ]/.test(value)){
            this.setState({CFName: value, isFolderNameEmpty: false});
        }
    }

    onFolderCreate(){
        if(this.state.CFName == ""){
            this.setState({isFolderNameEmpty: true});
        }else{
            this.setState({isFolderNameEmpty: false});
        }

        if(!this.state.CFColor){
            this.setState({isFolderClrEmpty: true});
        }else{
            this.setState({isFolderClrEmpty: false});
        }

        if(this.state.CFName != "" && this.state.CFColor && this.state.addFolder){

            this.setState({addFolder : false});

            $.ajax({
                url: '/folders/add-new',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data:{folder_name:this.state.CFName, folder_color:this.state.CFColor, shared_with:this.state.sharedWithIds, folder_type:0},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        this.loadFolders();
                        //this.setState({isShowingModal: false, CFName : "", CFColor : "", addFolder : true, sharedWithNames: []});

                        let _notificationData = {
                            folder_id:data.folder_id,
                            notification_type:"share_folder",
                            notification_sender:this.state.loggedUser,
                            notification_receivers:this.state.sharedWithUsernames
                        };

                        Socket.sendFolderNotification(_notificationData);
                        this.handleClose();
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(status);
                    console.log(error);
                }
            });


        }
    }

    colorPicker(e){
        let colorCls = e.target.getAttribute('data-color');
        this.setState({CFColor : colorCls, isFolderClrEmpty: false});
    }

    isActive(value){
        return ((value===this.state.CFColor) ? 'palette active': 'palette');
    }

    addFolderPopup(){
        const { value, suggestions, suggestionsList } = this.state;

        const inputProps = {
            placeholder: 'type a name...',
            value,
            onChange: this.onChange,
            className: 'form-control'
        };

        let shared_with_list = [];

        if(this.state.sharedWithNames.length > 0){
            shared_with_list = this.state.sharedWithNames.map((name,key)=>{
                return <span key={key} className="user">{name}<i className="fa fa-times" aria-hidden="true" onClick={(event)=>{this.removeUser(key)}}></i></span>
            });
        }
        return(
            <div>
                {this.state.isShowingModal &&
                <ModalContainer zIndex={9999}>
                    <ModalDialog className="create-folder modalPopup" width="438px">
                        <div className="popup-holder">
                            <section className="create-folder-popup">
                                <section className="folder-header">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <h2>Create new folder</h2>
                                        </div>
                                    </div>
                                </section>
                                <section className="folder-body">
                                    <div className="folder-name">
                                        <div className="col-sm-12 input-group">
                                            <p>Name your folder</p>
                                            <input type="text" className="form-control" value={this.state.CFName} onChange={this.handleNameChange.bind(this)} placeholder="type a category name..." />
                                            {
                                                (this.state.isFolderNameEmpty)?
                                                    <span className="errorMsg">Please add a Folder name</span>
                                                :
                                                    null
                                            }
                                        </div>
                                    </div>
                                    <div className="folder-color">
                                        <div className="col-sm-12 input-group">
                                            <p>Choose a color</p>
                                            <div className="color-palette clearfix">
                                                <div className={this.isActive('#00a6ef')} style={{backgroundColor: "#00a6ef"}} data-color="#00a6ef" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#a6c74a')} style={{backgroundColor: "#a6c74a"}} data-color="#a6c74a" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#ed1e7a')} style={{backgroundColor: "#ed1e7a"}} data-color="#ed1e7a" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#bebfbf')} style={{backgroundColor: "#bebfbf"}} data-color="#bebfbf" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#000f75')} style={{backgroundColor: "#000f75"}} data-color="#000f75" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#038247')} style={{backgroundColor: "#038247"}} data-color="#038247" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#b21e53')} style={{backgroundColor: "#b21e53"}} data-color="#b21e53" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <div className={this.isActive('#000000')} style={{backgroundColor: "#000000"}} data-color="#000000" onClick={this.colorPicker.bind(this)}>
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                            </div>
                                            {
                                                (this.state.isFolderClrEmpty)?
                                                    <span className="errorMsg">Please select Folder color</span>
                                                :
                                                    null
                                            }
                                        </div>
                                    </div>
                                    <div className="invite-people">
                                        <div className="col-sm-12 input-group">
                                            <p>Invite some people</p>
                                            {<Autosuggest suggestions={suggestions}
                                                         onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                                         onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                         getSuggestionValue={this.getSuggestionValue}
                                                         renderSuggestion={this.renderSuggestion}
                                                         inputProps={inputProps} />}
                                            {
                                                (this.state.sharedWithNames.length > 0)?
                                                    <div className="user-holder">{shared_with_list}</div> : null
                                            }
                                        </div>
                                    </div>
                                </section>
                                <section className="folder-footer">
                                    <div className="row action-bar">
                                        <div className="col-sm-12">
                                            <button className="btn btn-add-folder" onClick={this.onFolderCreate.bind(this)}>Create Folder</button>
                                        </div>
                                    </div>
                                </section>
                            </section>
                            <a className="closeButton--jss-0-1" onClick={(e) => this.handleClose(e)}>
                                <svg width="40" height="40">
                                    <circle cx="20" cy="20" r="20" fill="black"></circle>
                                    <g transform="rotate(45 20 20)">
                                        <rect x="8" y="19.25" width="24" height="1.5" fill="white"></rect>
                                        <rect y="8" x="19.25" height="24" width="1.5" fill="white"></rect>
                                    </g>
                                </svg>
                            </a>
                        </div>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    changeFolderType(_value) {
        this.setState({f_type: _value});
        //this.refs.folder_search.props.inputProps.value = '';
        //this.refs.folder_search.input.value = '';
        //this.refs.folder_search.input.focus();
        this.setState({selectedFileFolder:[], selectedGroupFileFolder:[], folderSuggestions: [], groupFolderSuggestions:[], suggestions: [], folderValue: ''})
        if(_value == "MY_FOLDER"){
            this.loadFolders();
        }else {
            this.loadGroupFolders();
        }
    }

    doSortingByUpdateTime(_folders) {

        if(_folders == undefined || _folders == null || _folders.length <= 1 ) {
            return _folders ;
        }

        var newArrayRef = _folders.slice(); //Creating a new ref array

        let _myFolder = newArrayRef[0]; //getting default folder named MY_FOLDER
        let allOther = newArrayRef.splice(1, newArrayRef.length - 1); // getting all other folders except MY_FOLDER

        /**
         * Sorting folders list by updated time.
         * moment has been used to validate time
         */
        allOther.sort(function(a, b) {
            return moment(a.folder_updated_at) < moment(b.folder_updated_at);
        });

        allOther.splice(0, 0, _myFolder); //add agin MY_FOLDER as the first element to sorted list
        return allOther;
    }

    render(){
        const value = this.state.folderValue;
        const { folderSuggestions, folderSuggestionsList, groupFolderSuggestions, groupFolderSuggestionsList, f_type } = this.state;
        let _suggessions = f_type == "MY_FOLDER" ? folderSuggestions : groupFolderSuggestions;
        //_suggessions = Array.isArray(_suggessions) ? _suggessions : [];
        let _this = this;
        let x = 1;
        let i = 0;
        let fldrId;
        let _folders = (this.state.selectedFileFolder.length > 0) ? this.state.selectedFileFolder : this.state.folders;
        let group_folders = (this.state.selectedGroupFileFolder.length > 0) ? this.state.selectedGroupFileFolder : this.state.group_folders;

        let allSortedList = this.doSortingByUpdateTime(_folders);
        let allSortedGroupList = this.doSortingByUpdateTime(group_folders);

        let folderList = allSortedList.map(function(folder,key){
            ++i;
            if(i == _folders.length){
                fldrId = "lastFolder";
            }else if(i == _folders.length - 1){
                fldrId = "oneBeforLastFolder";
            }else{
                fldrId = i;
            }

            return (
                <FolderList key={key} listType="personal" folderData={folder} folderCount={key} onLoadFolders={_this.loadFolders.bind(this)} tabType={_this.state.f_type} folderId={fldrId} />
            )
        });

        let groupFolderList = allSortedGroupList.map(function(folder,key){
            return (
                <FolderList key={key} listType="group" folderData={folder} folderCount={key} onLoadFolders={_this.loadGroupFolders.bind(this)} tabType={_this.state.f_type} />
            )
        });

        const inputProps = {
            placeholder: 'search',
            value,
            onChange: this.onFolderChange,
            className: 'form-control'
        };

        return(
            <section className="folder-container sub-container">
                <div className="container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-2">
                                <h2>Folders</h2>
                            </div>
                            <div className="col-sm-5 menu-bar">
                                <div className={this.state.f_type == 'MY_FOLDER' ? "folder-type active" : "folder-type"} onClick={() => this.changeFolderType('MY_FOLDER')}>
                                    <h4>My Folders</h4>
                                    <div className="highlighter"></div>

                                </div>
                                <div className={this.state.f_type == 'GROUP_FOLDER' ? "folder-type active" : "folder-type"} onClick={() => this.changeFolderType('GROUP_FOLDER')}>
                                    <h4>Group Folders</h4>
                                    <div className="highlighter"></div>
                                </div>
                            </div>
                            <div className="col-sm-5">
                                <div className="search-folder">
                                    <div className="inner-addon">
                                        <i className="fa fa-search"></i>
                                        {<Autosuggest
                                            ref="folder_search"
                                            suggestions={_suggessions}
                                            onSuggestionsFetchRequested={this.onFolderSuggestionsFetchRequested}
                                            onSuggestionsClearRequested={this.onFolderSuggestionsClearRequested}
                                            getSuggestionValue={this.getFolderSuggestionValue}
                                            renderSuggestion={this.renderFolderSuggestion}
                                            inputProps={inputProps} />}

                                    </div>
                                </div>
                                <div className="crt-folder">
                                    {this.state.f_type == 'MY_FOLDER' ?
                                        <button className="btn btn-crt-folder" onClick={this.handleClick.bind(this)}><i className="fa fa-plus"></i> New Folder</button>
                                    : null}

                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        {this.state.f_type == 'MY_FOLDER' ? folderList : groupFolderList}
                    </section>
                </div>
                {this.addFolderPopup()}
            </section>
        );
    }

}

