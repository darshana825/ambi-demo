/**
 * This class Will Handle browser work-mode sessions
 * */
import Moment from 'moment';
import Session  from './Session.js';
import Socket  from './Socket.js';
import Cron  from 'node-cron';

let WorkMode = {
    loggedUser: Session.getSession('prg_lg'),
    wmObj: {
        is_work_mode_active: false,
        news_feed: {
            is_active: false,
            scheduler: "",
            start_time: "",
            end_time: ""
        },
        calls: false,
        messages: false,
        social_notifications: false,
        all_notifications: false,
        selected_option: "",
        start_time: null,
        end_time: null
    },
    _wmCron: null,

    init: function(){
        this.wmObj = {
            is_work_mode_active: false,
            news_feed: {
                is_active: false,
                scheduler: "",
                start_time: "",
                end_time: ""
            },
            calls: false,
            messages: false,
            social_notifications: false,
            all_notifications: false,
            selected_option: null,
            start_time: null,
            end_time: null
        };
    },

    checkWorkMode: function(data){
        let _this = this;
        this._wmCron = Cron.schedule('* * * * * *', function() {
            _this.checkWithSession();
        }, false);

        this.updateWMSession(data, function () {
            _this._wmCron.start();
        });
    },

    checkWithSession: function() {
        let _this = this,  _wmSession = Session.getSession('prg_wm'), _wmObj = this.wmObj;

        if(_wmSession != null && _wmSession != ''){
            let _now = Moment.utc(), _end_time = Moment.utc(_wmSession.end_time);

            if (Moment(_end_time).isBefore(_now) || Moment(_end_time).isSame(_now)){
                this.deactivateWorkMode();
            }else if(_wmSession.news_feed.is_active == false && _wmSession.news_feed.scheduler == "temp_deactivated"){
                let _nw_end_time = Moment.utc(_wmSession.news_feed.end_time);
                if(Moment(_nw_end_time).isBefore(_now) || Moment(_nw_end_time).isSame(_now)){
                    this._wmCron.stop();
                    _wmSession["news_feed"] = {
                        is_active: true,
                        scheduler: "",
                        start_time: "",
                        end_time: ""
                    };

                    this.updateWMSession(_wmSession, function () {
                        _this._wmCron.start();
                        _this.updateWorkMode();
                    });
                }

            }else {
                this.updateWMSession(_wmSession, function () {});
            }
        }else {
            this.init();
        }
    },

    updateWMSession: function(data, callBack) {
        let _wmObj = this.wmObj;
        if(typeof data != "undefined" && data != null && (_wmObj.is_work_mode_active != data.is_work_mode_active || JSON.stringify(_wmObj.news_feed) != JSON.stringify(data.news_feed) ||
            _wmObj.calls != data.calls || _wmObj.messages != data.messages || _wmObj.social_notifications != data.social_notifications || _wmObj.all_notifications != data.all_notifications ||
            _wmObj.selected_option != data.selected_option || _wmObj.start_time != data.start_time || _wmObj.end_time != data.end_time)) {

            _wmObj['is_work_mode_active'] = data.is_work_mode_active;
            _wmObj['news_feed'] = data.news_feed;
            _wmObj['calls'] = data.calls;
            _wmObj['messages'] = data.messages;
            _wmObj['social_notifications'] = data.social_notifications;
            _wmObj['all_notifications'] = data.all_notifications;
            _wmObj['selected_option'] = data.selected_option;
            _wmObj['start_time'] = data.start_time;
            _wmObj['end_time'] = data.end_time;

            this.wmObj = _wmObj;
            Session.createSession("prg_wm", _wmObj);
            callBack(null);
        }else {
            callBack(null);
        }
    },

    getWorkMode: function(){
        let prg_wm_session = Session.getSession('prg_wm');
        return (typeof prg_wm_session != "undefined" && prg_wm_session != null) ? prg_wm_session : this.wmObj;
    },

    getRemainingTime: function (){
        let _this = this, now = Moment(),
            howLong = Moment(_this.wmObj.end_time).diff(now),
            timeLeft = Moment.utc(howLong);

        return timeLeft;
    },

    setWorkMode: function (data) {
        if(typeof data == "undefined" || data == null){
            return;
        }
        let _this = this;
        this._wmCron.stop();
        this.updateWMSession(data, function () {
            _this._wmCron.start();
            _this.updateWorkMode();
        });
    },

    deactivateWorkMode: function () {
        this.init();
        Session.createSession("prg_wm", '');
        this.updateWorkMode();
    },

    workModeAction: function (option, unblock) {
        if(option == "work"){
            window.location.href = "/";
        }

        if(option == "done"){
            this.deactivateWorkMode();
        }

        if(option == "unblock"){
            let _this = this, workModeData = Session.getSession('prg_wm');
            this._wmCron.stop();

            console.log(unblock);

            if(unblock == "all_notifications"){
                workModeData["all_notifications"] = false;
                workModeData["social_notifications"] = false;
            }else if(unblock != "news_feed"){
                workModeData[unblock] = false;
            }else {
                let _start_time = Moment.utc(), _end_time = Moment.utc(_start_time).add(5, 'minutes');
                workModeData['news_feed'] = {
                    is_active: false,
                    scheduler: "temp_deactivated",
                    start_time: Moment(_start_time).format(),
                    end_time: Moment(_end_time).format()
                }
            }

            if(workModeData.news_feed.is_active == false && workModeData.news_feed.scheduler != "temp_deactivated" && workModeData.calls == false && workModeData.messages == false &&
                workModeData.social_notifications == false && workModeData.all_notifications == false){
                this.deactivateWorkMode();
                this._wmCron.start();
            }else {
                this.updateWMSession(workModeData, function () {
                    _this._wmCron.start();
                    _this.updateWorkMode();
                });
            }
        }
    },

    updateWorkMode() {
        let _this = this;
        $.ajax({
            url: '/work-mode/add',
            method: "POST",
            dataType: "JSON",
            data: {work_mode_data: _this.wmObj},
            headers: {'prg-auth-header': this.loggedUser.token}
        }).done( function (data, text){
            if(data.status.code == 200){
                _this.emitWorkModeObject();
            }
        }.bind(this));
    },



    emitWorkModeObject: function () {
        let emitData = this.wmObj;
        emitData['user_name'] = this.loggedUser.user_name;
        Socket.sendWorkModeStatus(emitData);
    },

    listenToWMSocket() {
        let _this = this;
        Socket.listenToWorkModeStatus(function (data) {
            _this.updateWMSession(data, function () {});
        });
    }
};

export default WorkMode;
WorkMode.listenToWMSocket();
