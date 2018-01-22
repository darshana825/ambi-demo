"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/* eslint-disable */
var unicodeNumbers = /1-3\u0661-\u0663\u06F1-\u06F3\u07C1-\u07C3\u0967-\u0969\u09E7-\u09E9\u0A67-\u0A69\u0AE7-\u0AE9\u0B67-\u0B69\u0BE7-\u0BE9\u0C67-\u0C69\u0CE7-\u0CE9\u0D67-\u0D69\u0DE7-\u0DE9\u0E51-\u0E53\u0ED1-\u0ED3\u0F21-\u0F23\u1041-\u1043\u1091-\u1093\u17E1-\u17E3\u1811-\u1813\u1947-\u1949\u19D1-\u19D3\u1A81-\u1A83\u1A91-\u1A93\u1B51-\u1B53\u1BB1-\u1BB3\u1C41-\u1C43\u1C51-\u1C53\uA621-\uA623\uA8D1-\uA8D3\uA901-\uA903\uA9D1-\uA9D3\uA9F1-\uA9F3\uAA51-\uAA53\uABF1-\uABF3\uFF11-\uFF13/.source;
var regexes = {};

regexes.hashSigns = /[!]/;
regexes.hashtagNumeric = new RegExp("[" + unicodeNumbers + "]");
regexes.endHashtagMatch = regexSupplant(/^(?:!{hashSigns}|:\/\/)/);
regexes.hashtagBoundary = new RegExp("(?:^|$|[^&" + unicodeNumbers + "])");
regexes.validHashtag = regexSupplant(/(!{hashtagBoundary})(!{hashSigns})(!{hashtagNumeric})/g);

// A function that composes regexes together
function regexSupplant(regex, flags) {
    flags = flags || '';
    if (typeof regex !== 'string') {
        if (regex.global && flags.indexOf("g") < 0) {
            flags += "g";
        }
        if (regex.ignoreCase && flags.indexOf("i") < 0) {
            flags += "i";
        }
        if (regex.multiline && flags.indexOf("m") < 0) {
            flags += "m";
        }

        regex = regex.source;
    }

    return new RegExp(regex.replace(/!\{(\w+)\}/g, function (match, name) {
        var newRegex = regexes[name] || '';
        if (typeof newRegex !== 'string') {
            newRegex = newRegex.source;
        }

        return newRegex;
    }), flags);
}

exports.default = regexes;