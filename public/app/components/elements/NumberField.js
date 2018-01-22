/**
 * Number Field Component
 */
import React from 'react';
export default class NumberField extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            value: (this.props.value)? this.props.value : ""
        };


    }
    componentDidMount(){

    }
    elementChangeHandler(e){
        let zipCode = this.state.value;
        console.log(e.keyCode);
            if (e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault();
            }else{
                zipCode = e.target.value.substring(0,5);
                this.setState({value : zipCode});
            }
        this.props.onInputChange(this.props.name,this.state.value);
    }

    render(){
        let size = "input-field col-xs-" + this.props.size;
        let isValid = (typeof this.props.validate == 'undefined')?true:false;
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

        return (
            <div className={size}>

                <p>{this.props.label} {this.props.required ? <span style={{"color": "#ed0909"}}>*</span> : ""} </p>

                <input type="number"
                   name={this.props.name}
                   value={this.state.value}
                   placeholder={this.props.placeholder}
                   className={this.props.classes}
                   onChange={(event)=>{ this.elementChangeHandler(event)}}
                   onKeyPress={(event)=>{ this.elementChangeHandler(event)}}
                   onBlur={(event)=>{ this.elementChangeHandler(event)}}
                    {...opts}  />
                {(this.props.error_message)? <span className="invalid-msg" style={errorStyles}>{this.props.error_message}</span> : null}
            </div>
        );
    }

};
