(function() {
  var clone, currentState;
  var __slice = Array.prototype.slice;
  currentState = null;
  clone = function(obj) {
    var key, newInstance;
    if (!(obj != null) || typeof obj !== 'object') {
      return obj;
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = clone(obj[key]);
    }
    return newInstance;
  };
  window.state = {
    set: function(newState) {
      var filter, i, k, numericalParams, v, _len, _len2, _ref, _ref2, _ref3;
      if (!currentState) {
        render.setPipeline.apply(render, [newState.initialTexture].concat(__slice.call((function() {
          var _i, _len, _ref, _results;
          _ref = newState.filters;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            filter = _ref[_i];
            _results.push(render.makeFilter(filters[filter.name].code));
          }
          return _results;
        })())));
      } else {
        if (newState.initialTexture !== currentState.initialTexture) {
          render.replaceInitialTexture(newState.initialTexture);
        }
        _ref = newState.filters;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          filter = _ref[i];
          if (filter.name !== currentState.filters[i].name) {
            render.replaceFilter(i + 1, render.makeFilter(filters[filter.name].code));
          }
        }
      }
      _ref2 = newState.filters;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        filter = _ref2[i];
        numericalParams = {};
        _ref3 = filter.parameters;
        for (k in _ref3) {
          v = _ref3[k];
          if (typeof v.value === "number") {
            numericalParams[k] = v.value;
          }
        }
        render.setParameters(i + 1, numericalParams);
      }
      interface.buildInterface(newState);
      return currentState = clone(newState);
    },
    get: function() {
      return currentState;
    },
    applyDiff: function(path, newValue) {
      var component, i, lastComponent, node, root, _len, _ref;
      root = clone(currentState);
      node = root;
      _ref = path.slice(0, path.length - 1);
      for (i = 0, _len = _ref.length; i < _len; i++) {
        component = _ref[i];
        if (!node.hasOwnProperty(component)) {
          console.error("Invalid path component for state node", component, node);
          return;
        }
        node = node[component];
      }
      lastComponent = path[path.length - 1];
      node[lastComponent] = newValue;
      return state.set(root);
    }
  };
  window.state.sampleState = {
    initialTexture: "images/textures/sample.png",
    filters: [
      {
        name: "identity",
        parameters: {}
      }, {
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
      }, {
        name: "tile",
        parameters: {
          amount: {
            value: "oscillating",
            lastEdit: 1
          }
        }
      }
    ]
  };
}).call(this);
