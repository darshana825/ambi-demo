/*
* Component to show user intro
*/
import React from 'react';
import Session  from '../../middleware/Session';
import {Alert} from '../../config/Alert';

export default class Intro extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isFormVisible : false,
            introText : ""
        }
    }

    openForm(){
        this.setState({isFormVisible : true});
    }

    onFormCancel(){
        this.setState({isFormVisible : false});
    }

    onFormSave(data){
        this.setState({isFormVisible : false, introText : data});
        console.log(data);
        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/introduction/update',
            method: "POST",
            dataType: "JSON",
            data:{introText:data},
            headers: { 'prg-auth-header':loggedUser.token },
            success: function (data, text) {
                if(data.status.code == 200 ){
                    this.props.loadProfileData();

                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    loadIntroduction(){
        $.ajax({
            url: '/introduction/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.props.uname},
            success: function (data, text) {

                if (data.status.code == 200 && data.user !=null) {
                    this.setState({data:data.user});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    };

    render(){
        let loggedUser = Session.getSession('prg_lg');
        let read_only = (loggedUser.id == this.props.user.user_id)?false:true;
        return (
            <div className="inner-section intro">
                <div className="inner-header">
                    <div className="header-wrapper">
                        <span className="header-icon"></span>
                        <span className="header-text">intro</span>
                    </div>
                </div>
                <div className="inner-container">
                    {
                        (!read_only && !(this.state.isFormVisible || this.props.user.introduction))?
                        <div className="add-intro clearfix">
                            <p className="add-intro-text" onClick={this.openForm.bind(this)}><i className="fa fa-plus"></i>Describe who you are</p>
                        </div>
                        :
                        null
                    }
                    {
                        (this.props.user.introduction && !this.state.isFormVisible)?
                        <div className="intro-holder">
                            <p className="description">{this.props.user.introduction}
                                {(!read_only)?<i className="fa fa-pencil-square-o" onClick={this.openForm.bind(this)}></i>:null}</p>
                        </div>
                        :
                        null
                    }
                    {
                        (!read_only && this.state.isFormVisible)?
                        <IntroForm introText={this.props.user.introduction} onFormClose={this.onFormCancel.bind(this)} formSave={this.onFormSave.bind(this)} />
                        :
                        null
                    }
                </div>
            </div>
        )
    }
}

export class IntroForm extends React.Component{
    constructor(props){
        super(props);
        this.maxCharLength = 120;
        let inputValue = (this.props.introText)? this.props.introText : "";
        let charLength = this.maxCharLength - inputValue.length;

        this.state={
            value : inputValue,
            charLength : charLength,
            validateAlert:""
        }
    }

    onFieldUpdate(e){
        let value = e.target.value,
            charLen = value.length,
            maxLength = this.maxCharLength;

        if (charLen <= maxLength) {
            let char = maxLength - charLen;

            this.setState({value : value, charLength : char});
        }

        if(value == ""){
            this.setState({validateAlert:Alert.EMPTY_INTRODUCTION})
        }else{
            this.setState({validateAlert:""})
        }
    }

    onFormSave(e){
        e.preventDefault();
        if(this.state.value == ""){
            this.setState({validateAlert:Alert.EMPTY_INTRODUCTION})
        }else{
            this.setState({validateAlert:""})
            this.props.formSave(this.state.value);
        }

    }

    render() {
        return (
            <div className="intro-form-holder">
                <form onSubmit={this.onFormSave.bind(this)}>
                    <div className="form-group">
                        <textarea className="form-control" value={this.state.value} onChange={this.onFieldUpdate.bind(this)} placeholder="Describe who you are"></textarea>
                    </div>
                    <div className="form-bottom-holder clearfix">
                        <div className="char-length-holder">
                            <span>{this.state.charLength}</span>
                        </div>
                        <div className="char-length-holder">
                            <span className="error">{this.state.validateAlert}</span>
                        </div>
                        <div className="button-holder">
                            <button type="button" className="btn btn-default pg-btn-custom" onClick={this.props.onFormClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
