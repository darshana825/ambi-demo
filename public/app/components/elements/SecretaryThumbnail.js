/**
 * This is Secretary thumbnail component
 */
import React from 'react';

const SecretaryThumbnail = (props)=>{
    return(
        <div className="col-xs-2 pgs-secratery-img">
            <img src={props.url} alt="Secretary" className="img-responsive" />
        </div>
    )
}

export default SecretaryThumbnail;
