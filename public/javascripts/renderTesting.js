(function() {
  /*
  TESTING
  */  var canvas, identity, kaleido, t, tile;
  canvas = render.init();
  document.getElementById('container').appendChild(canvas);
  kaleido = render.makeFilter(filters.kaleido.code);
  identity = render.makeFilter(filters.identity.code);
  tile = render.makeFilter(filters.tile.code);
  render.setPipeline("images/textures/sample.png", identity, identity, kaleido);
  render.setResolution(window.innerWidth, window.innerHeight);
  console.log(render.getParameters(3));
  t = 0.0;
  setInterval(function() {
    t = (t + 0.01) % 1;
    render.setParameters(3, {
      phase: t
    });
    return render.render();
  }, 1000 / 30);
}).call(this);
