import React from 'react';
import Button from '../../components/elements/Button';
import Session  from '../../middleware/Session';

export default class ChangedPassword extends React.Component{
    constructor(props) {
        super(props);
        this.state= {};
    };

    render() {
        return (
            <div className="row row-clr pgs-middle-sign-wrapper changedPassword">
            	<div className="container">
                    <div className="containerHolder">
                        <div className="col-xs-6 pgs-middle-sign-wrapper-inner">
                            <div className="row row-clr pgs-middle-sign-wrapper-inner-cover">
                                <div className="introWrapper">
                                    <p>Password reset token is invalid</p>
                                </div>
                                <div className="row row-clr pgs-middle-sign-wrapper-inner-form">
                                    <Button type="button" size="12" classes="pgs-sign-submit-cancel" value="ok"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
