(function() {
  /*
  TESTING
  */  var canvas, t;
  canvas = render.init();
  document.getElementById('container').appendChild(canvas);
  render.setResolution(window.innerWidth, window.innerHeight);
  window.sampleState = {
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
  state.set(window.sampleState);
  t = 0.0;
  setInterval(function() {
    t = (t + 0.01) % 1;
    return render.render();
  }, 1000 / 30);
}).call(this);
