import React from "react";

const ProgressBar = (props) => {
    let percentage = (props.percentage)? props.percentage : "100";

    if(props.progressType == "bar"){
        return(
            <div className="progress">
                <div className="progress-bar progress-bar-striped active"
                     role="progressbar"
                     aria-valuenow={percentage}
                     aria-valuemin={0}
                     aria-valuemax={100} style={{width: percentage + '%'}}></div>
            </div>
        )
    }else{
        return(
            <div id="loadFacebookG">
                <div id="blockG_1" className="facebook_blockG" />
                <div id="blockG_2" className="facebook_blockG" />
                <div id="blockG_3" className="facebook_blockG" />
            </div>
        )
    }
}

export default ProgressBar;
