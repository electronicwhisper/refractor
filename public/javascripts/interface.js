(function() {
  var buildRangeCallback, changeFilter, changeParameterValue, changeTexture, connect, filterDefinitionIds, filterSelectIds, filters, initializeUI, processData, socket;
  socket = null;
  filters = {};
  filterDefinitionIds = ["first-plug", "second-plug", "third-plug"];
  filterSelectIds = ["first-filter-select", "second-filter-select", "third-filter-select"];
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
  changeParameterValue = function(filterIndex, parameterName, value) {
    var path, payload;
    path = ['filters', filterIndex, "parameters", parameterName];
    payload = {
      'value': value
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
      filterIndex = filterSelectIds.indexOf(e.srcElement.id);
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
  buildRangeCallback = function(filterIndex, propertyName) {
    return function(e) {
      var value;
      value = parseInt(e.srcElement.value, 10) / 100;
      return changeParameterValue(filterIndex, propertyName, value);
    };
  };
  window.interface = {
    buildInterface: function(state) {
      var bundle, definition, filter, filterIndex, name, range, selectElement, _len, _ref, _results;
      $('#texture-input input').val(state.initialTexture);
      $('#input-box img').attr('src', state.initialTexture);
      _ref = state.filters;
      _results = [];
      for (filterIndex = 0, _len = _ref.length; filterIndex < _len; filterIndex++) {
        filter = _ref[filterIndex];
        selectElement = document.getElementById(filterSelectIds[filterIndex]);
        selectElement.value = filter.name;
        definition = $(document.getElementById(filterDefinitionIds[filterIndex]));
        definition.empty();
        _results.push((function() {
          var _ref2, _results2;
          _ref2 = filter.parameters;
          _results2 = [];
          for (name in _ref2) {
            bundle = _ref2[name];
            console.log(name, bundle.value);
            range = $('<input type="range" min="0" max="100" step="1">').change(buildRangeCallback(filterIndex, name)).val(bundle.value * 100);
            _results2.push(definition.append($("<div>").append($('<span>').text(name), range)));
          }
          return _results2;
        })());
      }
      return _results;
    }
  };
}).call(this);
