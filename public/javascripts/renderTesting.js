(function() {
  /*
  TESTING
  */  var canvas;
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
  time.start();
}).call(this);
