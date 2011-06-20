
frames = 200
t = 0

time = window.time = {
  start: () ->
    t = (t+1) % frames
    
    # set parameters that are ascending, descending, or oscillating
    for filter, i in state.get().filters
      toSet = {}
      for k, v of filter.parameters
        if typeof v.value != "number"
          if v.value == "ascending"
            toSet[k] = t / frames
          else if v.value == "descending"
            toSet[k] = (frames - t) / frames
          else if v.value == "oscillating"
            toSet[k] = Math.sin(6.2832 * t / frames) * 0.5 + 0.5
      render.setParameters(i+1, toSet)
    
    render.render()
    
    setTimeout(time.start, 1000 / 30)
}