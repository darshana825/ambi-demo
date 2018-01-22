import React from 'react'
import TextField from '../../components/elements/TextField'
import NumberField from '../../components/elements/NumberField'
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import CountryList from '../../components/elements/CountryList'
import Button from '../../components/elements/Button'
import {Alert} from '../../config/Alert'
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail'
import AboutInner from '../../components/elements/AboutInner'

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : '0 0 15px',
    display       : "inline-block"
}

export default class AboutYou extends React.Component{
	constructor(props) {
        super(props);
        this.state= {
            sesData:{},
            formData:{},
            error:{},
            invalidElements :{},
            validateAlert: ""
        };
        this.elementChangeHandler = this.elementChangeHandler.bind(this);
        this.loggedUser = Session.getSession('prg_lg');

        this.validateSchema = {
                dob: "",
                country: ""
        };
        this.isValid = true;
        this.formData = this.loggedUser;
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
                url: "/general-info/save",
                method: "POST",
                data: this.formData,
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token },
                success: function (data, text) {
                    if (data.status.code == 200) {
                        Session.createSession("prg_lg", data.user);
                        _this.props.onNextStep();
                    }
                },
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }
            });
        }


    }

    onBack(){
        this.props.onPreviousStep()
    }

    isValidDate(dob){
        var dob_arr = dob.split("-");
        var presumedDate = new Date(dob_arr[2], parseInt(dob_arr[0]-1), dob_arr[1]);

        if (presumedDate.getDate() != dob_arr[1]){
            return false;
        }
        else{
            return true;
        }

    }


    traversObject(){
        let _error = {};
        for(let elm in this.formData){
            if(elm == "dob" && this.formData[elm]==""){
                _error[elm] = Alert.ENTER_DOB;
            }
            if(elm == "dob" &&  !this.isValidDate(this.formData[elm])){
                _error[elm] = Alert.INVALID_DOB;
            }

            if(elm == "country" && this.formData[elm] == ""){
                _error[elm] = Alert.ENTER_COUNTRY;
            }

            if(elm == "zip" && this.formData[elm] == "" && this.formData['country'] == 'United States'){
                _error[elm] = Alert.ENTER_ZIP_CODE;
            }
        }
       return _error;
    }

    elementChangeHandler(key,data,status){
        //console.log(key,data);

        this.formData[key] = data;

        let er = this.traversObject();
        this.setState({error:er})

    }

	render(){
        let _secretary_image =this.loggedUser.secretary_image_url;

        return(
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                    	<div className="row signupContentHolder">
                            <SecretaryThumbnail url={_secretary_image} />
                            <div className="col-xs-12">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow" />
                                    <AboutInner />
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    	<h6>Before I begin helping you, tell me more about yourself.</h6>
                                        <form method="post" onSubmit={this.submitData.bind(this)}>
	                                        <div className="row pgs-middle-about-inputs">

	                                        	<SelectDateDropdown
                                                    title="Date of Birth"
                                                    dateFormat="mm-dd-yyyy"
                                                    defaultOpt={(this.formData.dob)? this.formData.dob : "" }
                                                    optChange={this.elementChangeHandler}
                                                    required="true"
                                                    dateType="dob"
                                                    error_message={this.state.error.dob}/>

	                                            <CountryList optChange={this.elementChangeHandler}
                                                             defaultOpt={(this.formData.country)? this.formData.country : "United States"}
                                                             required={true}
                                                             error_message={this.state.error.country} />

                                                <NumberField  name="zip"
                                                            size="2"
                                                            value={this.formData.zip}
                                                            label="Zip Code"
                                                            placeholder=""
                                                            classes="pgs-sign-inputs"
                                                            onInputChange={this.elementChangeHandler}
                                                            required={false}
                                                            validate={this.state.invalidElements.zip}
                                                            error_message={this.state.error.zip}/>
	                                        </div>
	                                        {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
	                                        <div className="row">
		                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel pgs-sign-submit-back" value="back" onButtonClick = {this.onBack.bind(this)}/>
		                                        <Button type="submit" size="6" classes="pgs-sign-submit" value="next" />
		                                    </div>
                                        </form>
                                    </div>
                                </div>
                        	</div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}
