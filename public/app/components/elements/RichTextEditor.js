/*
* Rich text editor component
*/
'use strict';
import React from 'react';
import ReactQuill from 'react-quill';

export default class RichTextEditor extends React.Component{
    constructor(props){
        super(props);

        this.state={
            text : (this.props.note)? this.props.note : null
        };

        this.onTextChange = this.onTextChange.bind(this);
    }

    onTextChange(value) {
        this.props.noteText(value);
        this.setState({text : value});
    }

    render() {
        return (
            <div className="rich-editor-holder">
                <ReactQuill theme='snow' onChange={this.onTextChange} defaultValue ={this.state.text}/>
            </div>
        );
    }
}
