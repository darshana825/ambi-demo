/**
 * SettingsPopup Component
 */
import React from 'react'; 
import Session  from '../../middleware/Session';
import SettingBackground from './SettingBackground';
import SettingGeneral from './SettingGeneral';

export default class SettingsPopup extends React.Component {

    constructor(props) {
        super(props);

        if (Session.getSession('prg_lg') == null) {
            window.location.href = "/";
        }

        this._settings = [{name: "General", _id: "setting", detail: SettingGeneral }, {name: "Background", _id: "background", detail: SettingBackground }]; 

        this.state = {
            selectedSetting: this._settings[0],
        };
    }

    settingSelected(object, setting) {
        this.setState({
            selectedSetting: object
        });
    }

    minorSectionSelected(sectionName, obj) {
        console.log("Section name: " + sectionName);

        if (sectionName == 'logout') this.logout();
    }

    logout(){
        let token = Session.getSession('prg_lg').token;
        
        Session.destroy("prg_lg");
        Session.destroy("prg_wm");
        $.ajax({
            url: '/logout',
            method: "GET",
            dataType: "JSON",
            headers: { 'prg-auth-header':token },
            success: function (data, text) {

                if (data.status.code == 200) {
                    location.href ="/sign-up"

                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    }

    render() {
        let _sectionsMap = this._settings.map(function(section, key){
            return (
                <li onClick={this.settingSelected.bind(this, section)} key={section._id}><span className={this.state.selectedSetting.name == section.name && 'active'}>{section.name}</span></li>
            );
        }, this);

        let _minorSectionMap = ['logout'].map(function(section, key){
            return (
                <li onClick={this.minorSectionSelected.bind(this, section)} key={key}>{section}</li>
            );
        }, this);

        let selectedSetting = this.state.selectedSetting;
        let DetailView = selectedSetting.detail;

        return ( 
            <div className="settings-popup">
                <div className="setting-select">
                    <h2>settings</h2>
                    <ul>
                        { _sectionsMap }
                    </ul>
                    <ul className="minor-section">
                        { _minorSectionMap}
                    </ul>
                </div>
                <div className="setting-detail"> 
                    <div className="setting-detail-content">
                        { selectedSetting._id == 'background' && 
                            <h3>{ selectedSetting.name}</h3>
                        }
                        <DetailView />
                    </div>

                </div>
            </div> 
        ) 
    } 
}