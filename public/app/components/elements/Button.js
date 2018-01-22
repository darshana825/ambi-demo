import React from 'react';

const Button = ({size,type,classes,value,onButtonClick})=>{

    let _size = 'col-xs-'+size;
    if(typeof onButtonClick == 'undefined'){
        return(
            <div className={_size}>
                <input type={type} className={classes} value={value} />
            </div>
        );
    }
    return(
        <div className={_size}>
            <input type={type} className={classes} value={value} onClick={event=>onButtonClick(event)}/>
        </div>
    )
}
export default Button;
