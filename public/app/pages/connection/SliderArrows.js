/**
 * This is react slick slider arrows component
 */
import React from 'react';

export class SampleNextArrow extends React.Component {
    render() {
        let clsName;
        if(typeof this.props.className.split(" ")[2] != "undefined" && this.props.className.split(" ")[2] == "slick-disabled"){
            clsName = this.props.className.split(" ")[2] + "next";
        }else {
            clsName = "next";
        }
        return (
            <span {...this.props} className={clsName}></span>
        );
    }
}

export class SamplePrevArrow extends React.Component {
    render(){
        let clsName;
        if(typeof this.props.className.split(" ")[2] != "undefined" && this.props.className.split(" ")[2] == "slick-disabled"){
            clsName = this.props.className.split(" ")[2] + " previous";
        }else {
            clsName = "previous";
        }
        return (
            <span {...this.props} className={clsName}></span>
        );
    }
}