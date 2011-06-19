clients = {}

state =
  initialTexture: "images/textures/sample.png",
  filters: [
    { name: "identity" },
    { name: "identity" },
    { name: "identity" }]


exports.initializeClient = (client) ->
  console.log("client initialized: " + client.sessionId)

exports.handleClientMessage = (client, message) ->
  console.log("client sent message: " + message)
  client.broadcast(message)

exports.disconnectClient = (client) ->
  console.log("client disconnected: " + client.sessionId)