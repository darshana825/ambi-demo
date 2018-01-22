import Socket from "./Socket";
import Session from "../middleware/Session";
import {Config} from "../config/Config";
import ChatProvider from "./ChatProvider";

let bit6Client = null;

class Bit6ChatProvider extends ChatProvider {
    constructor() {
        super();

        if (!bit6Client) {
            bit6Client = new bit6.Client({'apikey': Config.BIT6_API_KEY});
        }

        this.b6 = bit6Client;
        this.authenticate = this.authenticate.bind(this);
        this.authenticate();
        this.loggedUser = Session.getSession('prg_lg');
        this.socket = Socket.socket;

        this.initializeChatClient = this.initializeChatClient.bind(this);
        this.bit6SignUp = this.bit6SignUp.bind(this);
        this.getBit6Identity = this.getBit6Identity.bind(this);
        this.getConversation = this.getConversation.bind(this);
        this.markConversationAsRead = this.markConversationAsRead.bind(this);
    }

    initializeChatClient(onConversationChange, onMessageChange, onTypingNotification) {
        let _this = this;

        // A conversation has changed
        this.b6.on('conversation', function(c, op) {
            if (onConversationChange) {
                onConversationChange(c, op, bit6Client);
            }
        });

        // A message has changed
        this.b6.on('message', function(m, op) {
            if (onMessageChange) {
                onMessageChange(m, op, bit6Client);
            }
        });

        this.b6.on('notification', function(notification) {
            if (notification.type === "typing") {
                if (onTypingNotification) {
                    onTypingNotification(notification, bit6Client);
                }
            }
        });
    }

    sendTypingNotification(currentChatUri) {
        // Send the typing notification to bit 6.
        bit6Client.sendTypingNotification(currentChatUri);
    }

    getConversation(convId) {
        return bit6Client.getConversation(convId);
    }

    markConversationAsRead(c) {
        return bit6Client.markConversationAsRead(c);
    }

    sendMessage(msgObj) {
        let user = Session.getSession('prg_lg');
        bit6Client.session.displayName = user.first_name + " " + user.last_name;
        bit6Client.compose(msgObj.uri).text(msgObj.message).send(function(err) {
            if (err) {
                // TODO: Use a logging framework like winston.
                console.log('error', err);
            }
            else {
                // TODO: Use a logging framework like winston.
                console.log("msg sent");
            }
        }.bind(this));
    }

    // TODO: Make this function private.
    /**
     * @param oUser - logged user object
     * **/
    getBit6Identity(oUser) {
        return Config.BIT6_IDENTITY_USER_SLUG + oUser.user_name;
    }

    /**
     * get bit6 - private group_id of user
     * @params groups - bit6 groups of the user
     * @params user - authed user
     * **/
    getBit6PrivateGroup(groups, user) {
        for (var key in groups) {
            var group_id = groups[key].meta.group_id;

            if (group_id == Config.BIT6_PRIVATE_GROUP_SLUG + '_' + user.user_name) {
                return groups[key];
            }
        }
        return false;
    }

    /**
     * create private group for user
     * @param groupData - group params object
     * @param callBack - group creation callback
     * **/
    createPrivateGroup(groupData, callBack) {
        this.b6.createGroup(groupData, function (error, group) {
            if (error) {
                console.log('error', error);
                callBack({status: 400, error: error});
            } else {
                console.log('created group >>', group);
                callBack({status: 200, data: group});
            }
        });
    }

    // TODO: Move this code to somewhere other than Middleware. Promisify, or use async.js here.
    /**
     * @param ident - bit6 ident
     * @param pass - bit6 password
     * @param oUser - user object
     * **/
    bit6SignUp(ident, pass, oUser) {
        var _this = this;

        var authedUser = Session.getSession('prg_lg');

        this.b6.session['signup']({'identity': ident, 'password': pass}, function (err) {
            if (err) {
                return false;
            }
            else {
                _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;

                var opts = {
                    meta: {
                        title: 'private_group_' + authedUser.user_name,
                        group_id: Config.BIT6_PRIVATE_GROUP_SLUG + '_' + authedUser.user_name
                    }
                };

                _this.createPrivateGroup(opts, function (groupRes) {
                    console.log(groupRes);
                });

                return true;
            }
        });
    }

    authenticate() {
        var authedUser = Session.getSession('prg_lg');

        if (authedUser) {
            var _this = this;
            var oUser = Session.getSession('prg_lg');

            if (this.b6.session.authenticated) {
                console.log('user already logged in');
                this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
            } else {
                // Convert username to an bit6 identity
                let ident = _this.getBit6Identity(oUser);
                let pass = 'proglobe_' + oUser.id;

                this.b6.session['login']({'identity': ident, 'password': pass}, function (err) {
                    if (err) {
                        console.log('sign-in error : ');
                        console.log(err);
                        _this.bit6SignUp(ident, pass, oUser);
                    } else {
                        _this.b6.session.displayName = oUser.first_name + " " + oUser.last_name;
                        if (!_this.getBit6PrivateGroup(_this.b6.session.client.groups, authedUser)) {
                            var opts = {
                                meta: {
                                    title: 'private_group_' + authedUser.user_name,
                                    group_id: Config.BIT6_PRIVATE_GROUP_SLUG + '_' + authedUser.user_name
                                }
                            };

                            _this.createPrivateGroup(opts, function (groupRes) {
                            });
                        }
                        // Why are we just returning true down here? is there a situation where we should be returning false from this function?
                        return true;
                    }
                });
            }
        }
    }
}

export default new Bit6ChatProvider;