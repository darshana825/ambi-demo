var WorkMode = require('mongoose').model('WorkMode');
var _async = require('async');


var WorkModeController ={
    set: {

        /**
         * This will set work mode
         * @param req
         * @param res
         */
        workMode : function(req,res) {

            var CurrentSession = Util.getCurrentSession(req);

            var work_mode_data = req.body.work_mode_data != undefined ? req.body.work_mode_data : null;

            var outPut = {};

            _async.waterfall([
                function getWorkMode(callBack) {
                    var _criteria = {
                        user_id : CurrentSession.id,
                    }

                    WorkMode.getWorkModeByCategory(_criteria,function(resultSet){
                        //console.log("work mode found>", resultSet.work_mode);
                        callBack(null, resultSet.work_mode);
                    });
                },
                function addWorkMode(_work_mode, callBack) {
                    if(_work_mode != undefined && _work_mode.length > 0) {

                        var criteria = {
                            _id:_work_mode[0]._id,
                            user_id:CurrentSession.id,
                        };

                        var updateData = {
                            is_work_mode_active : work_mode_data.is_work_mode_active,
                            news_feed : work_mode_data.news_feed,
                            calls : work_mode_data.calls,
                            messages : work_mode_data.messages,
                            social_notifications : work_mode_data.social_notifications,
                            all_notifications : work_mode_data.all_notifications,
                            selected_option :work_mode_data.selected_option,
                            start_time : work_mode_data.start_time,
                            end_time : work_mode_data.end_time
                        };
                        WorkMode.updateWorkMode(criteria, updateData, function(resultSet){
                                callBack(null)
                        });

                    } else {
                        var addData = {
                            user_id:CurrentSession.id,
                            is_work_mode_active : work_mode_data.is_work_mode_active,
                            news_feed : work_mode_data.news_feed,
                            calls : work_mode_data.calls,
                            messages : work_mode_data.messages,
                            social_notifications : work_mode_data.social_notifications,
                            all_notifications : work_mode_data.all_notifications,
                            selected_option :work_mode_data.selected_option,
                            start_time : work_mode_data.start_time,
                            end_time : work_mode_data.end_time
                        };
                        WorkMode.addWorkMode(addData,function(resultSet){
                            callBack(null)
                        });
                    }

                }
            ], function(error) {
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
                return 0;
            });
        }

    },

    get: {

        userActiveWorkMode : function(req,res) {

            var CurrentSession = Util.getCurrentSession(req),
                _userId = CurrentSession.id;

            if(req.query['_user_id'] != undefined && req.query['_user_id']) {
                _userId = req.query['_user_id'];
            }

            var _criteria = {
                user_id : Util.toObjectId(_userId)
            }
            WorkMode.getWorkModeByCategory(_criteria,function(resultSet){
                var outPut ={};
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['work_mode']  = resultSet.work_mode[0];
                res.status(200).send(outPut);
            });
        }

    },

    update: {

        workMode : function(req,res) {

            var criteria = {
                _id:req.body.work_mode_id,
                user_id:req.body.user_id,
            };

            var updateData = req.body.data;

            WorkMode.updateWorkMode(criteria,updateData,function(resultSet){
                if(resultSet.status == 200){
                    res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
                }else{
                    res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
                }
            });
        }

    }
};

module.exports = WorkModeController;