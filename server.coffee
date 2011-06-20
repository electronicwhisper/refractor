
state =
  clients: []
  initialTexture: "images/textures/sample.png"
  filters: [
    { name: "identity" },
    { name: "identity" },
    { name: "identity" }]

exports.initializeClient = (client) ->
  newclient = 
    id: client.sessionId
    color: "#FBF"
  state.clients.push(newclient)
  # TODO: generate random color
  io.sockets.emit('message', state: {clients: [newclient]})
  console.log("client initialized: " + client.sessionId)

exports.handleClientMessage = (client, message) ->
  console.log("client sent message: " + message)
  io.sockets.emit('message', message)
  client.broadcast(message)

exports.disconnectClient = (client) ->
  for c, id in state.clients
    if c.id == client.sessionId
      state.clients.remove(id)
  # TODO: update all clients with removed client
  console.log("client disconnected: " + client.sessionId)

