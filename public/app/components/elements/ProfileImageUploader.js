/**
 * This is Profile Image Uploader Component
 */
'use strict';
import React from 'react';
import Cropper from 'react-cropper';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ProgressBar from './ProgressBar';

export default class ProfileImageUploader extends React.Component{
    constructor(props){
        super(props);
        this.state={
            src : "",
            isShowingModal : false,
            cropResult : null,
            cropperVisible : false,
            progressbarIsVisible : false
        };
    }

    cropImage(){
        let imgSrc = this.refs.cropper.getCroppedCanvas().toDataURL();
        this.props.imgUpdated(imgSrc);
        this.setState({src: imgSrc});
        this.handleClose();
    }

    onChange(e){
        e.preventDefault();
        this.setState({cropperVisible : true, progressbarIsVisible: true});
        let files;

        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
            if(files[0].size > 2097152){
                alert("File you selected is too large.");
                this.setState({cropperVisible : false, progressbarIsVisible: false});
            }else{
                let reader = new FileReader();
                reader.onload = () => {
                    this.setState({src: reader.result, progressbarIsVisible: false});
                };
                reader.readAsDataURL(files[0]);
            }
        }else{
            this.setState({cropperVisible : false, progressbarIsVisible: false});
        }

    }

    getCropper(){
        return (
            <div>
                {
                    (this.state.cropperVisible)?
                    <Cropper
                    ref='cropper'
                    src={this.state.src}
                    style={{height: '450px', width: '100%'}}
                    guides={true}
                    crop={this.cropImage}
                    aspectRatio={140/140}
                    checkCrossOrigin={false}
                    />
                    :
                    <div className="noImage">
                        <img src="/images/no_image.png" />
                        <p className="notice-text">*image should be less than 2MB.</p>
                    </div>
                }
                {(this.state.progressbarIsVisible)? <div className="progressBarHolder"><ProgressBar /></div> : null}
                <div className="imgUploadBtnHolder">
                    <label htmlFor="newCoverImg" className="coverImgUpload pgs-sign-submit btn-img-cropper" >
                        upload file
                        <input type='file' onChange={this.onChange.bind(this)} id="newCoverImg" />
                    </label>
                    {(this.state.cropperVisible)? <button onClick={this.cropImage.bind(this)} style={{float: 'right'}} className="pgs-sign-submit" >crop image</button> : null}
                </div>
            </div>
        )
    }

    handleClick() {
        this.setState({isShowingModal: true})
    }

    handleClose() {
        this.setState({isShowingModal: false})
    }

    getPopup(){
        return(
            <div onClick={this.handleClick}>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%" style={{marginTop : "-100px"}}>
                            <h3>image cropper</h3>
                            {this.getCropper()}
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    render(){
        return (
            <div className="imageSelector">
                <a onClick={(event)=>{this.handleClick()}} title="Edit Profile Image"></a>
                {this.getPopup()}
            </div>)
    }
}
