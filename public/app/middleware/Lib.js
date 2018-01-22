/**
 * Library class
 */

export default class Lib{
    /**
     * Remove HTML elements form the string
     * @param txt
     * @returns {*}
     */
    static sanitize(txt){
        const validHTMLTags  =/^(?:a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdi|bdo|bgsound|big|blink|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|isindex|kbd|keygen|label|legend|li|link|listing|main|map|mark|marquee|menu|menuitem|meta|meter|nav|nobr|noframes|noscript|object|ol|optgroup|option|output|p|param|plaintext|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|spacer|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr|xmp)$/i;
        var normaliseQuotes = /=(["'])(?=[^\1]*[<>])[^\1]*\1/g,
            normaliseFn = function ($0, q, sym) {
                return $0.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            },
            replaceInvalid = function ($0, tag, off, txt) {
                var invalidTag =  document.createElement(tag) instanceof HTMLUnknownElement
                        || !validHTMLTags.test(tag),

                    isComplete = txt.slice(off+1).search(/^[^<]+>/) > -1;

                return invalidTag || !isComplete ? '&lt;' + tag : $0;
            };

        txt = txt.replace(normaliseQuotes, normaliseFn)
            .replace(/<(\w+)/g, replaceInvalid);

        var tmp = document.createElement("DIV");
        tmp.innerHTML = txt;

        return "textContent" in tmp ? tmp.textContent : tmp.innerHTML;

    }

    /**
     * Get Random Int
     * @param min
     * @param max
     * @returns {*}
     */
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static toDateString(d){
        var date = new Date(d);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            dateString =  months[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear();
        return dateString;
    }

    static toTimeString(d){
        var date = new Date(d);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    static getRelativeTime(time){
        let now = Date.now();
        // 24 hours in milliseconds
        let t24h = 24 * 60 * 60 * 1000;
        let s = (now - time > t24h) ? Lib.toDateString(time) : Lib.toTimeString(time);
        return s;
    }

    static timeAgo(date) {

        var date = new Date(date);

        var seconds = Math.floor((new Date() - date) / 1000);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (seconds < 5){
            return "just now";
        }else if (seconds < 60){
            return seconds + " seconds ago";
        }
        else if (seconds < 3600) {
            var minutes = Math.floor(seconds/60)
            if(minutes > 1)
                return minutes + " minutes ago";
            else
                return "1 minute ago";
        }
        else if (seconds < 86400) {
            var hours = Math.floor(seconds/3600)
            if(hours > 1)
                return hours + " hours ago";
            else
                return "1 hour ago";
        }
        //2 days and no more
        else if (seconds < 172800) {
            var days = Math.floor(seconds/86400)
            if(days > 1)
                return days + " days ago";
            else
                return "1 day ago";
        }
        else{

            //return new Date(time).toLocaleDateString();
            return date.getDate().toString() + " " + months[date.getMonth()] + ", " + date.getFullYear();
        }
    }

    static escapeRegexCharacters(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}