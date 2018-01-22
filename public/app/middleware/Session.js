/**
 * This class Will Handle browser sessions
 */

class Session {
    constructor() {
        this.expires = null;
        this.exdays = 30;
    }

    getExpireDate() {
        var d = new Date();
        d.setTime(d.getTime() + (this.exdays * 24 * 60 * 60 * 1000));
        this.expires = "expires=" + d.toUTCString();
        return this.expires;
    }

    isSessionSet(key) {
        if (this.getSession(key) != null) {
            return true
        } else {
            return false
        }
    }

    updateSession(cookie, key, value) {
        var oSession = this.getSession(cookie);
        oSession[key] = value;
        this.createSession(cookie, oSession);
    }

    createSession(key, value) {
        value = JSON.stringify(value);
        var expires;

        if (this.exdays) {
            var date = new Date();
            date.setTime(date.getTime() + (this.exdays * 24 * 60 * 60 * 1000));
            this.expires = "; expires=" + date.toGMTString();
        } else {
            this.expires = "";
        }
        document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + this.expires + "; path=/";
    }

    getSession(key) {
        var nameEQ = encodeURIComponent(key) + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
        }
        return null;
    }

    destroy(key) {
        console.log("destroy");

        this.exdays = -1;
        this.createSession(key, "");
    }

}

export default new Session;