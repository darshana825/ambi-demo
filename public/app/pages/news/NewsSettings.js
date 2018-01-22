/*
* News COntainer Component
*/

import React from 'react';
import _ from 'lodash';
import ArrayIndexofProp from 'array-index-of-property';
import NewsArticalThumb from '../../components/elements/NewsArticalThumb';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session  from '../../middleware/Session';
import {Scrollbars} from 'react-custom-scrollbars';
import Slider from 'react-slick';
import {SampleNextArrow, SamplePrevArrow} from '../../components/elements/SliderArrows'

export default class NewsSettings extends React.Component {
    constructor(props) {
        super(props);

        let user = Session.getSession('prg_lg');
        if (user == null) {
          window.location.href = "/";
        }

        this.state = {
            loggedUser: Session.getSession('prg_lg'),
            data: {},
            isShowingModal: false,
            isShowingTopicModal: false,
            popUpContent: {},
            popup: "",
            news_categories: [],
            subscribed_categories: [],
            modifiedTopics: {
                add: [],
                remove: []
            },
            onTopicSelect: ""
        };

        this.onPopUp = this.onPopUp.bind(this);
        this.addNewsChannel = this.addNewsChannel.bind(this);
        this.removeNewsChannel = this.removeNewsChannel.bind(this);
        this.selectTopic = this.selectTopic.bind(this);
        this.updateTopics = this.updateTopics.bind(this);
        this.loadSubscribedCategories = this.loadSubscribedCategories.bind(this);
        this.isaSubscribedTopic = this.isaSubscribedTopic.bind(this);

        this.loadCategories();
        this.loadSubscribedCategories();
        // this.addNewsChannel();
        // this.removeNewsChannel();
    }

    loadCategories(){
        $.ajax({
            url: '/news/get-categories',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({news_categories:data.news})
            }
        }.bind(this));
    }

    loadSubscribedCategories(){
        $.ajax({
            url: '/news/get-subscribed/topics',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({subscribed_categories:data.topics});
            }
        }.bind(this));
    }

    addNewsChannel(){

        let channelData ={
            __channel_id: '591ee53fc6c869131223e1be',
            __category_id: '591ee53fc6c869131223e1c1'
        };

        $.ajax({
            url: '/news/user-channel/composer',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data: channelData,
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.loadCategories();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }
        });

    }

    removeNewsChannel(channelId, categoryId){
        let channelData ={
            __channel_id: channelId,
            __category_id: categoryId
        };

        $.ajax({
            url: '/news/user-channel/remove',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data: channelData,
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.loadCategories();
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(status);
                console.log(error);
            }
        });
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onPopUp(id,type){

        let popupdata = this.articalCats,
            popup;

        for(var key in popupdata){
            popupdata[key].news.map(function(news){
                if (news.id === id) {
                    popup = news;
                }
            })
        }

        this.setState({isShowingModal: true, popup: popup});
    }

    getPopup(){
        let popupData = this.state.popup;

        return(
            <div>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%" style={{marginTop : "-100px"}}>
                            <div className="modal-body pg-modal-body">
                                <img className="img-responsive pg-main-pop-img" alt src={popupData.mainImgLink} />
                                <div className="row row-clr pg-new-news-popup-inner-container">
                                <h3 className="pg-body-heading-title">{popupData.title}</h3>
                                <div className="row row-clr pg-new-news-popup-inner-border" />
                                {}
                                <div dangerouslySetInnerHTML={{__html: popupData.description}} />
                                </div>
                            </div>

                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    onNewsCategoryClick(is_favourite,category_id){


        $.ajax({
            url: '/user/news/add-category',
            method: "POST",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            data:{nw_cat_id:category_id,fav:is_favourite}
        }).done(function (data, text) {
            console.log(data)
            if (data.status.code == 200) {
                this.loadCategories();

            }
        }.bind(this));

    }

    updateTopics(){
        let modifiedTopics = this.state.modifiedTopics,
            topicData ={
            _formatted_subscribed_topics: [],
            _formatted_unsubscribed_topics: []
        };

        let _subscribed_topics = modifiedTopics.add, _unsubscribed_topics = modifiedTopics.remove;

        for(let i = 0; i < _subscribed_topics.length; i++){
            topicData['_formatted_subscribed_topics'].push(_subscribed_topics[i]._id);
        }

        for(let i = 0; i < _unsubscribed_topics.length; i++){
            topicData['_formatted_unsubscribed_topics'].push(_unsubscribed_topics[i]._id);
        }

        if(topicData._formatted_subscribed_topics.length > 0){
             $.ajax({
                 url: '/news/subscribe/topics',
                 method: "POST",
                 dataType: "JSON",
                 headers: { 'prg-auth-header':this.state.loggedUser.token },
                 data: {_topic_ids: topicData._formatted_subscribed_topics},
                 success: function (data, text) {
                     if (data.status.code == 200) {
                        this.loadSubscribedCategories();
                     }
                 }.bind(this)
             });
         }

        if(topicData._formatted_unsubscribed_topics.length > 0) {
            $.ajax({
                url: '/news/unsubscribe/topics',
                method: "POST",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token},
                data: {_topic_ids: topicData._formatted_unsubscribed_topics},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        this.loadSubscribedCategories();
                    }
                }.bind(this)
            });
         }

        this.setState({isShowingTopicModal: false, modifiedTopics: {add: [], remove: []}});
    }

    handleTopicClose(){
        this.setState({isShowingTopicModal: false, modifiedTopics: {add: [], remove: []}});
    }

    selectTopic(topic, isSubscribedTopic){
        let subscribedTopics = this.state.subscribed_categories, modifiedTopics = this.state.modifiedTopics;
        let subscribed_index = subscribedTopics.indexOfProperty('category_id', topic._id);

        if(!isSubscribedTopic){
            let modified_index_remove = modifiedTopics.remove.indexOfProperty('_id', topic._id);

            if(modified_index_remove >= 0){
                modifiedTopics.remove.splice(modified_index_remove, 1);
            }

            if(subscribed_index < 0){
                modifiedTopics['add'].push(topic);
            }

        }else {
            let modified_index_add = modifiedTopics.add.indexOfProperty('_id', topic._id);

            if(modified_index_add >= 0){
                modifiedTopics.add.splice(modified_index_add, 1);
            }

            if(subscribed_index >= 0){
                modifiedTopics['remove'].push(topic);
            }
        }

        this.setState({modifiedTopics: modifiedTopics});
    }

    isaSubscribedTopic(newsCategory){
        let subscribedTopics = this.state.subscribed_categories, modifiedTopics = this.state.modifiedTopics;

        let subscribed_index = subscribedTopics.indexOfProperty('category_id', newsCategory._id);
        let modified_index_add = modifiedTopics.add.indexOfProperty('_id', newsCategory._id);
        let modified_index_remove = modifiedTopics.remove.indexOfProperty('_id', newsCategory._id);

        if(((subscribed_index >= 0 && modified_index_add < 0) || (subscribed_index < 0 && modified_index_add >= 0))
            && !(subscribed_index >= 0 && modified_index_remove >= 0)) {
            return true;
        }else {
            return false;
        }
    }

    newsCategories(categories) {
        let _this = this;

        let components = categories.map(function (newsCategory, index) {
            let topicCls = "topic " + newsCategory.category.toLowerCase();
            let backGroundImg = "/images/news/topic-covers/" + newsCategory.category.categoryImage;

            let isSubscribedTopic = _this.isaSubscribedTopic(newsCategory);

            return (
                <div className={topicCls} style={{background: backGroundImg}} onClick={(e) => _this.selectTopic(newsCategory, isSubscribedTopic)} key={index}>
                    <div className="news-cover">
                        <div className="content-wrapper">
                            <h3 className="topic-title">{newsCategory.category}</h3>
                        </div>
                    </div>
                    <span className={(isSubscribedTopic) ? "selected" : ""}></span>
                </div>
            )
        });

        return components;
    }

    wrap(items, groupSize) {

        let groups = _.map(items, function (item, index) {
            return index % groupSize === 0 ? items.slice(index, index + groupSize) : null;
        }).filter(function (item) {
            return item;
        });

        return groups.map(function (item, key) {
            return (
                <div className='topic-slide-holder' key={key}>
                    {item}
                </div>
            );
        });

    }

    addNewsTopic(){
        let sliderSettings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            slide:'topic-slide-holder',
            nextArrow: <SampleNextArrow />,
            prevArrow: <SamplePrevArrow />
        };

        let _news_categories = this.wrap(this.newsCategories(this.state.news_categories), 6);
        let btnText = ((this.state.modifiedTopics.add.length > 0) || (this.state.modifiedTopics.remove.length > 0)) ? "Update" : "add topics";
        return(
            <div>
                {this.state.isShowingTopicModal &&
                <ModalContainer onClose={this.handleTopicClose.bind(this)} zIndex={9999}>
                    <ModalDialog className="modalPopup newsModalPopup" width="438px">
                        <section className="popup-holder">
                            <div className="add-news-topic-popup news-popup">
                                <section className="news-popup-header">
                                    <h2>add new topic</h2>
                                    <p className="topic-txt">select your topic</p>
                                </section>
                                <section className="news-popup-body">
                                    <div className="topic-wrapper clearfix">
                                        <Slider {...sliderSettings}>
                                            {_news_categories}
                                        </Slider>
                                    </div>
                                </section>
                                <section className="news-popup-footer">
                                    <div className="action-bar">
                                        <button className="btn btn-add-topic" onClick={this.updateTopics.bind(this)}> {btnText}</button>
                                    </div>
                                </section>
                            </div>
                        </section>
                        <a className="closeButton--jss-0-1" onClick={(e) => this.handleTopicClose(e)}>
                            <svg width="40" height="40">
                                <circle cx="20" cy="20" r="20" fill="black"></circle>
                                <g transform="rotate(45 20 20)">
                                    <rect x="8" y="19.25" width="24" height="1.5" fill="white"></rect>
                                    <rect y="8" x="19.25" height="24" width="1.5" fill="white"></rect>
                                </g>
                            </svg>
                        </a>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    handleTopicModel(){
        this.setState({isShowingTopicModal: true});
    }

    render() {
        const {
            subscribed_categories
            } = this.state;
        let _this= this;
        let _news_category_template = subscribed_categories.map(function(newsCategory, index){

            return(
                <NewsCategory newsCategory={newsCategory}
                              removeNewsChannel = {_this.removeNewsChannel}
                              loadSubscribedCategories = {_this.loadSubscribedCategories}
                              onCategorySelect={_this.onNewsCategoryClick.bind(_this)}
                              key={index} />
            )
        });


        return (
            <div className="news-container">
                <div className="container">
                    <section className="news-header">
                        <div className="row">
                            <div className="col-sm-2">
                                <h2>news</h2>
                            </div>
                            <div className="col-sm-10">
                                <div className="header-opt-inner-wrapper clearfix">
                                    <div className="crt-news">
                                        <button className="btn btn-crt-news" onClick={this.handleTopicModel.bind(this)}>
                                            <i className="fa fa-plus"></i> add news topics
                                        </button>
                                    </div>
                                    <div className="search-news">
                                        <span className="inner-addon">
                                            <i className="fa fa-search"></i>
                                            <input type="text" className="form-control" placeholder="Search"/>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="news-body">
                        <SavedArticles />
                        {
                            _news_category_template
                        }
                    </div>
                </div>
                {(this.state.isShowingTopicModal) ? this.addNewsTopic() : null}
            </div>
        );
    }
}

// const NewsCategory = ({newsCategory,onCategorySelect})=>{
//
//     let _opt_class = newsCategory.category.toLowerCase();
//
//     let _channel_template = newsCategory.channels.map(function(channel,key){
//         return (
//             <NewsChannels newsChannel ={channel}
//                           key={key}/>
//         )
//     });
//
//     let _selected = (newsCategory.is_favorite)?"selected":"";
//     return (
//         <div className={"row row-clr pg-news-page-content-item pg-box-shadow "+ _selected + " "+ _opt_class}
//              onClick ={event=>onCategorySelect(newsCategory.is_favorite,newsCategory._id)}>
//
//             <div className={"col-xs-2 pg-news-page-content-item-left-thumb "+_opt_class }>
//                 <div className="cat-icon-holder">
//                     <span className="cat-icon"></span>
//                     <h3 className="cat-title">{newsCategory.category}</h3>
//                 </div>
//             </div>
//             <div className="col-xs-10 pg-news-page-content-item-right-thumbs">
//                 <div className="pg-news-page-content-item-right-inner-box">
//                     <div className="pg-news-item-main-row">
//
//                         {_channel_template}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
//
// }

export class NewsCategory extends React.Component{
    constructor(props){
        super(props);

        this.state={
            loggedUser: Session.getSession('prg_lg'),
            isShowingModal : false,
            isCollapsed: true,
            isShowingChannelModal: false,
            onChannelSelect: "",
            modifiedChannels: {
                add: [],
                remove: []
            }
        };

        this.topicId = this.props.newsCategory.category_id;

        this.onAddChannelClick = this.onAddChannelClick.bind(this);
        this.updateChannels = this.updateChannels.bind(this);
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    onCategorySelect(){
        this.props.onCategorySelect(this.props.newsCategory.is_favorite,this.props.newsCategory._id);
    }

    onAddChannelClick(event){
        event.stopPropagation();
        this.setState({isShowingModal: true});
    }

    getPopup(){
        let chanels = [];
        let dummyObj = {
            channel_image : "tnw.png"
        }
        for (let i=0; i < 9; i++) {
            chanels.push(<NewsChannels newsChannel ={dummyObj} key={i} canDelete={false} />);
        }
        return(
            <div key={this.props.key}>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="432px" className="add-chanel-popup">
                            <div className="popup-wrapper clearfix">
                                <div className="popup-header">
                                    <h3 className="popup-title">Add News Channels</h3>
                                    <div className="form-group channel-search-holder">
                                        <input type="text" className="form-controllor" placeholder="Search for channels" />
                                        <i className="fa fa-search" aria-hidden="true"></i>
                                    </div>
                                </div>
                                <div className="popup-content-holder">
                                    <Scrollbars style={{ height: 280 }}>
                                            {chanels}
                                    </Scrollbars>
                                </div>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    onNewsCatExpand(){
        let isCollapsed = this.state.isCollapsed;
        this.setState({isCollapsed : !isCollapsed});
    }

    updateChannels(){
        let _this = this, modifiedChannels = this.state.modifiedChannels,
            channelData ={
                _formatted_subscribed_channels: [],
                _formatted_unsubscribed_channels: []
            };

        let _subscribed_channels = modifiedChannels.add, _unsubscribed_channels = modifiedChannels.remove;

        for(let i = 0; i < _subscribed_channels.length; i++){
            channelData['_formatted_subscribed_channels'].push(_subscribed_channels[i]._id);
        }

        for(let i = 0; i < _unsubscribed_channels.length; i++){
            channelData['_formatted_unsubscribed_channels'].push(_unsubscribed_channels[i]._id);
        }

        if(channelData._formatted_subscribed_channels.length > 0){
            $.ajax({
                url: '/news/user-channel/composer',
                method: "POST",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.state.loggedUser.token },
                data: {_topic_id: this.topicId, _news_channels: channelData._formatted_subscribed_channels},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        setTimeout(function(){ _this.props.loadSubscribedCategories(); }, 1500);
                    }
                }.bind(this)
            });
        }

        if(channelData._formatted_unsubscribed_channels.length > 0) {
            $.ajax({
                url: '/news/user-channel/remove',
                method: "POST",
                dataType: "JSON",
                headers: {'prg-auth-header': this.state.loggedUser.token},
                data: {_topic_id: this.topicId, _news_channels: channelData._formatted_unsubscribed_channels},
                success: function (data, text) {
                    if (data.status.code == 200) {
                        setTimeout(function(){ _this.props.loadSubscribedCategories(); }, 1500);
                    }
                }.bind(this)
            });
        }

        this.setState({isShowingChannelModal: false, modifiedChannels: {add: [], remove: []}});
    }

    handleChannelClose(){
        this.setState({isShowingChannelModal : false, modifiedChannels: {add: [], remove: []}});
    }

    selectChannel(newsChannel, isSubscribedChannel){
        let subscribedChannels = this.props.newsCategory.subscribed_channels, modifiedChannels = this.state.modifiedChannels;
        let subscribed_index = subscribedChannels.indexOfProperty('channel_id', newsChannel._id);

        if(!isSubscribedChannel){
            let modified_index_remove = modifiedChannels.remove.indexOfProperty('_id', newsChannel._id);

            if(modified_index_remove >= 0){
                modifiedChannels.remove.splice(modified_index_remove, 1);
            }

            if(subscribed_index < 0){
                modifiedChannels['add'].push(newsChannel);
            }

        }else {
            let modified_index_add = modifiedChannels.add.indexOfProperty('_id', newsChannel._id);

            if(modified_index_add >= 0){
                modifiedChannels.add.splice(modified_index_add, 1);
            }

            if(subscribed_index >= 0){
                modifiedChannels['remove'].push(newsChannel);
            }
        }

        this.setState({modifiedChannels: modifiedChannels});
    }

    isaSubscribedChannel(newsChannel){
        let subscribedChannels = this.props.newsCategory.subscribed_channels, modifiedChannels = this.state.modifiedChannels;

        let subscribed_index = subscribedChannels.indexOfProperty('channel_id', newsChannel._id);
        let modified_index_add = modifiedChannels.add.indexOfProperty('_id', newsChannel._id);
        let modified_index_remove = modifiedChannels.remove.indexOfProperty('_id', newsChannel._id);

        if(((subscribed_index >= 0 && modified_index_add < 0) || (subscribed_index < 0 && modified_index_add >= 0))
            && !(subscribed_index >= 0 && modified_index_remove >= 0)) {
            return true;
        }else {
            return false;
        }
    }

    newsChannels(categories) {
        let _this = this;

        let components = categories.map(function (newsChannel, index) {
            let backGroundImg = "url(/images/news/channels/" + newsChannel.channel_image + ")";
            let isaSubscribedChannel = _this.isaSubscribedChannel(newsChannel);

            return (
                <div className="channel" onClick={(e) => _this.selectChannel(newsChannel, isaSubscribedChannel)} key={index}>
                    <span className="news-chanel hbr-chanel" style={{background: backGroundImg}}></span>
                    <span className={(isaSubscribedChannel)? "selected" : ""}></span>
                </div>
            )
        });

        return components;
    }

    wrap(items, groupSize) {

        let groups = _.map(items, function (item, index) {
            return index % groupSize === 0 ? items.slice(index, index + groupSize) : null;
        }).filter(function (item) {
            return item;
        });

        return groups.map(function (item, key) {
            return (
                <div className='channel-slide-holder' key={key}>
                    {item}
                </div>
            );
        });

    }

    addChannelPopup(){
        let sliderSettings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            nextArrow: <SampleNextArrow />,
            prevArrow: <SamplePrevArrow />
        };

        let _news_channels = this.wrap(this.newsChannels(this.props.newsCategory.channels), 6);
        let btnText = ((this.state.modifiedChannels.add.length > 0) || (this.state.modifiedChannels.remove.length > 0)) ? "update" : "add news channels";

        return(
            <div>
                {this.state.isShowingChannelModal &&
                <ModalContainer onClose={this.handleChannelClose.bind(this)} zIndex={9999}>
                    <ModalDialog className="modalPopup newsModalPopup" width="438px">
                        <section className="popup-holder">
                            <div className="add-news-channel-popup news-popup">
                                <section className="news-popup-header">
                                    <div className="title-wrapper">
                                        <h2 className="topic-title">{this.props.newsCategory.category}</h2>
                                    </div>
                                    <h2>add channels to your topic</h2>
                                    <p className="topic-txt">select channels to follow</p>
                                </section>
                                <section className="news-popup-body">
                                    <div className="channel-wrapper clearfix">
                                        <Slider {...sliderSettings}>
                                            {_news_channels}
                                        </Slider>
                                    </div>
                                </section>
                                <section className="news-popup-footer">
                                    <div className="action-bar">
                                        <button className="btn btn-add-topic" onClick={this.updateChannels.bind(this)}><i className="fa fa-plus"></i> {btnText}</button>
                                    </div>
                                </section>
                            </div>
                        </section>
                    </ModalDialog>
                </ModalContainer>
                }
            </div>
        );
    }

    addChannel(){
        this.setState({isShowingChannelModal : true});
    }

    render(){
        let _opt_class = this.props.newsCategory.category.toLowerCase();
        let _selected = (this.props.newsCategory.is_favorite)?"selected":"";
        let _this = this;
        /*let _channel_template = this.props.newsCategory.channels.map(function(channel,key){
            return (
                <NewsChannels category = {_this.props.newsCategory} newsChannel ={channel} removeNewsChannel = {_this.props.removeNewsChannel}
                              key={key}/>
            )
        });*/

        let _channel_template = this.props.newsCategory.subscribed_channels.map(function(channel,key){
            let backGroundImg = "url(/images/news/channels/" + channel.channel_image + ")";
            return (
                <div className="news-col" key={key}>
                    <span className="news-chanel hbr-chanel" style={{background: backGroundImg}}></span>
                </div>
            )
        });
        return (
            <div>
                {/*<div className={"row row-clr pg-news-page-content-item pg-box-shadow "+ _selected + " "+ _opt_class}
                     onClick ={this.onCategorySelect.bind(this)}>
                    <div className={"col-xs-2 pg-news-page-content-item-left-thumb "+_opt_class }>
                        <div className="cat-icon-holder">
                            <span className="cat-icon"></span>
                            <h3 className="cat-title">{this.props.newsCategory.category}</h3>
                        </div>
                    </div>
                    <div className="col-xs-10 pg-news-page-content-item-right-thumbs">
                        <div className="pg-news-page-content-item-right-inner-box">
                            <div className="pg-news-item-main-row">
                                <div className="add-chanel-wrapper pg-news-item" onClick={this.onAddChannelClick}>
                                    <i className="fa fa-plus" aria-hidden="true"></i>
                                    <p>Add Channel</p>
                                </div>
                                {_channel_template}
                            </div>
                        </div>
                    </div>
                    {this.getPopup()}
                </div>*/}
                <div className={(this.state.isCollapsed)? "row news-topic " + _selected : "row news-topic see-all " + _selected}>
                    <div className="news-wrapper">
                        <div className="col-sm-2 topic-cover">
                            <div className={"news-cover-wrapper " + _opt_class}>
                                <div className="news-cover">
                                    <div className="content-wrapper">
                                        <h3>{this.props.newsCategory.category}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-10 channel-wrapper">
                            <div className="row">
                                <div className="news-content-wrapper">
                                    <div className="news-items-wrapper">
                                        <div className="news-col" onClick={this.addChannel.bind(this)}>
                                            <div className="news-chanel upload-file">
                                                <i className="fa fa-plus"></i>
                                                <p>add news channel</p>
                                            </div>
                                        </div>
                                        {_channel_template}
                                    </div>
                                    {
                                        (this.props.newsCategory.subscribed_channels.length > 4)?
                                            (!this.state.isCollapsed)?
                                                <div className="see-all" onClick={this.onNewsCatExpand.bind(this)}>
                                                    <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                    <p>See All</p>
                                                </div>
                                                :
                                                <div className="see-all" onClick={this.onNewsCatExpand.bind(this)}>
                                                    <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                    <p>See Less</p>
                                                </div>
                                            :
                                            null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {(this.state.isShowingChannelModal) ? this.addChannelPopup() : null}
            </div>
        )
    }
}


// const NewsChannels = ({newsChannel})=>{
//
//     let _channel_img = "/images/news/channels/"+newsChannel.channel_image;
//     return (
//         <div className="col-xs-2 pg-col-20 pg-news-item" >
//             <div className="row row-clr pg-news-inner-full various">
//                 <img src={_channel_img} alt="" className="img-responsive pg-pg-news-inner-img" />
//                 <span className="delete-icon">
//                     <i className="fa fa-times" aria-hidden="true"></i>
//                 </span>
//             </div>
//         </div>
//     )
// }

export class NewsChannels extends React.Component{
    constructor(props){
        super(props);

        this.state={}
    }

    onChannelDelete(event){
        event.stopPropagation();

        let categoryId = this.props.category._id;
        let channelId = this.props.newsChannel._id;

        this.props.removeNewsChannel(channelId, categoryId);
    }

    render(){
        let _channel_img = "/images/news/channels/"+this.props.newsChannel.channel_image;
        let _channel_date = this.props.newsChannel.date.time_a_go;
        return(
            <div className="col-xs-2 pg-col-20 pg-news-item" >
                <div className="row row-clr pg-news-inner-full various">
                    <p className="pg-pg-news-inner-time">{_channel_date}</p>
                    <img src={_channel_img} alt="" className="img-responsive pg-pg-news-inner-img" />
                    {
                        (this.props.canDelete != false)?
                            <span className="delete-icon" onClick={this.onChannelDelete.bind(this)}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </span>
                        :
                            null
                    }
                </div>
            </div>
        )
    }
}


export class SavedArticles extends React.Component{

    constructor(props){
        super(props);
        this.state={
            articles:[],
            isShowingModal : false,
            popupData:"",
            allArticalsAreVisible: false,
            loggedUser:Session.getSession('prg_lg')
        };

        this.loadArticles();
        this.popUpArtical = this.popUpArtical.bind(this);
        this.showMoreArticals = this.showMoreArticals.bind(this);
    }

    loadArticles(){
        $.ajax({
            url: '/news/saved/articles',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':this.state.loggedUser.token }
        }).done(function (data, text) {
            if (data.status.code == 200) {
                this.setState({articles:data.news_list})
            }
        }.bind(this));
    }

    handleClose() {
        this.setState({isShowingModal: false});
    }

    getPopup(){
        let popupData = this.state.popupData;

        let _articalImage = '/images/image_not_found.png';
        if(popupData.article_image != null){
            _articalImage = popupData.article_image;
        }

        return(
            <div>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%">
                            <div className="modal-body pg-modal-body">
                                <div className="popup-img-holder">
                                    <img className="img-responsive pg-main-pop-img" alt src={_articalImage} />
                                </div>
                                <div className="row row-clr pg-new-news-popup-inner-container">
                                <h3 className="pg-body-heading-title">{popupData.heading}</h3>
                                <div className="row row-clr pg-new-news-popup-inner-border" />
                                <Scrollbars style={{ height: 250 }} onScroll={this.handleScroll}>
                                    <div dangerouslySetInnerHTML={{__html: popupData.content}} />
                                </Scrollbars>
                                </div>
                            </div>
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    popUpArtical(data){
        this.setState({popupData: data, isShowingModal: true});
    }

    showMoreArticals(){
        let visibilityState = this.state.allArticalsAreVisible;
        this.setState({allArticalsAreVisible : !visibilityState});
    }

    render(){
        let _this = this;
        let _more_articals = "";
        let _channel_template = this.state.articles.map(function(articles,key){
            let _articalImage = '/images/image_not_found.png';
            if(articles.article.article_image != null){
                _articalImage = articles.article.article_image;
            }

            return (
                <div key={key}>
                    {/*
                     <div className="col-xs-2 pg-col-20 pg-news-item" key={key} onClick={_this.popUpArtical.bind(this, articles.article)}>
                     <div className="row row-clr pg-news-inner-full various">
                     <img src={_articalImage} alt={articles.article.channel} className="img-responsive pg-pg-news-inner-img" />
                     <div className="artical-heading-holder">
                     <p className="artical-name">{articles.article.heading}</p>
                     </div>
                     </div>
                     </div>
                    */}
                    <div className="news-col saved-article" onClick={_this.popUpArtical.bind(this, articles.article)}>
                        <div className="news-article">
                            <div className="img-holder">
                                <img src={_articalImage} alt={articles.article.channel} className="img-responsive"/>
                            </div>
                            <div className="content-holder">
                                <p className="title">{articles.article.heading}</p>
                                <div className="bottom-bar">
                                    <p className="date">14 Feb 2017</p>
                                    <span className="saved-icon"></span>
                                </div>
                            </div>
                            <div className="chanel-icon">
                                <img src="images/news/chanel-icons/cnn-icon.png" />
                            </div>
                            <span className="share-icon"></span>
                        </div>
                    </div>
                </div>
            )

        });

        // if (this.state.articles.length > 5) {
        //     _more_articals = this.state.articles.map(function(articles,key){
        //     let _articalImage = '/images/image_not_found.png';
        //     if(articles.article.article_image != null){
        //         _articalImage = articles.article.article_image;
        //     }
        //         if(key >= 5){
        //             return (
        //                 <div className="col-xs-2 pg-col-20 pg-news-item" key={key} onClick={_this.popUpArtical.bind(this, articles.article)}>
        //                     <div className="row row-clr pg-news-inner-full various">
        //                         <img src={_articalImage} alt={articles.article.channel} className="img-responsive pg-pg-news-inner-img" />
        //                         <div className="artical-heading-holder">
        //                             <p className="artical-name">{articles.article.heading}</p>
        //                         </div>
        //                     </div>
        //                 </div>
        //             )
        //         }
        //     });
        // }

        let articlesStyle = (this.state.articles.length > 0 && this.state.allArticalsAreVisible) ? {"height": "auto"}  : {"height": "222px"};

        return(
            <div>
                {/*<div className="row row-clr pg-news-page-content-item pg-box-shadow">
                    <div className="col-xs-2 pg-news-page-content-item-left-thumb saved-articals-holder">
                        <div className="cat-icon-holder">
                            <h3 className="cat-title">Saved Articles</h3>
                        </div>
                    </div>
                    <div className="col-xs-10 pg-news-page-content-item-right-thumbs">
                        <div className="pg-news-page-content-item-right-inner-box">
                            <div className="pg-news-item-main-row">
                                <div className="articals">
                                    {_channel_template}
                                </div>
                                {
                                    (this.state.allArticalsAreVisible)?
                                        <div className="more-articals">
                                            {_more_articals}
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            {
                                (_more_articals)?
                                    <div className="show-more-btn" onClick={this.showMoreArticals.bind(this)}>
                                        {this.state.allArticalsAreVisible? "Show Less" : "Show More"}
                                    </div>
                                    :
                                    null
                            }
                        </div>
                    </div>
                    {this.getPopup()}
                </div>*/}
                <div className={(this.state.isCollapsed)? "row news-topic" : "row news-topic see-all"}>
                    <div className="news-wrapper">
                        <div className="col-sm-2 topic-cover">
                            <div className="news-cover-wrapper saved-articles-cover">
                                <div className="news-cover">
                                    <div className="content-wrapper">
                                        <h3>saved articles</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-10 channel-wrapper">
                            <div className="row">
                                <div className="news-content-wrapper">
                                    <div className="news-items-wrapper" style={articlesStyle}>
                                        {_channel_template}
                                    </div>
                                    {
                                        (this.state.articles.length > 4)?
                                            (!this.state.allArticalsAreVisible)?
                                                <div className="see-all" onClick={this.showMoreArticals.bind(this)}>
                                                    <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                    <p>See All</p>
                                                </div>
                                                :
                                                <div className="see-all" onClick={this.showMoreArticals.bind(this)}>
                                                    <i className="fa fa-chevron-circle-right" aria-hidden="true"></i>
                                                    <p>See Less</p>
                                                </div>
                                            :
                                            null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {(this.state.isShowingModal) ? this.getPopup() : null}
                </div>
            </div>
        )
    }

}
