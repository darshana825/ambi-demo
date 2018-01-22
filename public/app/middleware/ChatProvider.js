// ChatProvider. Please extend this class and implement functions there.
// See Bit6ChatProvider for an example.
class ChatProvider {

    constructor() {
        this.initializeChatClient = this.initializeChatClient.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.fetchMessages = this.fetchMessages.bind(this);
        this.sendTypingNotification = this.sendTypingNotification.bind(this);
        this.onConversationChanged = this.onConversationChanged.bind(this);
        this.onMessageChanged = this.onMessageChanged.bind(this);
        this.joinChannelOrGroup = this.joinChannelOrGroup.bind(this);
        this.leaveChannelOrGroup = this.leaveChannelOrGroup.bind(this);
        this.onChannelOrGroupChanged = this.onChannelOrGroupChanged.bind(this);
        this.inviteToChannelOrGroup = this.inviteToChannelOrGroup.bind(this);
        this.onTypingStartedNotification = this.onTypingStartedNotification.bind(this);
        this.onTypingStoppedNotification = this.onTypingStoppedNotification.bind(this);
    }

    initializeChatClient(onConversationChangedCallback, onMessageChangeCallback, onTypingNotificationCallback) {
        console.log("ChatProvider.initializeChatClient() not implemented");
    }

    authenticate() {
        console.log("ChatProvider authenticate() not yet implemented");
    }

    fetchMessages() {
        console.log("ChatProvider fetchMessages() not yet implemented");
    }

    sendTypingNotification(currentChatUri) {
        console.log("ChatProvider sendTypingNotification() not implemented");
    }

    onTypingStartedNotification() {
        console.log("ChatProvider onTypingStartedNotification() not implemented");
    }

    onTypingStoppedNotification() {
        console.log("ChatProvider onTypingStoppedNotification() not implemented");
    }

    onConversationChanged() {
        console.log("ChatProvider onConversationChanged() not implemented");
    }

    onMessageChanged() {
        console.log("ChatProvider onMessageChanged() not implemented");
    }

    joinChannelOrGroup() {
        console.log("ChatProvider joinChannelOrGroup() not implemented");
    }

    leaveChannelOrGroup() {
        console.log("ChatProvider leaveChannelOrGroup() not implemented");
    }

    inviteToChannelOrGroup(otherMember, channel) {
        console.log("ChatProvider inviteToChannelOrGroup() not implemented");
    }

    onChannelOrGroupChanged() {
        console.log("ChatProvider onChannelOrGroup() not implemented");
    }
}

export default ChatProvider;
