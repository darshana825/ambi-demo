/**
 * User tile view block
 */

import React from 'react';

const UserBlockTileView =({user,onAccept,onAdd,onSkip,showSkip, connectionType})=>{


    const user_profile_image = (typeof user.images.profile_image.http_url != 'undefined' )? user.images.profile_image.http_url : "images/"+user.images.profile_image.file_name,
          full_name             = user.first_name +" "+ user.last_name;
    return (

        <div className="connection-block">
            <div className="profile-image-wrapper">
                <img src={user_profile_image} className="img-responsive img-circle profile-pic"/>
                <span className="close-suggestion" onClick={()=>onSkip(user)}></span>
            </div>
            <div className="block-content">
                <h4 className="connection-name">{full_name}</h4>
                <p className="college">{user.cur_working_at}</p>
                <p className="college">{user.country}</p>
                {
                    (connectionType == "CONNECTION_REQUEST") ?
                        <button className="btn btn-connect" onClick={ () => onAccept(user) }>accept</button>
                        : null
                }
                {
                    (connectionType == "CONNECTION_SUGGESTION")?
                        <button className="btn btn-connect" onClick={ () => onAdd(user) }>connect</button>
                        :null

                }
            </div>
        </div>


    )

}

export default UserBlockTileView;
