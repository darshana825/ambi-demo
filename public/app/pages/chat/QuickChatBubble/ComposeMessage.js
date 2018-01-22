import React from "react";
import {Alert} from "../../../config/Alert";
import CommunicationsProvider from "../../../middleware/CommunicationsProvider";
import ReactS3Uploader from "react-s3-uploader";
import {Picker} from "emoji-mart";
import {Scrollbars} from "react-custom-scrollbars";

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "block"
};

let unfriendStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    margin        : "0 15px"
};

export default class ComposeMessage extends React.Component{
    constructor(props) {
        super(props);
        this.loggedUser = this.props.loggedUser;
        this.state = {
            validateAlert: "",
            formData: {},
            msgText: "",
            emojiPickerVisible: false
        };

        this.chatProvider = CommunicationsProvider.getChatProvider();
        this.elementChangeHandler = this.elementChangeHandler.bind(this);

        this.handleUploadClick = this.handleUploadClick.bind(this);
        this.onUploadProgress = this.onUploadProgress.bind(this);
        this.onUploadError = this.onUploadError.bind(this);
        this.onUploadFinish = this.onUploadFinish.bind(this);
        this.toggleEmojiPickerVisible = this.toggleEmojiPickerVisible.bind(this);

        // TODO: Would be nice to use redux / mobx to handle emoji selected events.
        this.onEmojiSelected = this.onEmojiSelected.bind(this);
    }

    // TODO: remove dead code.
    onUploadProgress(uploadProgressResult) {
    }

    // TODO: remove dead code.
    onUploadError(uploadErrorResult) {
    }

    onUploadFinish(result) {
        // Send a properly formatted message to the other user with the upload file information.
        this.sendS3Message(result);
    }

    handleUploadClick(e) {
        let fileInput = this.refs.s3Uploader;
        fileInput.click();
    }

    elementChangeHandler(event){
        this.setState({msgText : event.target.value});
        // Send the typing notification here.
        let channel = this.props.conv;
        this.chatProvider.sendTypingNotification(channel);
    }

    sendMessage(e){
        e.preventDefault();
        let _this = this;
        if(this.state.msgText.match(/^\s*$/)) {
            this.setState({validateAlert: Alert.EMPTY_MESSAGE});
            return 0;
        } else{
            let msg = this.state.msgText;
            let channel = this.props.conv;
            let messageBody = {
                message: msg,
                title: channel.friendlyName,
                uri: channel.sid
            };

            this.setState({msgText: "", validateAlert : ""});
            this.props.sendChat(messageBody, channel);
        }
    }

    sendS3Message(s3FileInfo) {
        let _this = this;
        let fileName = s3FileInfo.filename;
        let messageText = "s3URL=" + s3FileInfo.publicUrl + ",s3FileName=" + fileName;
        let channel = this.props.conv;
        let messageBody = {
            message: messageText,
            title: channel.friendlyName
        }
        // Now send the message to the other user
        this.props.sendChat(messageBody, channel);
    }

    onEnter(e){
        if (e.keyCode == 13) {
            this.sendMessage(e);
        }
    }

    setAsActiveBubble() {
        let convId = "usr:" + this.props.conv.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    onEmojiSelected(emoji) {
        let _msgText = this.state.msgText + emoji.native;
        this.setState({
            msgText: _msgText           
        });
    }

    toggleEmojiPickerVisible() {
        //let parent component know that we want to make the emoji picker visible or invisible.
        let _emojiPickerVisible = this.state.emojiPickerVisible;
        this.setState({
            emojiPickerVisible: !_emojiPickerVisible
        });
        this.props.toggleEmojiPickerVisible();
    }

    render(){
        // TODO: Remove unused code.
        /*return(
         <div>
         {
         (!this.props.minimizeChat)?
         <form onSubmit={this.sendMessage.bind(this)} id="chatMsg">
         <div className="chat-msg-input-holder">
         <div className="msg-input">
         <textarea className="form-control" placeholder="New Message..." name="msg" value={this.state.msgText}
         onChange={(event)=>{ this.elementChangeHandler(event)}}
         onKeyDown={(event)=>{this.onEnter(event)}}
         ></textarea>
         </div>
         </div>
         <div className="chat-msg-options-holder">
         <div className="send-msg">
         <button type="submit" className="btn btn-default send-btn">Send</button>
         </div>
         </div>
         {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
         </form>
         :
         null
         }
         </div>
         )*/
        let _wmMsg = this.props.prg_wm_msg;
        let _isUserOnWorkMode = this.props.isUserOnWorkMode;

        return (
            (!this.props.minimizeChat) ?
                <div>
                    {
                        this.state.emojiPickerVisible ?
                        <Scrollbars style={{height: 200}}>
                            <Picker 
                                title='Pick your emoji…'
                                emoji='point_up'
                                native={false}
                                set='apple'
                                perLine={7}
                                onClick={this.onEmojiSelected.bind(this)} 
                            />
                        </Scrollbars>
                        :
                        null
                    }
                <form onSubmit={this.sendMessage.bind(this)} id="chatMsg">
                    <div className="compose-msg" onClick={this.setAsActiveBubble.bind(this)}>
                        <textarea className="form-control" placeholder="Type your message here" name="msg" value={this.state.msgText}
                                  onChange={(event)=>{ this.elementChangeHandler(event)}}
                                  onKeyDown={(event)=>{this.onEnter(event)}} disabled={_wmMsg || _isUserOnWorkMode}
                        ></textarea>
                        <button className="submit-btn btn" disabled={_wmMsg || _isUserOnWorkMode}></button>
                    </div>
                    {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
                    <div className="footer-opt-bar">
                        <span className="opt-icon text-format"></span>
                        <span className="opt-icon emotican" onClick={this.toggleEmojiPickerVisible.bind(this)}></span>
                        <span className="opt-icon image" onClick={this.handleUploadClick.bind(this)}>
                            <label ref="s3Uploader">
                                <ReactS3Uploader
                                    signingUrl="/s3/sign"
                                    signingUrlMethod="GET"
                                    accept="image/*"
                                    style={{display: "none"}}
                                    onProgress={this.onUploadProgress.bind(this)}
                                    onError={this.onUploadError.bind(this)}
                                    onFinish={this.onUploadFinish.bind(this)}
                                    signingUrlHeaders={{ additional: {
                                        "Access-Control-Allow-Origin": "*"
                                    } }}
                                    uploadRequestHeaders={{
                                        "Access-Control-Allow-Origin": "*"
                                    }}
                                    contentDisposition="auto"
                                    />
                            </label>
                        </span>
                        <span className="opt-icon paperclip" onClick={this.handleUploadClick.bind(this)}>
                            <label ref="s3Uploader">
                                <ReactS3Uploader
                                    signingUrl="/s3/sign"
                                    signingUrlMethod="GET"
                                    accept="/*"
                                    style={{display: "none"}}
                                    onProgress={this.onUploadProgress.bind(this)}
                                    onError={this.onUploadError.bind(this)}
                                    onFinish={this.onUploadFinish.bind(this)}
                                    signingUrlHeaders={{ additional: {
                                        "Access-Control-Allow-Origin": "*"
                                    } }}
                                    uploadRequestHeaders={{
                                        "Access-Control-Allow-Origin": "*"
                                    }}
                                    contentDisposition="auto"
                                    />
                            </label>
                        </span>
                        <span className="opt-icon search"></span>
                    </div>

                    {
                        (_wmMsg || _isUserOnWorkMode) ?
                            <div className="footer-opt-bar">
                                <span className="opt-icon text-format"></span>
                                <span className="opt-icon emotican"></span>
                                <span className="opt-icon image"></span>
                                <span className="opt-icon location"></span>
                                <span className="opt-icon paperclip"></span>
                                <span className="opt-icon search"></span>
                            </div>
                            :
                            <div className="footer-opt-bar">
                                <span className="opt-icon text-format"></span>
                                <span className="opt-icon emotican" onClick={this.toggleEmojiPickerVisible.bind(this)}></span>
                                <span className="opt-icon image" onClick={this.handleUploadClick.bind(this)}>
                                    <label ref="s3Uploader">
                                        <ReactS3Uploader
                                            signingUrl="/s3/sign"
                                            signingUrlMethod="GET"
                                            accept="image/*"
                                            style={{display: "none"}}
                                            onProgress={this.onUploadProgress.bind(this)}
                                            onError={this.onUploadError.bind(this)}
                                            onFinish={this.onUploadFinish.bind(this)}
                                            signingUrlHeaders={{ additional: {
                                                "Access-Control-Allow-Origin": "*"
                                            } }}
                                            uploadRequestHeaders={{
                                                "Access-Control-Allow-Origin": "*"
                                            }}
                                            contentDisposition="auto"
                                        />
                                    </label>
                                </span>
                                <span className="opt-icon location"></span>
                                <span className="opt-icon paperclip" onClick={this.handleUploadClick.bind(this)}>
                                    <label ref="s3Uploader">
                                        <ReactS3Uploader
                                            signingUrl="/s3/sign"
                                            signingUrlMethod="GET"
                                            accept="/*"
                                            style={{display: "none"}}
                                            onProgress={this.onUploadProgress.bind(this)}
                                            onError={this.onUploadError.bind(this)}
                                            onFinish={this.onUploadFinish.bind(this)}
                                            signingUrlHeaders={{ additional: {
                                                "Access-Control-Allow-Origin": "*"
                                            } }}
                                            uploadRequestHeaders={{
                                                "Access-Control-Allow-Origin": "*"
                                            }}
                                            contentDisposition="auto"
                                        />
                                    </label>
                                </span>
                                <span className="opt-icon search"></span>
                            </div>
                    }

                </form>
                </div>
                :
                null
        );
    }
}
