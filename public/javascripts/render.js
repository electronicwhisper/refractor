(function() {
  /*
  Some extensions to GLOW
  */  var canvas2D, canvas2DContext, context, fbo1, fbo2, filter1, filter2, filter3, filterInfo1, filterInfo2, filterInfo3, initialTexture, render, resolutionHeight, resolutionWidth, textureCache;
  var __hasProp = Object.prototype.hasOwnProperty;
  GLOW.TextureCanvas = function(canvas) {
    this.id = GLOW.uniqueId();
    this.textureUnit = -1;
    this.texture = void 0;
    this.canvas = canvas;
    return this;
  };
  GLOW.TextureCanvas.prototype.init = function(textureUnit) {
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
  context = null;
  filterInfo1 = null;
  filterInfo2 = null;
  filterInfo3 = null;
  filter1 = null;
  filter2 = null;
  filter3 = null;
  fbo1 = null;
  fbo2 = null;
  resolutionWidth = 512;
  resolutionHeight = 512;
  initialTexture = null;
  textureCache = {};
  canvas2D = null;
  canvas2DContext = null;
  render = window.render = {
    /*
      ==========================================================
      Set Up
      ==========================================================
      */
    /*
      Call this first.
      Returns a DOM Element (that should be appended into the document)
      */
    init: function() {
      context = new GLOW.Context();
      fbo1 = new GLOW.FBO();
      fbo2 = new GLOW.FBO();
      canvas2D = document.createElement("canvas");
      $(canvas2D).attr("width", 1024).attr("height", 768).css("display", "none");
      $("body").append(canvas2D);
      canvas2DContext = canvas2D.getContext("2d");
      return context.domElement;
    },
    /*
      Call this second.
      Sets the pipeline of filters
        Pass in a URL (of a square image)
        f1, f2, and f3 should be objects created by render.makeFilter
      */
    setPipeline: function(initialTextureURL, f1, f2, f3) {
      if (!textureCache[initialTextureURL]) {
        textureCache[initialTextureURL] = new GLOW.Texture(initialTextureURL);
      }
      initialTexture = textureCache[initialTextureURL];
      filterInfo1 = f1;
      filterInfo2 = f2;
      filterInfo3 = f3;
      f1.data.tex0 = initialTexture;
      filter1 = new GLOW.Shader(filterInfo1);
      f2.data.tex0 = fbo1;
      filter2 = new GLOW.Shader(filterInfo2);
      f3.data.tex0 = fbo2;
      return filter3 = new GLOW.Shader(filterInfo3);
    },
    /*
      Call this third, and whenever the resolution changes.
      */
    setResolution: function(width, height) {
      resolutionWidth = width;
      resolutionHeight = height;
      if (filter1) {
        filter1.resolution.set(resolutionWidth, resolutionHeight);
        filter2.resolution.set(resolutionWidth, resolutionHeight);
        return filter3.resolution.set(resolutionWidth, resolutionHeight);
      }
    },
    /*
      ==========================================================
      Making modifications
      ==========================================================
      */
    /*
      Pass in a filter number (1, 2, or 3) and a filter (created by render.makeFilter)
      */
    replaceFilter: function(filterNum, f) {
      if (filterNum === 1) {
        f.data.tex0 = initialTexture;
        filterInfo1 = f;
        return filter1 = new GLOW.Shader(f);
      } else if (filterNum === 2) {
        f.data.tex0 = fbo1;
        filterInfo2 = f;
        return filter2 = new GLOW.Shader(f);
      } else if (filterNum === 3) {
        f.data.tex0 = fbo2;
        filterInfo3 = f;
        return filter3 = new GLOW.Shader(f);
      }
    },
    /*
      Pass in a new URL for the initial texture
      TODO
      */
    replaceInitialTexture: function(url) {
      var params;
      if (!textureCache[url]) {
        textureCache[url] = new GLOW.Texture(url);
      }
      initialTexture = url;
      params = render.getParameters(1);
      filterInfo1.data.tex0 = initialTexture;
      filter1 = new GLOW.Shader(filterInfo1);
      return render.setParameters(1, params);
    },
    /*
      Given a filter number (1, 2, or 3), returns an object whose keys are parameter names and values are the current values
      */
    getParameters: function(filterNum) {
      var f, k, parameters, v, _ref;
      f = filterNum === 1 ? filter1 : filterNum === 2 ? filter2 : filter3;
      parameters = {};
      _ref = f.uniforms;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        if (v.type === 5126) {
          parameters[k] = v.data.value[0];
        }
      }
      return parameters;
    },
    /*
      Given a filter number (1, 2, or 3) and a hash of parameters to set and their values, sets them
      */
    setParameters: function(filterNum, params) {
      var f, k, v, _results;
      f = filterNum === 1 ? filter1 : filterNum === 2 ? filter2 : filter3;
      _results = [];
      for (k in params) {
        if (!__hasProp.call(params, k)) continue;
        v = params[k];
        _results.push(f[k].set(v));
      }
      return _results;
    },
    /*
      ==========================================================
      The render loop
      ==========================================================
      */
    /*
      Will draw a render. Should be called repeatedly (e.g. setInterval).
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
      ==========================================================
      Making filters (from shader code)
      ==========================================================
      */
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
          resolution: new GLOW.Vector2(resolutionWidth, resolutionHeight)
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
