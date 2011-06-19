clients = {}

exports.initializeClient = (client) ->
  console.log("client initialized: " + client.sessionId)

exports.handleClientMessage = (client, message) ->
  console.log("client sent message: " + message)
  client.broadcast(message)

exports.disconnectClient = (client) ->
  console.log("client disconnected: " + client.sessionId)