// For Reference: https://www.twilio.com/docs/api/video/rooms

import Video from "twilio-video"
import uuid from 'node-uuid'
import * as jsonwebtoken from "jsonwebtoken"

import {Config} from "../config/Config"
import {RoomPrefix} from "../config/CallcenterStats"
import Socket from "./Socket"
import VideoProvider from "./VideoProvider"

class TwilioVideoProvider extends VideoProvider {
  constructor() {
    super()
    this.initializeVideoClient = this.initializeVideoClient.bind(this)
    this.createRoom = this.createRoom.bind(this)
    this.joinRoom = this.joinRoom.bind(this)
    this.socket = Socket.socket
    this.twilioToken = null
  }

  checkWebRtc() {
    if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
      console.log('WebRTC is not available in your browser.')
    }
  }

  initializeVideoClient() {
    // TODO: Get access token from Session.getSession("twilio-video-token").
    // TODO: initializeVideoClient video client,
    // TODO: listen out for track change events from Twilio
    console.log("TwilioVideoProvider.authenticate() not yet implemented");
  }

  updateToken() {
    // TODO : Get new twilio token from back-end
  }

  createRoomIdentity() {
    return uuid.v4()
  }

  isAudioTrack(track) {
    return (track === 'audio')
  }

  isTokenExpired(token) {
    let decodedToken = jsonwebtoken.decode(token)

    let date = new Date();
    let currentTime = date.getTime() / 1000

    return decodedToken.exp < currentTime
  }

  joinRoom(roomOptions, callBack) {
    let connectOptions = {
      name: roomOptions.roomName,
      logLevel: Config.TWILIO_LOG_LEVEL
    }

    if (roomOptions.audioOnly) {
      connectOptions.audio = true
    }

    Video.connect(roomOptions.twilioToken, connectOptions).then(callBack, function (error) {
      throw error.message
    })
  }

  createVideoTrack(callBack) {
    Video.createLocalVideoTrack().then(function (track) {
      callBack(track)
    });
  }
}

export default new TwilioVideoProvider
