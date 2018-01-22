import React from 'react';
import schedule from 'node-schedule';
import Moment from 'moment';
import Session  from '../../middleware/Session';
import WidgetsPopup from '../widgets/WidgetsPopup';
import CountdownWidget from '../widgets/CountdownWidget';
import FeedbackWidget from '../widgets/FeedbackWidget';
import QuoteWidget from '../widgets/QuoteWidget';
import DailyInterestWidget from '../widgets/DailyInterestWidget';
import Intercom from 'react-intercom';

export default class AmbiDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.day = Moment().format("dddd");
        this.month = Moment().format("MMMM");
        this.date = Moment().format("DD");

    let user = Session.getSession('prg_lg');

    let clockFormat = "h:mm";
    if (user && user.settings.clock_format == 24) {
      clockFormat = "H:mm";
    }

    this.state = {
      user: user,
      currentTime: Moment().format(clockFormat),
      a: Moment().format("a"),
      showWidgetsPopup: false,
      weatherCity: '-',
      weatherTemperatureF: '-',
      weatherTemperatureC: '-',
    }

    this.tick = this.tick.bind(this);
    this.tick();

    this.loadWeather.bind(this);
    this.dropImage.bind(this);
  }

  componentDidMount() {
    // Setup file dropping for background upload
    var dropzone = new Dropzone(".myDropzone", { url: "/file/post", clickable: false, previewTemplate: '<span></span>', acceptedFiles: 'image/*' });
    dropzone.on('dragenter', function(event) {
      console.log("Drag enter");
      $('.drag-view').css("display", "flex").fadeIn(function() {
        $('.wallpaper-holder').addClass('blurred');
      });
      return true;
    });

    $(".drag-view").mouseleave(function() {  
      $('.wallpaper-holder').removeClass('blurred');
      $('.drag-view').fadeOut();
    });

    window.onmouseout = function() {
      $('.wallpaper-holder').removeClass('blurred');
      $('.drag-view').fadeOut();
    }

    let that = this;
    dropzone.on("addedfile", function(file) {
      that.dropImage(file); 
    });

    $(window).click(function(e) {
      let targ = $(e.target);

      if (that.state.showWidgetsPopup && !targ.is('.widget-icon') && !targ.parents().andSelf().is('.widgets-popup')) {
        that.setState({showWidgetsPopup: false}); // Hide widgets popup when clicking outside
      }
    });
  }

  dropImage(file) { 
    var reader = new FileReader();
    var that = this;
    let user = this.state.user;

    reader.onload = function(e) {
      var content = e.target.result;
      var data = {'img_name': file.name, 'img': content, 'type':file.type};

      $.ajax({
        url: '/upload/image',
        method: "POST",
        dataType: "JSON",
        data: data, 
        headers: { 'prg-auth-header':user.token }, 
        success: function (data, status) {
          console.log("data: " + JSON.stringify(data, null, 4));
          let newImgSrc = data.response.file_path;
          $('<img>').attr('src', newImgSrc).load();

          let wallpaperHolder = $('.wallpaper-holder');
          $('.drag-view').fadeOut();
          wallpaperHolder.removeClass('blurred'); 

          let values = {'background': data.response.file_path};
          $.ajax({
            url: '/background/update',
            method: "POST",
            dataType: "JSON",
            data:values,
            headers: { 'prg-auth-header':user.token },
            success: function (data, text) {
              if(data.status.code == 200 ){
                Session.createSession("prg_lg", data.user);

                $('<img>').attr('src', newImgSrc).load(function() {
                  wallpaperHolder.fadeOut(function() {
                    wallpaperHolder.css("background-image", 'url(' + newImgSrc + ')').fadeIn(function() {
                      that.setState({user: data.user});
                    }); 
                  });
                });
              } 
            }.bind(this),
            error: function (request, status, error) {
              console.log(request.responseText);
              console.log(status);
              console.log(error);
            }.bind(this)
          });
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

  toggleWidgetsPopup() {
    let _swp = this.state.showWidgetsPopup;
    this.setState({
      showWidgetsPopup: !_swp,
    });
  }

  reloadWidgets() {
    this.setState({user: Session.getSession('prg_lg')});
  }

  tick() {
    let _this = this;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        _this.loadWeather(position.coords.latitude+','+ position.coords.longitude);
      });
    } else {
      _this.loadWeather('Boston','');
    }

    new schedule.scheduleJob('* * * * *', function () {
        let clockFormat = "h:mm";
        if (Session.getSession('prg_lg') && Session.getSession('prg_lg').settings.clock_format == 24) {
          clockFormat = "H:mm";
        }

        var now = Moment().format(clockFormat), a = Moment().format("a");
            _this.setState({
        currentTime: now,
                a: a
      });
    });
  }

  loadWeather(location, woeid) {
    let that = this;
    $.simpleWeather({
      location: location,
      woeid: woeid,
      unit: 'f',
      success: function(weather) {
        that.setState({
          weatherCity: weather.city,
          weatherTemperatureF: weather.temp,
          weatherTemperatureC: weather.alt.temp
        });
      },
      error: function(error) {
        console.log("Weather error: " + error);
      }
    });
  }

  render() {
    let user = this.state.user;
    let show24hr = user && user.settings.clock_format == 24;

    let showDateAndTime = user && (user.settings.widgets.date_and_time);
    let showWeather = user && (user.settings.widgets.weather);
    let showDailyInterest = user && (user.settings.widgets.daily_interest);
    let showDailyQuotes = user && (user.settings.widgets.daily_quotes); 
    let showCountdown = user && (user.settings.widgets.countdown);
    let showFeedback = user && (user.settings.widgets.feedback);

    let date = new Date();
    let hrs = date.getHours();

    let greating;

    if (hrs < 12){
      greating = 'Good Morning';
    } else if (hrs >= 12 && hrs <= 17){
      greating = 'Good Afternoon';
    } else if (hrs >= 17 && hrs <= 24){
      greating = 'Good Evening';
    }

    let imgUrl = (user && user.settings.background) || 'https://s3.amazonaws.com/ambi-static/backgrounds/1.jpg'; 
    let loadUrl = imgUrl == 'white' ? '' : imgUrl;

    let wallpaper = {
      backgroundImage: 'url(' + loadUrl + ')'
    };

    return (
      <section className={"dashboard-container " + (imgUrl == 'white' && 'dashboard-white')}>
        <div className='myDropzone'>
            <div className="container main-container">
                <div className="row">
                    {showDateAndTime &&
                      <section className="time-holder">
                          <p className="date-text">{this.day}, {this.month} {this.date}</p>
                          <p className="time-text">
                                <span>{this.state.currentTime}</span>
                                <span className="timeA">{!show24hr && this.state.a}</span>
                            </p>
                      </section>
                    }
                    <section className="greeting-holder">
                        <p className="greeting-text">{greating}, {user.first_name}!</p>
                    </section>
                    {showDailyInterest && 
                      <DailyInterestWidget />
                    }
                    {showDailyQuotes && 
                      <QuoteWidget />
                    }
                </div>
            </div>
            {showWeather && 
              <section className="weather-holder">
                <div className="weather-icon">
                    <img src="/images/weather-icons/weather-icon.png" alt="rainy" className="img-reponsive" />
                </div>
                <p className="weather-text">{user.settings.weather_format == 'f' ? this.state.weatherTemperatureF : this.state.weatherTemperatureC}°{user.settings.weather_format.toUpperCase()}</p>
                <p className="weather-location">{this.state.weatherCity}</p>
              </section>
            }
            {showCountdown &&
              <CountdownWidget />
            }
            {/*showFeedback &&
              <FeedbackWidget />*/
            }
            <span onClick={this.toggleWidgetsPopup.bind(this)} className="widget-icon"></span>
            <div className="wallpaper-holder" style={wallpaper}>
            <span className="overlay"></span>
          </div>
          <span className="left-top-shadow"></span>
          <span className="left-btm-shadow"></span>
          <span className="right-top-shadow"></span>
          {/* <span className="middle-shadow"></span> */}
          {
              (this.state.showWidgetsPopup) ? <WidgetsPopup zIndex={9999} parentUpdateFn={this.reloadWidgets.bind(this)} /> : null
          }
          {showFeedback &&
            <Intercom appID="soou5ujn" { ...user } />
          }
          <div className="drag-view blur">
            <h2>drop to upload background</h2>
          </div>
        </div>
      </section>
    );
  }
}