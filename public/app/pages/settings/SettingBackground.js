/**
 * SettingsBackground Component
 */
import React from 'react';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import Session  from '../../middleware/Session';
import $ from 'jquery';
import ToggleButton from 'react-toggle-button'
import Dropzone from 'react-dropzone'

export default class SettingBackground extends React.Component {

  constructor(props) {
    super(props);

    if (Session.getSession('prg_lg') == null) {
      window.location.href = "/";
    }

    this.state = {
      user: Session.getSession('prg_lg'),
      selectedBackgroundType: 'white',
      toggleWhiteBackgroundValue: false,
      toggle4kBackgroundValue: false
    };

    this.wallpapers = [];
    for (var i = 1; i <= 12; i++) {
      this.wallpapers.push('https://s3.amazonaws.com/ambi-static/backgrounds/' + i + '.jpg');
    }

    this.selectBackgroundType = this.selectBackgroundType.bind(this);
  }

  componentDidMount() { 
    let that = this;
    setTimeout(function() { that.preloadImages(that.wallpapers)}, 100);
  }

  preloadImages(images) {
    $(images).each(function(){
        $('<img/>')[0].src = this; 
    });
  }

  selectBackgroundType(event) {
    $('#' + this.state.selectedBackgroundType).removeClass('active');
    const {id} = event.target; 
    $('#' + id).addClass('active');
    this.setState({
      selectedBackgroundType: id,
    });
  }

  selectWallpaper(src, object) {
    let values = {'background': src};
    let user = Session.getSession('prg_lg');

    $.ajax({
      url: '/background/update',
      method: "POST",
      dataType: "JSON",
      data:values,
      headers: { 'prg-auth-header':user.token },
      success: function (data, text) {
        if(data.status.code == 200 ){
          Session.createSession("prg_lg", data.user);
          let wallpaperHolder = $('.wallpaper-holder');
          if (wallpaperHolder) {
            if (src == '') {
              src = 'https://s3.amazonaws.com/ambi-static/backgrounds/1.jpg'; // change when going live
              $('.dashboard-container').removeClass('dashboard-white');
            } else if (src == 'white') {
              src = '';
              wallpaperHolder.fadeOut(function() {
                $('.dashboard-container').addClass('dashboard-white');
              });
            } else {
              $('.dashboard-container').removeClass('dashboard-white');
            }

            wallpaperHolder.fadeOut(function() {
              wallpaperHolder.css("background-image", 'url(' + src + ')').fadeIn();
            });
          }

          this.setState({user: data.user});
        } 
      }.bind(this),
      error: function (request, status, error) {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      }.bind(this)
    });
  }

  onImageDrop(files) { 
    let file = files[0];
    var reader = new FileReader();
    var that = this;
        
    reader.onload = function(e) {
      var content = e.target.result;

      var data = {'img_name': file.name, 'img': content, 'type':file.type};

      $.ajax({
        url: '/upload/image',
        method: "POST",
        dataType: "JSON",
        data: data, 
        headers: { 'prg-auth-header': Session.getSession('prg_lg').token }, 
        success: function (data, status) {
          console.log("data: " + JSON.stringify(data, null, 4)); 
          that.selectWallpaper(data.response.file_path);
      }.bind(that),
        error: function (request, status, error) {
          console.log("Request: " + JSON.stringify(request, null, 4)); 
          console.log("Status: " + JSON.stringify(status, null, 4));
          console.log("Error: " + JSON.stringify(error, null, 4));
          console.log(error);
        }.bind(that)
      });
    }
    
    reader.readAsDataURL(file)
  }

  render() {
    let selectedTab = this.state.selectedBackgroundType
    let user = Session.getSession('prg_lg')

    const tabs = ['white', 'wallpaper', '4K everyday', 'custom'];
    let _tabsMap = tabs.map(function(tab, key){
      return (
        <div className="col-xs-3" key={key}>
          <h4 onClick={this.selectBackgroundType} className={tab == selectedTab ? 'active' : ''} id={tab.replace(/ /g,"-")} key={tab.replace(/ /g,"-")}>{tab}</h4>
        </div> 
      );
    }, this);

    let _wallpapersMap = this.wallpapers.map(function(wallpaper, key){
      return (
        <div className="col-xs-3" key={key}>
          <div className='p5'>
            <img src={wallpaper} className={'wallpaper ' + (this.state.user.settings.background == wallpaper && 'selected-bg')} onClick={this.selectWallpaper.bind(this, wallpaper)} key={wallpaper} />
          </div>
        </div> 
      );
    }, this);

    return (  
      <div className="background">
        <p>enhance your day with beautiful photos</p>
        <div className="row">
          {_tabsMap}
          <div className="content">


            {selectedTab == 'white' &&
              <div>
                <div className="toggle-right">
                  <ToggleButton
                    value={ user.settings.background == 'white' }
                    inactiveLabel={''}
                    activeLabel={''}
                    colors={{
                    active: {
                      base: '#ed1e7a',
                    },
                    }}
                    onToggle={this.selectWallpaper.bind(this, user.settings.background == 'white' ? '' : 'white')}
                    />
                  <h5>turn on </h5>
                </div>
                <img className="full-image" src="/images/dashboard/settings/whiteMode.png" /> 
              </div>
            }


            {selectedTab == 'wallpaper' &&
              <div>
                <p>choose one of ambi's favorite wallpapers</p>
                <div className="row ml0 all-wallpapers">
                  {_wallpapersMap}
                </div>
              </div>
            }


            {selectedTab == '4K-everyday' &&
              <div>
                <div className="toggle-right">
                  <ToggleButton
                    value={ user.settings.background == '' }
                    inactiveLabel={''}
                    activeLabel={''}
                    colors={{
                    active: {
                      base: '#ed1e7a',
                    },
                    }}
                    onToggle={this.selectWallpaper.bind(this, '')}
                    />
                  <h5>turn on </h5>
                </div> 
                <p>4K everyday automatically rotates your background photo each day with new and unique photos</p>
              </div>
            }


            {selectedTab == 'custom' &&
              <div> 
                <Dropzone className="dropzone-custom"
                  multiple={false}
                  accept="image/*"
                  onDrop={this.onImageDrop.bind(this)}>
                  <p>Drop an image or click to add a custom background.</p>
                </Dropzone>
              </div>
            }

          </div>
        </div>
      </div>
    ) 
  } 
}