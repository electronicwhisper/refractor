(function() {
  var changeFilter, changeTexture, connect, filterIds, filters, initializeUI, processData, socket;
  socket = null;
  filters = {};
  filterIds = ["first-filter-select", "second-filter-select", "third-filter-select"];
  processData = function(data) {
    switch (data.type) {
      case "ping":
        return alert(data.payload);
      case "initialize":
        return state.set(data.state);
      case "update":
        return state.applyDiff(data.statePath, data.newValue);
      default:
        return console.log("Unknown message type: " + data.type);
    }
  };
  connect = function() {
    socket = new io.Socket();
    socket.on('connect', function() {
      return console.log("Connected!");
    });
    socket.on('message', function(data) {
      return processData(JSON.parse(data));
    });
    return socket.connect();
  };
  changeTexture = function(newTexture) {
    var path, payload;
    path = ['initialTexture'];
    payload = newTexture;
    state.applyDiff(path, payload);
    return socket.send({
      type: "update",
      statePath: path,
      newValue: payload
    });
  };
  changeFilter = function(filterIndex, filterKey) {
    var k, params, path, payload, v, _ref;
    path = ['filters', filterIndex];
    params = {};
    _ref = window.filters[filterKey].defaults;
    for (k in _ref) {
      v = _ref[k];
      console.log("setting", filterKey, k, v);
      params[k] = {
        value: v
      };
    }
    payload = {
      name: filterKey,
      parameters: params
    };
    state.applyDiff(path, payload);
    return socket.send({
      type: "update",
      statePath: path,
      newValue: payload
    });
  };
  initializeUI = function() {
    var k, v, _ref;
    $('button').click(function(e) {
      var msg;
      msg = {
        type: "ping",
        payload: "Hello"
      };
      return socket.send(JSON.stringify(msg));
    });
    $('.filter-select').change(function(e) {
      var filterIndex, newFilter;
      filterIndex = filterIds.indexOf(e.srcElement.id);
      newFilter = $(e.srcElement).val();
      return changeFilter(filterIndex, newFilter);
    });
    $('#texture-input input').change(function(e) {
      var newTexture;
      newTexture = e.srcElement.value;
      return changeTexture(newTexture);
    });
    _ref = window.filters;
    for (k in _ref) {
      v = _ref[k];
      $('.filter-select').append($('<option>').text(k).val(k));
    }
    return render.setResolution(window.innerWidth, window.innerHeight);
  };
  $(document).ready(function() {
    $('body').prepend(render.init());
    connect();
    initializeUI();
    state.set(state.sampleState);
    return time.start();
  });
  window.interface = {
    buildInterface: function(state) {
      var element, filter, i, _len, _ref, _results;
      $('#texture-input input').val(state.initialTexture);
      _ref = state.filters;
      _results = [];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        filter = _ref[i];
        element = $("#" + filterIds[i]);
        _results.push(element.val(filter.name));
      }
      return _results;
    }
  };
}).call(this);
