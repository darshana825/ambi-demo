import React from "react"
import SidebarMenuItem from "../elements/SidebarMenuItem"

export default class SidebarNav extends React.Component{
	constructor(props){
		super(props);

		}
	render(){
		let menuItemList = this.props.menuItems;
		let menuItems = menuItemList.items.map((menuobject,key)=>{
				return (	<SidebarMenuItem item={menuobject} key={key} />)

		});
		//console.log("=====SidebarNav======"+this.props.blockRight)
		//TODO::
		// if side right & blockRight true need to hide

		let workmodeCSS = (this.props.blockRight)?" workmode-switched":"";

		return(
			<div>
				<div className={"row row-clr pg-"+this.props.side+"-nav-wrapper "+workmodeCSS}>
					<div className="bx-wrapper">
						{
							(this.props.blockRight) ?
								null
								:
								<div className="bx-viewport">
									{menuItems}
								</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
