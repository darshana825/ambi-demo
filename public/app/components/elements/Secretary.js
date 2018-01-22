import React from 'react';

export default class Secretary extends React.Component{
	constructor(props) {
        super(props);

        this.state = {selected: ""}
    }

	onSelectSecratery(id){
        this.props.onSelectSecratery(id);

	}
	render(){

		let _image_name = this.props.data.full_name.toLowerCase();
        let _active = (this.props.selected)?"pgs-middle-sign-wrapper-secratery-box-active":"";

		return(
                <div className="col-xs-6">
                	<div className={'row row-clr pgs-middle-sign-wrapper-secratery-box ' +_active}>
                    	<a href="javascript:void(0)" onClick={this.onSelectSecratery.bind(this,this.props.data.id)}>
                            <div className="row pic-secretary" >
                            	<div className="col-xs-6 pgs-secratery-pic-box">
                                	<div className="row row-clr pgs-secratery-pic">
                                    	<img src={"/images/"+_image_name+".png"} alt="" className="img-responsive pgs-sec-default-pic"/>
                                        <img src={"/images/"+_image_name+"-hover.gif"} alt="" className="img-responsive pgs-sec-active-pic"/>
                                    </div>
                                </div>
                                <div className="col-xs-6 pgs-secratery-content-box">
                                	<h3>{this.props.data.full_name}</h3>
                                    {(this.props.selected) ? <h6 className="pbs-active-text">Yay</h6> : <h6 className="pbs-default-text">Choose {this.props.data.full_name}</h6>}
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
		)
	}
}
