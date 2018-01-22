/*
    Module to help show download links for file uploads in Quick Chat.
*/

// TODO: for Andre: Add some comments on how this module works and why we need it.
var messageHelper =  {
    processMessageString: function(messageString) {
        var s3URL, s3FileName, shortName;
        var fileInfo = messageString.split(",");
        if (fileInfo.length == 2) {
            if (fileInfo[0].indexOf("s3URL=") === 0) {
                s3URL = fileInfo[0].replace("s3URL=", "");
            }
            if (fileInfo[1].indexOf("s3FileName=") === 0) {
                s3FileName = fileInfo[1].replace("s3FileName=", "");
                if (s3FileName.length > 37) { // strip out the GUID that prefixes the file name. There may be a better way to do this ...
                    shortName = s3FileName.substring(37);
                }
            }
        }

        var result = {
            messageContent: shortName ? shortName: messageString,
            messageLink: s3URL ? s3URL : null
        };
        return result;
    }
}

module.exports = messageHelper;