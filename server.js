(function() {
  var state;
  state = {
    clients: [],
    initialTexture: "images/textures/sample.png",
    filters: [
      {
        name: "identity",
        parameters: {}
      }, {
        name: "kaleido",
        parameters: {
          phase: {
            value: 0.5
          },
          sides: {
            value: 0.5
          }
        }
      }, {
        name: "tile",
        parameters: {
          amount: {
            value: "oscillating"
          }
        }
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
    client.broadcast({
      type: "update",
      statePath: ["clients"],
      newValue: state.clients
    });
    return client.send({
      type: "initialize",
      userId: newclient.id,
      userColor: newclient.color,
      state: state
    });
  };
  exports.handleClientMessage = function(client, message) {
    console.log("client sent message: " + JSON.stringify(message));
    switch (message.type) {
      case "update":
        return client.broadcast(message);
    }
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
    return client.broadcast({
      type: "update",
      statePath: ["clients"],
      newValue: state.clients
    });
  };
}).call(this);
