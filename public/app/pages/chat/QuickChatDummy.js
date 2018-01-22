// TODO: Is this code even used any more? I don't think it is. What purpose does it serve now and how should we use it moving forward?
import React from 'react';
import moment from 'moment';

export default class QuickChatDummy extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dummyChatList:this.props.dummyChatList,
            minimizeList:[],
            isNavHidden: this.props.isNavHidden
        };
        this.minimizeList=[];
    }


    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.dummyChatList != 'undefined' && nextProps.dummyChatList) {
            this.setState({dummyChatList: nextProps.dummyChatList, isNavHidden: nextProps.isNavHidden});
        }
    }

    closeQuickChat(_id) {
        // TODO: Remove comment.
        //console.log("about to close chat >> ", _id);
        this.props.closeQuickChat(_id);
    }

    onClickMinimize(_id) {
        // TODO: Remove comment.
        //console.log("about to minimize chat >> ", _id);
        if(this.minimizeList.indexOf(_id) == -1) {
            this.minimizeList.push(_id);
            this.setState({minimizeList: this.minimizeList});
        }
    }

    onUndoMinimize(_id) {
        // TODO: Remove comment.
        //console.log("about to undo minimize chat >> ", _id);
        let _index = this.minimizeList.indexOf(_id);
        if(_index != -1) {
            this.minimizeList.splice(_index, 1);
            this.setState({minimizeList: this.minimizeList});
        }
    }

    getChatById(_id) {
        // TODO: Remove comment.
        //console.log("about to load chat by id >> ", _id);
        let isMinimized = this.state.minimizeList.indexOf(_id) != -1 ? true : false;
        switch(_id) {
            case 1:
                return this.loadFirstChat(isMinimized);
            case 2:
                return  this.loadSecondChat(isMinimized);
            case 3:
                return  this.loadThirdChat(isMinimized);
            default:
                return null;
        }
    }

    loadFirstChat(_isMinimized) {
        // TODO: Remove comment.
        //console.log("about to load first chat **** ", _isMinimized);
        return _isMinimized === true ?
            (
                <div className="chat-bubble minimized" onClick={() => this.onUndoMinimize(1)}>
                    <div className="bubble-header clearfix">
                        <div className="pro-pic">
                            <img src="images/header-icons/dropdown/pic1.png" className="img-responsive" />
                        </div>
                        <div className="username-holder">
                            <h3 className="name">Science Group</h3>
                            <span className="all-media-btn">all media</span>
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon phn-icon"></span>
                            <span className="icon video-icon"></span>
                            <span className="icon close-icon" onClick={() => this.closeQuickChat(1)}></span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="chat-bubble">
                    <div className="bubble-header clearfix">
                        <div className="pro-pic">
                            <img src="images/header-icons/dropdown/pic1.png" className="img-responsive" />
                        </div>
                        <div className="username-holder">
                            <h3 className="name">Science Group</h3>
                            <span className="all-media-btn">all media</span>
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon phn-icon"></span>
                            <span className="icon video-icon"></span>
                            <span className="icon minimize-icon" onClick={() => this.onClickMinimize(1)}></span>
                            <span className="icon close-icon" onClick={() => this.closeQuickChat(1)}></span>
                        </div>
                    </div>
                    <div className="conv-holder">
                        <div className="chat-msg received">
                            <div className="pro-img">
                                <img src="images/header-icons/dropdown/pic1.png" className="img-responsive" />
                            </div>
                            <p className="msg">First line goes like this here second line looks like this third line looks something like this After the 4th theres 12 px of space</p>
                        </div>
                        <div className="chat-msg sent">
                            <div className="pro-img">
                                <img src="images/call-center/user-pro-img.png" className="img-responsive" />
                            </div>
                            <p className="msg">Text has 6 pixels of padding  on L/R</p>
                        </div>
                        <div className="chat-msg received">
                            <div className="pro-img">
                                <img src="images/header-icons/dropdown/pic1.png" className="img-responsive" />
                            </div>
                            <p className="msg">Text is in work sans regular and consists of 11 line spacing…</p>
                        </div>
                        <div className="chat-msg sent">
                            <div className="pro-img">
                                <img src="images/call-center/user-pro-img.png" className="img-responsive" />
                            </div>
                            <p className="msg">and it’s in size 7</p>
                        </div>
                        <div className="chat-msg received">
                            <div className="pro-img">
                                <img src="images/header-icons/dropdown/pic1.png" className="img-responsive" />
                            </div>
                            <p className="msg">Hey can you upload the new notes to groups?</p>
                        </div>
                    </div>
                    <div className="compose-msg">
                        <input type="text" className="form-control" placeholder="Type your message here" />
                        <button className="submit-btn btn"></button>
                    </div>
                    <div className="footer-opt-bar">
                        <span className="opt-icon text-format"></span>
                        <span className="opt-icon video"></span>
                        <span className="opt-icon emotican"></span>
                        <span className="opt-icon image"></span>
                        <span className="opt-icon voice"></span>
                        <span className="opt-icon location"></span>
                        <span className="opt-icon search"></span>
                    </div>
                </div>
            );
    }
    loadSecondChat(_isMinimized) {
        // TODO: Remove this console.log statement.
        console.log("about to load second chat **** ", _isMinimized);
        return _isMinimized === true ?
            (
                <div className="chat-bubble minimized" onClick={() => this.onUndoMinimize(2)}>
                    <div className="bubble-header clearfix">
                        <div className="pro-pic">
                            <img src="images/header-icons/dropdown/pic2.png" className="img-responsive"/>
                        </div>
                        <div className="username-holder">
                            <h3 className="name">Tamia Bello</h3>
                            <span className="all-media-btn">all media</span>
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon phn-icon"></span>
                            <span className="icon video-icon"></span>
                            <span className="icon close-icon" onClick={() => this.closeQuickChat(2)}></span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="chat-bubble">
                        <div className="bubble-header clearfix">
                            <div className="pro-pic">
                                <img src="images/header-icons/dropdown/pic2.png" className="img-responsive"/>
                            </div>
                            <div className="username-holder">
                                <h3 className="name">Tamia Bello</h3>
                                <span className="all-media-btn">all media</span>
                            </div>
                            <div className="opt-icons clearfix">
                                <span className="icon phn-icon"></span>
                                <span className="icon video-icon"></span>
                                <span className="icon minimize-icon" onClick={() => this.onClickMinimize(2)}></span>
                                <span className="icon close-icon" onClick={() => this.closeQuickChat(2)}></span>
                            </div>
                        </div>
                        <div className="conv-holder">
                            <div className="chat-msg received">
                                <div className="pro-img">
                                    <img src="images/call-center/chat-user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">First line goes like this here second line looks like this third line
                                    looks something like this After the 4th theres 12 px of space</p>
                            </div>
                            <div className="chat-msg sent">
                                <div className="pro-img">
                                    <img src="images/call-center/user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">Text has 6 pixels of padding on L/R</p>
                            </div>
                            <div className="chat-msg received">
                                <div className="pro-img">
                                    <img src="images/call-center/chat-user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">Text is in work sans regular and consists of 11 line spacing…</p>
                            </div>
                            <div className="chat-msg sent">
                                <div className="pro-img">
                                    <img src="images/call-center/user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">and it’s in size 7</p>
                            </div>
                            <div className="chat-msg received">
                                <div className="pro-img">
                                    <img src="images/call-center/chat-user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">Hey can you upload the new notes to groups?</p>
                            </div>
                        </div>
                        <div className="compose-msg">
                            <input type="text" className="form-control" placeholder="Type your message here"/>
                            <button className="submit-btn btn"></button>
                        </div>
                        <div className="footer-opt-bar">
                            <span className="opt-icon text-format"></span>
                            <span className="opt-icon video"></span>
                            <span className="opt-icon emotican"></span>
                            <span className="opt-icon image"></span>
                            <span className="opt-icon voice"></span>
                            <span className="opt-icon location"></span>
                            <span className="opt-icon search"></span>
                        </div>
                    </div>
            );
    }
    loadThirdChat(_isMinimized) {
        console.log("about to load third chat **** ", _isMinimized);
        return _isMinimized === true ?
            (
                <div className="chat-bubble minimized" onClick={() => this.onUndoMinimize(3)}>
                    <div className="bubble-header clearfix">
                        <div className="pro-pic">
                            <img src="images/header-icons/dropdown/pic3.png" className="img-responsive" />
                        </div>
                        <div className="username-holder">
                            <h3 className="name">Jayden Rye</h3>
                            <span className="all-media-btn">all media</span>
                        </div>
                        <div className="opt-icons clearfix">
                            <span className="icon phn-icon"></span>
                            <span className="icon video-icon"></span>
                            <span className="icon close-icon" onClick={() => this.closeQuickChat(3)}></span>
                        </div>
                    </div>

                </div>

            ) : (
                <div className="chat-bubble">
                        <div className="bubble-header clearfix">
                            <div className="pro-pic">
                                <img src="images/header-icons/dropdown/pic3.png" className="img-responsive"/>
                            </div>
                            <div className="username-holder">
                                <h3 className="name">Jayden Rye</h3>
                                <span className="all-media-btn">all media</span>
                            </div>
                            <div className="opt-icons clearfix">
                                <span className="icon phn-icon"></span>
                                <span className="icon video-icon"></span>
                                <span className="icon minimize-icon" onClick={() => this.onClickMinimize(3)}></span>
                                <span className="icon close-icon" onClick={() => this.closeQuickChat(3)}></span>
                            </div>
                        </div>
                        <div className="conv-holder">
                            <div className="chat-msg received">
                                <div className="pro-img">
                                    <img src="images/header-icons/dropdown/pic3.png" className="img-responsive"/>
                                </div>
                                <p className="msg">First line goes like this here second line looks like this third line
                                    looks something like this After the 4th theres 12 px of space</p>
                            </div>
                            <div className="chat-msg sent">
                                <div className="pro-img">
                                    <img src="images/call-center/user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">Text has 6 pixels of padding on L/R</p>
                            </div>
                            <div className="chat-msg received">
                                <div className="pro-img">
                                    <img src="images/header-icons/dropdown/pic3.png" className="img-responsive"/>
                                </div>
                                <p className="msg">Text is in work sans regular and consists of 11 line spacing…</p>
                            </div>
                            <div className="chat-msg sent">
                                <div className="pro-img">
                                    <img src="images/call-center/user-pro-img.png" className="img-responsive"/>
                                </div>
                                <p className="msg">and it’s in size 7</p>
                            </div>
                            <div className="chat-msg received">
                                <div className="pro-img">
                                    <img src="images/header-icons/dropdown/pic3.png" className="img-responsive"/>
                                </div>
                                <p className="msg">Hey can you upload the new notes to groups?</p>
                            </div>
                        </div>
                        <div className="compose-msg">
                            <input type="text" className="form-control" placeholder="Type your message here"/>
                            <button className="submit-btn btn"></button>
                        </div>
                        <div className="footer-opt-bar">
                            <span className="opt-icon text-format"></span>
                            <span className="opt-icon video"></span>
                            <span className="opt-icon emotican"></span>
                            <span className="opt-icon image"></span>
                            <span className="opt-icon voice"></span>
                            <span className="opt-icon location"></span>
                            <span className="opt-icon search"></span>
                        </div>
                    </div>
            );
    }

    renderChatList() {
        let _this = this;
        return this.state.dummyChatList.map(function(_chat, key){
            return(
                _this.getChatById(_chat)
            );
        });
    }

    render() {
        return (
            <section className={this.state.isNavHidden == true ? "chat-bubble-holder menu-hidden" : "chat-bubble-holder"}>
                <div className="container clearfix">
                    { this.renderChatList() }
                </div>
            </section>

        )
    }
}