import React, { Component } from 'react';

export default class NoteEditorToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentClass: "ql-size-custom ql-picker",
      active: false
    }
    this.toggleClass = this.toggleClass.bind(this);
  }

  toggleClass() {
    const { active } = this.state;
    if (!active) {
      this.setState({ currentClass: "ql-size-custom ql-picker ql-expanded", active: true })
    } else if (active) {
        this.setState({ currentClass: "ql-size-custom ql-picker", active: false })
    }
  }

  render() {
    return (
      <div id="toolbar">
        <select className="ql-font" title="Font">
          <option value={"Work Sans"} selected>Work Sans</option>
          <option value={"Pantra"} label={"Pantra"}>Pantra</option>
          <option value={"Georgia"}>Georgia</option>
          <option value={"Helvetica"}>Helvetica</option>
          <option value={"Courier New"}>Courier New</option>
          <option value={"Times New Roman"}>Times New Roman</option>
          <option value={"Trebuchet"}>Trebuchet</option>
          <option value={"Verdana"}>Verdana</option>
        </select>
        <div className="ql-custom-divider"><span className="divider-span">|</span></div>
        <select className="ql-size">
          <option value="small">8</option>
          <option value="small-10">10</option>
          <option value="normal" selected>12</option>
          <option value="normal-14">14</option>
          <option value="normal-18">18</option>
          <option value="large">24</option>
          <option value="huge">36</option>
        </select>
        <div className="ql-custom-divider"><span className="divider-span">|</span></div>
        <select className="ql-color"></select>
        {/* <div className="ql-custom-arrow-divider"><span className="arrow-divider-span"></span></div> */}
        {/* <div className="ql-custom-divider"><span className="divider-span">|</span></div> */}
        <button className="ql-bold"></button>
        {/* <img className="boldOverlay" src={'https://localhost/images/note-toolbar-icons/Infohoverpopups/bold.png'} alt="boohoo" /> */}
        <button className="ql-italic"></button>
        <button className="ql-underline" style={{ color: 'red' }}></button>
        <button className="ql-strike"></button>
        <button className="ql-code-block"></button>
        <div className="ql-custom-divider"><span className="divider-span2">|</span></div>
        <button className="ql-list" value="ordered" style={{
          background: "url(../images/note-toolbar-icons/Nlist2.png)",
          backgroundSize: "60% 60%",
          backgroundRepeat: "no-repeat",
          marginRight: 10,
          marginLeft: -23,
          marginBottom: -15,
          marginTop: 14
        }}></button>
        <button className="ql-list" value="bullet" style={{
          background: "url(../images/note-toolbar-icons/BList2.png)",
          backgroundSize: "60% 60%",
          backgroundRepeat: "no-repeat",
          marginLeft: -10,
          marginBottom: -15,
          marginTop: 14
        }}></button>
        <div className="ql-custom-divider"><span className="divider-span">|</span></div>
        <button className="ql-indent" value="-1"></button>
        <button className="ql-indent" value="+1"></button>
        <div className="ql-custom-divider"><span className="divider-span">|</span></div>
        <button className="ql-image"></button>
        <button className="ql-link"></button>
        {/* <span className="ql-size-custom ql-picker">
          <span className="ql-picker-label ql-active" data-label="PDF"></span>
          <span className="ql-picker-label ql-active" data-label="PDF"></span>
        </span> */}
        <span className={this.state.currentClass} onClick={this.toggleClass}>
          <span className="ql-picker-label ql-active" data-label="PDF"></span>
          <span className="ql-picker-options" data-label="PDF">
            <span className="ql-picker-item ql-selected" onClick={this.props.onClick}></span>
          </span>
        </span>
        {/* <select className="ql-size-custom" onClick={this.props.onClick}>
          <option onClick={this.props.onClick}></option>
        </select> */}
      </div>
    )
  }
}
