GLOW.TextureCanvas = (canvas) ->
  this.id = GLOW.uniqueId();
  this.textureUnit = -1;
  this.texture = undefined;
  this.canvas = canvas
  console.log("initialized")
  return this



GLOW.TextureCanvas.prototype.init = (textureUnit) ->
  console.log("got here")
  
  this.textureUnit = textureUnit
  this.texture = GL.createTexture()
  
  GL.bindTexture( GL.TEXTURE_2D, this.texture )
  GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, canvas )
  
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT )
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT )
  
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR )
  GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR )
  
  GL.generateMipmap( GL.TEXTURE_2D )
  
  



canvas = document.getElementById("canvas")
ctx = canvas.getContext("2d")

ctx.fillStyle = "rgb(200,0,0)"
ctx.fillRect(10, 10, 55, 50)



















make2dShader = (data, fragmentShaderCode) ->
  shaderInfo = {
    data: data
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
  
  # used for the vertex shader
  shaderInfo.data.vertices = GLOW.Geometry.Plane.vertices()
  shaderInfo.data.uvs = GLOW.Geometry.Plane.uvs()
  
  new GLOW.Shader(shaderInfo)



context = new GLOW.Context()
document.getElementById( 'container' ).appendChild( context.domElement )

window.context = context



FBO = new GLOW.FBO()


myTex = new GLOW.TextureCanvas(canvas)



plasma = make2dShader(
  {
    screenWidth: new GLOW.Float( window.innerWidth )
    screenHeight: new GLOW.Float( window.innerHeight )
    time: new GLOW.Float()
  },
  """
  #ifdef GL_ES
    precision highp float;
  #endif
  
  uniform float screenWidth;
  uniform float screenHeight;
  uniform float time;

  varying vec2 uv;

  void main( void ) {
    float x = gl_FragCoord.x / screenWidth;
    float y = gl_FragCoord.y / screenHeight;
    float sinTime = sin( time );
    float cosTime = cos( time );
    float twoTime = time * 2.0;
    float red = ( sin( x * cosTime * 5.0 ) + cos( y * 6.0 + time + cosTime )) * ( sinTime * 0.25 + 0.25 ) + 0.5;
    float green = ( sin( cosTime ) * cos( y * cosTime )) * 0.2 + 0.5;
    float blue = ( sin( x * sinTime * 5.0 + time ) + cos( y * 5.0 * cosTime + time * cosTime )) * ( cosTime * 0.25 + 0.25 ) + 0.5;
    gl_FragColor = vec4( red, green, blue, 1.0 );
  }
  """
)





kaleido = make2dShader(
  {
    resolution: new GLOW.Vector2(window.innerWidth, window.innerHeight)
    # tex0: new GLOW.Texture( "clouds.jpg" )
    # tex0: new GLOW.Texture("http://a0.twimg.com/profile_images/393262736/n636211541_7004_reasonably_small.jpg")
    # tex0: FBO
    tex0: myTex
    time: new GLOW.Float()
    

  },
  """
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform vec2 resolution;
  uniform float time;
  uniform sampler2D tex0;

  void main(void)
  {
      vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
      vec2 uv;

      float a = atan(p.y,p.x);
      float r = sqrt(dot(p,p));

      uv.x =          7.0*a/3.1416;
      uv.y = -time+ sin(7.0*r+time) + .7*cos(time+7.0*a);

      //float w = .5+.5*(sin(time+7.0*r)+ .7*cos(time+7.0*a));

      vec3 col =  texture2D(tex0,uv*.5).xyz;

      gl_FragColor = vec4(col,1.0);
  }
  """
)


render = () ->
  # plasma.time.add( 0.01 );
  # 
  # context.cache.clear();
  # context.clear();
  # plasma.draw();
  
  plasma.time.add(0.01)
  kaleido.time.add(0.01)
  
  context.cache.clear()
  FBO.bind()
  context.clear()
  plasma.draw()
  FBO.unbind()
  kaleido.draw()


setInterval(render, 1000 / 30);

ctx.fillStyle = "rgba(0, 0, 200, 0.5)"
ctx.fillRect(30, 30, 55, 50)

img = new Image()
img.onload = () ->
  ctx.drawImage(img,0,0,1024,1024)
  myTex.init()
img.src = 'http://b.vimeocdn.com/ts/138/161/138161069_200.jpg'

myTex.init()