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
  exports.initializeClient = function(client) {
    var newclient;
    newclient = {
      userId: client.sessionId,
      userColor: '#' + (Math.random() * 0xFFFFFF << 0).toString(16)
    };
    state.clients.push(newclient);
    client.broadcast('message', {
      type: "update",
      statePath: ["clients"],
      newValue: state.clients
    });
    client.send('message', {
      type: "initialize",
      userId: newclient.id,
      userColor: newclient.color
    });
    return console.log("client initialized: " + client.sessionId);
  };
  exports.handleClientMessage = function(client, message) {
    switch (message.type) {
      case "update":
        client.broadcast('message', message);
        break;
      case "ping":
        client.broadcast('message', message);
    }
    return console.log("client sent message: " + message);
  };
  exports.disconnectClient = function(client) {
    var c, index, _len, _ref;
    _ref = state.clients;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      c = _ref[index];
      if (c && c.id === client.sessionId) {
        state.clients.pop(index);
      }
    }
    client.broadcast('message', {
      type: "update",
      statePath: ["clients"],
      newValue: state.clients
    });
    return console.log("client disconnected: " + client.sessionId);
  };
}).call(this);
