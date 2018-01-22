import React from 'react'
import Session  from '../../middleware/Session';

export default class SidebarManuItem extends React.Component{

	render(){
		let item = this.props.item;

		return(
			<div className="row row-clr pg-nav-item-wrapper">
                <a href={item.link} >
                    <img className="img-responsive" alt="navigation links" src={"/images/" + item.imgName + ".png"} />
                    <p>{item.name}</p>
                </a>
            </div>
		);
	}
}
