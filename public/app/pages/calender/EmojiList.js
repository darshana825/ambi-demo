/**
 * Suggestions Block
 */
import React from 'react';

export default class EmojiList extends React.Component {

    constructor(props) {
        super(props);
        this.state ={}; 
    }

    render() {

        let _this = this;
        let emojis = this.props.emojis;
        let selectEmojis = this.props.selectEmojis;
        let items = emojis.map(function(emoji,key){
            return (
                <li key={key} onClick={() => _this.props.selectEmojis(emoji)} >
                    <div className="img-div">
                        <img src={emoji.link} />
                    </div>
                    <p>{emoji.name}</p>
                </li>
            );
        });

        return (
            <div className="suggestions-holder emojis">
                <ul>
                    {items}
                </ul>
            </div>
        )
    }
}
