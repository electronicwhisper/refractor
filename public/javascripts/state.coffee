currentState = null

###
sample state:

{
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
          value: "ascending",
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
      render.setPipeline(newState.initialTexture, (render.makeFilter(filters[filter.name].code) for filter in newState.filters)...)
    else
      # replace initialTexture if it's new
      if newState.initialTexture != currentState.initialTexture
        render.replaceInitialTexture(newState.initialTexture)
      
      # replace filters if they're new
      for filter, i in newState.filters
        if filter.name != currentState.filters[i].name
          render.replaceFilter(i+1, render.makeFilter(filters[filter.name].code))
    
    # set parameters
    for filter, i in newState.filters
      numericalParams = {}
      for k, v of filter.parameters
        if typeof v.value == "number"
          numericalParams[k] = v.value
      render.setParameters(i+1, numericalParams)
    
    
    # ===================================
    # call appropriate ui methods
    # ===================================
    # TODO Scott
    
    currentState = clone(newState)
  get: () -> currentState
}