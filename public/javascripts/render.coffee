###
Some extensions to GLOW
###
GLOW.TextureCanvas = (canvas) ->
  this.id = GLOW.uniqueId();
  this.textureUnit = -1;
  this.texture = undefined;
  this.canvas = canvas
  this
GLOW.TextureCanvas.prototype.init = (textureUnit) ->
  this.textureUnit = textureUnit
  this.texture = GL.createTexture()
  
  GL.bindTexture( GL.TEXTURE_2D, this.texture )
  GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.canvas )
  
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT )
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT )
  
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR )
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR )
  
  GL.generateMipmap( GL.TEXTURE_2D )
  
  GL.bindTexture( GL.TEXTURE_2D, null );









# the GLOW.Context
context = null

# these are objects that get returned by render.makeFilter
filterInfo1 = null
filterInfo2 = null
filterInfo3 = null

# these are GLOW.Shader's
filter1 = null
filter2 = null
filter3 = null

# these are GLOW.FBO's
fbo1 = null
fbo2 = null

resolutionWidth = 512
resolutionHeight = 512

# GLOW.Texture
initialTexture = null

# 2d canvas (to resize images)
canvas2D = null
canvas2DContext = null


render = window.render = {
  
  ###
  ==========================================================
  Set Up
  ==========================================================
  ###
  
  ###
  Call this first.
  Returns a DOM Element (that should be appended into the document)
  ###
  init: () ->
    context = new GLOW.Context()
    fbo1 = new GLOW.FBO()
    fbo2 = new GLOW.FBO()
    
    canvas2D = document.createElement("canvas")
    $(canvas2D).attr("width", 1024).attr("height", 1024).css("display", "none")
    $("body").append(canvas2D)
    canvas2DContext = canvas2D.getContext("2d")
    
    initialTexture = new GLOW.TextureCanvas(canvas2D)
    
    context.domElement
  
  ###
  Call this second.
  Sets the pipeline of filters
    Pass in a URL (of a square image)
    f1, f2, and f3 should be objects created by render.makeFilter
  ###
  setPipeline: (initialTextureURL, f1, f2, f3) ->
    render.replaceInitialTexture(initialTextureURL)
    
    filterInfo1 = f1
    filterInfo2 = f2
    filterInfo3 = f3
    
    f1.data.tex0 = initialTexture
    filter1 = new GLOW.Shader(filterInfo1)
    f2.data.tex0 = fbo1
    filter2 = new GLOW.Shader(filterInfo2)
    f3.data.tex0 = fbo2
    filter3 = new GLOW.Shader(filterInfo3)
  
  ###
  Call this third, and whenever the resolution changes.
  ###
  setResolution: (width, height) ->
    resolutionWidth = width
    resolutionHeight = height
    if filter1
      filter1.resolution.set(resolutionWidth, resolutionHeight)
      filter2.resolution.set(resolutionWidth, resolutionHeight)
      filter3.resolution.set(resolutionWidth, resolutionHeight)
  
  ###
  ==========================================================
  Making modifications
  ==========================================================
  ###
  
  ###
  Pass in a filter number (1, 2, or 3) and a filter (created by render.makeFilter)
  ###
  replaceFilter: (filterNum, f) ->
    if filterNum == 1
      f.data.tex0 = initialTexture
      filterInfo1 = f
      filter1 = new GLOW.Shader(f)
    else if filterNum == 2
      f.data.tex0 = fbo1
      filterInfo2 = f
      filter2 = new GLOW.Shader(f)
    else if filterNum == 3
      f.data.tex0 = fbo2
      filterInfo3 = f
      filter3 = new GLOW.Shader(f)
  
  ###
  Pass in a new URL for the initial texture
  TODO
  ###
  replaceInitialTexture: (url) ->
    img = new Image()
    img.onload = () ->
      canvas2DContext.drawImage(img,0,0,1024,1024)
      initialTexture.init()
      
      # we need to remake filter1 (for some strange reason)
      params = render.getParameters(1)
      filterInfo1.data.tex0 = initialTexture
      filter1 = new GLOW.Shader(filterInfo1)
      render.setParameters(1, params)
    img.src = url
  
  ###
  Given a filter number (1, 2, or 3), returns an object whose keys are parameter names and values are the current values
  ###
  getParameters: (filterNum) ->
    f = if filterNum == 1 then filter1 else if filterNum == 2 then filter2 else filter3
    parameters = {}
    for own k, v of f.uniforms
      if v.type == 5126 # check if it's a float
        parameters[k] = v.data.value[0]
    parameters
  
  ###
  Given a filter number (1, 2, or 3) and a hash of parameters to set and their values, sets them
  ###
  setParameters: (filterNum, params) ->
    f = if filterNum == 1 then filter1 else if filterNum == 2 then filter2 else filter3
    for own k, v of params
      f[k].set(v)
  
  ###
  ==========================================================
  The render loop
  ==========================================================
  ###
  
  ###
  Will draw a render. Should be called repeatedly (e.g. setInterval).
  ###
  render: () ->
    context.cache.clear()
    
    fbo1.bind()
    filter1.draw()
    fbo1.unbind()
    fbo2.bind()
    filter2.draw()
    fbo2.unbind()
    filter3.draw()
  
  
  ###
  ==========================================================
  Making filters (from shader code)
  ==========================================================
  ###
  
  ###
  takes shader code (in GLSL) and returns shaderInfo (for making a GLOW.Shader)
  the GLSL code should expect:
    uniform vec2 resolution;
    uniform sampler2D tex0;
    uniform float parameters (varying from 0.0 to 1.0)
  ###
  makeFilter: (fragmentShaderCode) ->
    shaderInfo = {
      data: {
        vertices: GLOW.Geometry.Plane.vertices()
        uvs: GLOW.Geometry.Plane.uvs()
        resolution: new GLOW.Vector2(resolutionWidth, resolutionHeight)
      }
      elements: GLOW.Geometry.Plane.elements()
      vertexShader: """
        attribute vec3 vertices;
        attribute vec2 uvs;
        varying vec2 uv;

        void main(void) {
          uv = uvs;
          gl_Position = vec4( vertices.x, vertices.y, 1.0, 1.0 );
        }
        """
      fragmentShader: fragmentShaderCode
    }
    
    # find uniform float parameters (via a regular expression on the shader code)
    re = /uniform float ([\d\w]*)/g
    while (myArray = re.exec(fragmentShaderCode)) != null
      shaderInfo.data[myArray[1]] = new GLOW.Float(0.5)
    
    shaderInfo
}











