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
		vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;

        vec2 uv;
        uv.x = -(p.x * cos(angle) + p.y * sin(angle));
        uv.y = -p.x * sin(angle) + p.y * cos(angle);

        vec3 col = texture2D(tex0, uv + 0.5).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  explode: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

	uniform float zoom;

    void main(void)
    {
        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;

		float a = atan(p.y, p.x);
		float r = sqrt(dot(p, p));

        vec2 uv;
        uv.x = (r*cos(zoom+a))/(r);
        uv.y = (r*sin(zoom+a))/(r);

        vec3 col = texture2D(tex0, uv - 0.5).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  sphere: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

	uniform float zoom;

    void main(void)
    {
        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;

		float a = atan(p.y, p.x) + zoom;
		float r = sqrt(dot(p, p));
		float multiplier = 1.0 - pow(zoom-0.1, 1.0/(0.5 - r));

        vec2 uv;
		if (multiplier > 0.0) {
			uv.x = -p.x * multiplier;
			uv.y = p.y * multiplier;
		}
		else {
			uv.x = -p.x;
			uv.y = p.y;
		}

        vec3 col = texture2D(tex0, uv + 0.5).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  dihedral: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float amount;

    void main(void)
    {
        float divider = 3.1416/(amount*100.0);
        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;

		float a;
        if (((p.y < 0.0) && (p.x > 0.0)) || ((p.x < 0.0) && (p.y > 0.0)))
            a = abs(atan(p.x/p.y));
        else
            a = abs(atan(p.y/p.x));
        if (p.x < 0.0 && p.y >= 0.0 ) a += 3.1416/2.0;
        if (p.x < 0.0 && p.y < 0.0 ) a += 3.1416;
        if (p.x > 0.0 && p.y < 0.0 ) a += 3.1416*3.0/2.0;
	
		float r = sqrt(dot(p,p));
		
        vec2 uv;
		if (mod(floor(a/divider), 2.0) == 0.0) {
			a = mod(a, divider);
			uv.x = r * cos(a);
			uv.y = r * sin(a);
		}
		else {
			a = divider - mod(a, divider);
			uv.x = r * cos(a);
			uv.y = r * sin(a);
		}

        vec3 col = texture2D(tex0, uv).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
  spiral: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

	uniform float symmetry;
	uniform float twist;

    void main(void)
    {
        float divider = 3.1416/(2.0 + symmetry*50.0);
        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;

		float b = twist + 0.05;
		float a = 0.01;
		float angle = atan(p.y, p.x);
		float r = sqrt(dot(p,p));
		
		float period = 0.0;
		float newOne = 0.0;
		for (int i = 0; i < 1000; i++) {
			newOne = a*exp(b*(angle + period * 2.0 * 3.1416));
			period++;
			if (newOne > r) break;
		}
		
		float newZero = a*exp(b*(angle + (period - 2.0) * 2.0 * 3.1416));
		r = (r - newZero)/(newOne - newZero);
		
        vec2 uv;
		
		if (mod(floor(angle/divider), 2.0) == 0.0) {
			angle = mod(angle, divider);
			uv.x = r * cos(angle);
			uv.y = r * sin(angle);
		}
		else {
			angle = divider - mod(angle, divider);
			uv.x = r * cos(angle);
			uv.y = r * sin(angle);
		}
		
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
  distort: """
    #ifdef GL_ES
    precision highp float;
    #endif
    
    // based on 'Kaleidoscope' by iq (2009)
    // http://www.iquilezles.org/apps/shadertoy/

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float time;
    uniform float mousepos;

    void main(void)
    {
		vec2 mouse = vec2(mousepos*resolution.x, mousepos*resolution.y);
	    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	    vec2 m = -1.0 + 2.0 * mouse / resolution.xy;

	    float a1 = atan(p.y-m.y,p.x-m.x);
	    float r1 = sqrt(dot(p-m,p-m));
	    float a2 = atan(p.y+m.y,p.x+m.x);
	    float r2 = sqrt(dot(p+m,p+m));

	    vec2 uv;
	    uv.x = 0.5*time + (r1-r2)*0.25;
	    uv.y = sin(2.0*(a1-a2));

	    float w = r1*r2*0.8;
	    vec3 col = texture2D(tex0,uv).xyz;

	    gl_FragColor = vec4(col/(.1+w),1.0);
    }
    """
  gentleWave: """
    #ifdef GL_ES
    precision highp float;
    #endif
    

    uniform vec2 resolution;
    uniform sampler2D tex0;

	uniform float offset;
	uniform float colors;
	uniform float location;

    void main(void)
    {
    vec2 p = gl_FragCoord.xy / resolution.xy;
    float a = atan(p.y,p.x);
    float r = sqrt(dot(p,p));

    vec2 uv;
    uv.x = colors;
    uv.y = ( p.y - 0.06 * cos(111.0 * offset - 13.0 * p.x) - 0.05 * sin(9.0 * offset - 7.0 * p.x)) + 0.2 * location;
    //uv.y = p.y;

    vec3 col = texture2D(tex0,uv).xyz;

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
  madpatternP3M1: """
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 resolution;
    uniform sampler2D tex0;

    uniform float amount;

    void main(void)
    {
        float sixty = 3.1416/3.0;
        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;

		float a;
        if (((p.y < 0.0) && (p.x > 0.0)) || ((p.x < 0.0) && (p.y > 0.0)))
            a = abs(atan(p.x/p.y));
        else
            a = abs(atan(p.y/p.x));
        if (p.x < 0.0 && p.y >= 0.0 ) a += 3.1416/2.0;
        if (p.x < 0.0 && p.y < 0.0 ) a += 3.1416;
        if (p.x > 0.0 && p.y < 0.0 ) a += 3.1416*3.0/2.0;
	
		float r = sqrt(dot(p,p));
		
        vec2 uv;
		if (mod(floor(a/sixty), 2.0) == 0.0) {
			a = mod(a, sixty);
			uv.x = r * cos(a);
			uv.y = r * sin(a);
		}
		else {
			a = sixty - mod(a, sixty);
			uv.x = r * cos(a);
			uv.y = r * sin(a);
		}

        vec3 col = texture2D(tex0, uv).xyz;

        gl_FragColor = vec4(col,1.0);
    }
    """
}