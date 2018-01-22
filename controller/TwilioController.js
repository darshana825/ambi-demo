var TwilioTokenService = require("./TwilioTokenService");
var uuid = require("node-uuid");

var TwilioController =  {
    generateAccessToken: function (req, res) {
        var tokenService = TwilioTokenService();

        // Check to see if identity or deviceId are passed in through the route.
        var identity = uuid.v1();
        var deviceId = uuid.v1();

        if (req) {
            if (req.body) {
                if (req.body.identity) {
                    identity = req.body.identity;
                }
                if (req.body.deviceId) {
                    deviceId = req.body.deviceId;
                }
            }
        }


        var token = tokenService.generateAccessToken(identity, deviceId);

        res.send({
            identity: identity,
            token: token.toJwt()
        });
    }
};

module.exports = TwilioController;