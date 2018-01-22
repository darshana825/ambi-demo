import React from 'react';

const Img = (props) =>{
    return (
        <div className="row row-clr wv-content-image-section" >
            <img src={props.src} alt={props.alt} className={props.cls}/>
        </div>
    );
}

export default Img;