import React from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';

export default class DummyConversationList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    handleMessageClick(id) {
        this.props.onMessaging(id);
    }

    render() {
        return (
            <section className="chat-popover-holder">
                <div className="inner-wrapper">
                    <div className="popover-header">
                        <div className="top-section clearfix">
                            <p className="inbox-count header-text clearfix">
                                <span className="count">(56)</span>inbox
                            </p>
                            <p className="mark-all header-text">mark all as read</p>
                            <p className="new-msg header-text">new message</p>
                        </div>
                        <div className="bottom-section">
                            <input type="text" className="form-control" placeholder="search" />
                            <i className="fa fa-search" aria-hidden="true"></i>
                        </div>
                    </div>
                    <div className="chat-list-holder">
                        <Scrollbars style={{ height: 357 }}>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(1)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic1.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Science Group</h3>
                                        <p className="chat-time">@ 7:33pm</p>                                        
                                    </div>
                                    <p className="chat-msg">Awesome! I’ll see you guys tomorrow then :D</p>
                                    <span className="mark-read" title="mark as read"></span>
                                </div>
                            </div>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(2)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic2.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Tamia Bello</h3>
                                        <p className="chat-time">@ 3:05pm</p>                                        
                                    </div>
                                    <p className="chat-msg">Hey can you upload the new notes to groups?</p>
                                    <span className="mark-read"></span>
                                </div>
                            </div>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(3)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic3.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Jayden Rye</h3>
                                        <p className="chat-time">@Tue 9:41pm</p>                                     
                                    </div>
                                    <p className="chat-msg">The book was SO much bettter than the movie</p>
                                    <span className="mark-read"></span>
                                </div>
                            </div>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(4)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic4.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Leah Amber</h3>
                                        <p className="chat-time">Seen @Tue 10:27pm</p>                                    
                                    </div>
                                    <p className="chat-msg">Thanks for helping tonight, it’s good to see you! </p>
                                    <span className="mark-read"></span>
                                </div>
                            </div>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(5)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic5.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Helena Hernandez</h3>
                                        <p className="chat-time">@Mon 10:27pm</p>                                   
                                    </div>
                                    <p className="chat-msg">Agreed! Let’s talk logistics on thursday</p>
                                    <span className="mark-read"></span>
                                </div>
                            </div>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(6)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic6.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Helena Hernandez</h3>
                                        <p className="chat-time">@Mon 10:27pm</p>                                   
                                    </div>
                                    <p className="chat-msg">Agreed! Let’s talk logistics on thursday</p>
                                    <span className="mark-read"></span>
                                </div>
                            </div>
                            <div className="chat-item clearfix" onClick={() => this.handleMessageClick(7)}>
                                <div className="prof-img">
                                    <img src="images/header-icons/dropdown/pic7.png" className="img-responsive" />
                                </div>
                                <div className="chat-preview">
                                    <div className="chat-preview-header clearfix">
                                        <h3 className="prof-name">Tony Pham</h3>
                                        <p className="chat-time">Seen @Sun 10:27pm</p>                                  
                                    </div>
                                    <p className="chat-msg">Have fun on your trip! Cool runnings :D</p>
                                    <span className="mark-read"></span>
                                </div>
                            </div>
                        </Scrollbars>
                        <p className="see-all">see all</p>
                    </div>
                </div>
            </section>
        );
    }
}
