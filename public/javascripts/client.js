(function() {
  var connect, initializeUI, processData, socket;
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
      return null;
    });
    socket.on('message', function(data) {
      return processData(JSON.parse(data));
    });
    return socket.connect();
  };
  initializeUI = function() {
    return $('button').click(function(e) {
      var msg;
      msg = {
        type: "ping",
        payload: "Hello"
      };
      return socket.send(JSON.stringify(msg));
    });
  };
  $(document).ready(function() {
    connect();
    return initializeUI();
  });
}).call(this);
