import React from 'react'
import EstablishConnectionButton from './EstablishConnectionButton'

const EstablishConnectionBlock = ({connection,onConnectionSelect})=>{

    let _full_name = connection.first_name +" "+connection.last_name;

    let _image_name= (typeof connection.images.profile_image != 'undefined')?connection.images.profile_image.http_url:"/images/secretary-pic.png";
    let value = "";
    let is_clicked = false;
    switch(parseInt(connection.connection_status)){
        case 1:
            value="Connected";
            is_clicked = true;
            break;
        case 4:
            value = "Request Sent";
            is_clicked = true;
            break;
        default:
            value = "Connect";
            is_clicked = false;
    }
    return (
        <div className={"row row-clr pgs-establish-connection-box "}>
            <div className="row">
                <div className="col-xs-2 pgs-establish-pro-pic">
                    <img src={_image_name} alt={_full_name} className="img-responsive"/>
                </div>
                <div className="col-xs-6 pgs-establish-pro-detail">
                    <h3>{_full_name}</h3>
                    <p>{connection.cur_designation} at {connection.cur_working_at}</p>
                </div>
                <EstablishConnectionButton size="4"
                                           classes="pgs-establish-pro-button"
                                           clicked= {is_clicked}
                                           value={value}
                                           click={(isConnected) => {
                                                    onConnectionSelect(connection,isConnected);
                                           }} />
            </div>
        </div>
    );
}

export default EstablishConnectionBlock;