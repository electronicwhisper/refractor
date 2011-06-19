(function() {
  var context, fbo1, fbo2, filter1, filter2, filter3, textureCache;
  context = null;
  filter1 = null;
  filter2 = null;
  filter3 = null;
  fbo1 = null;
  fbo2 = null;
  textureCache = {};
  window.render = {
    /*
      Call this first.
      Returns a DOM Element (that should be appended into the document)
      */
    init: function() {
      context = new GLOW.Context();
      fbo1 = new GLOW.FBO();
      fbo2 = new GLOW.FBO();
      return context.domElement;
    },
    /*
      Sets the pipeline of filters
      */
    setPipeline: function(initialTextureURL, f1, f2, f3) {
      if (!textureCache[initialTextureURL]) {
        textureCache[initialTextureURL] = new GLOW.Texture(initialTextureURL);
      }
      f1.data.tex0 = textureCache[initialTextureURL];
      filter1 = new GLOW.Shader(f1);
      f2.data.tex0 = fbo1;
      filter2 = new GLOW.Shader(f2);
      f3.data.tex0 = fbo2;
      return filter3 = new GLOW.Shader(f3);
    },
    /*
      Will do a render. Should be called repeatedly.
      */
    render: function() {
      context.cache.clear();
      fbo1.bind();
      filter1.draw();
      fbo1.unbind();
      fbo2.bind();
      filter2.draw();
      fbo2.unbind();
      return filter3.draw();
    },
    /*
      takes shader code (in GLSL) and returns shaderInfo (for making a GLOW.Shader)
      the GLSL code should expect:
        uniform vec2 resolution;
        uniform sampler2D tex0;
        uniform float parameters (varying from 0.0 to 1.0)
      */
    makeFilter: function(fragmentShaderCode) {
      var myArray, re, shaderInfo;
      shaderInfo = {
        data: {
          vertices: GLOW.Geometry.Plane.vertices(),
          uvs: GLOW.Geometry.Plane.uvs(),
          resolution: new GLOW.Vector2(window.innerWidth, window.innerHeight)
        },
        elements: GLOW.Geometry.Plane.elements(),
        vertexShader: "attribute vec3 vertices;\nattribute vec2 uvs;\nvarying vec2 uv;\n\nvoid main(void) {\n  uv = uvs;\n  gl_Position = vec4( vertices.x, vertices.y, 1.0, 1.0 );\n}",
        fragmentShader: fragmentShaderCode
      };
      re = /uniform float ([\d\w]*)/g;
      while ((myArray = re.exec(fragmentShaderCode)) !== null) {
        shaderInfo.data[myArray[1]] = new GLOW.Float(0.5);
      }
      return shaderInfo;
    }
  };
}).call(this);
