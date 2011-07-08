(function() {
  var animationModes, buildButtonCallback, buildRangeCallback, changeFilter, changeParameterValue, changeTexture, connect, filterDefinitionIds, filterSelectIds, filters, initializeUI, processData, socket, userColor, userId;
  socket = null;
  userId = null;
  userColor = null;
  filters = {};
  filterDefinitionIds = ["first-plug", "second-plug", "third-plug"];
  filterSelectIds = ["first-filter-select", "second-filter-select", "third-filter-select"];
  animationModes = [["ascending", "&rarr;"], ["descending", "&larr;"], ["oscillating", "&harr;"]];
  processData = function(data) {
    switch (data.type) {
      case "initialize":
        console.log(data);
        state.set(data.state);
        userId = data.userId;
        userColor = data.userColor;
        return time.start();
      case "update":
        return state.applyDiff(data.statePath, data.newValue, true);
      default:
        return console.warn("Unknown message type: " + data.type);
    }
  };
  connect = function() {
    socket = new io.Socket();
    socket.on('connect', function() {
      return console.log("Connected!");
    });
    socket.on('message', function(data) {
      return processData(data);
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
      parameters: params,
      userColor: userColor
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
    state.applyDiff(path, payload, false);
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
    return initializeUI();
  });
  buildRangeCallback = function(filterIndex, parameterName) {
    return function(e) {
      var element, value;
      element = $(e.srcElement);
      value = parseInt(element.val(), 10) / 100;
      changeParameterValue(filterIndex, parameterName, value);
      return element.parent().find('.modeButton').removeClass('selected');
    };
  };
  buildButtonCallback = function(filterIndex, parameterName, animationMode, range) {
    return function(e) {
      var value;
      changeParameterValue(filterIndex, parameterName, animationMode);
      $(e.srcElement).toggleClass('selected');
      $(e.srcElement).siblings().removeClass('selected');
      if (!$(e.srcElement).hasClass('selected')) {
        value = range.val() / 100.0;
        return changeParameterValue(filterIndex, parameterName, value);
      }
    };
  };
  window.interface = {
    updateSlider: function(filterIndex, parameterName, newValue) {
      var rangeId, slider;
      rangeId = ['filter', filterIndex, parameterName, 'range'].join('-');
      slider = document.getElementById(rangeId);
      if (slider) {
        return slider.value = newValue * 100;
      }
    },
    buildInterface: function(state) {
      var bundle, definition, div, filter, filterIndex, mode, modeLink, modeName, modeSymbol, parameterName, range, selectElement, _len, _ref, _results;
      $('#texture-input input').val(state.initialTexture);
      $('#input-box img').attr('src', state.initialTexture);
      $('input#tempo').change(function() {
        return window.tempo = $(this).val() / 100;
      });
      _ref = state.filters;
      _results = [];
      for (filterIndex = 0, _len = _ref.length; filterIndex < _len; filterIndex++) {
        filter = _ref[filterIndex];
        selectElement = document.getElementById(filterSelectIds[filterIndex]);
        selectElement.value = filter.name;
        definition = $(document.getElementById(filterDefinitionIds[filterIndex]));
        definition.empty();
        if (filter.userColor) {
          definition.css('border-color', filter.userColor);
        }
        _results.push((function() {
          var _i, _len2, _ref2, _results2;
          _ref2 = filter.parameters;
          _results2 = [];
          for (parameterName in _ref2) {
            bundle = _ref2[parameterName];
            div = $("<div>");
            range = $('<input type="range" min="0" max="100" step="1">').attr('id', ['filter', filterIndex, parameterName, 'range'].join('-')).change(buildRangeCallback(filterIndex, parameterName));
            if (typeof bundle.value === 'number') {
              range.val(bundle.value * 100);
            }
            div.append($('<span>').text(parameterName), range, $('<br>'));
            for (_i = 0, _len2 = animationModes.length; _i < _len2; _i++) {
              mode = animationModes[_i];
              modeName = mode[0];
              modeSymbol = mode[1];
              modeLink = $('<a>').html(modeSymbol).click(buildButtonCallback(filterIndex, parameterName, modeName, range)).addClass('modeButton');
              if (bundle.value === modeName) {
                modeLink.addClass('selected');
              }
              div.append(modeLink);
            }
            _results2.push(definition.append(div));
          }
          return _results2;
        })());
      }
      return _results;
    }
  };
}).call(this);
