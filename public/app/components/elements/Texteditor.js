/*
* Rich Text editor
*/
import React from 'react';
import Immutable from 'immutable';
import {Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, ContentState, Entity} from 'draft-js';
import {Alert} from '../../config/Alert';
import Session from '../../middleware/Session';

let errorStyles = {
    color         : "#ed0909",
    fontSize      : "0.8em",
    textTransform : "capitalize",
    margin        : '0 0 15px',
    display       : "inline-block"
};

export default class Texteditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState:EditorState.createEmpty(),
            noteTitle : "",
            validateAlert : ""
        };
        this.notebook_id = this.props.notebook_id;
        this.note_id = this.props.note_id;

        if(typeof this.note_id != 'undefined' && this.note_id != null){
            let loggedUser = Session.getSession('prg_lg');

            $.ajax({
                url: '/notes/get-note/'+this.note_id,
                method: "GET",
                dataType: "JSON",
                headers: { 'prg-auth-header':loggedUser.token }
            }).done( function (data, text) {
                if(data.status.code == 200){

                    let _content = {
                        entityMap : {},
                        blocks : data.note.content[0].blocks
                    }
                    const blocks = convertFromRaw(_content);
                    var editorState = EditorState.createWithContent(
                        ContentState.createFromBlockArray(blocks)
                    );
                    this.setState({editorState:editorState});
                    this.setState({noteTitle:data.note.name});
                }
            }.bind(this));
        }

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({editorState});

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.handleChange = this.handleChange.bind(this);

        this.logState = () => {
          const content = this.state.editorState.getCurrentContent();
          this.saveNote(convertToRaw(content));
        };
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
                this.onChange(newState);
                return true;
            }
        return false;
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    handleChange(e){
        this.setState({noteTitle : e.target.value});
    }

    saveNote(data){

        if(this.state.noteTitle == ""){
            this.setState({validateAlert:Alert.EMPTY_NOTE_TITLE})
        } else{
            if(typeof this.notebook_id != 'undefined' && this.notebook_id != null){
                let _note = {
                    noteName:this.state.noteTitle,
                    noteContent:JSON.stringify(data),
                    notebookId:this.notebook_id
                };

                let loggedUser = Session.getSession('prg_lg');

                $.ajax({
                    url: '/notes/add-note',
                    method: "POST",
                    dataType: "JSON",
                    data:_note,
                    headers: { 'prg-auth-header':loggedUser.token },
                }).done( function (data, text) {
                    if(data.code == 200){
                        location.href = '/notes';
                    }
                }.bind(this));
            }

            if(typeof this.note_id != 'undefined' && this.note_id != null){
                let _note = {
                    noteName:this.state.noteTitle,
                    noteContent:JSON.stringify(data),
                    noteId:this.note_id
                }

                let loggedUser = Session.getSession('prg_lg');

                $.ajax({
                    url: '/notes/update-note',
                    method: "POST",
                    dataType: "JSON",
                    data:_note,
                    headers: { 'prg-auth-header':loggedUser.token },
                }).done( function (data, text) {
                    if(data.code == 200){
                        location.href = '/notes';
                    }
                }.bind(this));
            }

        }
    }

    render() {
    const {editorState} = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
          className += ' RichEditor-hidePlaceholder';
        }
    }

    return (
        <div className="row row-clr">
            <div className="note-title-holder col-md-10 col-md-offset-1">
                <p className="edit-note-header">Note title</p>
                <input
                    type="text"
                    value={this.state.noteTitle}
                    name="NoteCategoryName"
                    onChange={this.handleChange.bind(this)}
                    className="pgs-sign-inputs"
                  />
                {this.state.validateAlert ? <p className="form-validation-alert" style={errorStyles} >{this.state.validateAlert}</p> : null}
            </div>
            <div className="note-holder">
                <div className="container-fluid">
                    <div className="col-md-10 col-md-offset-1" id="middle-content-wrapper">
                        <div className="RichEditor-root">
                            <BlockStyleControls
                            editorState={editorState}
                            onToggle={this.toggleBlockType}
                            />
                            <InlineStyleControls
                            editorState={editorState}
                            onToggle={this.toggleInlineStyle}
                            />
                            <div className={className} onClick={this.focus}>
                                <Editor
                                blockStyleFn={getBlockStyle}
                                customStyleMap={styleMap}
                                editorState={editorState}
                                handleKeyCommand={this.handleKeyCommand}
                                onChange={this.onChange}
                                placeholder="Write your note..."
                                ref="editor"
                                spellCheck={true}
                                textAlignment = "center"
                                />
                            </div>
                        </div>
                        <input
                            onClick={this.logState}
                            type="button"
                            value="Save Note"
                            className="submit-note-btn"
                            />
                    </div>
                </div>
            </div>
        </div>
    );
    }
}

    // Custom overrides for "code" style.
    const styleMap = {
        CODE: {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
            fontSize: 16,
            padding: 2,
        },
    };

    function getBlockStyle(block) {
        switch (block.getType()) {
            case 'blockquote': return 'RichEditor-blockquote';
            default: return null;
        }
    }

    class StyleButton extends React.Component {
        constructor() {
            super();
            this.onToggle = (e) => {
                e.preventDefault();
                this.props.onToggle(this.props.style);
            };
        }

        render() {
            let className = 'RichEditor-styleButton';
            if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

            return (
                <span className={className} onMouseDown={this.onToggle}>
                {this.props.label}
                </span>
            );
        }
    }

    const BLOCK_TYPES = [
        {label: 'H1', style: 'header-one'},
        {label: 'H2', style: 'header-two'},
        {label: 'H3', style: 'header-three'},
        {label: 'H4', style: 'header-four'},
        {label: 'H5', style: 'header-five'},
        {label: 'H6', style: 'header-six'},
        {label: 'Blockquote', style: 'blockquote'},
        {label: 'UL', style: 'unordered-list-item'},
        {label: 'OL', style: 'ordered-list-item'},
        {label: 'Code Block', style: 'code-block'},
    ];

    const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                key={type.label}
                active={type.style === blockType}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
                />
            )}
        </div>
        );
    };

    var INLINE_STYLES = [
        {label: 'Bold', style: 'BOLD'},
        {label: 'Italic', style: 'ITALIC'},
        {label: 'Underline', style: 'UNDERLINE'},
        {label: 'Monospace', style: 'CODE'},
    ];

    const InlineStyleControls = (props) => {
        var currentStyle = props.editorState.getCurrentInlineStyle();
        return (
            <div className="RichEditor-controls">
                {INLINE_STYLES.map(type =>
                    <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                    />
                )}
            </div>
        );
    };
