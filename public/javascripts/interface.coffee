socket = null
filters = {}

filterDefinitionIds = ["first-plug", "second-plug", "third-plug"]
filterSelectIds     = ["first-filter-select", "second-filter-select", "third-filter-select"]
animationModes      = [["ascending", "&rarr;"], ["descending", "&larr;"], ["oscillating", "&harr;"]]

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

buildRangeCallback = (filterIndex, parameterName) ->
  (e) ->
    element = $(e.srcElement).removeAttr('disabled')
    value = parseInt(element.val(), 10) / 100
    changeParameterValue(filterIndex, parameterName, value)
    element.parent().find('.modeButton').removeClass('selected')

buildButtonCallback = (filterIndex, parameterName, animationMode, range) ->
  (e) ->
    changeParameterValue(filterIndex, parameterName, animationMode)
    $(e.srcElement).toggleClass('selected')
    $(e.srcElement).siblings().removeClass('selected')
    if ($(e.srcElement).hasClass('selected'))
      range.attr('disabled', 'disabled');
    else
      range.removeAttr('disabled');
      value = range.val() / 100.0
      changeParameterValue(filterIndex, parameterName, value)


window.interface = {

  updateSlider: (filterIndex, parameterName, newValue) ->
    rangeId = ['filter', filterIndex, parameterName, 'range'].join('-')
    document.getElementById(rangeId).value = newValue * 100

  buildInterface: (state) ->
    $('#texture-input input').val(state.initialTexture)
    $('#input-box img').attr('src', state.initialTexture)
    for filter, filterIndex in state.filters
      selectElement = document.getElementById(filterSelectIds[filterIndex])
      selectElement.value = filter.name
      definition = $(document.getElementById(filterDefinitionIds[filterIndex]))
      definition.empty()

      for parameterName, bundle of filter.parameters
        div = $("<div>")
        range = $('<input type="range" min="0" max="100" step="1">')
          .attr('id', ['filter', filterIndex, parameterName, 'range'].join('-'))
          .change(buildRangeCallback(filterIndex, parameterName))
        if (typeof bundle.value == 'number')
          range.val(bundle.value * 100)
        else
          range.attr('disabled', 'disabled')

        div.append($('<span>').text(parameterName), range, $('<br>'))
        for mode in animationModes
          modeName = mode[0]
          modeSymbol = mode[1]
          modeLink = $('<a>')
            .html(modeSymbol)
            .click(buildButtonCallback(filterIndex, parameterName, modeName, range))
            .addClass('modeButton')
          if (bundle.value == modeName)
            modeLink.addClass('selected')
          div.append(modeLink)
        definition.append(div)
}
