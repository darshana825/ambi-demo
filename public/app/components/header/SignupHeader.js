/**
 * Header component for users who are not logged in
 */

import React from 'react';
import Img from '../elements/Img'
import { Link} from 'react-router'
import Logo from './Logo'
import {Alert} from '../../config/Alert';
import TextField from '../../components/elements/TextField'
import PasswordField from '../../components/elements/PasswordField'
import Session  from '../../middleware/Session';
import CommunicationsProvider from '../../middleware/CommunicationsProvider';
import Fingerprint2 from "fingerprintjs2";

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : '0 0 15px',
    display       : "inline-block"
};

export default class Header extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            formData:{},
            error:{},
            signinURL:'/doSignin',
            validateAlert: "",
            invalidElements :{},
            fieldValue : "",
            rememberMe : Session.getSession("prg_rm")?Session.getSession("prg_rm").rememberMe:false
        };

        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.validateSchema = {
                uname: "",
                password: ""
        };
        this.isValid = true;
        this.formData = {};
    }

    traversObject(){
        let _error = {};
        for(let elm in this.formData){

            if(elm == "uname" && this.formData[elm]==""){
                _error[elm] = Alert.EMPTY_USER_NAME;
            }

            if(elm == "password" && this.formData[elm].length < 6){
                _error[elm] = Alert.PASSWORD_LENGTH_ERROR;
            }
        }
       return _error;
    }

    elementChangeHandler(key,data,status){

        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})

    }

    onCheck(){
        let rememberMe = this.state.rememberMe;
        this.setState({rememberMe : !rememberMe});
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
            var userStatus = -1;

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
                // TODO: Refactor this to use axios instead of jQuery.
                // TODO: Mock these requests and write some unit tests.
                $.ajax({
                    url: this.state.signinURL,
                    method: "POST",
                    data: this.formData,
                    dataType: "JSON",
                    success: function (data, text) {
                        if (data.status.code === 200) {
                            _this.setState({validateAlert: ""});
                            Session.createSession("prg_lg", data.user);
                            if(_this.state.rememberMe){
                                Session.createSession("prg_rm", {rememberMe:_this.state.rememberMe});
                            }

                            if (data.user.status) {
                                userStatus = data.user.status;
                            }

                            let tokenRequestBody = {
                                deviceId: deviceFingerPrint,
                                identity: data.user.id
                            };

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
                                            chatClient = chatClientResult;

                                            // Done signing in, take user to the home page.
                                            if(userStatus == 7){
                                                location.href = "/";
                                            } else {
                                                location.reload();
                                            }
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
                        console.log("Error signing user in", error);
                        _this.setState({validateAlert: request.responseJSON.status.message});
                    }
                });
            })
            .catch((err) => {
                console.log("SignupHeader error getting deviceFingerPrint: ", err);
            });
        }
    }

	render(){
		return(
            <div className="row row-clr pg-top-navigation signup-header">
                <div className="container pg-custom-container">
                    <div className="row">
                        <div className="col-xs-2 logoHolder">
                            <Logo url ="/images/logo.png" />
                        </div>
                        <div className="col-xs-6 pgs-main-nav-area">
                            <div className="row row-clr pgs-main-nav-area-inner">
                                <ul>
                                    <li>
                                        <Link to="/">
                                            About Proglobe
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/">
                                            How it works
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/">
                                            The Team
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/">
                                            Contact us
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xs-4 pgs-login-area">
                            <form onSubmit={this.submitData.bind(this)}>
                                <div className="form-group userNameHolder inputWrapper col-sm-4">
                                    <TextField  name="uname"
                                                size="12"
                                                value={this.formData.uname}
                                                label=""
                                                placeholder="EMAIL"
                                                classes="pgs-sign-inputs"
                                                onInputChange={this.elementChangeHandler}
                                                required={true}
                                                validate={this.state.invalidElements.uname}
                                                error_message={this.state.error.uname}/>
                                    <div className="checkbox">
                                        <input type="checkbox"
                                               id="rememberMe"
                                               name="rememberMe"
                                               checked={this.state.rememberMe} onChange={this.onCheck.bind(this)}/>
                                        <label htmlFor="rememberMe">Remember Me</label>
                                    </div>
                                </div>
                                <div className="form-group passwordHolder inputWrapper col-sm-4">
                                    <PasswordField  name="password"
                                                size="12"
                                                value={this.formData.password}
                                                label=""
                                                placeholder="PASSWORD"
                                                classes="pgs-sign-inputs"
                                                onInputChange={this.elementChangeHandler}
                                                required={true}
                                                validate={this.state.invalidElements.password}
                                                error_message={this.state.error.password}/>
                                    <a href="/forgot-password">Forgot Password?</a>
                                </div>
                                <div className="form-group btnHolder col-sm-3">
                                    <button type="submit" size="6" className="pgs-sign-submit">Login</button>
                                </div>
                                {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}
