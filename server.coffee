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
}

applyDiff = (path, newValue) ->
  node = state
  for component, i in path[0...path.length - 1]
      if (!node.hasOwnProperty(component))
        console.error("Invalid path component for state node", component, node)
        return
      node = node[component]
  lastComponent = path[path.length - 1]
  node[lastComponent] = newValue

exports.initializeClient = (client) ->
  newclient =
    userId: client.sessionId
    userColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
  state.clients.push(newclient)
  client.broadcast({
    type: "update",
    statePath: ["clients"],
    newValue: state.clients})
  client.send({
    type: "initialize",
    userId: newclient.id,
    userColor: newclient.color
    state: state })

exports.handleClientMessage = (client, message) ->
  console.log("client sent message: " + JSON.stringify(message))
  switch message.type
    when "update"
      applyDiff(message.statePath, message.newValue)
      client.broadcast(message)

exports.disconnectClient = (client) ->
  for c, index in state.clients
    if c and c.id == client.sessionId
      state.clients.pop(index)
  client.broadcast({
    type: "update",
    statePath: ["clients"],
    newValue: state.clients
  })
