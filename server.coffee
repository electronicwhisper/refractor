
state =
  clients: []
  initialTexture: "images/textures/sample.png"
  filters: [
    { name: "identity" },
    { name: "identity" },
    { name: "identity" }]

exports.initializeClient = (client) ->
  newclient = 
    userId: client.sessionId
    userColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
  state.clients.push(newclient)
  client.broadcast('message', {
    type: "update",
    statePath: ["clients",],
    newValue: state.clients})
  client.send('message', {
    type: "initialize",
    userId: newclient.id,
    userColor: newclient.color})
  console.log("client initialized: " + client.sessionId)

exports.handleClientMessage = (client, message) ->
  switch message.type
    when "update"
      client.broadcast('message', message)
    when "ping"
      client.broadcast('message', message)
  console.log("client sent message: " + message)

exports.disconnectClient = (client) ->
  for c, index in state.clients
    if c and c.id == client.sessionId
      state.clients.pop(index)
  client.broadcast('message', {
    type: "update",
    statePath: ["clients",],
    newValue: state.clients})
  console.log("client disconnected: " + client.sessionId)

