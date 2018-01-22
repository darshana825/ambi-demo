/**
 * All Unit functional test will implement in side this controller
 */

var TestController ={

    uploadTest:function(req,res){

        var fs = require('fs');

        var attachment = "/web/ProGlob/Docs/ProGlobe-Main/2015-12-30/images/pg-professional-networks_08.png";

        fs.readFile(attachment, function(err, data) {


            var base64data = new Buffer(data, 'binary').toString('base64'),
                prefix = "data:image/png;base64,";

            var data ={
                content_title:"Test Album",
                file_name:prefix+base64data,
                file_type:"image/png",
                is_default:0,
                entity_id:"56b98fe8a546494c18b576d3",
                entity_tag:UploadMeta.COVER_IMAGE

            }

            ContentUploader.uploadFile(data,function(dataSet){
                res.status(200).json(dataSet);
                return 0;
            })
        });


    },
    getImageTest:function(req,res){
        var Upload = require('mongoose').model('Upload');
        var _usrId = req.params['id'];
        Upload.getProfileImage(_usrId,function(dataSet){
            res.status(200).json(dataSet);
            return 0;
        });
    },
    sendMailTest:function(req,res){
        res.render('email-templates/signup', {
            name: "tests@eigth25media.com",
        }, function(err, emailHTML) {

            var sendOptions = {
                to: "tests@eigth25media.com",
                subject: 'Proglobe Signup',
                html: emailHTML
            };
            EmailEngine.sendMail(sendOptions, function(err){
                if(!err){
                    res.status(200).json("EMAIL SENT");
                    return 0
                } else{
                    console.log("EMAIL Sending Error");
                    res.status(200).json(err);
                    return 0
                }
            });

        });
    },
    getProfile:function(req,res){
        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User'),
            Upload = require('mongoose').model('Upload') ;

        if(typeof req.params['id'] == 'undefined'){
            var outPut ={};
            outPut['status']    = ApiHelper.getMessage(400, Alert.CANNOT_FIND_PROFILE, Alert.ERROR);
            res.status(400).send(outPut);
            return 0;
        }


        var _id =req.params['id'];
        _async.waterfall([
            function getUserById(callBack){
                var _search_param = {
                    _id:Util.toObjectId(_id),

                },
                showOptions ={
                    w_exp:false,
                    edu:false
                };

                User.getUser(_search_param,showOptions,function(resultSet){
                    if(resultSet.status ==200 ){
                        callBack(null,resultSet.user)
                    }
                })
            },
            function getConnectionCount(profileData,callBack){

                if( profileData!= null){
                    Connection.getConnectionCount(profileData.user_id,function(connectionCount){
                        profileData['connection_count'] = connectionCount;
                        callBack(null,profileData);
                        return 0
                    });
                }else{
                    callBack(null,null)
                }



            },
            function getProfileImage(profileData,callBack){

                if(profileData != null){
                    Upload.getProfileImage(profileData.user_id.toString(),function(profileImageData){
                        profileData['images'] = profileImageData.image;
                        callBack(null,profileData)
                        return 0;
                    });
                }else{
                    callBack(null,null)
                }


            }



        ],function(err,profileData){
            var outPut ={};
            if(!err){

                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                outPut['profile_data']      = profileData;
                res.status(200).send(outPut);
                return 0
            }else{
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(200).send(outPut);
                return 0;
            }
        })


    },
    retrieveEducationDetail:function(req,res){
        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var criteria = {user_name:req.params['uname']};

        var _education_id = "56c321a42ab09c7b09034e85";

        User.retrieveEducationDetail(criteria,function(resultSet){

            res.status(200).send(resultSet);


        });
    },
    retrieveWorkExperience:function(req,res){
        var User = require('mongoose').model('User');

        //var _userId = CurrentSession.id;

        var criteria = {user_name:req.params['uname']},
            showOptions ={
                w_exp:true,
                edu:false
            };

        var _education_id = "56c321a42ab09c7b09034e85";

        User.getUser(criteria,showOptions,function(resultSet){
            res.status(200).send(resultSet);
        })
    },

    esCreateIndex:function(req,res){

        var _async = require('async'),
            Connection = require('mongoose').model('Connection'),
            User = require('mongoose').model('User');

        User.addUserToCache(req.params['id'],function(resultSet){
            res.status(200).send(resultSet);
        })

    },
    esSearch:function(req,res){
        var query={
            q:req.query.q,
            index:'idx_usr'

        };

        ES.search(query,function(resultSet){
            res.status(200).send(resultSet);
            return 0;
        });
    },



    /**
     * Save notification & add recipients for that notifications
     * @param req
     * @param res
     */
    saveNotification:function(req,res){

        var notification = JSON.parse(req.body.notification);
        var notification_recipients = JSON.parse(req.body.recipients);

        var outPut = {};

        if(notification_recipients.length < 1){
            outPut['status'] = ApiHelper.getMessage(400, Alert.NO_RECIPIENTS, Alert.ERROR);
            res.status(400).send(outPut);
        }

        var _async = require('async'),
            Notification = require('mongoose').model('Notification'),
            NotificationRecipient = require('mongoose').model('NotificationRecipient');


        _async.waterfall([
            function saveNotification(callback){

                Notification.saveNotification(notification, function(resultSet){
                    if(resultSet.status == 200){
                        callback(null,resultSet.result._id);
                    }else{
                        outPut['status'] = ApiHelper.getMessage(400, Alert.DATA_INSERT_ERROR, Alert.ERROR);
                        res.status(400).send(outPut);
                    }
                });
            },
            function saveRecipients(notification_id, callback){
                var data = {
                    notification_id:notification_id,
                    recipients:notification_recipients
                };
                NotificationRecipient.saveRecipients(data, function(resultSet){
                    if(resultSet.status == 200){
                        callback(null)
                    }else{
                        outPut['status'] = ApiHelper.getMessage(400, Alert.DATA_INSERT_ERROR, Alert.ERROR);
                        res.status(400).send(outPut);
                    }
                });
            }

        ], function(err){
            var outPut ={};
            if(!err){
                outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
                res.status(200).send(outPut);
            }else{
                outPut['status']    = ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR);
                res.status(200).send(outPut);
            }

        })

    },

    /**
     * Get notifications of a user
     * @param req
     * @param res
     */
    getNotifications:function(req,res){

        //var criteria = JSON.parse(req.body.criteria);

        var criteria = {
            recipient:"56c2d6038c920a41750ac4db".toObjectId()
        };

        var NotificationRecipient = require('mongoose').model('NotificationRecipient');

        NotificationRecipient.getRecipientNotifications(criteria, function(resultSet){
            res.status(resultSet.status).json(resultSet);
        });

    },

    /**
     * update read_status
     * @param req
     * @param res
     */
    updateNotification:function(req,res){

        // Update a notification's read status
        // Mark all as read

        var criteria = JSON.parse(req.body.criteria);

        //var criteria = {
        //    _id:"56d807f84dad67e51a56af5b".toObjectId() // update specific notification of a user
        //};

        //var criteria = {
        //    recipient:"56c3fba9d8fb77690c16b27e".toObjectId() // update all notifications of a user
        //};

        var data = {
            read_status:true
        };

        var NotificationRecipient = require('mongoose').model('NotificationRecipient');

        NotificationRecipient.updateRecipientNotification(criteria, data, function(resultSet){
            if(resultSet.status == 200){
                res.status(200).send(ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS));
            }else{
                res.status(400).send(ApiHelper.getMessage(400, Alert.ERROR, Alert.ERROR));
            }
        });

    }

}



module.exports = TestController;