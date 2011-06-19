(function() {
  var changeFilter, connect, filterIds, filters, handleInitialize, handleStateChange, initializeUI, loadFilters, processData, socket;
  socket = null;
  filters = {};
  filterIds = ["first-filter-select", "first-filter-select", "first-filter-select"];
  handleInitialize = function(userId, newState) {
    return null;
  };
  handleStateChange = function(newState) {
    return null;
  };
  processData = function(data) {
    switch (data.type) {
      case "ping":
        return alert(data.payload);
      case "initialize":
        return handleInitialize(data.userId, data.state);
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
  changeFilter = function(filterIndex, filterKey) {
    return console.log("changing filter " + filterIndex + " to " + filterKey);
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
      return console.log(e);
    });
    return loadFilters(window.filters);
  };
  $(document).ready(function() {
    connect();
    return initializeUI();
  });
}).call(this);
