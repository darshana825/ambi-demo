/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import SuggestionsList from './SuggestionsList';
import EmojiList from './EmojiList';
import Lib from '../../middleware/Lib';

import Session from '../../middleware/Session';

export default class CustomEditorField extends Component {

    constructor(props) {
        super(props);
        
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user,
            showSuggestions : false,
            startSuggesting: false,
            showEmojis : false,
            suggestions : [],
            emojis : [],
            editorOutputHtml : "",
        };

        this.suggestionFilter = "";
        this.emojiFilter = "";
        this.inputText = "";
        this.updatedText = "";
        this.startSuggesting = this.state.startSuggesting;
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    getDifference(a, b) {
        var i = 0;
        var j = 0;
        var result = "";
        
        while (j < b.length)
        {
            if (a[i] != b[j] || i == a.length)
                result += b[j];
            else
                i++;
            j++;
        }
        return result;
    }

    handleKeyPress(e) {

        this.inputText = e.target.innerHTML;
        
        
        let nowc = this.getDifference(this.updatedText, this.inputText).trim();  
        console.log(this.inputText);
        console.log(this.updatedText);  

        console.log("1 Now PRESSED >>" + nowc + "<<");   

        this.updatedText = this.inputText;   

        let currentCaracter = (this.inputText ? this.inputText[this.inputText.length -1 ] : "");
        

        // if( this.inputText[this.inputText.length - 1] === '#' ) {
        if( nowc == '#' ) {
            // this.suggestionFilter = this.suggestionFilter+nowc;
            console.log("# IS CLICKED");
            this.startSuggesting = true;
            this.setState({showSuggestions : true, startSuggesting : this.startSuggesting});

        // } else if( this.inputText[this.inputText.length - 1] === ':' ) {
        } else if ( nowc == ':' ) {
            console.log("A : IS TYPED ");
            // TODO: Create our own emojis similer to the followings
            var emojis = [
                {
                    prefix: ':)',
                    name: 'Smile',
                    link: 'http://emojipedia-us.s3.amazonaws.com/cache/be/22/be22105632cfc32abf7b24bed3924e12.png',
                },
                {
                    prefix: ':o',
                    name: 'OMG',
                    link: 'http://emojipedia-us.s3.amazonaws.com/cache/55/af/55af488f029266842c13a54d4c50fc11.png',
                },
                {
                    prefix: ':|',
                    name: 'No words',
                    link: 'http://emojipedia-us.s3.amazonaws.com/cache/ce/1a/ce1a33d6a4535ce73c8b2b899d51071b.png',
                },
                {
                    prefix: ':D',
                    name: 'LOL',
                    link: 'http://emojipedia-us.s3.amazonaws.com/cache/85/8d/858dbeb7634d262e41a522f349f52d9c.png',
                },

            ];

            this.setState({showEmojis : true, emojis : emojis});
        }

        if( nowc == '&nbsp;' || nowc == '<br>' ) {
            console.log(" SPACE IS CLICKED !! ");
            this.suggestionFilter = "";
            this.startSuggesting = false;
            this.setState({startSuggesting : this.startSuggesting, showSuggestions: false});
        }

        // if withdraw mentioning
        if(this.inputText.indexOf('#') == -1 ) {

            this.startSuggesting = false;
            this.suggestionFilter = "";
            this.setState({startSuggesting : this.startSuggesting, showSuggestions: false});
        }

        // if emoji withdraw
        if(this.inputText.indexOf(':') == -1 ) {
            this.emojiFilter = "";
            this.setState({showEmojis : false});
        }

        // RESET start suggesting if space is pressed
        var patt1 = /\s/g;
        var resu = currentCaracter.match(patt1);

        if(resu && resu.length > 0) {
            console.log(" >>>>>>>>>>>>>>>> 1 ");
            this.startSuggesting = false;
            this.suggestionFilter = "";
            this.emojiFilter = "";
            this.setState({startSuggesting : this.startSuggesting, showSuggestions: false, showEmojis : false});
        }

        if(this.startSuggesting === true) {
            
            let currentFilter = this.suggestionFilter;
            console.log(" START SUGGESTING TRUE " + nowc + " <> " + currentFilter);
            // this.suggestionFilter = currentFilter + nowc;
            this.suggestionFilter =  this.inputText.split('#')[this.inputText.split('#').length - 1];
            console.log(" >> FILTER :: " + this.suggestionFilter);
            if(this.suggestionFilter.length > 1) {
                this.loadSuggestions(this.suggestionFilter);
            }
        }

        if(this.startEmoji === true) {
            this.emojiFilter =  this.inputText.split(':')[this.inputText.split(':').length - 1];
        }

    }

    loadSuggestions(filter) {
        console.log(" LOADING .... " + filter);
        $.ajax({
            url : '/user/get-user-suggestions/'+filter.replace("#", ""),
            method : "GET",
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    this.setState({suggestions: data.suggested_users, showSuggestions: true});
                    let stopSuggestion = false;
                    let hasSuggestion = false;

                    console.log("Length" + data.suggested_users.length);
                    if(this.inputText[this.inputText.length - 1] === ';' && data.suggested_users.length == 0) {
                        var selected = '<a href="" class="custom-editor-field-suggestion disabled">'+filter+'</a>';
                        var newHtml = this.getSuggestionBlock(selected);
                        this.inputText = newHtml;
                        this.setState({showSuggestions : false});
                        this.startSuggesting = false;
                        this.suggestionFilter = "";
                    }

                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }  

    clickedSuggestions(user) {

        var selected = '<a href="/profile/'+user.user_name+'" class="custom-fditor-field-suggestion" target="_blank">'+user.first_name+'</a>';
        var newHtml = this.getSuggestionBlock(selected);
        this.setState({showSuggestions : false, editorOutputHtml: newHtml});
        this.startSuggesting = false;
        this.suggestionFilter = "";
    }

    clickedEmojis(emoji) {
        this.setState({showEmojis : false});
        var selected = '<img width="20" height="20" src="'+emoji.link+'">';
        var newHtml = this.getEmojiBlock(selected);
        this.setState({showSuggestions : false, editorOutputHtml: newHtml});
        this.startEmoji = false;
        this.emojiFilter = "";
    }

    getSuggestionBlock(selectedBlock) {
        var newHtml = "";
        var curentHTML = this.inputText;
        return curentHTML.replace('#'+this.suggestionFilter, selectedBlock);
    }

    getEmojiBlock(selectedBlock) {
        var newHtml = "";
        var curentHTML = this.inputText;
        return curentHTML.replace(':'+this.emojiFilter, selectedBlock);
    }

    render() {
        return (
            <div className="day-view-text-editor-holder">
                <div onInput={(event)=>{this.handleKeyPress(event)}} contentEditable className="day-view-text-editor day-view-editor-copy" dangerouslySetInnerHTML={{ __html: this.state.editorOutputHtml}} ></div>
                {this.state.showSuggestions ? <SuggestionsList suggestions={this.state.suggestions} selectSuggestions={this.clickedSuggestions.bind(this)} /> : null }
                {this.state.showEmojis ? <EmojiList emojis={this.state.emojis} selectEmojis={this.clickedEmojis.bind(this)} /> : null }
            </div>
        );
    }
}
