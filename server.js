(function() {
  var state;
  state = {
    clients: [],
    initialTexture: "images/textures/sample.png",
    filters: [
      {
        name: "identity"
      }, {
        name: "identity"
      }, {
        name: "identity"
      }
    ]
  };
  exports.initializeClient = function(client, io) {
    var newclient;
    newclient = {
      id: client.sessionId,
      color: "#FBF"
    };
    state.clients.push(newclient);
    io.sockets.emit('message', {
      state: {
        clients: [newclient]
      }
    });
    return console.log("client initialized: " + client.sessionId);
  };
  exports.handleClientMessage = function(client, message, io) {
    console.log("client sent message: " + message);
    io.sockets.emit('message', message);
    return client.broadcast(message);
  };
  exports.disconnectClient = function(client, io) {
    var c, id, _len, _ref;
    _ref = state.clients;
    for (id = 0, _len = _ref.length; id < _len; id++) {
      c = _ref[id];
      if (c.id === client.sessionId) {
        state.clients.remove(id);
      }
    }
    return console.log("client disconnected: " + client.sessionId);
  };
}).call(this);
