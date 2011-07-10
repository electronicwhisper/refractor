(function() {
  var applyDiff, applyUpdateMessage, randomHexColor, state;
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
  applyDiff = function(path, newValue) {
    var component, i, lastComponent, node, _len, _ref;
    node = state;
    _ref = path.slice(0, path.length - 1);
    for (i = 0, _len = _ref.length; i < _len; i++) {
      component = _ref[i];
      if (!node.hasOwnProperty(component)) {
        console.error("Invalid path component for state node", component, node);
        return;
      }
      node = node[component];
    }
    lastComponent = path[path.length - 1];
    return node[lastComponent] = newValue;
  };
  applyUpdateMessage = function(message) {
    return applyDiff(message.statePath, message.newValue);
  };
  randomHexColor = function() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  };
  exports.initializeClient = function(client) {
    var newclient, updateMessage;
    newclient = {
      userId: client.sessionId,
      userColor: randomHexColor()
    };
    state.clients.push(newclient);
    updateMessage = {
      type: "update",
      statePath: ["clients"],
      newValue: state.clients
    };
    applyUpdateMessage(updateMessage);
    client.broadcast(updateMessage);
    return client.send({
      type: "initialize",
      userId: newclient.userId,
      userColor: newclient.userColor,
      state: state
    });
  };
  exports.handleClientMessage = function(client, message) {
    switch (message.type) {
      case "update":
        applyUpdateMessage(message);
        return client.broadcast(message);
    }
  };
  exports.disconnectClient = function(client) {
    var c, index, message, _len, _ref;
    _ref = state.clients;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      c = _ref[index];
      if (c && c.id === client.sessionId) {
        state.clients.pop(index);
      }
    }
    message = {
      type: "update",
      statePath: ["clients"],
      newValue: state.clients
    };
    applyUpdateMessage(message);
    return client.broadcast(message);
  };
}).call(this);
