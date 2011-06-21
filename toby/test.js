(function() {
  var FBO, canvas, context, ctx, img, kaleido, make2dShader, myTex, plasma, render;
  GLOW.TextureCanvas = function(canvas) {
    this.id = GLOW.uniqueId();
    this.textureUnit = -1;
    this.texture = void 0;
    this.canvas = canvas;
    console.log("initialized");
    return this;
  };
  GLOW.TextureCanvas.prototype.init = function(textureUnit) {
    console.log("got here");
    this.textureUnit = textureUnit;
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, canvas);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
    return GL.generateMipmap(GL.TEXTURE_2D);
  };
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgb(200,0,0)";
  ctx.fillRect(10, 10, 55, 50);
  make2dShader = function(data, fragmentShaderCode) {
    var shaderInfo;
    shaderInfo = {
      data: data,
      elements: GLOW.Geometry.Plane.elements(),
      vertexShader: "attribute vec3 vertices;\nattribute vec2 uvs;\nvarying vec2 uv;\n\nvoid main(void) {\n  uv = uvs;\n  gl_Position = vec4( vertices.x, vertices.y, 1.0, 1.0 );\n}",
      fragmentShader: fragmentShaderCode
    };
    shaderInfo.data.vertices = GLOW.Geometry.Plane.vertices();
    shaderInfo.data.uvs = GLOW.Geometry.Plane.uvs();
    return new GLOW.Shader(shaderInfo);
  };
  context = new GLOW.Context();
  document.getElementById('container').appendChild(context.domElement);
  window.context = context;
  FBO = new GLOW.FBO();
  myTex = new GLOW.TextureCanvas(canvas);
  plasma = make2dShader({
    screenWidth: new GLOW.Float(window.innerWidth),
    screenHeight: new GLOW.Float(window.innerHeight),
    time: new GLOW.Float()
  }, "#ifdef GL_ES\n  precision highp float;\n#endif\n\nuniform float screenWidth;\nuniform float screenHeight;\nuniform float time;\n\nvarying vec2 uv;\n\nvoid main( void ) {\n  float x = gl_FragCoord.x / screenWidth;\n  float y = gl_FragCoord.y / screenHeight;\n  float sinTime = sin( time );\n  float cosTime = cos( time );\n  float twoTime = time * 2.0;\n  float red = ( sin( x * cosTime * 5.0 ) + cos( y * 6.0 + time + cosTime )) * ( sinTime * 0.25 + 0.25 ) + 0.5;\n  float green = ( sin( cosTime ) * cos( y * cosTime )) * 0.2 + 0.5;\n  float blue = ( sin( x * sinTime * 5.0 + time ) + cos( y * 5.0 * cosTime + time * cosTime )) * ( cosTime * 0.25 + 0.25 ) + 0.5;\n  gl_FragColor = vec4( red, green, blue, 1.0 );\n}");
  kaleido = make2dShader({
    resolution: new GLOW.Vector2(window.innerWidth, window.innerHeight),
    tex0: myTex,
    time: new GLOW.Float()
  }, "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform float time;\nuniform sampler2D tex0;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    uv.x =          7.0*a/3.1416;\n    uv.y = -time+ sin(7.0*r+time) + .7*cos(time+7.0*a);\n\n    //float w = .5+.5*(sin(time+7.0*r)+ .7*cos(time+7.0*a));\n\n    vec3 col =  texture2D(tex0,uv*.5).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}");
  render = function() {
    plasma.time.add(0.01);
    kaleido.time.add(0.01);
    context.cache.clear();
    FBO.bind();
    context.clear();
    plasma.draw();
    FBO.unbind();
    return kaleido.draw();
  };
  setInterval(render, 1000 / 30);
  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(30, 30, 55, 50);
  img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0, 1024, 1024);
    return myTex.init();
  };
  img.src = 'http://b.vimeocdn.com/ts/138/161/138161069_200.jpg';
  myTex.init();
}).call(this);
