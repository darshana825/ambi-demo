import React from 'react';
import ReactDom from 'react-dom';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import { connect } from 'react-redux'
import wordcount from 'wordcount';
import NoteList from './NoteList';
import NoteEditorToolbar from './NoteEditorToolbar';
import Popup from '../../components/elements/Popup';
import Session from '../../middleware/Session';
import * as actions from './actions';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactQuill, { Quill } from 'react-quill';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
import sharedb from 'sharedb/lib/client';
import richText from 'rich-text';
import pdfConverter from 'jspdf';
// import HtmlDocx from 'html-docx-js';



// const createSliderWithTooltip = Slider.createSliderWithTooltip;
// const Range = createSliderWithTooltip(Slider.Range);
// const Handle = Slider.Handle;
//
// //TODO: import the styles for the slider into our css file instead of loading module.
// //TODO: map the slider functionality to the background opacity
// const handle = (props) => {
//   const { value, dragging, index, ...restProps } = props;
//   return (
//     <Tooltip
//       prefixCls="rc-slider-tooltip"
//       overlay={value}
//       visible={dragging}
//       placement="top"
//       key={index}
//     >
//       <Handle {...restProps} />
//     </Tooltip>
//   );
// };

//TODO: style the toolbar//move the download to the more option of the toolbar
const popupConfig = {
  width: 100,
  height: 300,
  left: 50,
  bottom: 50,
}


// const onToolBarHover = () => (
//   alert('onToolBarHover')
// )

const wrapperStyle = { width: 100, margin: 50 };

class NoteEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: Session.getSession('prg_lg'),
      cursors: {}, // Key = userId, value = {range, color, userObject}
      wordcount:0,
      pdfContent: '',
      title: this.props.note.title,
      userUpdatedNote: false
    }

    this.quillRef = null;
    this.reactQuillRef = null;

    var socketAddress = 'wss://' + window.location.host + '';

    sharedb.types.register(richText.type);
    this.socket = new WebSocket(socketAddress);
    this.connection = new sharedb.Connection(this.socket);

    window.disconnect = function() {
      this.connection.close();
    };

    window.connect = function() {
      this.socket = new WebSocket(socketAddress);
      this.connection.bindToSocket(this.socket);
    };

    this.modules = {
          toolbar: {
          container: "#toolbar",
          handlers: {
                "downloadPdf": this.onClickButton,
              }
            }
          };

    this.formats = [
      'font',
      'size',
      'color', 'background',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image'
    ];

    this.colors = [ '#0881e6', '#8ed72b', '#fbd900', '#a33efe', '#ff6b20', '#ff1885', '#00c9e6', '#1700e1', '#e3a400', '#00c25d' ];

    this.onClickButton = this.onClickButton.bind(this);
    this.toDataUrl = this.toDataUrl.bind(this);
  }

  //   insertCustomTags(args){
  //   console.log("insertCustomTags", args);
  //   const value = args[0];
  //   const cursorPosition = this.quill.getSelection().index
  //   this.quill.insertText(cursorPosition, value)
  //   this.quill.setSelection(cursorPosition + value.length)
  // }

  componentDidMount() {
    this.attachQuillRefs();
    let that = this;

    this.quillRef.addContainer('ql-custom-cursors');

    this.quillRef.on('selection-change', function(range, oldRange, source) {
      that.handleCursorPosition(range);
    });

    this.quillRef.on('text-change', function(delta, source) {
      that.handleCursorPosition(that.quillRef.getSelection());
    });

    this.doc = this.connection.get('collab-notes', this.props.note.doc_id);
    this.doc.subscribe(function(err) {
      if (err) throw err;

      that.quillRef.setContents(that.doc.data);

      that.doc.on('op', function(op, source) {
        if (source === that.quillRef) return;

        that.quillRef.updateContents(op);
      });
    });

    this.handleSockets();
  }

  componentDidUpdate() {
    this.attachQuillRefs();
  }

  close() {
    console.log("Disconnecting from socket!");
    // Save title if changed or user changed content (this also handles updated_at for note)
    if (this.props.note.title != this.state.title || this.state.userUpdatedNote) {
      $.ajax({
        url: '/notes/update-note',
        method: "POST",
        dataType: "JSON",
        data: { noteId: this.props.note._id, title: this.state.title },
        headers: { 'prg-auth-header': this.state.user.token }
      }).done(function (data, text) {
        if (data.code == 200) {
          console.log("Updated note title");

          let that = this;
          setTimeout(function() { that.props.fetchNotebooks(that.state.user) }, 100);
        }
      }.bind(this));
    }

    this.ioSocket.disconnect();
    this.props.dismissModal();
  }

  handleSockets() {
    let user = this.state.user;

    let that = this;
    let userObject = {_id: user.id, name: (user.first_name + ' ' + user.last_name) };
    this.ioSocket = io.connect(window.location.host, { query: {"user": JSON.stringify(userObject), "noteId":this.props.note._id}});

    this.ioSocket.on('authenticated', function(authenticationData) {
      console.log("[NotesSockets] Socket.on(Authenticated)!");
      console.log(authenticationData);

      let currentCursors = authenticationData.data.currentMap;
      if (!currentCursors) currentCursors = {};
      Object.keys(currentCursors).map(function(userId) {
        if (userId != user.id) {
          that.putCursor(userId, currentCursors[userId]);
        }
      });
    });

    this.ioSocket.on('connect', function() {
      console.log('[NotesSockets] Connected socket.  Waiting on authentication.');
    });

    this.ioSocket.on('newMessage', function(response) {
      console.log("[NotesSockets] New message");
    });

    this.ioSocket.on('stateChange', function(response) {
      console.log("Received socket state change");
      console.log(JSON.stringify(response));
      if (response.data.user._id != user.id) {
        that.putCursor(response.data.user._id, response.data);
      }
    });

    this.ioSocket.on('removeCursor', function(response) {
      console.log("Removing: " + response.data.user._id);
      if (response.data.user._id != user.id) {
        that.removeCursor(response.data.user._id);
      }
    });
  }

  putCursor(userId, cursorObject) {
    let allCursors = this.state.cursors;
    let cursor = allCursors[userId];
    var modified = false;
    var userUpdate = false;

    if (!cursor) {
      modified = true;
      allCursors[userId] = cursorObject;
      cursor = allCursors[userId];
      // todo download user info and assign unique color
    }

    if (cursorObject.range.index != cursor.range.index || cursorObject.range.length != cursor.range.length) {
      modified = true;
      allCursors[userId]['range'] = cursorObject.range;
    }

    if (modified && userId == this.state.user.id) {
      userUpdate = true;
      this.ioSocket.emit('stateChange', {range: cursorObject.range});
    }

    userUpdate = (userUpdate || this.state.userUpdatedNote); // Set to true if already set

    this.setState({ cursors: allCursors, userUpdatedNote: userUpdate});
  }

  removeCursor(userId) {
    let allCursors = this.state.cursors;
    delete allCursors[userId];
    this.setState({ cursors: allCursors});
  }

  handleCursorPosition(range) {
    if (range) {
      if (range.length == 0) {
        console.log('User cursor is on', range.index);
      } else {
        var text = this.quillRef.getText(range.index, range.length);
        console.log('User has highlighted', text);
      }

      console.log("Position: " + JSON.stringify(this.quillRef.getBounds(range.index)));
      this.putCursor(this.state.user.id, { range: range });
    } else {
      console.log('Cursor not in the editor');
    }
  }

  attachQuillRefs() {
    // Ensure React-Quill reference is available:
    if (typeof this.reactQuillRef.getEditor !== 'function') return;
    // Skip if Quill reference is defined:
    if (this.quillRef != null) return;

    const quillRef = this.reactQuillRef.getEditor();
    if (quillRef != null) this.quillRef = quillRef;
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  handleTextChange(content, delta, source, editor) {
    // console.log(this.quillRef.editor.delta.ops[0].insert);
    // this.setState({ pdfContent: this.quillRef.editor.delta.ops[0].insert })
    if (source !== 'user') return;

    this.doc.submitOp(delta, {source: this.quillRef});
    this.wordCountUpdate();
  }

  getNoteEditor(cursorElements) {
    return (
      <div>
        <NoteEditorToolbar onClick={this.onClickButton.bind(this)} />
        <ReactQuill ref={(el) => { this.reactQuillRef = el }} theme='snow' modules={this.modules} formats={this.formats} onChange={this.handleTextChange.bind(this)} />
      </div>
    );

    $('.ql-container').append()
  }

  getCursorStyle(pos, color) {
    let quillOffset = $('.ql-editor').position();
    return { left: pos.left - quillOffset.left, top: pos.top - quillOffset.top, backgroundColor: color};
  }

  wordCountUpdate() {
    let wordNumber = this.quillRef.editor.delta.ops[0].insert;
    this.setState({ wordcount: wordcount(wordNumber) })
  }

  toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  onClickButton() {
    console.log('onclick button log');
      var doc = new pdfConverter('p','pt','letter');
      var docTitle = this.props.note.title;
      var docContent = this.quillRef.editor.delta.ops[0].insert;
      //console.log(doc.getFontList() );
      this.toDataUrl('images/background.jpg', function(base64Img) {
        var imgData = base64Img;
        console.log(imgData);
        console.log('Adding to doc.');
        doc.addImage(imgData, 'JPEG', 0, 0, 612, 792);
        console.log('Image added.');
        doc.setFont('Times', 'Roman');
        doc.setFontSize(22);
        doc.text(20, 50, docTitle);
        doc.setFontSize(16);
        doc.text(20, 80, docContent);
        console.log('About to save');
        doc.save("test.pdf");
      });
  }

  // onClickWordButton() {
  //   var docContent = this.quillRef.editor.delta.ops[0].insert;
  //   var converted = HtmlDocx.asBlob(docContent, {orientation: 'portrait', margins: {top: 720}});
  //   saveAs(converted, 'test.docx');
  // }

  render() {
    let user = this.state.user;
    let note = this.props.note;
    let noteCreator = note.creator.first_name + ' ' + note.creator.last_name
    let noteImg = '/images/default-profile-pic.png';

    let cursors = this.state.cursors;
    // console.log("Cursors: " + JSON.stringify(this.state.cursors, null, 4));


    let that = this;
    let cursorElements = Object.keys(this.state.cursors).map(function(userId, key) {
      if (userId != user.id) { // Don't show cursor for our user
        let bounds = that.quillRef.getBounds(cursors[userId].range.index);
        console.log('Displaying: ' + userId);
        console.log("Bounds: " + JSON.stringify(bounds));

        let color = that.colors[key % that.colors.length];

        return (
          <div className='cursorItem' style={that.getCursorStyle(bounds, color)} key={key}>
            <p style={{ display: 'none'}}><span style={{backgroundColor: color}}>{cursors[userId].user.name}</span></p>
          </div>
        );
      } else {
        return (<span key={key}></span>);
      }
    });

    setTimeout(function() { // Ensure dom element is rendered if this is our first pass
      let domNode = document.getElementsByClassName("ql-custom-cursors")[0];
      const element = <h1>Hello, world</h1>;
      ReactDom.render(<span> { cursorElements }</span>, domNode);

      $(function() {
        $(".cursorItem").hover(
          function() { 
            $(this).children('p').show().clearQueue();
          }, function() {  
            $(this).children('p').delay(1000).fadeOut();
          }
        );
      });

    }, 50);

    let cursorImageElements = Object.keys(this.state.cursors).map(function(userId, key) {
      if (userId != user.id) {
        let color = that.colors[key % that.colors.length];

        return (
          <img key={key} src="https://placeholdit.co//i/150x150" className='img-circle' style={{backgroundColor: color}} /> 
        );
      }
      return (<span key={key}></span>);
    });

    const modalStyles = {
        overlay: {
        background: null,
        backgroundColor: 'red',
        opacity: null
    },
        content: {
          backgroundColor: 'red',
        }
};


    return(
      <div>
        <ModalContainer zIndex={9999} backgroundColor='rgb(238, 237, 237)' opacity='0.85' style={modalStyles}>
          <ModalDialog className="note-popup-dialog" style={modalStyles} >
            <div className="popup-holder">
              <section className="edit-note-popup clearfix">
                <section className="inner-header clearfix">
                  <div className="info-wrapper">
                    <img className="user-image img-circle" src={noteImg} alt="User"/>
                      <p className="note-owner">by {noteCreator}</p>
                      <p className="time-wrapper">{ new Date(note.updated_at).toLocaleDateString('en-US', { weekday: "long", year: "numeric", month: "long",  
                day: "numeric" }) }</p>
                  </div>
                  {/* <div className="options-wrapper">
                    <span className="delete-note"></span>
                    <span className="note-info"></span>
                    <div className="search-wrapper">
                      <input type="text" className="form-control search-note" placeholder="search"/>
                      <span className="search-ico"></span>
                    </div>
                    <span className="maximize"></span>
                  </div> */}
                </section>
                <section className="note-body clearfix">
                  <div className="title-wrapper">
                    <input defaultValue={note.title} type="text" className="note-title" name='title' value={this.state.noteTitle} onChange={ this.handleChange.bind(this) } />
                  </div>
                  <div className="rich-editor-holder">
                    { this.getNoteEditor(cursorElements) }
                  </div>
                </section>
                <section className="inner-footer clearfix">
                  { cursorImageElements }
                </section>
              </section>
              <span className="close-note" onClick={this.close.bind(this)}></span>
              <div className="note-words-count">
                <span className="count">{this.state.wordcount}</span> <span className="def">words</span>
              </div>
              <div>
                <Slider min={0} max={20} defaultValue={3} handle={this.handle} />
              </div>
            </div>
          </ModalDialog>
        </ModalContainer>
      </div>
    );
  }
}

export default connect(null, actions)(NoteEditor);

// <Scrollbars style={{ height: 570 }}>
//   <div className="rich-editor-holder">
//       <ReactQuill theme='snow' onChange={this.handleTextChange.bind(this)} defaultValue='' />
//   </div>
// </Scrollbars>

// (this.state.notebookObj != null && this.state.notebookObj.shared_privacy == _notes_read_write) ?
                    //   <span className="save-note" onClick={this.closeNotePopup.bind(this)}></span> :
                    //   <span className="save-note read-only" onClick={this.closeNotePopup.bind(this)}></span>
