state = null

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

window.state = {
  set: (newState) ->
    # call appropriate render methods
    if !state
      # initializing a new state
      render.setPipeline(newState.initialTexture, (render.makeFilter(filters[filterName].code) for filterName in newState.filters)...)
    else
      # replace initialTexture if it's new
      if newState.initialTexture != state.initialTexture
        render.replaceInitialTexture(newState.initialTexture)
      
      # replace filters if they're new
      for filterName, i in newState.filters
        if filterName != state.filters[i]
          render.replaceFilter(i+1, render.makeFilter(filters[filterName].code))
    
    # set parameters
    for paramSet, i in newState.parameters
      numericalParams = {}
      for k, v of paramSet
        if typeof v == "number"
          numericalParams[k] = v
      render.setParameters(i+1, numericalParams)
  
    
    # call appropriate ui methods
    # TODO Scott
    
    state = newState
  get: () -> state
}