var EmailEngine ={

    _mandrilApi:null,
    //_nodemailer:null,
    init:function(){
        //var nodemailer = require('nodemailer');
        //this._nodemailer = nodemailer.createTransport(Config.MAILER.OPTIONS);
        var mandrill = require('mandrill-api/mandrill');
        this._mandrilApi = new mandrill.Mandrill(Config.MAILER.OPTIONS.AUTH.PASS);
    },



    sendMail:function(sendOptions, callback){

        //var mailOptions = {
        //    to: sendOptions.to,
        //    from: Config.MAILER.FROM,
        //    subject: sendOptions.subject,
        //    html: sendOptions.html
        //};

        //var mandrill_client = new mandrill.Mandrill(config.mailer.options.auth.pass);

        var message = {
            "html": sendOptions.html,
            "subject": sendOptions.subject,
            "from_email": Config.MAILER.FROM,
            "from_name": "Proglobe",
            "to": [{
                "email": sendOptions.to,
                "type": "to"
            }]
        };

        this._mandrilApi.messages.send({"message": message}, function(result) {
            console.log(result);
            callback();

        }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            callback(e)
        });






        //this._nodemailer.sendMail(mailOptions, callback);

    }

};

module.exports = EmailEngine;
