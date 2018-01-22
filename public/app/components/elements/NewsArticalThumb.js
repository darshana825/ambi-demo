/*
*   News Artical Thumb Component
*/
import React from "react";

const NewsArticalThumb = ({articals,onNewsThumbClick,isHiddenBlockVisible,type}) => {

    let _articals = (typeof articals != "undefined")? articals : [];

    let styles={
        height : (isHiddenBlockVisible)? "auto" : 0
    }

    let thumbBlock = _articals.map(function(artical,index){
        if(index <= 4){
            return(
                <div className="col-xs-2 pg-col-20 pg-news-item" onClick={(event)=>onNewsThumbClick(artical.id, type)} key={index}>
                    <div className="row row-clr pg-news-inner-full various">
                        <p className="pg-pg-news-inner-time">{artical.timeDuration + " hrs ago..."}</p>
                        <img src={artical.imgLink} alt="" className="img-responsive pg-pg-news-inner-img" />
                        <div className="col-xs-12 pg-news-inner-box-content">
                            <h6 className="pg-news-inner-box-content-txt">{artical.name}</h6>
                        </div>
                    </div>
                </div>
            )
        }
    });

    let hiddenthumbBlock = _articals.map(function(artical,index){
        if(index > 4){
            return(
                <div className="col-xs-2 pg-col-20 pg-news-item" onClick={(event)=>onNewsThumbClick(artical.id, type)} key={index}>
                    <div className="row row-clr pg-news-inner-full various">
                        <p className="pg-pg-news-inner-time">{artical.timeDuration + " hrs ago..."}</p>
                        <img src={artical.imgLink} alt="" className="img-responsive pg-pg-news-inner-img" />
                        <div className="col-xs-12 pg-news-inner-box-content">
                            <h6 className="pg-news-inner-box-content-txt">{artical.name}</h6>
                        </div>
                    </div>
                </div>
            )
        }
    });

    return(
        <div className="row row-clr pg-news-item-top-row">
            {thumbBlock}

            {(hiddenthumbBlock)? <div className="hiddenBlock" style={styles}>{hiddenthumbBlock}</div> : null}
        </div>
    )
}

export default NewsArticalThumb;
