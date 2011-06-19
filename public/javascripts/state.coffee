currentState = null

###
sample state:

{
  initialTexture: "images/textures/sample.png",
  filters: ["identity", "kaleido", "tile"],
  parameters: [
    {},
    {phase: 0.5, sides: "ascending"},
    {amount: "oscillating"}
  ]
}

###

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
    if !currentState
      # initializing a new state
      render.setPipeline(newState.initialTexture, (render.makeFilter(filters[filterName].code) for filterName in newState.filters)...)
    else
      # replace initialTexture if it's new
      if newState.initialTexture != currentState.initialTexture
        render.replaceInitialTexture(newState.initialTexture)
      
      # replace filters if they're new
      for filterName, i in newState.filters
        if filterName != currentState.filters[i]
          render.replaceFilter(i+1, render.makeFilter(filters[filterName].code))
    
    # set parameters
    for paramSet, i in newState.parameters
      numericalParams = {}
      for k, v of paramSet
        if typeof v == "number"
          numericalParams[k] = v
      render.setParameters(i+1, numericalParams)
    
    
    # ===================================
    # call appropriate ui methods
    # ===================================
    # TODO Scott
    
    currentState = clone(newState)
  get: () -> currentState
}