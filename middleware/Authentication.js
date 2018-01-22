/**
 * Authenticate class will handle to make user log in and maintain session
 */


exports.Authentication= function(req,res,next){
	/**
	 * Pass public URLs from the route
	 */
	for (var i = 0; i < publicURLs.length; i++) {
        if (req.originalUrl.indexOf(publicURLs[i]) >= 0) {
            next()
            return;
        }
    }

	var origURL =  String(req.originalUrl).split('?')[0];

    if(notAuthURLs.indexOf(origURL) >= 0){
        if(typeof  req.session.user != 'undefined'  ){
            res.redirect('/');
            return;
        } else{
            res.render('index');
            return;
        }
    }

    if (AccessAllow.indexOf(origURL) >= 0) {
        res.render('index');
        return;
    }

    /**
     * This is where API requests get authenticated
     */
    if (mobileApiUrls.indexOf(origURL) >= 0) {
        console.log("came to mobile api authenticationsss ----");

        var token = req.headers['prg-auth-header'];
        var jwt    = require('jsonwebtoken');
        var outPut ={},
            _payload = {};

        jwt.verify(token, Config.SECRET, function(err, decoded) {
            _payload = decoded;
            //console.log(_payload);

            if (typeof _payload == 'undefined' || typeof _payload.user_id == 'undefined') {
                outPut['status'] = ApiHelper.getMessage(401, Alert.INVALID_TOKEN, Alert.ERROR);
                res.status(401).json(outPut);
                return;

            } else if (typeof _payload.pat == 'undefined' || !_payload.pat ||
                typeof _payload.v_token == "" || !_payload.v_token ||
                typeof _payload.v_tag == 'undefined' || !_payload.v_tag) {
                outPut['status'] = ApiHelper.getMessage(400, Alert.INVALID_TOKEN, Alert.ERROR);
                res.status(400).json(outPut);
                return;

            } else {

                var _async = require('async'),
                    User = require('mongoose').model('User'),
                    bCrypt	  = require('bcrypt-nodejs');

                _async.waterfall([

                    function getUserById(callBack){
                        var _search_param = {
                                _id:_payload.user_id.toObjectId()
                            }
                        User.getUserAllDetails(_search_param,function(resultSet){
                            if(resultSet.status ==200 ){
                                Util.addToSession(req,resultSet.user);
                                callBack(null,resultSet.user);
                            }
                        })
                    },
                    function bcryptCompare(userData,callBack) {

                        var code = Config.API_KEY + _payload.pat;
                        //var vCode = Util.createHash(userData.salt, code);
                        //var vName = Util.createHash(userData.salt, userData.user_name);

                        bCrypt.compare(code, _payload.v_token, function(err, matches) {
                            if (matches) {
                                console.log('verification token success');
                            } else {
                                outPut['status'] = ApiHelper.getMessage(400, Alert.INVALID_TOKEN, Alert.ERROR);
                                res.status(400).json(outPut);
                                return;
                            }
                        });

                        bCrypt.compare(userData.user_name, _payload.v_tag, function(err, matches) {
                            if (matches) {
                                console.log('verification tag success');
                                //callback(null);
                            } else {
                                outPut['status'] = ApiHelper.getMessage(400, Alert.INVALID_TOKEN, Alert.ERROR);
                                res.status(400).json(outPut);
                                return;
                            }
                        });
                        callBack(null);
                    }

                    ], function(err){
                        var outPut ={};
                        if(err){
                            console.log("it is an error");
                            outPut['status'] = ApiHelper.getMessage(400, Alert.INVALID_TOKEN, Alert.ERROR);
                            res.status(400).json(outPut);
                            return;
                        } else {
                            next();
                        }
                })
                //next();
                return;
            }
        });
        return;

    }

    if(typeof req.session.user != 'undefined'  ){
        if(String(req.originalUrl).indexOf('logout') != -1){

            req.session.destroy(function(err){
                _out_put={
                    status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
                }
                res.status(200).json(_out_put);
            });
            return ;

        } else if(String(req.originalUrl).indexOf('/verify/me') != -1) {
            _out_put={
                status:ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS),
            }
            res.status(200).json(_out_put);
            return ;
        }
        next();
        return;
    } else {
        var _out_put= {
            status:'success',
            message:Alert.INVALID_TOKEN
        }
        res.status(401).json(_out_put);
        return;
    }

 }



