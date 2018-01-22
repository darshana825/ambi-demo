/**
 * This component is to store classes information
 */
import React from 'react';
import SelectDateDropdown from '../../components/elements/SelectDateDropdown'
import Session  from '../../middleware/Session';

export default class Classes extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedUser:Session.getSession('prg_lg'),
            data:{}
        };

    }
    componentDidMount(){
        this.loadClasses();
    }
    loadClasses(){
        $.ajax({
            url: '/educations/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.props.uname},
            success: function (data, text) {

                if (data.status.code == 200 && data.user !=null) {
                    this.setState({data:data.user});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    };
    render() {
        let read_only = (this.state.loggedUser.id == this.state.data.user_id)?false:true;

        return (
            <div className="inner-section classes">
                <div className="inner-header">
                    <div className="header-wrapper">
                        <span className="header-icon classes"></span>
                        <span className="header-text">classes</span>
                        {
                            (!read_only)?
                                <button className="btn add-data" onClick={this.editForm}>+ add classes</button>
                            : null
                        }
                    </div>
                </div>
                <div className="inner-container">
                    {/*<div className="title-wrapper">
                        <span className="title">Instructional Design</span>
                        <p className="title-text">Mdes, Information and Digital Design <span className="time">May 2016 - Present</span></p>
                    </div>
                    <div className="title-wrapper">
                        <span className="title">Dealing with Drought</span>
                        <p className="title-text">National Environmental Education Foundation (NEEF) <span className="time">Jan 2017 - Present</span></p>
                    </div>
                    <div className="title-wrapper">
                        <span className="title">User Research</span>
                        <p className="title-text">Mdes, Information and Digital Design <span className="time">May 2016 - Present</span></p>
                    </div>
                    <div className="title-wrapper">
                        <span className="title">AB Testing and code</span>
                        <p className="title-text">National Environmental Education Foundation (NEEF) <span className="time">Jan 2017 - Present</span></p>
                    </div>*/}
                </div>
            </div>
        );
    }

}
