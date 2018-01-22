import React from 'react';
import Secretary from '../../components/elements/Secretary';
import {Alert} from '../../config/Alert'
import Button from '../../components/elements/Button'
import Session  from '../../middleware/Session';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : '0 0 15px',
    display       : "inline-block"
}

class SelectSecretary extends React.Component {
    constructor(props) {
        super(props);
         this.state={
            secretaries:[],
            selected: "",
            selectSecretary: "",
            secretary : ""
         }
        this.onNextStep = this.onNextStep.bind(this);
        this.loggedUser = Session.getSession('prg_lg')
        this.onPrevious = this.onPrevious.bind(this);
    }

    componentDidMount() {
        this.serverRequest = $.ajax({
            url: '/secretaries',
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                this.setState({secretaries: data});
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });

        let secretary ={
            secretary : this.loggedUser.secretary_id
        }

        this.setState({selected:this.loggedUser.secretary_id, secretary: (this.loggedUser.secretary_id)? secretary : ""});
    }


    componentWillUnmount() {
        this.serverRequest.abort();
    }

    onPrevious(){
        this.props.onPreviousStep();
    }

    onSelectSecratery(secretaryId){

        let secretary ={
            secretary : secretaryId
        }

        this.setState({
            secretary:secretary,
            selected:secretaryId
        });

        this.setState({selectSecretary: ""});
    }

    onNextStep(){
        if(this.state.secretary){
            let _this =  this;
            $.ajax({
                url: '/secretary/save',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token},
                data:this.state.secretary,
                success: function (data, text) {
                    if (data.status === 'success') {
                        data.user

                        Session.createSession("prg_lg", data.user);
                        location.reload();

                    }

                },
                error: function (request, status, error) {
                    console.log(request.responseText);
                    console.log(status);
                    console.log(error);
                }
            });

        }else{
            this.setState({selectSecretary: Alert.PLEASE_SELECT_SECRETARY})
        }

    }

	render(){
		return (
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                        <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary">
                        	<h2>Choose your secretary</h2>
                            <h5>Your secretary will help you manage your content and organize your tasks</h5>
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                            	<div className="row">
                                    {
                                        this.state.secretaries.map((key,i)=>

                                           <Secretary data={key} key={i} selected={(key.id == this.state.selected)?true:false} onSelectSecratery={this.onSelectSecratery.bind(this)}/>
                                        )
                                    }
                                </div>

                                {this.state.selectSecretary ? <p className="form-validation-alert" style={errorStyles} >{this.state.selectSecretary}</p> : null}

                                <div className="row">
                                    <Button type="button" size="12" classes="pgs-sign-submit" value="next" onButtonClick={()=>this.onNextStep()} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		)
	}


}


module.exports = SelectSecretary;
