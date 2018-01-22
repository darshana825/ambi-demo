/**
 * Logo Component
 */
import React from 'react'


const Logo =(props)=>{
    return (
        <div className="branding">
            <a href="/">
                <img src={props.url} alt="ambi" className="img-responsive" />
            </a>
        </div>
    )
}
export default Logo;
