import React from 'react'
import SignupLayout from './layout/SignupLayout'
import DefaultLayout from './layout/DefaultLayout'
import AmbiLayout from './layout/AmbiLayout'
import Session  from '../middleware/Session';
import Signup  from './signup/Signup';


class Main extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
            verify: ''
        }

        this.loggedUser= Session.getSession('prg_lg');
    }


    componentWillMount() {
        if (this.loggedUser) {
            this.setState({verify: 'verifying'});
            $.ajax({
                url : '/verify/me',
                method: "GET",
                dataType: "JSON",
                headers: { 'prg-auth-header':this.loggedUser.token },
                success : function (data, text) {
                    if(data.status.code == 200){
                        this.setState({verify: 'verified'});
                    }else {
                        this.setState({verify: 'verification-failed'});
                    }
                }.bind(this),
                error: function (request, status, error) {
                    this.setState({verify: 'verification-failed'});
                }.bind(this)
            });
        }else {
            this.setState({verify: 'verification-failed'});
        }
    }


    layoutSelector() {
        if (this.loggedUser && (this.state.verify == 'verified' || this.state.verify == 'verifying')) {
            return (
                    <AmbiLayout>
                        {this.props.children}
                    </AmbiLayout>
            )

        } else {
            return (
                    <SignupLayout>
                        {this.props.children ||<Signup />}
                    </SignupLayout>
            )
        }
    }

    render() {
        return this.layoutSelector();

    }
}


module.exports = Main;
