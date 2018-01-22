/**
 * The Index view of the folder section
 */
import React from 'react';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import FolderList from '../folders/FoldersList';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import moment from 'moment';
import Autosuggest from 'react-autosuggest';
import Lib from '../../middleware/Lib';

export default class Index extends React.Component{

    constructor(props) {

        let user =  Session.getSession('prg_lg');
        if(user == null){
            window.location.href = "/";
        }
        super(props);
        this.state = {
            loggedUser : Session.getSession('prg_lg'),
            group: this.props.myGroup,
            members_count:1,
            folders:[],
            isShowingModal : false,
            CFName : "",
            CFColor : "",
            clrChosen : "",
            isFolderNameEmpty : false,
            isFolderClrEmpty: false,
            isAlreadySelected:false,
            value: '',
            folderValue:'',
            groupFolderSuggestions:[],
            groupFolderSuggestionsList:{},
            selectedGroupFileFolder:[],
            onSelect: false
        };

        this.loadFolders = this.loadFolders.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.colorPicker = this.colorPicker.bind(this);
        this.doSortingByUpdateTime = this.doSortingByUpdateTime.bind(this);
        this.onFolderSuggestionsFetchRequested = this.onFolderSuggestionsFetchRequested.bind(this);
        this.onFolderSuggestionsClearRequested = this.onFolderSuggestionsClearRequested.bind(this);
        this.getFolderSuggestionValue = this.getFolderSuggestionValue.bind(this);
        this.renderFolderSuggestion = this.renderFolderSuggestion.bind(this);
        this.onFolderChange = this.onFolderChange.bind(this);
        this.showSelectedFileFolder = this.showSelectedFileFolder.bind(this);
        this.loadFolders();
    }

    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.myGroup != 'undefined' && nextProps.myGroup) {
            let _count = typeof nextProps.myGroup.members == 'undefined' ? 1 : nextProps.myGroup.members.length + 1;
            this.setState({group: nextProps.myGroup, members_count: _count});
        }
    }

    loadFolders(){

        $.ajax({
            url: '/group-folders/get-all/'+ this.state.group._id,
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token}
        }).done( function (data, text){

            if(data.status.code == 200){
                this.setState({folders: data.folders});
            }

        }.bind(this));
    }

    handleClick() {
        this.setState({isShowingModal: true});
    }

    handleClose() {
        this.setState({isShowingModal: false, isFolderNameEmpty : false, isFolderClrEmpty : false, CFName : "", CFClrClass : "",
            clrChosen : "", isAlreadySelected:false, value: ''});
    }

    handleNameChange(e){
        this.setState({CFName: e.target.value, isFolderNameEmpty: false});
    }

    onFolderCreate(){

        let _this = this;

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

        if(this.state.CFName && this.state.CFColor){

            $.ajax({
                url: '/group-folders/add-new',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data:{folder_name:this.state.CFName, folder_color:this.state.CFColor, group_id: this.state.group._id},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        setTimeout(function(){ _this.loadFolders(); }, 2000);
                        this.setState({isShowingModal: false, CFName : "", CFColor : ""});
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

    addDefaultFolder(){

        let _members = this.state.group.members;

        let _data = {
            folder_name: this.state.group.name,
            folder_color: "#00a6ef",
            shared_with: this.state.group.members,
            isDefault: 1,
            folder_type:1,
            group_id:this.state.group._id,
            group_members: _members ? _members : []
        }

        $.ajax({
            url: '/group-folders/add',
            method: "POST",
            dataType: "JSON",
            headers: {'prg-auth-header': this.state.loggedUser.token},
            data: _data
        }).done( function (data, text){
            if (data.status.code == 200) {
                let folders = [data.folder];
                this.setState({folders: folders});
            }
        }.bind(this));
    }

    addFolderPopup(){

        const { value } = this.state;

        const inputProps = {
            placeholder: 'type a name...',
            value,
            onChange: this.onChange,
            className: 'form-control'
        };

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

    onFolderChange(event, { newValue }) {

        this.setState({folderValue:newValue});

        if(!this.state.onSelect){
            this.setState({selectedGroupFileFolder:[]})
            let group_id = this.state.group._id;

            if(newValue.length == 1){

                $.ajax({
                    ///group-folder/search/:group_id/:q
                    url: '/group-folder/search/'+group_id+'/'+newValue,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {
                        if(data.status.code == 200){
                            this.group_folders = data.suggested_folders;
                            this.setState({
                                groupFolderSuggestions: this.getFolderSuggestions(newValue, this.group_folders),
                                groupFolderSuggestionsList : this.getFolderSuggestions(newValue, this.group_folders)
                            });
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(request.responseText);
                        console.log(status);
                        console.log(error);
                    }.bind(this)
                });
            } else if(newValue.length > 1 && this.group_folders.length < 10){

                $.ajax({
                    url: '/group-folder/search/'+group_id+'/'+newValue,
                    method: "GET",
                    dataType: "JSON",
                    success: function (data, text) {
                        if(data.status.code == 200){
                            this.group_folders = data.suggested_folders;
                            this.setState({
                                groupFolderSuggestions: this.getFolderSuggestions(newValue, this.group_folders),
                                groupFolderSuggestionsList : this.getFolderSuggestions(newValue, this.group_folders)
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

    onFolderSuggestionsFetchRequested({ value }) {
        this.setState({
            groupFolderSuggestions: this.getFolderSuggestions(value, this.group_folders),
            groupFolderSuggestionsList : this.getFolderSuggestions(value, this.group_folders)
        });
    }

    onFolderSuggestionsClearRequested() {
        this.setState({groupFolderSuggestions:[], groupFolderSuggestionsList:[], suggestions: []})
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
                        this.setState({selectedGroupFileFolder:data.folder, onSelect:false})
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
                        this.setState({selectedGroupFileFolder:data.folder, onSelect:false})
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

    getFolderSuggestions(value, data) {
        if(data == undefined) {
            return [];
        }
        const escapedValue = Lib.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        const regex = new RegExp('^' + escapedValue, 'i');
        return data.filter(data => regex.test(data.name));
    }

    render() {

        let _this = this;
        let group_folders = (this.state.selectedGroupFileFolder.length > 0) ? this.state.selectedGroupFileFolder : this.state.folders;
        let allSortedList = this.doSortingByUpdateTime(group_folders);
        let folderList = allSortedList.map(function(folder,key){
            return (
                <FolderList key={key} listType="group" folderData={folder} folderCount={key} onLoadFolders={_this.loadFolders.bind(this)} />
            )
        });

        const value = this.state.folderValue;

        const inputProps = {
            placeholder: 'search',
            value,
            onChange: this.onFolderChange,
            className: 'form-control'
        };

        const { groupFolderSuggestions, groupFolderSuggestionsList} = this.state;
        let _suggessions = groupFolderSuggestions;

        return (
            <section className="group-content">
                <div className="group-folder-container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-7">
                                <h2>Group Folder</h2>
                            </div>
                            <div className="col-sm-5">
                                <div className="search-folder">
                        <span className="inner-addon">
                            <i className="fa fa-search"></i>
                            {
                                <Autosuggest
                                    ref="folder_search"
                                    suggestions={_suggessions}
                                    onSuggestionsFetchRequested={this.onFolderSuggestionsFetchRequested}
                                    onSuggestionsClearRequested={this.onFolderSuggestionsClearRequested}
                                    getSuggestionValue={this.getFolderSuggestionValue}
                                    renderSuggestion={this.renderFolderSuggestion}
                                    inputProps={inputProps}/>
                            }
                        </span>
                                </div>
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder" onClick={this.handleClick.bind(this)}>
                                        <i className="fa fa-plus"></i> New Folder
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        {folderList}
                    </section>
                </div>
                {_this.addFolderPopup()}
            </section>
        );
    }
}
