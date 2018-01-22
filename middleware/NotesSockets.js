var socketMap = {};
var positionMap = {};
var io;

var addSocketToSocketMap = function(socket) {
  var handshake = socket.handshake.query;
  console.log('User connected: ' + JSON.stringify(handshake, null, 4) + ', id: ' + socket.id);

  if (socketMap[handshake.noteId]) {
    socketMap[handshake.noteId].push(socket.id);
  } else {
    socketMap[handshake.noteId] = [socket.id];
  }

  // Remove this for prod
  console.log("Socket map after add: " + JSON.stringify(socketMap, null, 4));
}

var removeSocketFromSocketMap = function(socket) {
  var handshake = socket.handshake.query;
  console.log('User disconnected: ' + handshake.user); 
  // Iterate over socket map connection ids
  for (var i = 0; i < socketMap[handshake.noteId].length; i++) {
    if (socketMap[handshake.noteId][i] == socket.id) {
      socketMap[handshake.noteId].splice(i, i + 1);
      if (positionMap[handshake.noteId]) {
        delete positionMap[handshake.noteId][handshake.user._id]; // Remove from position map as well
      }
      break;
    }
  }
  console.log("Socket map after remove: " + JSON.stringify(socketMap, null, 4));
}

var updateRange = function(io, socket, range) {
  var handshake = socket.handshake.query;
  if (!positionMap[handshake.noteId][handshake.user._id]) {
    positionMap[handshake.noteId][handshake.user._id] = { user: handshake.user };
  }
  positionMap[handshake.noteId][handshake.user._id]['range'] = range;
    // Broadcast change to all
  broadcastToAll(io, handshake.noteId, 'stateChange', { data: { 'user': handshake.user, 'range': range}})
}

var broadcastToAll = function(io, noteId, message, contents) {
  // Broadcast change to all
  var notificants = socketMap[noteId];
  for (var i = 0; i < notificants.length; i++) {
    var socketId = notificants[i];
    io.to(socketId).emit(message, contents); 
    console.log("Broadcasting [" + message + "] to: " + socketId);
  }
}

module.exports = {
  init: function(_io) {
    io = _io;

    io.use(function(socket, next){
      var handshake = socket.handshake.query;
      if (handshake && handshake.user && handshake.noteId) {
        socket.handshake.query['user'] = JSON.parse(handshake.user);
        socket.handshake.query['noteId'] = handshake.noteId;

        console.log("New connection for note: " + handshake.noteId);
        console.log("User: " + JSON.stringify(handshake.user, null, 4)); 

        return next(); 
      } else {
        next(new Error('Socket Authentication Error'));
      }
    });

    io.on('connection', function(socket){
      addSocketToSocketMap(socket);
      var handshake = socket.handshake.query;

      if (!positionMap[handshake.noteId]) positionMap[handshake.noteId] = {}; // Initialize to empty map
      positionMap[handshake.noteId][handshake.user._id] = {user: handshake.user, range: { index: 0, length: 0}};

      // Return other users connected
      socket.emit('authenticated', {data: { user: handshake['user'], currentMap: positionMap[handshake['noteId']], noteId: handshake['noteId']}});

      socket.on('disconnect', function() {
        console.log('Disconnecting: ' + handshake.user._id);
        broadcastToAll(io, handshake.noteId, 'removeCursor', { data: { user: { '_id': handshake.user._id}}})
        removeSocketFromSocketMap(socket);
      });

      socket.on('stateChange', function(data) {
        console.log("State change!");
        console.log(JSON.stringify(data));
        updateRange(io, socket, data.range);
        // Broadcast to others
      });
    });
  },
};