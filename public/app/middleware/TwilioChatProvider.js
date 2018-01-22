import Promise from "bluebird";
import TwilioChat from "twilio-chat";
import uuid from "node-uuid";
import ChatProvider from "./ChatProvider";
import Session from "./Session";
import TwilioCommon from "twilio-common";
import axios from "axios";
import Fingerprint2 from "fingerprintjs2";

class TwilioChatProvider extends ChatProvider {
    constructor() {
        super();
        this.chatClient = null;
        this.initializeChatClient = this.initializeChatClient.bind(this);
        this.createChannel = this.createChannel.bind(this);
        this.getConversations = this.getConversations.bind(this);
        this.getMessagesFromConversation = this.getMessagesFromConversation.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getDeviceFingerPrint = this.getDeviceFingerPrint.bind(this);
        this.generateChatAccessToken = this.generateChatAccessToken.bind(this);
        this.sendTypingNotification = this.sendTypingNotification.bind(this);
    }

    sendTypingNotification(conversation) {
        conversation.channel.typing();
    }

    joinChannelOrGroup(channel) {
        return channel.join();
    }

    // TODO: Add proper error checking for when we are not able to create a channel
    createChannel(friendlyName) {
        return new Promise ((resolve, reject) => {
            if (!this.chatClient) {
                const rejectedReason = new Error("Error TwilioChatProvider.createChannel(): chat client not iniailized.");
                reject(rejectedReason);
            }

            this.chatClient.createChannel({
                uniqueName: uuid.v1(),
                friendlyName: friendlyName
            })
            .then((createdChannel) => {
                resolve(createdChannel);
            });
        })
    }

    // TODO: Add proper error checking for when we are not able to get the subscribed channels.
    getConversations() {
        return new Promise ((resolve, reject) => {
            if (!this.chatClient) {
                const rejectedReason = new Error("Error TwilioChatProvider.getConversations(): chat client not iniailized.");
                reject(rejectedReason);
            }

            this.chatClient.getSubscribedChannels()
                .then((subscribedChannels) => {
                    resolve(subscribedChannels);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getMessagesFromConversation(channel) {
        return new Promise ((resolve, reject) => {
            if (!this.chatClient) {
                const rejectedReason = new Error("Error TwilioChatProvider.getConversations(): chat client not iniailized.");
                reject(rejectedReason);
            }

            channel.getMessages()
                .then((messages) => {
                    resolve(messages);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    initializeChatClient() {
        let hasChatClient =  this.chatClient;
        return new Promise((resolve, reject) => {
            let chatToken = Session.getSession("twilio-access-token");
            if(!hasChatClient && chatToken !== null) {
                // Initialize the AccessManager and respond to events for changes in tokens.
                let accessManager = new TwilioCommon.AccessManager(chatToken.token);
                let twilioChatClient = new TwilioChat(chatToken.token);
                
                // Set new token when it is updated.
                accessManager.on('tokenUpdated', (am) => {
                    twilioChatClient.updateToken(am.token);
                });

                // renew access token upon expiration.
                accessManager.on('tokenExpired', () => {
                    // generate new token here and set it to the accessManager
                    console.log("Twilio chat Access token expired. updating token.");
                    this.generateChatAccessToken()
                        .then((updatedToken) => {
                            Session.createSession("twilio-access-token", updatedToken);
                            accessManager.updateToken(updatedToken);
                        });
                });

                twilioChatClient.initialize()
                    .then((chatClientResult) => {
                        this.chatClient = chatClientResult;
                        
                        // Listen for channel invites, and accept them
                        this.chatClient.on('channelInvited', function(channel) {
                            // Join the channel that you were invited to
                            channel.join();
                        });

                        resolve(chatClientResult);
                    });
            }
        });
    }

    getDeviceFingerPrint() {
        const fingerPrint = true;
        return new Promise((resolve, reject) => {
            if(fingerPrint) {
                new Fingerprint2().get((result) => {
                    resolve(result);
                });
            } else {
                const rejectedReason = new Error('SignupHeader: unable to get device fingerprint');
                reject(rejectedReason);
            }
        });
    }

    // This is only used from when a chat token expires.
    generateChatAccessToken() {
        let user = Session.getSession("prg_lg");
        
        // Generate device finger print, then make request to get the access token for chat.
        return this.getDeviceFingerPrint()
            .then((fingerPrint) => {
                let tokenRequestBody = {
                    deviceId: fingerPrint,
                    identity: user.id
                };

                // Send post request to axios here.
                return axios.post("/twilio/token/generate", tokenRequestBody, { headers: {'prg-auth-header': user.token}});
            });
    }

    sendMessage(msgObj, channel) {
        let twilioChannel = channel.channel;
        return new Promise((resolve, reject) => {
            twilioChannel.sendMessage(msgObj.message)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}

export default new TwilioChatProvider;
