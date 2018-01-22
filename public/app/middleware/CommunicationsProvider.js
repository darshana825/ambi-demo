import TwilioChatProvider from "./TwilioChatProvider";
import TwilioVideoProvider from "./TwilioVideoProvider";

class CommunicationsProvider {
        constructor() {
            this.chatProvider = TwilioChatProvider;
            this.videoProvider = TwilioVideoProvider;

            this.getChatProvider = this.getChatProvider.bind(this);
            this.getVideoProvider = this.getVideoProvider.bind(this);
        }

        getChatProvider() {
            return this.chatProvider;
        }

        getVideoProvider() {
            return this.videoProvider;
        }

	}

export default new CommunicationsProvider;
