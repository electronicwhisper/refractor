socket = null
filters = {}

filterIds = ["first-filter-select", "second-filter-select", "third-filter-select"]

handleInitialize = (userId, userColor, newState) ->
  state.set(newState)

processData = (data) ->
  switch(data.type)
    when "ping" then alert(data.payload)
    when "initialize" then handleInitialize(data.userId, data.userColor, data.state)
    when "stateChange" then handleStateChange(data.newState)
    else console.log("Unknown message type: " + data.type)

connect = () ->
  socket = new io.Socket()
  socket.on('connect', () -> console.log("Connected!"))
  socket.on('message', (data) -> processData(JSON.parse(data)))
  socket.connect()

loadFilters = (filters) ->
  for k, v of window.filters
    $('.filter-select').append($('<option>').text(k).val(k))

changeTexture = (newTexture) ->
  path = ['initialTexture']
  payload = newTexture
  state.applyDiff(path, payload)

changeFilter = (filterIndex, filterKey) ->
  path = ['filters', filterIndex]
  payload = { name: filterKey, parameters: {} }
  state.applyDiff(path, payload)

initializeUI = () ->
  $('button').click (e) ->
    msg =
      type: "ping"
      payload: "Hello"
    socket.send(JSON.stringify(msg))
  $('.filter-select').change (e) ->
    filterIndex = filterIds.indexOf(e.srcElement.id)
    newFilter = $(e.srcElement).val()
    changeFilter(filterIndex, newFilter)
  $('#texture-input input').change (e) ->
    newTexture = e.srcElement.value
    changeTexture(newTexture)
  loadFilters(window.filters)
  render.setResolution(window.innerWidth, window.innerHeight)

$(document).ready ->
  $('body').prepend(render.init())
  connect()
  initializeUI()
  state.set(state.sampleState)
  time.start()

window.interface = {
  buildInterface: (state) ->
    $('#texture-input input').val(state.initialTexture)
    for filter, i in state.filters
      element = $("#" + filterIds[i])
      element.val(filter.name)
}
