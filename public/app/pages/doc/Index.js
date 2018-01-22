/**
 * This is folders index class that handle all
 */
import React from 'react';
import Session  from '../../middleware/Session';

export default class Index extends React.Component{
    constructor(props){
        super(props);

        if(Session.getSession('prg_lg') == null){
            window.location.href = "/";
        }

        this.state={}
    }

    render(){
        return(
            <div id="pg-doc-page" className="pg-page">
                <div className="row row-clr">
                    <div className="container-fluid">
                        <h2 className="section-text">Doc</h2>
                    </div>
                </div>
            </div>
        );
    }

}
