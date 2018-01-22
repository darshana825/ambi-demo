/**
 * This is Secretary thumbnail component
 */
import React from 'react';

const FooterSecretaryThumbnail = (props)=>{
    return(
        <div className="col-xs-2 pgs-secratery-img">
            <a href="/notifications">
                <img src={props.url} alt="Secretary" className="img-responsive" />
                {props.count>0?<span className="counter">{props.count}</span>:null}
            </a>
        </div>
    )
}

export default FooterSecretaryThumbnail;
