import React from 'react';
import Button from '../../components/elements/Button';
import {Alert} from '../../config/Alert';
import EmailField from '../../components/elements/EmailField';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
}

let successStyles = {
    color         : "#3C763D",
    fontSize      : "0.8em",
    textTransform : "none",
    margin        : '0 0 15px',
    display       : "inline-block"
}

export default class ForgotPassword extends React.Component{
    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            error:{},
            forgotPasswordURL:'/forgot-password/request/',
            validateAlert: "",
            invalidElements :{},
            fieldValue : "",
            successAlert: ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        this.validateSchema = {
                email: ""
        };
        this.isValid = true;
        this.formData = {};
    };

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
                url: this.state.forgotPasswordURL,
                method: "POST",
                data: this.formData,
                dataType: "JSON",

                success: function (data, text) {
                    if (data.status.code === 200) {
                        _this.setState({validateAlert: ""});
                        _this.setState({successAlert: data.status.message});
                    }

                },
                error: function (request, status, error) {
                    _this.setState({validateAlert: request.responseJSON.status.message});
                }
            });
        }
    }

    isValidEmail(email){
        var regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regx.test(email);
    }

    traversObject(){
        let _error = {};
        for(let elm in this.formData){

            if(elm == "email" && this.formData[elm] == "" ){
                _error[elm] = Alert.EMPTY_EMAIL_ID;
            }
            if(elm == "email" &&  !this.isValidEmail(this.formData[elm])){
                _error[elm] = Alert.INVALID_EMAIL;
            }
        }
       return _error;
    }

    elementChangeHandler(key,data,status){
        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})
    }

    resetData(e){
        this.setState({invalidElements:{}, error:{}});
        this.formData = {};
        window.location.href = '/';

    }

    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper forgotPassword">
            	<div className="container">
                    <div className="containerHolder">
                        <div className="col-xs-6 pgs-middle-sign-wrapper-inner">
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                            	<h2>forgot Password</h2>
                                <div className="introWrapper">
                                    <p>Enter your email address below and we’ll</p>
                                    <p>send you password reset instructions</p>
                                </div>
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                    <form method="get" onSubmit={this.submitData.bind(this)} onReset={this.resetData.bind(this)}>
                                        <div className="row">
                                            <EmailField name="email"
                                                        size="12"
                                                        value={this.formData.email}
                                                        label="Your email address"
                                                        placeholder=""
                                                        classes="pgs-sign-inputs"
                                                        onInputChange={this.elementChangeHandler}
                                                        required={true}
                                                        validate={this.state.invalidElements.email}
                                                        error_message={this.state.error.email}/>
                                        </div>
                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                                        {this.state.successAlert ? <p className="form-validation-alert" style={successStyles} >{this.state.successAlert}</p> : null}
                                        <div className="row">
                                            <Button type="reset" size="6" classes="pgs-sign-submit-cancel" value="cancel" />
                                            <Button type="submit" size="6" classes="pgs-sign-submit" value="send email" />
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
