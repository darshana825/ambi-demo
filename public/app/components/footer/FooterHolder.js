import React from 'react';
import Session  from '../../middleware/Session';
import Socket  from '../../middleware/Socket';
import WorkMode from '../../middleware/WorkMode';
import WmCountdown from '../elements/WmCountdown';

export default class FooterHolder extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            notificationCount: 0,
            loggedUser: Session.getSession('prg_lg'),
            isNavHidden: false
        };
        Socket.connect();
        this.listenToNotification();
        this.getNotificationCount();
        this.updateNotificationPopCount = this.updateNotificationPopCount.bind(this);
    }

    getNotificationCount() {
        if (!this.props.blockSocialNotification) {
            $.ajax({
                url: '/notifications/get-notification-count',
                method: "GET",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token}
            }).done(function (data, text) {

                if (data.status.code == 200) {
                    this.setState({notificationCount: data.count});
                }
            }.bind(this));
        }
    }

    listenToNotification() {
        if (!this.props.blockSocialNotification) {
            let _this = this;

            Socket.listenToNotification(function (data) {
                console.log("Got Notification from footer");
                let _notificationType = typeof data.notification_type != "undefined" ? data.notification_type : data.data.notification_type;

                if (_notificationType == "Birthday") {
                    _this.state.notificationCount++;
                } else {
                    if (data.user != _this.state.loggedUser.user_name) {
                        console.log("Increase")
                        let _notCount = _this.state.notificationCount;
                        _notCount++;
                        _this.setState({notificationCount: _notCount});
                        _this.updateNotificationPopCount(_notCount);
                    }
                }

            });
        }
    }

    onWorkmodeClick() {
        this.props.onWorkmodeClick();
    }

    onNotifiClick(e) {
        this.props.onNotifiTypeClick(e.target.id, this.state.notificationCount);
    }

    updateNotificationPopCount(count) {
        this.props.onUpdateNotifiPopupCount(count);
    }

    onNavCollapse() {
        let isHidden = this.state.isNavHidden;

        if (this.props.currPage) {
            this.setState({isNavHidden: !isHidden});
            this.props.onNavCollapse();
        }
    }

    render() {
        let currPage = this.props.currPage;
        let _sesData = Session.getSession('prg_lg');
        let {remainingTime} = this.state;
        let _secretary_image = _sesData.secretary_image_url;

        let footerClass = (!this.state.isNavHidden) ? "" : "navHidden";

        const {
            notificationCount
        }=this.state;
        let dashboardCSS = (currPage) ? "dashboard-footer" : " " + footerClass;
        let workmodeCSS = (this.props.blockBottom) ? " workmode-switched nav-holder clearfix" : "nav-holder clearfix";
        //console.log("=====Footer Holder======"+this.props.blockBottom)
        //TODO::
        // if blockBottom true need to hide
        return (
            <footer className={dashboardCSS}>
                {/**<div>

                 <div className={"row row-clr pg-footer-wrapper "+workmodeCSS}>
                 <div className="pg-footer-left-options-panel">
                 <a href="/notifications">
                 <div className="col-xs-2 pgs-secratery-img">
                 <img src={_secretary_image} alt="Secretary" className="img-responsive" />
                 {notificationCount>0?<span className="counter">{notificationCount}</span>:null}
                 </div>
                 </a>
                 <div className="pg-footer-left-options">
                 <div className="notifi-type-holder">
                 <i className="fa fa-list-alt" id="todos" onClick={(event) => this.onNotifiClick(event)}></i>
                 {notificationCount>0?<span className="notifi-counter">{notificationCount}</span>:null}
                 </div>
                 <div className="notifi-type-holder">
                 <i className="fa fa-globe" id="social" onClick={(event) => this.onNotifiClick(event)}></i>
                 {notificationCount>0?<span className="notifi-counter">{notificationCount}</span>:null}
                 </div>
                 <div className="notifi-type-holder">
                 <i className="fa fa-line-chart" id="productivity" onClick={(event) => this.onNotifiClick(event)}></i>
                 {notificationCount>0?<span className="notifi-counter">{notificationCount}</span>:null}
                 </div>
                 </div>
                 </div>
                 {
                     (this.props.blockBottom)?
                         null
                         :
                         <div className="container">
                             <div className="pg-footer-top-control-panel">
                                 <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/footer-control-ico-1.png"
                                                                                      alt="" className="img-responsive"/>
                                     split</a>
                                 <a href="#" onClick={event=>onLinkClick(event)}><img src="/images/footer-control-ico-2.png"
                                                                                      alt="" className="img-responsive"/>
                                     full</a>
                             </div>
                         </div>
                 }
                 <div className="pg-footer-right-options-panel">
                 <div className="pg-footer-right-options-panel-inner" onClick={this.onWorkmodeClick.bind(this)}>
                 <img src="/images/footer-right-image.png" alt="Logo" className="img-responsive"/>
                 <p>Work Mode</p>
                 </div>
                 </div>

                 </div>
                 </div>
                 **/}
                <div className="container">
                    <section
                        className={(!this.state.isNavHidden) ? "notification-alert-holder" : "notification-alert-holder slideOut"}>
                        <div className="notifi-brand-icon" onClick={this.onNavCollapse.bind(this)}>
                            <img src="/images/brand-icon.png" alt="Ambi Icon"/>
                        </div>
                        <div className="notifi-icon-holder">
                            <div className="todo-notifi notifi-icons" id="events"
                                 onClick={(event) => this.onNotifiClick(event)}>
                                <span className="icon" id="events"></span>
                                {notificationCount > 0 ? <span className="has-notifi"></span> : null}
                            </div>
                            <div className="social-notifi notifi-icons" id="social"
                                 onClick={(event) => this.onNotifiClick(event)}>
                                <span className="icon" id="social"></span>
                                {notificationCount > 0 ? <span className="has-notifi"></span> : null}
                            </div>
                            <div className="productivity-notifi notifi-icons" id="work"
                                 onClick={(event) => this.onNotifiClick(event)}>
                                <span className="icon" id="work"></span>
                                {notificationCount > 0 ? <span className="has-notifi"></span> : null}
                            </div>
                        </div>
                    </section>
                    {
                        (!this.state.isNavHidden) ?
                            <section className={workmodeCSS}>
                                <div className={(currPage == "calendar")? "calendar nav-item active" : "calendar nav-item"}>
                                    {/*<a href="/calendar">*/}
                                    <a href="#">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">Calendar</p>
                                    </a>
                                </div>
                                <div className={(currPage == "notes")? "notebooks nav-item active" : "notebooks nav-item"}>
                                    <a href="/notes">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">Notebooks</p>
                                    </a>
                                </div>
                                <div className={(currPage == "folders")? "folders nav-item active" : "folders nav-item"}>
                                    <a href="/folders">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">Folders</p>
                                    </a>
                                </div>
                                <div className={(currPage == "groups")? "groups nav-item active" : "groups nav-item"}>
                                    <a href="/groups">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">Groups</p>
                                    </a>
                                </div>
                                <div className={(currPage == "news")? "news nav-item active" : "news nav-item"}>
                                    <a href="/news">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">News</p>
                                    </a>
                                </div>
                                <div className={(currPage == "interests")? "interests nav-item active" : "interests nav-item"}>
                                    <a href="#">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">Interests</p>
                                    </a>
                                </div>
                                <div className={(currPage == "callcenter")? "call-center nav-item active" : "call-center nav-item"}>
                                    {/*<a href="/callcenter">*/}
                                    <a href="#">
                                        <span className="icon-holder"></span>
                                        <p className="nav-title">Call Center</p>
                                    </a>
                                </div>
                            </section>
                            :
                            null
                    }
                    {
                        (!this.state.isNavHidden) ?
                            <section className="work-mode-holder" onClick={this.onWorkmodeClick.bind(this)}>
                                <div className="icon-holder">
                                    <img src="/images/work-mode-icon.png" alt="work mode icon"/>
                                </div>
                                <p className="section-title">Work mode</p>
                                <WmCountdown isVisibleSection="wmFooterTimer" isWmTimerActive={this.props.isWmTimerActive} />
                            </section>
                            :
                            null
                    }
                </div>
            </footer>

        );
    }
}
