import React from "react";
import {Scrollbars} from "react-custom-scrollbars";
import messageHelper from "./MessageHelper";
import Session from "../../../middleware/Session";

export default class MessageList extends React.Component{
    constructor(props){
        super(props);
        this.state ={minimizeChat : this.props.minimizeChat};
        this.loggedUser = this.props.loggedUser;
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate(){
        this.scrollToBottom();
    }

    scrollToBottom() {
        if(Object.keys(this.refs).length > 0){
            for(var key in this.refs){
                if(key == "msgScrollBar"){
                    const scrollbars = this.refs[key];
                    const scrollHeight = scrollbars.getScrollHeight();
                    scrollbars.scrollToBottom(scrollHeight);
                }
            }
        }
    }

    setAsActiveBubble() {
        let convId = "usr:" + this.props.conv.proglobeTitle;
        this.props.setActiveBubbleId(convId);
    }

    render() {
        let _this = this;
        // TODO: Figure out how to get a profile image for the Twilio group.
        //let receiver_image = _this.props.conv.user.images.profile_image.http_url;
        let receiver_image = "/images/default-profile-pic.png";
        // TODO: check out this.props.messages.
        let _messages = null;
        if (this.props.messages) {
          _messages = this.props.messages.map(function(msg, key){
              // Check message content for an s3 upload link. (for file uploads)
              let currentUser = Session.getSession('prg_lg');
              let userName = currentUser.id;
              let author = msg.author;
              // check author against the currently logged in user.
              let content = messageHelper.processMessageString(msg.body);
              return (
                  <div className={author !== userName ? "chat-msg received" : "chat-msg sent"} key={key}>
                      {
                          (msg.cssClass == "receiver")?
                              <div className="pro-img">
                                  <img src={receiver_image} className="img-responsive" />
                              </div>
                              :
                              null
                      }
                      {
                          content.messageLink ?
                              content.messageLink.substring(content.messageLink.length-4).toLowerCase() === ".jpg" || content.messageLink.substring(content.messageLink.length-4).toLowerCase() === ".png" ?
                                  <p className="msg">
                                      <a href={content.messageLink} target="_blank">
                                          <img src={content.messageLink} className="img-responsive"/>
                                      </a>
                                  </p>
                              :
                              <p className="msg">
                                  <a href={content.messageLink} style={{color: "white"}} target="_blank">{"File Upload: " + content.messageContent}</a>
                              </p>
                          :
                          <p className="msg">{msg.body}</p>
                      }
                  </div>
              );
          });
        }


        let chatHeight = 250;
        if (this.props.emojiPickerActive && !this.props.minimizeChat) {
            chatHeight = 50;
        }

        return (
            <div className="conv-holder" onClick={this.setAsActiveBubble.bind(this)} style={{height: chatHeight}}>
                <Scrollbars ref="msgScrollBar" autoHide={true} autoHideTimeout={1000} autoHideDuration={200} >
                    {_messages}
                    {
                        /*This is the UI to show that someone else is currently typing */
                        this.props.someoneTyping ?
                        <div className="chat-msg received">
                            <div className="pro-img">
                                <img src={receiver_image} className="img-responsive" />
                            </div>
                            <p className="msg">...</p>
                        </div>
                        :
                        null
                    }
                </Scrollbars>
            </div>
        );
    }
}
