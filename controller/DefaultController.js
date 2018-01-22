
'use strict'

var DefaultController ={

	index:function(req,res){
		res.render('index');
	},
	dummy:function(req,res){
		var outPut ={};
		outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
		res.status(200).send(outPut);
		return 0;
	}
}


module.exports = DefaultController;