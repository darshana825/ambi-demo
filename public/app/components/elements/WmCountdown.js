/**
 * Component for work mode time countdown
 */

import React from 'react';
import WorkMode from '../../middleware/WorkMode';

export default class WmCountdown extends React.Component{
    constructor(props){
        super(props);

        this.state={
            _prg_wm: null,
            wmTimeSet: false,
            remainingTime: {
                hours: '00',
                mins: '00',
                secs: '00'
            }
        };

        this.checkRemainingTimeInterval = null;
    }

    componentDidMount(){
        let _prg_wm = WorkMode.getWorkMode(),
            _this = this;
        this.checkRemainingTimeInterval = null;

        if(_prg_wm.is_work_mode_active){
            console.log("mounted")
            this.checkRemainingTimeInterval = setInterval(function () {
                _this.checkRemainingTime();
            }, 1000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.checkRemainingTimeInterval);
        this.checkRemainingTimeInterval = null;
    }

    componentWillReceiveProps(nextProps){
        let _prg_wm = WorkMode.getWorkMode(),
            _this = this;

        if(nextProps.isWmTimerActive){
            if(_prg_wm.is_work_mode_active){
                this.setState({wmTimeSet : true});
                this.checkRemainingTimeInterval = setInterval(function () {
                    _this.checkRemainingTime();
                }, 1000);
            }
        }
    }

    checkRemainingTime() {
        let _prg_wm = WorkMode.getWorkMode();
        let timeLeft = WorkMode.getRemainingTime();
        this.setState({wmTimeSet : true});

        if(_prg_wm.is_work_mode_active) {
            this.setState({
                remainingTime: {
                    hours: timeLeft.format("HH"),
                    mins: timeLeft.format("mm"),
                    secs: timeLeft.format("ss")
                }
            });
        }else{
            this.setState({wmTimeSet : false});
            clearInterval(this.checkRemainingTimeInterval);
        }

    }

    render(){
        let {remainingTime, wmTimeSet} = this.state;

        return(
            <div>
                {
                    (this.props.isWmTimerActive && wmTimeSet && this.props.isVisibleSection)?
                        <p className="time-remaining">{(remainingTime.hours != "00")? remainingTime.hours + ":" : null}{remainingTime.mins + ":" + remainingTime.secs}</p>
                        :
                        null
                }
            </div>
        )
    }
}