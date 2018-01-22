var AccessToken = require('twilio').AccessToken;
var IpMessagingGrant = AccessToken.IpMessagingGrant;
var VideoGrant = AccessToken.VideoGrant;
var Config = require("../config/app.config");
var uuid = require("node-uuid");

//https://www.twilio.com/docs/api/rest/access-tokens
var TwilioTokenService = function () {
  return {
    generateAccessToken: function (identity, deviceId) {
      var endpointId = 'ambi-chat:' + identity + ':' + deviceId;

      var ipmGrant = new IpMessagingGrant({
        serviceSid: Config.TWILIO_SERVICE_SID,
        endpointId: endpointId
      });

      var videoGrant = new VideoGrant();

      var token = new AccessToken(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_API_KEY_SID, Config.TWILIO_API_KEY_SECRET, {ttl: Config.TWILIO_TOKEN_TTL});

      token.addGrant(ipmGrant);
      token.addGrant(videoGrant);
      token.identity = identity;

      return token;
    }
  };
};
module.exports = TwilioTokenService;