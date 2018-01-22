import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import Button from '../../components/elements/Button'
import EstablishConnectionBlock from '../../components/elements/EstablishConnectionBlock'
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail'
import Session  from '../../middleware/Session';

export default class EstablishConnections extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            connections: [],
            sesData:{},
            resultHeader:[]
        }

        this.onNextStep = this.onNextStep.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.elementsList = [];
        this.currentPage = 1;
        this.connectedUsers =[];
        this.unConnectedUsers =[];
        this.btn_text="Skip"
    }
	componentDidMount() {
        this.loadData(this.currentPage);

        let _sesData = Session.getSession('prg_lg')
        this.setState({sesData:_sesData});
	}

    loadData(page){
        let user = Session.getSession('prg_lg');
        let _this =  this;
        $.ajax({
            url: '/connections/get',
            method: "GET",
            dataType: "JSON",
            data:{pg:page},
            headers: { 'prg-auth-header':user.token },
            success: function (data, text) {
                if(data.status.code == 200){
                    this.setState({connections:data.connections,resultHeader:data.header})
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

	handleScroll(event, values) {
        if  (values.scrollTop == (values.scrollHeight - values.clientHeight) - 4){

            if (this.currentPage > this.state.resultHeader.total_pages){
                //return false;
            }else{
               // console.log(this.currentPage)
                //this.loadData(this.currentPage)
            }
            this.currentPage = this.currentPage+1;
        }
    }

    onNextStep(){
        let user = Session.getSession('prg_lg');
        let _this = this;
        $.ajax({
            url: '/connect-people',
            method: "POST",
            dataType: "JSON",
            data:{ connected_users: JSON.stringify(this.connectedUsers),unconnected_users:JSON.stringify(this.unConnectedUsers)},
            headers: { 'prg-auth-header':user.token },
            success: function (data, text) {
                if(data.status.code == 200){
                    Session.createSession("prg_lg", data.user);
                    _this.props.onNextStep();
                }

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    onConnectionSelect(connection,isConnected){

        if(isConnected){
            this.connectedUsers.push(connection.user_id);
            let _index = this.unConnectedUsers.indexOf(connection.user_id,1)
            this.unConnectedUsers.splice(_index);
        }else{
            let index = this.connectedUsers.indexOf(connection.user_id,1)
            this.connectedUsers.splice(index);
            this.unConnectedUsers.push(connection.user_id)
        }


        if(this.connectedUsers.length >=1){
            this.btn_text = "Next";
        }else{
            this.btn_text = "Skip";
        }
    }

    onBack(){
        this.props.onPreviousStep()
    }

	render() {
        let connection_list = [];
        let session = Session.getSession('prg_lg');
        let _secretary_image = this.state.sesData.secretary_image_url;

        if(this.state.connections.length > 0){
            connection_list = this.state.connections.map((connection)=>{

                return <EstablishConnectionBlock key={connection._id} connection={connection} onConnectionSelect={(connection,isConnected)=>this.onConnectionSelect(connection,isConnected)}/>
            });
        }

        this.elementsList.push(connection_list);

		return (
			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper large-container connections">
            	<div className="container">
                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">
                    	<div className="row signupContentHolder">
                        	<SecretaryThumbnail url={_secretary_image} />
                            <div className="col-xs-12">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                	<img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow"/>
                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner pgs-middle-sign-wrapper-about-inner-establish-conn">
                                        <h1>Hello {session.first_name},</h1>
                                        <h2>Welcome to Proglobe</h2>
                                    </div>
                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form">
                                    	<h6>Establish your connections</h6>
                                        <div className="row row-clr pgs-establish-connection-cover">
                                        	<div className="row row-clr pgs-establish-connection-cover-inner">
                                                <Scrollbars style={{ height: 310 }} onScroll={this.handleScroll}>
                                                    {this.elementsList}
                                                </Scrollbars>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <Button type="button" size="6" classes="pgs-sign-submit-cancel pgs-sign-submit-back" value="Back" onButtonClick = {this.onBack.bind(this)}/>
                                            <Button type="button" size="6" classes="pgs-sign-submit" value="Next" onButtonClick = {this.onNextStep.bind(this)}/>
	                                    </div>
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
