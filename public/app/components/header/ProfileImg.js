import React from 'react'
import Session  from '../../middleware/Session'

export default class ProfileImg extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            userLogedIn : Session.getSession('prg_lg'),
            imgSrc : "/images/default-profile-pic.png"
        }


    }


    componentDidMount(){
        if(this.state.userLogedIn.profile_image){
              this.setState({imgSrc : this.state.userLogedIn.profile_image});
            }
        }
    loadProfile(event){
        window.location.href ='/profile/'+this.state.userLogedIn.user_name
    }

    render() {
        let _full_name = this.state.userLogedIn.first_name +" "+ this.state.userLogedIn.last_name;
        return (
            <div className="profile-header-thumb">
                <a href="javascript:void(0)" onClick={event=>this.loadProfile(event)} title={_full_name}>
                    <img src={this.state.imgSrc} alt={_full_name} className="img-responsive" />
                </a>
            </div>
        );
    }
}
