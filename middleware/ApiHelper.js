/**
 * This is for API Helper
 */
'use strict'
var ApiHelper = {
    _100 : 'Continue',
    _101 : 'Switching Protocols',
    _200 : 'OK',
    _201 : 'Created',
    _202 : 'Accepted',
    _203 : 'Non-Authoritative Information',
    _204 : 'No Content',
    _205 : 'Reset Content',
    _206 : 'Partial Content',
    _300 : 'Multiple Choices',
    _301 : 'Moved Permanently',
    _302 : 'Found',
    _303 : 'See Other',
    _304 : 'Not Modified',
    _305 : 'Use Proxy',
    _306 : '(Unused)',
    _307 : 'Temporary Redirect',
    _400 : 'Bad Request',
    _401 : 'Unauthorized',
    _402 : 'Payment Required',
    _403 : 'Forbidden',
    _404 : 'Not Found',
    _405 : 'Method Not Allowed',
    _406 : 'Not Acceptable',
    _407 : 'Proxy Authentication Required',
    _408 : 'Request Timeout',
    _409 : 'Conflict',
    _410 : 'Gone',
    _411 : 'Length Required',
    _412 : 'Precondition Failed',
    _413 : 'Request Entity Too Large',
    _414 : 'Request-URI Too Long',
    _415 : 'Unsupported Media Type',
    _416 : 'Requested Range Not Satisfiable',
    _417 : 'Expectation Failed',
    _500 : 'Internal Server Error',
    _501 : 'Not Implemented',
    _502 : 'Bad Gateway',
    _503 : 'Service Unavailable',
    _504 : 'Gateway Timeout',
    _505 : 'HTTP Version Not Supported',
    _602 : 'Required Fields Empty',

    getMessage:function(statusCode,message,type){
        var _type = (typeof type != 'undefined')?type:Alert.SUCCESS;
        var _message = (typeof message != 'undefined')?message:Alert.DATAFOUND;
        var outPut = {};
        if(_message != null || _message != ""){
            outPut={
                "message":_message,
                "code":statusCode,
                "type":_type,
                "http_health":ApiHelper["_"+statusCode],
                "s_time_stamp:":DateTime.getServerTimeStamp()

            }
        }else{
            outPut={
                "message":ApiHelper["_"+statusCode],
                "code":statusCode,
                "type":_type,
                "http_health":ApiHelper["_"+statusCode],
                "s_time_stamp:":DateTime.getServerTimeStamp()

            }
        }
        return outPut;
    }


}

module.exports = ApiHelper;