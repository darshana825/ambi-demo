import React from 'react';

export default class SelectDateDropdown extends React.Component{
	constructor(props) {
        super(props);
			let defaultOption = (this.props.defaultOpt) ? this.props.defaultOpt : "";
			let startYear = (this.props.startYear) ? this.props.startYear : "";

        this.state = {
				date:{},
				defaultDateOpt : defaultOption,
                startYear : startYear
        };

        this.dateUpdate = this.dateUpdate.bind(this);
    }

    getDateFormat(){
    	let dateFormat = this.props.dateFormat.split("-");

    	return dateFormat;
    }

	dateUpdate(key,value){
		let dateFormat = this.getDateFormat();

		let _date = this.state.date;

	    _date[key] = value;
	    this.setState({date:_date});

		if(Object.keys(this.state.date).length == 3){
			let _fData = this.state.date[dateFormat[0]]+"-"+this.state.date[dateFormat[1]]+"-"+this.state.date[dateFormat[2]];

			if(this.props.required){
				status = "valid";
			}else{
				status = "";
			}

			this.props.optChange(this.props.dateType, _fData, status);
		}

	}

	render(){
		let _this = this;
		let dateFormat = this.getDateFormat();
		let defaultDate = this.state.defaultDateOpt.split("-");

		let errorStyles = {
            color         : "#ed0909",
            fontSize      : "0.8em",
            textTransform : "capitalize",
            margin        : '10px 0 0',
            display       : "inline-block"
        }

		return(
			<div className="col-xs-5">
            	<p>{this.props.title} {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""} </p>
                <div className="row row-clr">
					{
						dateFormat.map(function(date,i){
							return <Dropdown fieldName={date} dateChange={_this.dateUpdate.bind(this)} defaultVal={date} startYear={(date == "yyyy")? _this.state.startYear : null} errorMsg={_this.props.error_message} key={i} />;
						})
					}
					{(this.props.error_message)? <span className="invalid-msg" style={errorStyles}>{this.props.error_message}</span> : null}
                </div>
            </div>
		);
	}
}

class Dropdown extends React.Component{
	constructor(props) {
        super(props);

				let defaultOption = (this.props.defaultVal) ? this.props.defaultVal : "";

				this.state = {
					defaultOpt : defaultOption
				}

        this.selectChange = this.selectChange.bind(this);
		this.currYear = new Date().getFullYear();
    }

    selectChange(e){
			this.setState({defaultOpt : e.target.value});
			this.props.dateChange(this.props.fieldName,e.target.value);
    }

		componentDidMount(){
			if(this.state.defaultOpt){
				this.props.dateChange(this.props.fieldName,this.state.defaultOpt);
			}
		}

	render(){
		let start;
        let end;
		let options = [];
		let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		let fieldName = this.props.fieldName;
        let startYear = (this.props.startYear)? this.props.startYear : "1960";

		switch(fieldName) {
		    case "mm":
		        start = "1";
		        end = "12";
		        break;
		    case "dd":
		        start = "1";
		        end = "31";
		        break;
		    case "yyyy":
				end = this.currYear;
		        start = startYear;
		        break;

		}

		for(let i = start; i <= end; i++){
			i = (i < 10 ? '0'+ i : i);
			options.push(i);
		}

		let opts = {};

		if (this.props.errorMsg) {
            opts['style'] = {"borderColor" : "#ed0909"};
        }

		if (fieldName == "yyyy") {
			options.sort(function(a, b){return b-a});
		}

		return(
			<div className="pgs-sign-select-about-col">
                <select name={this.props.fieldName}
                        className="pgs-sign-select"
                        value={this.state.defaultOpt}
                        onChange={this.selectChange.bind(this)} {...opts}>
                    <option value="">{this.props.fieldName}</option>
                    {(fieldName == "mm")?
						months.map(function(month, i){
					        return <option value={i+1} key={i}>{month}</option>;
					    })
						:
						options.map(function(opt, i){
					        return <option value={opt} key={i}>{opt}</option>;
					    })
					}
                </select>
            </div>
		);
	}
}
