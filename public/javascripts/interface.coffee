socket = null
filters = {}

filterIds = ["first-filter-select", "first-filter-select", "first-filter-select"]

handleInitialize = (userId, newState) ->
  null # TODO

handleStateChange = (newState) ->
  null # TODO

processData = (data) ->
  switch(data.type)
    when "ping" then alert(data.payload)
    when "initialize" then handleInitialize(data.userId, data.state)
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

changeFilter = (filterIndex, filterKey) ->
  console.log("changing filter " + filterIndex + " to " + filterKey)


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
    console.log(e)
  loadFilters(window.filters)

$(document).ready ->
  connect()
  initializeUI()

