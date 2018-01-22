import React, { Component } from 'react';

export default class Popup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: this.props.config.width,
      height: this.props.config.height,
      left: this.props.config.left,
      bottom: this.props.config.bottom,
      zPosition: 100
    }
  }

  render() {
    return (
      <div className="custom-popup">
        <h1>{this.props.content}</h1>
      </div>
    )
  }
}
