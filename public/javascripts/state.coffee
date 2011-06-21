currentState = null


# from: http://coffeescriptcookbook.com/chapters/classes_and_objects/cloning
clone = (obj) ->
  if not obj? or typeof obj isnt 'object'
    return obj
  newInstance = new obj.constructor()
  for key of obj
    newInstance[key] = clone obj[key]
  return newInstance


window.state = {
  set: (newState) ->
    # ===================================
    # call appropriate render methods
    # ===================================
    console.log("setting new state", newState)
    shouldRebuild = false
    if !currentState
      # initializing a new state
      render.setPipeline(newState.initialTexture, (render.makeFilter(filters[filter.name].code) for filter in newState.filters)...)
      shouldRebuild = true
    else
      # replace initialTexture if it's new
      if newState.initialTexture != currentState.initialTexture
        render.replaceInitialTexture(newState.initialTexture)
        shouldRebuild = true

      # replace filters if they're new
      for filter, i in newState.filters
        if filter.name != currentState.filters[i].name
          render.replaceFilter(i+1, render.makeFilter(filters[filter.name].code))
          shouldRebuild = true

    # set parameters
    for filter, i in newState.filters
      numericalParams = {}
      for k, v of filter.parameters
        if typeof v.value == "number"
          numericalParams[k] = v.value
      render.setParameters(i+1, numericalParams)

    if shouldRebuild
      interface.buildInterface(newState)
    currentState = clone(newState)
  get: () -> currentState
  applyDiff: (path, newValue) ->
    root = clone(currentState)
    node = root
    for component, i in path[0...path.length - 1]
      if (!node.hasOwnProperty(component))
        console.error("Invalid path component for state node", component, node)
        return
      node = node[component]
    lastComponent = path[path.length - 1]
    node[lastComponent] = newValue
    state.set(root)
}

window.state.sampleState = {
  initialTexture: "images/textures/sample.png",
  filters: [
    {
      name: "identity",
      parameters: {}
    },
    {
      name: "kaleido",
      parameters: {
        phase: {
          value: 0.5,
          lastEdit: 3
        },
        sides: {
          value: 0.5,
          lastEdit: 4
        }
      }
    },
    {
      name: "tile",
      parameters: {
        amount: {
          value: "oscillating",
          lastEdit: 1
        }
      }
    }
  ]
}
