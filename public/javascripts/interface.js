(function() {
  var changeFilter, changeTexture, connect, filterIds, filters, handleInitialize, initializeUI, loadFilters, processData, socket;
  socket = null;
  filters = {};
  filterIds = ["first-filter-select", "second-filter-select", "third-filter-select"];
  handleInitialize = function(userId, userColor, newState) {
    return state.set(newState);
  };
  processData = function(data) {
    switch (data.type) {
      case "ping":
        return alert(data.payload);
      case "initialize":
        return handleInitialize(data.userId, data.userColor, data.state);
      case "stateChange":
        return handleStateChange(data.newState);
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
  loadFilters = function(filters) {
    var k, v, _ref, _results;
    _ref = window.filters;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push($('.filter-select').append($('<option>').text(k).val(k)));
    }
    return _results;
  };
  changeTexture = function(newTexture) {
    var path, payload;
    path = ['initialTexture'];
    payload = newTexture;
    return state.applyDiff(path, payload);
  };
  changeFilter = function(filterIndex, filterKey) {
    var path, payload;
    path = ['filters', filterIndex];
    payload = {
      name: filterKey,
      parameters: {}
    };
    return state.applyDiff(path, payload);
  };
  initializeUI = function() {
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
    loadFilters(window.filters);
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
