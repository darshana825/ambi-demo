/**
 * This is new connections component
 */
import React from 'react';
import Slider from 'react-slick';
import {UserBlockTileView} from './UserBlocks';
import {SampleNextArrow, SamplePrevArrow} from './SliderArrows'

export default class NewConnections extends  React.Component {

    constructor(props){
        super(props);

        this.onAcceptRequest = this.onAcceptRequest.bind(this);
        this.onRejectRequest = this.onRejectRequest.bind(this);
        this.onAddConnection = this.onAddConnection.bind(this);
        this.onSkipSuggestion = this.onSkipSuggestion.bind(this);
    }

    onAcceptRequest(user){
        this.props.onAcceptRequest(user);
    }

    onRejectRequest(user){
        this.props.onRejectRequest(user);
    }

    onAddConnection(user){
        this.props.onAddConnection(user);
    }

    onSkipSuggestion(index){
        this.props.onSkipSuggestion(index);
    }

    render(){

        const connections = this.props.connections;
        let _this = this;
        let sliderSettings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 6,
            slidesToScroll: 1,
            nextArrow: <SampleNextArrow />,
            prevArrow: <SamplePrevArrow />
        };
        let userBlockTiles = connections.map(function(connection,key){
            return (
                <div key={key} >
                    {
                        (_this.props.sectionType == "CONNECTION_REQUESTS") ?
                            <UserBlockTileView user={connection} connectionType={_this.props.sectionType}
                                               onAcceptRequest={_this.onAcceptRequest} onRejectRequest={_this.onRejectRequest} /> :
                        (_this.props.sectionType == "CONNECTION_SUGGESTIONS") ?
                            <UserBlockTileView user={connection} connectionType={_this.props.sectionType}
                                               onSkipSuggestion={_this.onSkipSuggestion} isAllowToSkip={(connections.length > 6)}
                                               onAddConnection={_this.onAddConnection} index={key} /> : null
                    }
                </div>
            );
        });

        return (
            <div className="requests-wrapper">
                <div className="inner-header">
                    <h4 className="section-title">{this.props.title}</h4>
                </div>
                <div className="connection-requests clearfix">
                    <div className="requests">
                        {
                            (typeof connections.length == 'undefined' || connections.length == 0) ?
                                <div className="connections-list requests">
                                    <h3 className="no-connections">there are no connections to display</h3>
                                </div> :
                                <Slider {...sliderSettings}>
                                    {userBlockTiles}
                                </Slider>
                        }
                    </div>
                </div>
            </div>
        );

    }
}