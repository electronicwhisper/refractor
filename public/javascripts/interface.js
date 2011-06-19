(function() {
  var connect, initializeUI, loadFilters, processData, socket;
  socket = null;
  processData = function(data) {
    switch (data.type) {
      case "ping":
        return alert(data.payload);
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
  loadFilters = function(filters) {};
  initializeUI = function() {
    $('button').click(function(e) {
      var msg;
      msg = {
        type: "ping",
        payload: "Hello"
      };
      return socket.send(JSON.stringify(msg));
    });
    return loadFilters(window.filters);
  };
  $(document).ready(function() {
    connect();
    return initializeUI();
  });
}).call(this);
