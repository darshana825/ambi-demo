import React from 'react';
import EmailField from '../../components/elements/EmailField';
import Button from '../../components/elements/Button';
import {Alert} from '../../config/Alert';
import Session  from '../../middleware/Session';
import TextField from '../../components/elements/TextField';
import PasswordField from '../../components/elements/PasswordField';
import CommunicationsProvider from '../../middleware/CommunicationsProvider';
import Fingerprint2 from "fingerprintjs2";

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : '0 0 15px',
    display       : "inline-block"
}
/**
 * TODO :: Set formData objects for each element as defualt value when plugin load
 */
class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state= {
            formData:{},
            error:{},
            signupURL:'/doSignup',
            validateAlert: "",
            invalidElements :{},
            fieldValue : ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this)
        this.clearValidations     = this.clearValidations.bind(this)
        this.validateSchema = {
                fName: "",
                lName: "",
                email: "",
                password: "",
                confPassword:""
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

            const fingerPrint = true;
            let deviceFingerPrint = new Promise(
                (resolve, reject) => {
                    if(fingerPrint) {
                        new Fingerprint2().get((result) => {
                            resolve(result);
                        });
                    } else {
                        const rejectedReason = new Error('SignupHeader: unable to get device fingerprint');
                        reject(rejectedReason);
                    }
                }
            ).then((deviceFingerPrint) => {
                $.ajax({
                        url: this.state.signupURL,
                        method: "POST",
                        data: this.formData,
                        dataType: "JSON",
                        success: function (data, text) {
                            if (data.status === 'success') {
                                _this.setState({validateAlert: ""});
                                Session.createSession("prg_lg", data.user);
                                let tokenRequestBody = {
                                    deviceId: deviceFingerPrint,
                                    identity: data.user.id
                                };

                                // Generate Twilio access token
                                $.ajax({
                                    url: "/twilio/token/generate",
                                    method: "POST",
                                    data: tokenRequestBody,
                                    dataType: "JSON",
                                    success: function (accessTokenData) {
                                        Session.createSession("twilio-access-token", accessTokenData);

                                        // Initialize the Twilio chat provider
                                        let chatProvider = CommunicationsProvider.getChatProvider();
                                        var chatClient = null;
                                        
                                        // initializeVideoClient the chat client here.
                                        // No further initialization needed for the video client now that we have an access token
                                        // NOTE: This might not be necessary, and can be replaced by the initialization in ConversationList.
                                        chatProvider.initializeChatClient()
                                                    .then((chatClientResult) => {
                                                        console.log("chatClientResult: ", chatClientResult);
                                                        chatClient = chatClientResult;

                                                        // Finally, go to the Choose Secretary page.
                                                        location.href="/choose-secretary";
                                                    });
                                    },
                                    error: function (request, status, error) {
                                        // TODO: Use a proper logging framework here.
                                        console.log("Error getting Twilio chat Token Ajax.", error);
                                    }
                                });
                            }

                        },
                        error: function (request, status, error) {

                            console.log(request.responseText);
                            console.log(status);
                            console.log(error);

                            _this.setState({validateAlert: Alert.EMAIL_ID_ALREADY_EXIST});
                        }
                    });
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

            if(elm == "fName" && this.formData[elm]==""){
                _error[elm] = Alert.EMPTY_FIRST_NAME;
            }

            if(elm == "lName" && this.formData[elm] == ""){
                _error[elm] = Alert.EMPTY_LAST_NAME;
            }

            if(elm == "email" && this.formData[elm] == "" ){
                _error[elm] = Alert.EMPTY_EMAIL_ID;
            }

            if(elm == "email" &&  !this.isValidEmail(this.formData[elm])){
                _error[elm] = Alert.INVALID_EMAIL;
            }

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

    clearValidations(){
        this.setState({invalidElements:{}, error : {}});
        this.formData = {};
    }

	render(){
		return (
			<div className="row row-clr pgs-middle-sign-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                        	<h2>Let’s create your account</h2>
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                <form method="get" onSubmit={this.submitData.bind(this)} onReset={this.clearValidations.bind(this)} >
                                    <div className="row">
                                        <TextField  name="fName"
                                                    size="6"
                                                    value={this.formData.fName}
                                                    label="First Name"
                                                    placeholder=""
                                                    classes="pgs-sign-inputs"
                                                    onInputChange={this.elementChangeHandler}
                                                    required={true}
                                                    validate={this.state.invalidElements.fName}
                                                    error_message={this.state.error.fName}/>
                                        <TextField  name="lName"
                                                    size="6"
                                                    value={this.formData.lName}
                                                    label="Last Name"
                                                    placeholder=""
                                                    classes="pgs-sign-inputs"
                                                    required={true}
                                                    onInputChange={this.elementChangeHandler}
                                                    validate={this.state.invalidElements.lName}
                                                    error_message={this.state.error.lName}/>
                                    </div>
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
                                    <div className="row">
                                        <PasswordField name="password"
                                                       size="6"
                                                       value={this.formData.password}
                                                       label="Password"
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
                                        <Button type="reset" size="6" classes="pgs-sign-submit-cancel" value="clear" />
                                        <Button type="submit" size="6" classes="pgs-sign-submit" value="next" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		)
	}
}


module.exports = Signup;
