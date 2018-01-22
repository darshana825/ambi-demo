const data = {
    envs: {live: 'LIVE', dev: 'DEV', local: 'LOCAL'},
    live: {
        "PROGLOBE_APP": "//proglobe.us/",
        "PROGLOBE_NOTIFICATION_APP": "//notification.proglobe.us/",
        "BIT6_API_KEY": "22n7t-0zXi33P9Yap6",
        "BIT6_IDENTITY_USER_SLUG": "usr:proglobe",
        "BIT6_GROUP_SLUG": "group:proglobe",
        "BIT6_PRIVATE_GROUP_SLUG": "group:proglobe_private",
        "TWILIO_LOG_LEVEL": "OFF"
    },
    dev: {
        "PROGLOBE_APP": "//dev.proglobe.us/",
        "PROGLOBE_NOTIFICATION_APP": "//dev-notification.proglobe.us/",
        "BIT6_API_KEY": "22n7t-0zXi33P9Yap6",
        "BIT6_IDENTITY_USER_SLUG": "usr:proglobe",
        "BIT6_GROUP_SLUG": "group:proglobe",
        "BIT6_PRIVATE_GROUP_SLUG": "group:proglobe_private",
        "TWILIO_LOG_LEVEL": "OFF"
    },
    local: {
        "PROGLOBE_APP": "//dev.proglobe.us/",
        "PROGLOBE_NOTIFICATION_APP": "//proglobe_notify.local/",
        "BIT6_API_KEY": "22n7t-0zXi33P9Yap6",
        "BIT6_IDENTITY_USER_SLUG": "usr:proglobe",
        "BIT6_GROUP_SLUG": "group:proglobe",
        "BIT6_PRIVATE_GROUP_SLUG": "group:proglobe_private",
        "TWILIO_LOG_LEVEL": "OFF"
    }
};

const env = data.envs.local;

/* Developed it this way to avoid code changes occurrences, sources already using  'const Configs',
 Otherwise we can export a func that will eval  'const env' */

var Config = {};

switch (env) {
    case 'LIVE':
        Config = data.live;
        break;
    case 'DEV':
        Config = data.dev;
        break;
    case 'LOCAL':
        Config = data.local;
        break;
    default:
        Config = data.dev.dev;
        break;
}

export {Config};





