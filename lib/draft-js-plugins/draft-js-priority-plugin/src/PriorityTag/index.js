import React, { Component } from 'react';
import unionClassNames from 'union-class-names';

export default class PriorityTag extends Component {
    render() {
        const {
            theme = {},
            className,
            decoratedText, // eslint-disable-line no-unused-vars
            dir, // eslint-disable-line no-unused-vars
            entityKey, // eslint-disable-line no-unused-vars
            getEditorState, // eslint-disable-line no-unused-vars
            offsetKey, // eslint-disable-line no-unused-vars
            setEditorState, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props; // eslint-disable-line no-use-before-define
        const combinedClassName = unionClassNames(theme.prioritytag, className);
        return (
            <span {...otherProps} className={combinedClassName} />
        );
    }
}
