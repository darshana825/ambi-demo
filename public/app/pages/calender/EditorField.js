/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import Session from '../../middleware/Session';

import { EditorState, RichUtils, Modifier} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin';

//import createHashtagPlugin from 'draft-js-priority-plugin';

import {convertFromRaw, convertToRaw} from 'draft-js';
import { fromJS } from 'immutable';
import timeSuggestions from './timeSuggestions';
//import prioritySuggestions from './PrioritySuggessions';

// plugins for mentioning the person
const mentionPlugin = createMentionPlugin({
    entityMutability: 'IMMUTABLE',
    mentionPrefix: '#',
    mentionTrigger: '#',
    mentionComponent: (props) => (
        <span data-offset-key={props.entityKey} className={props.className} > {props.decoratedText}</span>
    )
});

// plugins for mentioning the time
const mentionPlugin2 = createMentionPlugin({
    timeSuggestions,
    entityMutability: 'IMMUTABLE',
    mentionPrefix: '@',
    mentionTrigger: '@'
});

//const mentionPlugin3 = createMentionPlugin({
//    prioritySuggestions,
//    mentionComponent: (props) => (
//        <span
//            className={props.className}
//            // eslint-disable-next-line no-alert
//            onClick={() => alert('Clicked on the Mention!')}
//        >
//      {props.decoratedText}
//    </span>
//    ),
//    entityMutability: 'IMMUTABLE',
//    mentionPrefix: '$',
//    mentionTrigger: '$'
//});

// mentions for persons
const MentionSuggestions = mentionPlugin.MentionSuggestions;
// mentions for time
const MentionSuggestions2 = mentionPlugin2.MentionSuggestions;
//const MentionSuggestions3 = mentionPlugin3.MentionSuggestions;

const emojiPlugin = createEmojiPlugin();
//const hashtagPlugin = createHashtagPlugin({theme: {prioritytag: 'prioritytag'}});
const { EmojiSuggestions } = emojiPlugin;

const plugins = [mentionPlugin, emojiPlugin, mentionPlugin2];

export default class EditorField extends Component {

    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user,
            suggestions : fromJS([]),
            suggestions2 : timeSuggestions,
            //suggestions3 : prioritySuggestions,
            editorState : EditorState.createEmpty(),
            exclamationSet: false,
            exclamationCharCount: 0,
            priorityColor: '',
            specialPriorityScenario: false
        };

        this.focus = this.focus.bind(this);
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.onChange = this.onChange.bind(this);
        this.doColorChange = this.doColorChange.bind(this);
        this.setPriorityTag = this.setPriorityTag.bind(this);

        this.onSearchChange = ({ value }) => {
            let str = value.replace("#", "");
            let _groupId = this.props.groupId != undefined ? this.props.groupId : null;

            if(str.length > 0) {
                $.ajax({
                    // url : '/connection/get/'+str,
                    url : '/calendar/suggest-users/'+this.props.calendarOrigin+'/1/'+_groupId+'/'+str,
                    method : "GET",
                    dataType : "JSON",
                    headers : { "prg-auth-header" : this.state.user.token },
                    success : function (data, text) {
                        if (data.status.code == 200) {
                            let users = data.suggested_users.filter(function( obj ) {
                                return obj.user_id !== user.id;
                            });
                            this.setState({ suggestions: defaultSuggestionsFilter(value, fromJS(users))});
                        }
                    }.bind(this),
                    error: function (request, status, error) {
                        console.log(error);
                    }
                });
            } else {
                this.setState({
                    suggestions: defaultSuggestionsFilter(value, this.state.suggestions),
                });
            }
        };

        this.onSearchChange2 = ({ value }) => {
            this.setState({
                suggestions2: defaultSuggestionsFilter(value, timeSuggestions),
            });
        };

        //this.onSearchChange3 = ({ value }) => {
        //    this.setState({
        //        suggestions3: defaultSuggestionsFilter(value, prioritySuggestions),
        //    });
        //};
    }

    focus() {
        this.editor.focus();
    }

    /**
     * This part will add n space (' ') to the priority tag
     * If not after set the color all other inputs will get highlighted.
     * To avoid that this space added
     */
    setPriorityTag() {
        var contentState = this.state.editorState.getCurrentContent();
        const plainText = contentState.getPlainText();
        const startingAt = plainText.indexOf("!");
        const endingAt = startingAt+2;

        if(startingAt != -1) {
            const newSelection = this.state.editorState.getSelection().merge({
                anchorOffset: startingAt,
                focusOffset: endingAt
            });

            const _word = plainText.slice(startingAt, endingAt);
            let replacedText = _word + " ";

            const contentReplaced = Modifier.replaceText(
                contentState,
                newSelection,
                replacedText);

            const editorState = EditorState.push(
                this.state.editorState,
                contentReplaced,
                'replace-text'
            );
            this.setState({editorState:editorState});
            //this.doColorChange();
        }

    }

    /**
     * This will do the highlighting part of priority tag based on added color
     */
    doColorChange() {
        const contentState = this.state.editorState.getCurrentContent();
        const plainText = contentState.getPlainText();

        const startingAt = plainText.indexOf("!");
        const endingAt = startingAt+2;
        if(startingAt != -1) {
            const newSelection = this.state.editorState.getSelection().merge({
                anchorOffset: startingAt,
                focusOffset: endingAt
            });

            let _color = this.state.priorityColor != undefined && this.state.priorityColor != '' ? this.state.priorityColor : 'BLACK';

            const newContent = Modifier.applyInlineStyle(contentState, newSelection, _color);
            const editorState = EditorState.push(this.state.editorState, newContent);
            this.setState({editorState:editorState, priorityColor: 'BLACK'});
        }
    }

    /**
     * This will listen for all changes in editor
     * @param editorState
     */
    onChange(editorState) {

        var contentState = this.state.editorState.getCurrentContent();
        var currentContent = editorState.getCurrentContent();
        var currentPlainText = currentContent.getPlainText();
        var plainText = contentState.getPlainText();
        var diff = this.getDifference(currentPlainText, plainText);
        var diff2 = this.getDirectDifference(currentPlainText, plainText);

        /**
         * This part set the task priority
         * Once detected ! input and character count
         * Assumption: Task priority always set end of the text
         */
        if(plainText.length < currentPlainText.length &&
            this.state.exclamationSet == true &&
            plainText.length == this.state.exclamationCharCount &&
            this.props.eventType == 'task') {

            /**
             * Priority number is only 1 to 3
             * There can be situations where number updates so, for other numbers it will remove priority
             */
            if(diff2 > 0 && diff2 < 4) {
                this.setState({priorityColor :'RED'});
                setTimeout(this.setPriorityTag, 500);
                this.props.setTaskPriority(diff2); //set priority in super class
            } else {
                this.setState({priorityColor :'BLACK'});
                setTimeout(this.setPriorityTag, 500);
                this.props.setTaskPriority(0); //remove priority in super class
            }

        }

        /**
         * If you modify the task priority and when there are many characters after the tag this part will do the identification
         */
        if(this.state.specialPriorityScenario == true
            && this.state.exclamationSet == true
            && plainText.length > this.state.exclamationCharCount
            && this.props.eventType == 'task') {

            let _priorityNum = currentPlainText.slice(this.state.exclamationCharCount, this.state.exclamationCharCount + 1);
            if(_priorityNum > 0 && _priorityNum < 4) {
                this.setState({priorityColor :'RED', specialPriorityScenario:false});
                //setTimeout(this.doColorChange, 500); //making priority number RED highlighting is disabled
                this.props.setTaskPriority(_priorityNum); //set priority in super class
            } else {
                this.setState({priorityColor :'BLACK', specialPriorityScenario:false});
                this.props.setTaskPriority(0); //remove priority in super class
            }

        }

        /**
         * This part will identify ! character input and set states
         */
        if(plainText.length < currentPlainText.length
            && diff2 == '!'
            && this.state.exclamationSet != true
            && this.props.eventType == 'task') {

            let _charCount = currentPlainText.length;
            this.setState({exclamationSet :true, exclamationCharCount:_charCount});

        } else if(plainText.length < currentPlainText.length //if ! mark is not at the end or if you remove entier tag and re-entering this part do the identification
            && currentPlainText.indexOf('!') != -1
            && this.state.exclamationSet != true
            && this.state.specialPriorityScenario != true
            && this.props.eventType == 'task' ) {

            let _indexCount = currentPlainText.indexOf('!');
            if(_indexCount != -1) {
                this.setState({specialPriorityScenario:true, exclamationSet :true, exclamationCharCount:_indexCount+1});
            }
        }

        /**
         * This part will detect removal of chracter set including already set priority
         * if the current text length is less then ! char index it will remove already set priority
         */
        if(currentContent != plainText &&
            plainText.length > currentPlainText.length &&
            this.state.exclamationSet == true &&
            currentPlainText.length <= this.state.exclamationCharCount &&
            this.props.eventType == 'task') {

            //console.log("removed priority count>");
            this.props.setTaskPriority(0);
        }

        /**
         * This part will identify removal of character !
         * There can situations where multiple ! entered. So the removal will only done if there's only one ! exists
         * Assumption: Can only one priority tag exists. So first one will be activated. Other's ignored
         */
        if(currentContent != plainText && plainText.length > currentPlainText.length && diff.includes("!") && this.props.eventType == 'task') {
            let _index = currentPlainText.indexOf("!");
            if(_index == -1) {
                //console.log("removed ! mark>");
                this.setState({exclamationSet :false, exclamationCharCount:0, priorityColor :''});
                this.props.setTaskPriority(0);
            }
        }

        /**
         * This part will identify removal of # character
         */
        if(currentContent != plainText && plainText.length > currentPlainText.length && diff.includes("#")) {

            var splited = diff.split("#");
            splited = splited.filter(function(v){return v!==''});
            var arrNames = [];
            for (var i = 0; i <= splited.length - 1; i++) {

                var splitedBySpace = splited[i].split(" ");
                var aName = "";

                for (var j = 0; j <= splitedBySpace.length - 1; j++) {
                    aName = splitedBySpace[0]+" "+splitedBySpace[1];
                }
                arrNames.push(aName);
            }

            this.props.removeUsersByName(arrNames);
        }
        this.setState({editorState});
    }

    getDifference(str1, str2) {
        var i = 0;
        var j = 0;
        var result = "";
        while (j < str2.length) {
            if (str1[i] != str2[j] || i == str1.length)
                result += str2[j];
            else
                i++;
            j++;
        }
        return result;
    }

    getDirectDifference(str1, str2) {
        var result = "";
        if(str1.length > str2.length) {
            let _str = String(str1);
            result = _str.slice(str2.length, str1.length);
        }
        return result;
    }

    onEventAdd() {
        this.setState({editorState : EditorState.createEmpty()});
    }

    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }



    render() {
        const showSecond = false;
        const colorStyleMap = {
            RED: {
                color: 'rgba(255, 0, 0, 1.0)',
            },
            ORANGE: {
                color: 'rgba(255, 127, 0, 1.0)',
            },
        };

        let inputPlaceholder  = "enter " + this.props.eventType + " description";

        return (
            <div onClick={this.focus}>
                <Editor
                    customStyleMap={colorStyleMap}
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    onChange={this.onChange}
                    plugins={plugins}
                    ref={(element) => { this.editor = element; }}
                    placeholder= {inputPlaceholder}
                />
                <EmojiSuggestions />
                <MentionSuggestions
                    onSearchChange={this.onSearchChange}
                    suggestions={this.state.suggestions}
                    onAddMention={this.props.setSharedUsers.bind(this)}
                />
                <MentionSuggestions2
                    onSearchChange={this.onSearchChange2}
                    suggestions={this.state.suggestions2}
                    onAddMention={this.props.setTime.bind(this)}
                />
                {
                    //<MentionSuggestions3
                    //    onSearchChange={this.onSearchChange3.bind(this)}
                    //    suggestions={this.state.suggestions3}
                    //    //onChange={this.setOnChangeMe.bind(this)}
                    //    //onAddMention={this.highlightPriorityTag.bind(this)}
                    ///>
                }

            </div>
        );
    }
}
