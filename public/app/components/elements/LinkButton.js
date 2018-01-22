import React from 'react';

export default class LinkButton extends React.Component{
	constructor(props){
		super(props);
		this.state = {};

		this.respond = this.respond.bind(this);
	}

	respond(){
		this.props.click(console.log("clicked"));
	}

	render() {
		let size = " col-xs-" + this.props.size;
    	let classes = this.props.classes + size;

		return (
			<div className={classes}>
            	<a href={this.props.link} className={this.props.extraClasses} onClick={this.respond}>{this.props.value}</a>
        	</div>
		);
	}
}