window.filters = {}

addFilter = (name, code) ->
  # find uniform float parameters (via a regular expression on the shader code)
  defaults = {}
  re = /uniform float ([\d\w]*)/g
  while (myArray = re.exec(code)) != null
    defaults[myArray[1]] = 0.5
  
  window.filters[name] = {
    code: code,
    defaults: defaults
  }


addFilters = (filters) ->
  for name, code of filters
    addFilter(name, code)



addFilters {
  identity: """
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
  squareCrop: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    void main(void)
    {
        vec2 p = gl_FragCoord.xy / resolution.xy;
        vec2 uv;

		if (resolution.x > resolution.y) {
			float shift = (resolution.x - resolution.y)/2.0;
			if (gl_FragCoord.x < shift || gl_FragCoord.x + shift > resolution.y + shift * 2.0) {
				//uv.x = mod(gl_FragCoord.x/resolution.y, 1.0);
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				return;
			}
			else
				uv.x = (gl_FragCoord.x - shift)/resolution.y;
				
			uv.y = 1.0 - p.y;
		}
		else {
			if (gl_FragCoord.y > resolution.x) {
				//uv.y = mod(gl_FragCoord.y/resolution.x, 1.0);
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				return;
			}
			else
				uv.y = gl_FragCoord.y/resolution.x;
			
			uv.x = p.x;
		}

        vec3 col = texture2D(tex0, uv).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  rotate: """
    #ifdef GL_ES
    precision highp float;
    #endif

	uniform float amount;

    uniform vec2 resolution;
    uniform sampler2D tex0;

    void main(void)
    {
        float angle = amount*2.0*3.1416;
		vec2 p = gl_FragCoord.xy / resolution.xy;

        vec2 uv;
        uv.x = p.x * cos(angle) + (1.0 - p.y) * sin(angle);
        uv.y = -p.x * sin(angle) + (1.0 - p.y) * cos(angle);

		if (uv.x > 1.0) uv.x -= 1.0;
		if (uv.x < 0.0) uv.x += 1.0;
		if (uv.y > 1.0) uv.y -= 1.0;
		if (uv.y < 0.0) uv.y += 1.0;

        vec3 col = texture2D(tex0, uv).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  kaleido: """
    #ifdef GL_ES
    precision highp float;
    #endif
    
    // based on 'Kaleidoscope' by iq (2009)
    // http://www.iquilezles.org/apps/shadertoy/

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float sides;
    uniform float phase;

    void main(void)
    {
        vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
        vec2 uv;

        float a = atan(p.y,p.x);
        float r = sqrt(dot(p,p));

        float amount = (sides * 5.0) + 1.0;

        uv.x = amount*a/3.1416;
        uv.y = sin(amount*r+phase*6.2832) + .7*cos(amount*a+phase*6.2832);

        vec3 col =  texture2D(tex0,fract(uv)).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  tile: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float amount;

    void main(void)
    {
        vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;

        p = p * ((12.0 * amount) + 1.0);

        vec2 uv;
        uv.x = (p.x + 0.5);
        uv.y = (0.5 - p.y);

        vec3 col = texture2D(tex0, fract(uv)).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  mirrorH: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float phase;

    void main(void)
    {
        vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;

        vec2 uv;
        uv.x = abs(p.x) + phase / 2.0;
        uv.y = (0.5 - p.y);

        vec3 col = texture2D(tex0, fract(uv)).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  mirrorV: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float phase;

    void main(void)
    {
        vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;

        vec2 uv;
        uv.x = p.x + 0.5;
        uv.y = abs(p.y) + phase / 2.0;

        vec3 col = texture2D(tex0, fract(uv)).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  twist: """
    #ifdef GL_ES
    precision highp float;
    #endif
    
    // based on 'Twist' by iq (2009)
    // http://www.iquilezles.org/apps/shadertoy/
    
    uniform vec2 resolution;
    uniform sampler2D tex0;
    
    uniform float phase;
    uniform float amount;
    void main(void)
    {
        vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
        vec2 uv;

        float a = atan(p.y,p.x);
        float r = sqrt(dot(p,p));

        uv.x = r - phase;
        uv.y = cos(0.5*a + 3.0*r*(amount-0.5));

        vec3 col =  texture2D(tex0,fract(uv)).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  tunnel: """
    #ifdef GL_ES
    precision highp float;
    #endif
    
    // based on 'Tunnel' by iq (2009)
    // http://www.iquilezles.org/apps/shadertoy/

    uniform vec2 resolution;
    uniform sampler2D tex0;
    
    uniform float phase;

    void main(void)
    {
        vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
        vec2 uv;

        float a = atan(p.y,p.x);
        float r = sqrt(dot(p,p));

        uv.x = .1/r + phase;
        uv.y = a/3.1416;

        vec3 col =  texture2D(tex0,fract(uv)).xyz;

        gl_FragColor = vec4(col*r,1.0);
    }
    """
  metatile:   """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float amount;

    void main(void)
    {
        vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;

        vec2 uv;
        uv.x = (p.x + 0.5);
        uv.y = (0.5 - p.y);
        
        p = p * ((100.0 * amount) + 1.0);
        
        vec2 uv2;
        uv2.x = (p.x + 0.5);
        uv2.y = (0.5 - p.y);

        vec3 col = texture2D(tex0, uv).xyz;
        vec3 col2 = texture2D(tex0, fract(uv2)).xyz;

        gl_FragColor = vec4(col*amount+col2*(1.0-amount),1.0);
    }
    """
  madpatternPMM: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

	uniform float phasex;
	uniform float phasey;
    uniform float amount;

    void main(void)
    {
        float mult = 1.0 + amount*10.0;
        float sx = resolution.x/mult;
        float sy = resolution.y/mult;
        vec2 p = gl_FragCoord.xy / resolution.xy;

        vec2 uv;

        if (mod(floor(gl_FragCoord.x/sx), 2.0) == 0.0)
            uv.x = mod(phasex + mod(gl_FragCoord.x,sx)/sx, 1.0);
        else
            uv.x = mod(phasex + 1.0 - mod(gl_FragCoord.x,sx)/sx, 1.0);

        if (mod(floor(gl_FragCoord.y/sy), 2.0) == 0.0)
            uv.y = mod(phasey + mod(gl_FragCoord.y,sy)/sy, 1.0);
        else
            uv.y = mod(phasey + 1.0 - mod(gl_FragCoord.y,sy)/sy, 1.0);

        vec3 col = texture2D(tex0, uv).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  madpatternP4M: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float amount;

    void main(void)
    {
        float mult = 1.0 + amount*10.0;
        float sx = resolution.x/mult;
        float sy = resolution.y/mult;
        vec2 p = gl_FragCoord.xy / resolution.xy;

        vec2 uv, tile;

        if (mod(floor(gl_FragCoord.x/sx), 2.0) == 0.0)
            tile.x = mod(gl_FragCoord.x,sx)/sx;
        else
            tile.x = 1.0 - mod(gl_FragCoord.x,sx)/sx;

        if (mod(floor(gl_FragCoord.y/sy), 2.0) == 0.0)
            tile.y = mod(gl_FragCoord.y,sy)/sy;
        else
            tile.y = 1.0 - mod(gl_FragCoord.y,sy)/sy;

		if ( abs(atan(tile.y/tile.x)) < 3.1416/4.0 ) {
			uv.x = tile.x;
			uv.y = tile.y;
		}
		else {
			uv.x = tile.y;
			uv.y = tile.x;
		} 

        vec3 col = texture2D(tex0, uv).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
}