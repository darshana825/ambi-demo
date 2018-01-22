import React from 'react'
import Button from '../../components/elements/Button'

export default class ImgUploader extends React.Component{
	constructor(props){
		super(props);

		this.state = {imgPreview : this.props.defaultImg};

		this.previewImg = this.previewImg.bind(this);
	}

	previewImg(e){
	    var img = document.getElementById("previewProfileImg");
	    let file = e.target.files[0];
	    let imgSrc;
	    let imgAlt = this.state.imgPreview;

		img.file = file;


	    var reader = new FileReader();
	    reader.onload = (function(aImg,context) { 

	    	return function(e) { 
	    	imgSrc = e.target.result; 
			context.setState({imgPreview:imgSrc});
			
			context.props.imgUploaded(imgSrc);
	    }; 

	    })(img,this);
	    reader.readAsDataURL(file);

	}

	render() {
		return (
			<div className="Profile-pic-main">
            	<form id="proImgUpload">
				    <div className="Profile-pic-display-area">
					    <input type='file' id="imgUpload" onChange={this.previewImg} />
					    <img src={this.state.imgPreview} alt="Default user profile image" id="previewProfileImg" />
	                </div>
				    <div className="Profile-pic-display-btn-area">
				    	<label htmlFor="imgUpload"> Upload </label>
	                </div>
				</form>
            </div>
		);
	}
}