(function() {
  var clients;
  clients = {};
  exports.initializeClient = function(client) {
    return console.log("client initialized: " + client.sessionId);
  };
  exports.handleClientMessage = function(client, message) {
    console.log("client sent message: " + message);
    return client.broadcast(message);
  };
  exports.disconnectClient = function(client) {
    return console.log("client disconnected: " + client.sessionId);
  };
}).call(this);
