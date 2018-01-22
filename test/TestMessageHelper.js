"use strict";
var messageHelper = require("../public/app/pages/chat/QuickChatBubble/MessageHelper");
var expect = require("chai").expect;

describe("MessageHelper", function() {
    it ("Returns message content and message link when s3 link provided", function () {
        var fileUploadString = "s3URL=/s3/uploads/8b43fe5d-82d6-4434-a807-efccdadf71d7_IMG_0136.JPG,s3FileName=8b43fe5d-82d6-4434-a807-efccdadf71d7_IMG_0136.JPG";
        var result = messageHelper.processMessageString(fileUploadString);
        expect(result.messageContent).to.equal("IMG_0136.JPG");
        expect(result.messageLink).to.equal("/s3/uploads/8b43fe5d-82d6-4434-a807-efccdadf71d7_IMG_0136.JPG");
        expect(true).to.be.true;
    });

    it ("Does not parse out a regular text message", function () {
        var regularMessage = "Hello there how are you?";
        var result = messageHelper.processMessageString(regularMessage);
        expect(result.messageContent).to.equal(regularMessage);
        expect(result.messageLink).to.be.null;
    });
});