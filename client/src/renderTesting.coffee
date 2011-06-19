###
TESTING
###

canvas = render.init()
document.getElementById( 'container' ).appendChild(canvas)

kaleido = render.makeFilter """
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform vec2 resolution;
  uniform sampler2D tex0;
  uniform float time;
  uniform float tester;

  void main(void)
  {
      vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
      vec2 uv;

      float a = atan(p.y,p.x);
      float r = sqrt(dot(p,p));

      uv.x =          7.0*a/3.1416;
      uv.y = -time+ sin(7.0*r+time) + .7*cos(time+7.0*a);

      //float w = .5+.5*(sin(time+7.0*r)+ .7*cos(time+7.0*a));

      vec3 col =  texture2D(tex0,fract(uv*.5)).xyz;

      gl_FragColor = vec4(col,1.0);
  }
  """



identity = render.makeFilter """
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform vec2 resolution;
  uniform sampler2D tex0;

  void main(void)
  {
      vec2 p = gl_FragCoord.xy / resolution.xy;
      
      vec2 uv;
      uv.x = p.x;
      uv.y = 1.0 - p.y;
      
      vec3 col = texture2D(tex0, uv).xyz;
      
      gl_FragColor = vec4(col,1.0);
  }
  """



tile = render.makeFilter """
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform vec2 resolution;
  uniform sampler2D tex0;
  
  uniform float amount;

  void main(void)
  {
      vec2 p = gl_FragCoord.xy / resolution.xy;
      
      p.x = fract(p.x * 64.0 * amount);
      p.y = fract(p.y * 64.0 * amount);
      
      vec2 uv;
      uv.x = p.x;
      uv.y = 1.0 - p.y;
      
      vec3 col = texture2D(tex0, uv).xyz;
      
      gl_FragColor = vec4(col,1.0);
  }
  """




render.setPipeline("sample.png", identity, identity, kaleido)

setInterval(render.render, 1000 / 30);