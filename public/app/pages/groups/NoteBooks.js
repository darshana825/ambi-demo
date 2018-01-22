
import React from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session from '../../middleware/Session';
//import {Alert} from '../../config/Alert';
import { Scrollbars } from 'react-custom-scrollbars';
//import RichTextEditor from '../../components/elements/RichTextEditor';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import NoteCategory from '../notes/NoteCategory';

export default class NoteBooks extends React.Component {
    constructor(props) {
        super(props);
        if (Session.getSession('prg_lg') == null) {
            window.location.href = "/";
        }
        this.state = {
            catColor: "",
            catNameValue: "",
            isDefault: 0,
            notes: [],
            loggedUser : Session.getSession('prg_lg'),
            group: this.props.myGroup,
        };

        this.loadNotes();
    }

    componentWillReceiveProps(nextProps) {
        if(typeof nextProps.myGroup != 'undefined' && nextProps.myGroup) {
            this.setState({group: nextProps.myGroup});
        }
    }

    loadNotes() {

        let loggedUser = Session.getSession('prg_lg');

        $.ajax({
            url: '/notes/get-notes',
            method: "GET",
            dataType: "JSON",
            headers: {'prg-auth-header': loggedUser.token}
        }).done(function (data, text) {
            console.log(data);
            if (data.status.code == 200) {
                if (data.notes.length == 0 || data.notes[0] == null) {
                    let _grp = this.state.group;
                    this.setState({catNameValue: _grp.name, catColor: _grp.color, isDefault: 1});
                    //this.addDefaultNoteBook();
                } else {
                    let notebooks = data.notes;
                    this.setState({notes: notebooks});
                }
            }
        }.bind(this));

    }

    render() {

        console.log("before loading notebook list ");
        console.log(this.state.notes);


        return (
            <section className="group-content">
                {/*<div className="group-folder-container">
                    <section className="folder-header">
                        <div className="row">
                            <div className="col-sm-7">
                                <h2>My Group NoteBooks</h2>
                            </div>
                            <div className="col-sm-5">
                                <div className="search-folder">
                        <span className="inner-addon">
                            <i className="fa fa-search"></i>
                            <input type="text" className="form-control" placeholder="Search"/>
                        </span>
                                </div>
                                <div className="crt-folder">
                                    <button className="btn btn-crt-folder">
                                        <i className="fa fa-plus"></i> New NoteBook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="folder-body">
                        {
                            (this.state.notes.length>0) ?
                                <NoteCategory notebooks={this.state.notes}
                                              showConfirm={null}
                                              showNotePopup={null}
                                              onLoadNotes={null}/>
                                :null
                        }
                    </section>
                </div>*/}
            </section>
        );
    }
}