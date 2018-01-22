import React, { Component } from 'react';
import firebase from 'firebase';
import CodeMirror from 'codemirror';
import Firepad from 'firepad';

export default class FirePad extends Component {
  constructor(){
    super();
  }

  componentDidMount() {
    // Create Ace editor.
    firebase.initializeApp({
      apiKey: "AIzaSyCDre_vyeiK1a0qA8XSecI4elbF3hlobjc",
      authDomain: "firepad-test-d4679.firebaseapp.com",
      databaseURL: "https://firepad-test-d4679.firebaseio.com",
      projectId: "firepad-test-d4679",
      storageBucket: "firepad-test-d4679.appspot.com",
      messagingSenderId: "585682717429"
    });

      var firepadRef = firebase.database().ref();

      var editor = ace.edit('firepad');

      var firepad = Firepad.fromACE(firepadRef, editor);

    // Get Firebase Database reference.
   //var firepadRef = firebase.database().ref();

  //  // Create CodeMirror (with lineWrapping on).
  //  var codeMirror = CodeMirror(document.getElementById('firepadz'), { lineWrapping: true });
  //
  //  // Create Firepad (with rich text toolbar and shortcuts enabled).
  //  console.log("firepadRef: " + this.firepadRef);
  //
  //
  //  var firepad = Firepad.fromCodeMirror(this.firepadRef, codeMirror,
  //      { richTextShortcuts: true, richTextToolbar: true, defaultText: 'This is FIREPAD!!!' });
  //
  }
    render() {
    return <div id='firepad'></div>;
  }
}
