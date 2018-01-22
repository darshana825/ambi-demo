import React from 'react';
import Session  from '../../middleware/Session';
import Signup from './Signup';
import SelectSecretary from './SelectSecretary';
import AboutYou from './AboutYou';
import EstablishConnections from './EstablishConnections';
import NewsType from './NewsType';
import ProfileImgUpload from './ProfileImgUpload';
import AboutCollegeAndJob from './AboutCollegeAndJob';
import Main from '../main'
class Index extends React.Component {

	constructor(props) {
		super(props);

		this.state={
			step:1,
            userData:{},
            serviceURLs:{
                1:'sign-up',
                2:'choose-secretary',
                3:'about-you',
                4:'collage-and-job',
                5:'establish-connections',
                6:'profile-image',
                7:'/'

            }
		};


		this.onNextStep = this.onNextStep.bind(this);
		this.onPreviousStep = this.onPreviousStep.bind(this);


	}
	componentDidMount() {
        let _step = this.loadNextStep();
        this.setState({step: _step}, function () {
            this.loadRoute();
        });

	}
	onNextStep(){
        let _step = this.loadNextStep();
		this.setState({step: _step}, function () {
            this.loadRoute();
		});
	}
	onPreviousStep(){
        let _step =  this.state.step-1;
        this.setState({step: _step}, function () {
            this.loadRoute();
        });
	}

	loadNextStep(){
        if(Session.isSessionSet('prg_lg')) {
            let ses_user = Session.getSession('prg_lg');
            return ses_user.status+1;
        }
        return 1;
	}

	loadRoute(){

        let _urls = this.state.serviceURLs[this.state.step];
        window.history.pushState('Sign up','User Sign up','/'+_urls);


	}

	showSteps(){

		switch(this.state.step){
            case 1:
                return (<Signup onNextStep ={this.onNextStep}/>);
			case 2:
				return (<SelectSecretary onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
			case 3:
				return  (<AboutYou onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
            case 4:
                return (<AboutCollegeAndJob onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
            case 5:
                return  (<EstablishConnections onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
            case 6:
                return (<ProfileImgUpload onNextStep ={this.onNextStep} onPreviousStep = {this.onPreviousStep}/>);
            case 7:
                return(<Main />)
			default:
				return (<Signup onNextStep ={this.onNextStep}/>);
		}
	}
	render() {
		return this.showSteps()
	}



}



module.exports = Index;
