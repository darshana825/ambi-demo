import React from 'react'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert';
import PasswordField from '../../components/elements/PasswordField'

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}

export default class ChangePassword extends React.Component{
    constructor(props) {
        super(props);
        this.state= {
            token:this.getUrl(),
            formData:{},
            error:{},
            submitURL:'/change-password/',
            validateAlert: "",
            invalidElements :{},
            fieldValue : ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        this.validateSchema = {
                password: "",
                confPassword:""
        };
        this.isValid = true;
        this.formData = {};
    };

    getUrl(){
        return  this.props.params.token;
    }

    submitData(e){
        e.preventDefault();
        let _this = this;
        let _invalid_frm = this.formData;
        for (let err_elm in this.validateSchema){
            if(!this.formData.hasOwnProperty(err_elm))
                this.formData[err_elm] = this.validateSchema[err_elm];
        }

        let er = this.traversObject();
        this.setState({error:er})

        if(Object.keys(er).length == 0){
            this.formData['status'] = 1;
            $.ajax({
                url: this.state.submitURL+this.state.token,
                method: "POST",
                data: this.formData,
                dataType: "JSON",

                success: function (data, text) {
                    console.log(data.status.message)
                    if (data.status.code === 200) {
                        _this.setState({validateAlert: ""});
                        window.location.href ='/changed-password';
                    }

                },
                error: function (request, status, error) {
                    _this.setState({validateAlert: request.responseJSON.status.message});
                }

            });
        }
    }

    traversObject(){
        let _error = {};
        for(let elm in this.formData){

            if(elm == "password" && this.formData[elm].length < 6){
                _error[elm] = Alert.PASSWORD_LENGTH_ERROR;
            }
            if(elm == 'confPassword' && this.formData[elm].length < 6){
                _error[elm] = Alert.PASSWORD_LENGTH_ERROR;
            }

            if(elm == 'confPassword' && this.formData[elm] != this.formData['password']){
                _error[elm] = Alert.PASSWORD_MISMATCH;
            }
        }
       return _error;
    }

    elementChangeHandler(key,data,status){
        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})
    }

    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper changePassword">
            	<div className="container">
                    <div className="containerHolder">
                        <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                            	<h2>Change Password</h2>
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                    <form method="get" onSubmit={this.submitData.bind(this)}>
                                        <div className="row">
                                            <PasswordField name="password"
                                                           size="6"
                                                           value={this.formData.password}
                                                           label="New Password"
                                                           placeholder=""
                                                           classes="pgs-sign-inputs"
                                                           required={true}
                                                           onInputChange={this.elementChangeHandler}
                                                           validate={this.state.invalidElements.password}
                                                           compareWith={this.state.formData.confPassword}
                                                           error_message={this.state.error.password}/>
                                            <PasswordField name="confPassword"
                                                           size="6"
                                                           value={this.formData.confPassword}
                                                           label="Confirm Password"
                                                           placeholder=""
                                                           classes="pgs-sign-inputs"
                                                           required={true}
                                                           onInputChange={this.elementChangeHandler}
                                                           validate={this.state.invalidElements.confPassword}
                                                           compareWith={this.state.formData.password}
                                                           error_message={this.state.error.confPassword}/>
                                        </div>
                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                                        <div className="row">
                                            <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
                                            <Button type="submit" size="6" classes="pgs-sign-submit" value="change" />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
