import React from 'react'
import {Countries} from '../../service/Countries'

export default class CountryList extends React.Component{
	constructor(props) {
        super(props);
				let defaultOption = (this.props.defaultOpt) ? this.props.defaultOpt : "";

				this.state = {defaultOpt: defaultOption}
        this.selectChange = this.selectChange.bind(this);
    }

    selectChange(e){

        this.setState({defaultOpt: e.target.value});

    	if(this.props.required){
				if(e.target.value.length != 0 ){
					status = "valid";
				}else{
					status = "invalid";
				}
			}else{
				status = "";
			}

		this.props.optChange("country",e.target.value,status);

    }

		componentDidMount(){
			if(this.state.defaultOpt){
				this.props.optChange("country",this.state.defaultOpt,"valid");
			}
		}

	render(){
		let errorStyles = {
            color         : "#ed0909",
            fontSize      : "0.8em",
            textTransform : "capitalize",
            margin        : '10px 0 0',
            display       : "inline-block"
        }
		let opts = {};

		if (this.props.error_message) {
            opts['style'] = {"borderColor" : "#ed0909"};
        }

		return(
			<div className="col-xs-5">
	            <p>Country {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""}</p>
	            <select name="country"
                        className="pgs-sign-select"
                        value={this.props.defaultOpt}
                        onChange={this.selectChange.bind(this)} {...opts}>
													<option/>
	            	{Countries.map(function(country, i){
						return <option value={country.key}
                                       key={i}
                                         >
                            {country.name}</option>;
	            	})}
	            </select>
				{(this.props.error_message)? <span className="invalid-msg" style={errorStyles}>{this.props.error_message}</span> : null}
            </div>
		);
	}
}
