/**
 * User Thumbnail view
 */
import React from 'react';
import ReactTooltip from  'react-tooltip';

const UserBlockThumbView =({user,onClick})=> {

    let _images = user.images;
    let user_profile_image = _images.hasOwnProperty('profile_image') ? _images.profile_image.hasOwnProperty('http_url') ? _images.profile_image.http_url : "/images/default-profile-pic.png" : "/images/default-profile-pic.png";
    user_profile_image = (user_profile_image != undefined && user_profile_image) ? user_profile_image : "/images/default-profile-pic.png";

    //const user_profile_image = (typeof user.images.profile_image.http_url != 'undefined' )? user.images.profile_image.http_url : "images/"+user.images.profile_image.file_name;

    const full_name = user.first_name + " " + user.last_name;

    return (
        <div className="box">
            <div className="boxInner">
                <a href="javascript:void(0)"
                    onClick={()=>onClick(user)}
                    data-tip
                    data-for={user.user_id}
                    ><img src={user_profile_image} />
                </a>
            </div>
            <ReactTooltip id={user.user_id} >
                <span>{full_name}</span>
            </ReactTooltip>
        </div>
    );
};

export default UserBlockThumbView;
