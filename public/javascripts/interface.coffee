socket = null
filters = {}

filterDefinitionIds = ["first-plug", "second-plug", "third-plug"]
filterSelectIds     = ["first-filter-select", "second-filter-select", "third-filter-select"]

processData = (data) ->
  switch(data.type)
    when "ping"       then alert(data.payload)
    when "initialize" then state.set(data.state)
    when "update"     then state.applyDiff(data.statePath, data.newValue)
    else console.log("Unknown message type: " + data.type)

connect = () ->
  socket = new io.Socket()
  socket.on('connect', () -> console.log("Connected!"))
  socket.on('message', (data) -> processData(JSON.parse(data)))
  socket.connect()

changeTexture = (newTexture) ->
  path = ['initialTexture']
  payload = newTexture
  state.applyDiff(path, payload)
  socket.send({ type: "update", statePath: path, newValue: payload })

changeFilter = (filterIndex, filterKey) ->
  path = ['filters', filterIndex]
  params = {}
  for k, v of window.filters[filterKey].defaults
    params[k] = { value: v }
  payload = { name: filterKey, parameters: params }
  state.applyDiff(path, payload)
  socket.send({ type: "update", statePath: path, newValue: payload })

changeParameterValue = (filterIndex, parameterName, value) ->
  path = ['filters', filterIndex, "parameters", parameterName]
  payload = { 'value': value }
  state.applyDiff(path, payload)
  socket.send({ type: "update", statePath: path, newValue: payload })

initializeUI = () ->
  $('button').click (e) ->
    msg = { type: "ping", payload: "Hello" }
    socket.send(JSON.stringify(msg))
  $('.filter-select').change (e) ->
    filterIndex = filterSelectIds.indexOf(e.srcElement.id)
    newFilter = $(e.srcElement).val()
    changeFilter(filterIndex, newFilter)
  $('#texture-input input').change (e) ->
    newTexture = e.srcElement.value
    changeTexture(newTexture)
  for k, v of window.filters
    $('.filter-select').append($('<option>').text(k).val(k))
  render.setResolution(window.innerWidth, window.innerHeight)

$(document).ready ->
  $('body').prepend(render.init())
  connect()
  initializeUI()
  state.set(state.sampleState)
  time.start()

buildRangeCallback = (filterIndex, propertyName) ->
  (e) ->
    value = parseInt(e.srcElement.value, 10) / 100
    changeParameterValue(filterIndex, propertyName, value)


window.interface = {

  buildInterface: (state) ->
    $('#texture-input input').val(state.initialTexture)
    $('#input-box img').attr('src', state.initialTexture)
    for filter, filterIndex in state.filters
      selectElement = document.getElementById(filterSelectIds[filterIndex])
      selectElement.value = filter.name
      definition = $(document.getElementById(filterDefinitionIds[filterIndex]))
      definition.empty()

      for name, bundle of filter.parameters
        console.log(name, bundle.value)
        range = $('<input type="range" min="0" max="100" step="1">')
          .change(buildRangeCallback(filterIndex, name))
          .val(bundle.value * 100)
        definition.append($("<div>").append($('<span>').text(name), range))

}
