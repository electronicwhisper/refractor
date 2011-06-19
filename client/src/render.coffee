# the GLOW.Context
context = null

# these are GLOW.Shader's
filter1 = null
filter2 = null
filter3 = null

# these are GLOW.FBO's
fbo1 = null
fbo2 = null

# cache textures by url
textureCache = {}


window.render = {
  ###
  Call this first.
  Returns a DOM Element (that should be appended into the document)
  ###
  init: () ->
    context = new GLOW.Context()
    fbo1 = new GLOW.FBO()
    fbo2 = new GLOW.FBO()
    context.domElement
  
  ###
  Sets the pipeline of filters
  ###
  setPipeline: (initialTextureURL, f1, f2, f3) ->
    # create GLOW.Texture and cache it if it doesn't exist
    if !textureCache[initialTextureURL]
      textureCache[initialTextureURL] = new GLOW.Texture(initialTextureURL)
    
    f1.data.tex0 = textureCache[initialTextureURL]
    filter1 = new GLOW.Shader(f1)
    f2.data.tex0 = fbo1
    filter2 = new GLOW.Shader(f2)
    f3.data.tex0 = fbo2
    filter3 = new GLOW.Shader(f3)
  
  ###
  Will do a render. Should be called repeatedly.
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
        resolution: new GLOW.Vector2(window.innerWidth, window.innerHeight)
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











