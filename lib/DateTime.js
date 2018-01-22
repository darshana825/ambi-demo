
/**
 * This is date time related lib class that can use any where in the application
 */
'use strict'

var DateTime ={
    getServerTimeStamp :function(){
        return Math.floor(new Date() / 1000);
    },
    timeAgo: function(date) {

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
    },
    timeAgoShortForm: function(date) {

        var seconds = Math.floor((new Date() - date) / 1000);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (seconds < 5){
            return "just now";
        }else if (seconds < 60){
            return seconds + " secs ago";
        }
        else if (seconds < 3600) {
            var minutes = Math.floor(seconds/60)
            if(minutes > 1)
                return minutes + " mins ago";
            else
                return "1 min ago";
        }
        else if (seconds < 86400) {
            var hours = Math.floor(seconds/3600)
            if(hours > 1)
                return hours + " hrs ago";
            else
                return "1 hr ago";
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
    },
    /**
     * Explain Date
     * @param date
     * @returns {{time_a_go: *, date_string: string}}
     */
   explainDate:function(date){
        var date = new Date(date);
        var seconds = Math.floor((new Date() - date) / 1000),
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            long_date_str =  date.getDate().toString() + " " + months[date.getMonth()] + ", " + date.getFullYear(),
            short_date_str = date.getDate().toString() + "/" + date.getMonth() + "/" + date.getFullYear(),
            time_stamp = new Date(date).getTime();


        return {
            time_a_go:this.timeAgo(date),
            long_date_string:long_date_str,
            short_date_string:short_date_str,
            time_stamp:time_stamp
        }
    },

    /**
     * Explain Date Short Form
     * @param date
     * @returns {{time_a_go: *, date_string: string}}
     */
   explainDateShortForm:function(date){
        var date = new Date(date);
        var seconds = Math.floor((new Date() - date) / 1000),
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            long_date_str =  date.getDate().toString() + " " + months[date.getMonth()] + ", " + date.getFullYear(),
            short_date_str = date.getDate().toString() + "/" + date.getMonth() + "/" + date.getFullYear(),
            time_stamp = new Date(date).getTime();


        return {
            time_a_go:this.timeAgoShortForm(date),
            long_date_string:long_date_str,
            short_date_string:short_date_str,
            time_stamp:time_stamp
        }
    },


    formatAMPM:function(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    },


    noteCreatedDate:function(date){
        var date = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            dateString =  months[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear(),
            timeString = this.formatAMPM(date);

        return {
            createdDate:dateString,
            createdTime:timeString
        }
    },

    documentCreatedDate:function(date){
        var date = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            dateString =  months[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear(),
            timeString = this.formatAMPM(date);

        return {
            createdDate:dateString,
            createdTime:timeString
        }
    },


    newsPublishedDate:function(date){
        var dateTimeString = "";

        if(typeof date != 'undefined' && date != ""){
            var date = new Date(date);
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                dateString =  months[date.getMonth()] + " " + date.getDate().toString(),
                timeString = this.formatAMPM(date);
            dateTimeString = dateString+" at "+timeString;
        }

        return dateTimeString;
    },


    oneWeekDate:function(){

        var today = new Date();
        var y = today.getFullYear();
        var m = today.getMonth()+1;
        var d = today.getDate();

        var returnToday = new Date(y+"-"+m+"-"+d);
        var returnWeekAgo = new Date(y+"-"+m+"-"+d);
        returnWeekAgo.setDate(returnToday.getDate() - 7);
        return {today:today, weekAgo:returnWeekAgo};

    }



};

module.exports = DateTime;
