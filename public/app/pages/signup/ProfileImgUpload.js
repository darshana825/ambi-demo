//ProfileImgUpload
import React from 'react'
import Button from '../../components/elements/Button'
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../../components/elements/SecretaryThumbnail'
import ProfileImageUploader from '../../components/elements/ProfileImageUploader'
import ProgressBar from '../../components/elements/ProgressBar'

export default class ProfileImgUpload extends React.Component{

	constructor(props){
		super(props);
      	this.loggedUser = Session.getSession('prg_lg');

		this.state = {
	        profileImg : (typeof  this.loggedUser.profile_image != "undefined")?this.loggedUser.profile_image:"",
			loadingBarIsVisible : false
	    };

	}

	profileImgUpdated(img){
		this.setState({profileImg : img});
	}

	onBack(){
			this.props.onPreviousStep()
	}

	uploadImg(){
		this.setState({loadingBarIsVisible : true});
        let _this =  this;
        $.ajax({
            url: '/upload/profile-image',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.loggedUser.token },
            data:{profileImg:this.state.profileImg,extension:'png'},
            cache: false,
            contentType:"application/x-www-form-urlencoded",
            success: function (data, text) {
                if (data.status.code == 200) {
					_this.setState({loadingBarIsVisible : false});
                    Session.createSession("prg_lg", data.user);

                    if(typeof data.profile_image != 'undefined'){

                        var _pay_load = {};
                        _pay_load['__content'] = "";
                        _pay_load['__hs_attachment'] = true;
                        _pay_load['__post_mode'] = "PP";//profile update post
                        _pay_load['__profile_picture'] = data.profile_image;

                        $.ajax({
                            url: '/post/profile-image-post',
                            method: "POST",
                            dataType: "JSON",
                            headers: {'prg-auth-header': Session.getSession('prg_lg')},
                            data: _pay_load,
                            cache: false,
                            contentType: "application/x-www-form-urlencoded",
                            success: function (data, text) {
                                if (data.status.code == 200) {
                                    location.href ="/";
                                }
                            },
                            error: function (request, status, error) {
                                console.log(request.responseText);
                                console.log(status);
                                console.log(error);
                            }
                        });

                    } else{
                        location.href ="/";
                    }


                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
	}

	render() {
        let user = Session.getSession('prg_lg');
		let _secretary_image = user.secretary_image_url;
		return (

			<div className="row row-clr pgs-middle-sign-wrapper pgs-middle-about-wrapper">
            	<div className="container">

                    <div className="col-xs-8 pgs-middle-sign-wrapper-inner">

                    	<div className="row signupContentHolder">

                        	<SecretaryThumbnail url={_secretary_image} />

                            <div className="col-xs-12">
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-cover pgs-middle-sign-wrapper-inner-cover-secretary pgs-middle-sign-wrapper-about">
                                <img src="images/sign-left-arrow-1.png" alt="" className="img-responsive pgs-sign-left-arrow"/>

                                    <div className="row row-clr pgs-middle-sign-wrapper-about-inner pgs-middle-sign-wrapper-about-inner-establish-conn">
                                        <h1>Hello {user.first_name},</h1>
                                        <h2>Welcome to Proglobe</h2>
                                    </div>

                                    <div className="row row-clr pgs-middle-sign-wrapper-inner-form pgs-middle-sign-wrapper-about-inner-form pgs-middle-sign-wrapper-complete-inner-form">

                                    	<h6>Congratulations! You’re profile is now complete.</h6>

                                        <p>But wait! I don’t even know what you look like.</p>

                                        <p>Would you like to upload a picture now?</p>

										<div className="Profile-pic-main proImgHolder">
											<img src={(this.state.profileImg == "")?"/images/default-profile-pic.png":this.state.profileImg} alt="Default user profile image" id="previewProfileImg" className="img-responsive Profile-pic-uploaded"/>
											<ProfileImageUploader profileImgSrc={this.state.profileImg} imgUpdated={this.profileImgUpdated.bind(this)} />
										</div>

                                         <div className="row">
	                                        <Button type="button" size="6" classes="pgs-sign-submit-cancel" value="back" onButtonClick = {this.onBack.bind(this)} />
	                                        <Button type="button" size="6" classes="pgs-sign-submit" value="finish" onButtonClick={()=>this.uploadImg()} />
	                                    </div>
                                    </div>

                                </div>
                        	</div>


                        </div>


                    </div>

                </div>
				{(this.state.loadingBarIsVisible)? <div className="ProgressBarHolder"><ProgressBar /></div> : null}
            </div>
		);
	}
}
