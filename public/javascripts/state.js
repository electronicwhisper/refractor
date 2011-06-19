(function() {
  var state;
  state = null;
  window.state = {
    set: function(newState) {
      return state = newState;
    },
    get: function() {
      return state;
    }
  };
}).call(this);
