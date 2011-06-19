(function() {
  var state;
  var __slice = Array.prototype.slice;
  state = null;
  /*
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
  
  */
  window.state = {
    set: function(newState) {
      var filterName, i, k, numericalParams, paramSet, v, _len, _len2, _ref, _ref2;
      if (!state) {
        render.setPipeline.apply(render, [newState.initialTexture].concat(__slice.call((function() {
          var _i, _len, _ref, _results;
          _ref = newState.filters;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            filterName = _ref[_i];
            _results.push(render.makeFilter(filters[filterName].code));
          }
          return _results;
        })())));
      } else {
        if (newState.initialTexture !== state.initialTexture) {
          render.replaceInitialTexture(newState.initialTexture);
        }
        _ref = newState.filters;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          filterName = _ref[i];
          if (filterName !== state.filters[i]) {
            render.replaceFilter(i + 1, render.makeFilter(filters[filterName].code));
          }
        }
      }
      _ref2 = newState.parameters;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        paramSet = _ref2[i];
        numericalParams = {};
        for (k in paramSet) {
          v = paramSet[k];
          if (typeof v === "number") {
            numericalParams[k] = v;
          }
        }
        render.setParameters(i + 1, numericalParams);
      }
      return state = newState;
    },
    get: function() {
      return state;
    }
  };
}).call(this);
