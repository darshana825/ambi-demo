import React from "react";

export default class Toast extends React.Component{
    constructor(props){
        super(props);
        this.state={};
    }

    // onToastClose(){

    // }
    
    render(){
        return(
            <section className={"toast-holder " + this.props.type}>
                <div className="inner-wrapper">
                    <p className="toast-text">{this.props.msg}</p>
                    <i className="fa fa-times" onClick={(e) => this.props.onToastClose()}></i>
                </div>
            </section>
        )
    }

} 