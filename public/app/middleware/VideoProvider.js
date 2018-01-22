class VideoProvider {

    constructor() {
        this.initializeVideoClient = this.initializeVideoClient.bind(this);
        this.createRoom = this.createRoom.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
    }

    initializeVideoClient() {
        console.log("VideoProvider.authenticate() not implemented");
    }

    createRoom(roomName) {
        console.log("VideoProvider.createRoom() not implemented");
    }

    joinRoom(roomName) {
        console.log("VideoProvider.joinRoom() not implemented");
    }
}

export default VideoProvider;