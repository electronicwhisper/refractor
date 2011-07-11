(function() {
  var addFilter, addFilters;
  window.filters = {};
  addFilter = function(name, code) {
    var defaults, myArray, re;
    defaults = {};
    re = /uniform float ([\d\w]*)/g;
    while ((myArray = re.exec(code)) !== null) {
      defaults[myArray[1]] = 0.5;
    }
    return window.filters[name] = {
      code: code,
      defaults: defaults
    };
  };
  addFilters = function(filters) {
    var code, name, _results;
    _results = [];
    for (name in filters) {
      code = filters[name];
      _results.push(addFilter(name, code));
    }
    return _results;
  };
  addFilters({
    identity: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nvoid main(void)\n{\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = p.x;\n    uv.y = 1.0 - p.y;\n\n    vec3 col = texture2D(tex0, uv).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    squareCrop: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\n    void main(void)\n    {\n        vec2 p = gl_FragCoord.xy / resolution.xy;\n        vec2 uv;\n\nif (resolution.x > resolution.y) {\n	float shift = (resolution.x - resolution.y)/2.0;\n	if (gl_FragCoord.x < shift || gl_FragCoord.x + shift > resolution.y + shift * 2.0) {\n		//uv.x = mod(gl_FragCoord.x/resolution.y, 1.0);\n		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n		return;\n	}\n	else\n		uv.x = (gl_FragCoord.x - shift)/resolution.y;\n		\n	uv.y = 1.0 - p.y;\n}\nelse {\n	if (gl_FragCoord.y > resolution.x) {\n		//uv.y = mod(gl_FragCoord.y/resolution.x, 1.0);\n		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n		return;\n	}\n	else\n		uv.y = gl_FragCoord.y/resolution.x;\n	\n	uv.x = p.x;\n}\n\n        vec3 col = texture2D(tex0, uv).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    rotate: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\nuniform float amount;\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\n    void main(void)\n    {\n        float angle = amount*2.0*3.1416;\n	vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;\n\n        vec2 uv;\n        uv.x = -(p.x * cos(angle) + p.y * sin(angle));\n        uv.y = -p.x * sin(angle) + p.y * cos(angle);\n\n        vec3 col = texture2D(tex0, uv + 0.5).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    explode: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\nuniform float zoom;\n\n    void main(void)\n    {\n        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;\n\n	float a = atan(p.y, p.x);\n	float r = sqrt(dot(p, p));\n\n        vec2 uv;\n        uv.x = (r*cos(zoom+a))/(r);\n        uv.y = (r*sin(zoom+a))/(r);\n\n        vec3 col = texture2D(tex0, uv - 0.5).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    sphere: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\nuniform float zoom;\n\n    void main(void)\n    {\n        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;\n\n	float a = atan(p.y, p.x) + zoom;\n	float r = sqrt(dot(p, p));\n	float multiplier = 1.0 - pow(zoom-0.1, 1.0/(0.5 - r));\n\n        vec2 uv;\n	if (multiplier > 0.0) {\n		uv.x = -p.x * multiplier;\n		uv.y = p.y * multiplier;\n	}\n	else {\n		uv.x = -p.x;\n		uv.y = p.y;\n	}\n\n        vec3 col = texture2D(tex0, uv + 0.5).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    dihedral: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\n    uniform float amount;\n\n    void main(void)\n    {\n        float divider = 3.146/(amount*100.0);\n        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;\n\n	float a;\n        if (((p.y < 0.0) && (p.x > 0.0)) || ((p.x < 0.0) && (p.y > 0.0)))\n            a = abs(atan(p.x/p.y));\n        else\n            a = abs(atan(p.y/p.x));\n        if (p.x < 0.0 && p.y >= 0.0 ) a += 3.146/2.0;\n        if (p.x < 0.0 && p.y < 0.0 ) a += 3.146;\n        if (p.x > 0.0 && p.y < 0.0 ) a += 3.146*3.0/2.0;\n\n	float r = sqrt(dot(p,p));\n	\n        vec2 uv;\n	if (mod(floor(a/divider), 2.0) == 0.0) {\n		a = mod(a, divider);\n		uv.x = r * cos(a);\n		uv.y = r * sin(a);\n	}\n	else {\n		a = divider - mod(a, divider);\n		uv.x = r * cos(a);\n		uv.y = r * sin(a);\n	}\n\n        vec3 col = texture2D(tex0, uv).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    kaleido: "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// based on 'Kaleidoscope' by iq (2009)\n// http://www.iquilezles.org/apps/shadertoy/\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float sides;\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    float amount = (sides * 5.0) + 1.0;\n\n    uv.x = amount*a/3.1416;\n    uv.y = sin(amount*r+phase*6.2832) + .7*cos(amount*a+phase*6.2832);\n\n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    distort: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n    \n    // based on 'Kaleidoscope' by iq (2009)\n    // http://www.iquilezles.org/apps/shadertoy/\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\n    uniform float time;\n    uniform float mousepos;\n\n    void main(void)\n    {\nvec2 mouse = vec2(mousepos*resolution.x, mousepos*resolution.y);\n	    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n	    vec2 m = -1.0 + 2.0 * mouse / resolution.xy;\n\n	    float a1 = atan(p.y-m.y,p.x-m.x);\n	    float r1 = sqrt(dot(p-m,p-m));\n	    float a2 = atan(p.y+m.y,p.x+m.x);\n	    float r2 = sqrt(dot(p+m,p+m));\n\n	    vec2 uv;\n	    uv.x = 0.5*time + (r1-r2)*0.25;\n	    uv.y = sin(2.0*(a1-a2));\n\n	    float w = r1*r2*0.8;\n	    vec3 col = texture2D(tex0,uv).xyz;\n\n	    gl_FragColor = vec4(col/(.1+w),1.0);\n    }",
    tile: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float amount;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    p = p * ((12.0 * amount) + 1.0);\n\n    vec2 uv;\n    uv.x = (p.x + 0.5);\n    uv.y = (0.5 - p.y);\n\n    vec3 col = texture2D(tex0, fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    mirrorH: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = abs(p.x) + phase / 2.0;\n    uv.y = (0.5 - p.y);\n\n    vec3 col = texture2D(tex0, fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    mirrorV: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = p.x + 0.5;\n    uv.y = abs(p.y) + phase / 2.0;\n\n    vec3 col = texture2D(tex0, fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    twist: "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// based on 'Twist' by iq (2009)\n// http://www.iquilezles.org/apps/shadertoy/\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\nuniform float amount;\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    uv.x = r - phase;\n    uv.y = cos(0.5*a + 3.0*r*(amount-0.5));\n\n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    tunnel: "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// based on 'Tunnel' by iq (2009)\n// http://www.iquilezles.org/apps/shadertoy/\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    uv.x = .1/r + phase;\n    uv.y = a/3.1416;\n\n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n\n    gl_FragColor = vec4(col*r,1.0);\n}",
    metatile: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float amount;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = (p.x + 0.5);\n    uv.y = (0.5 - p.y);\n    \n    p = p * ((100.0 * amount) + 1.0);\n    \n    vec2 uv2;\n    uv2.x = (p.x + 0.5);\n    uv2.y = (0.5 - p.y);\n\n    vec3 col = texture2D(tex0, uv).xyz;\n    vec3 col2 = texture2D(tex0, fract(uv2)).xyz;\n\n    gl_FragColor = vec4(col*amount+col2*(1.0-amount),1.0);\n}",
    madpatternPMM: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\nuniform float phasex;\nuniform float phasey;\n    uniform float amount;\n\n    void main(void)\n    {\n        float mult = 1.0 + amount*10.0;\n        float sx = resolution.x/mult;\n        float sy = resolution.y/mult;\n        vec2 p = gl_FragCoord.xy / resolution.xy;\n\n        vec2 uv;\n\n        if (mod(floor(gl_FragCoord.x/sx), 2.0) == 0.0)\n            uv.x = mod(phasex + mod(gl_FragCoord.x,sx)/sx, 1.0);\n        else\n            uv.x = mod(phasex + 1.0 - mod(gl_FragCoord.x,sx)/sx, 1.0);\n\n        if (mod(floor(gl_FragCoord.y/sy), 2.0) == 0.0)\n            uv.y = mod(phasey + mod(gl_FragCoord.y,sy)/sy, 1.0);\n        else\n            uv.y = mod(phasey + 1.0 - mod(gl_FragCoord.y,sy)/sy, 1.0);\n\n        vec3 col = texture2D(tex0, uv).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    madpatternP4M: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\n    uniform float amount;\n\n    void main(void)\n    {\n        float mult = 1.0 + amount*10.0;\n        float sx = resolution.x/mult;\n        float sy = resolution.y/mult;\n        vec2 p = gl_FragCoord.xy / resolution.xy;\n\n        vec2 uv, tile;\n\n        if (mod(floor(gl_FragCoord.x/sx), 2.0) == 0.0)\n            tile.x = mod(gl_FragCoord.x,sx)/sx;\n        else\n            tile.x = 1.0 - mod(gl_FragCoord.x,sx)/sx;\n\n        if (mod(floor(gl_FragCoord.y/sy), 2.0) == 0.0)\n            tile.y = mod(gl_FragCoord.y,sy)/sy;\n        else\n            tile.y = 1.0 - mod(gl_FragCoord.y,sy)/sy;\n\nif ( abs(atan(tile.y/tile.x)) < 3.1416/4.0 ) {\n	uv.x = tile.x;\n	uv.y = tile.y;\n}\nelse {\n	uv.x = tile.y;\n	uv.y = tile.x;\n} \n\n        vec3 col = texture2D(tex0, uv).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }",
    madpatternP3M1: "    #ifdef GL_ES\n    precision highp float;\n    #endif\n\n    uniform vec2 resolution;\n    uniform sampler2D tex0;\n\n    uniform float amount;\n\n    void main(void)\n    {\n        float sixty = 3.146/3.0;\n        vec2 p = 0.5 - gl_FragCoord.xy / resolution.xy;\n\n	float a;\n        if (((p.y < 0.0) && (p.x > 0.0)) || ((p.x < 0.0) && (p.y > 0.0)))\n            a = abs(atan(p.x/p.y));\n        else\n            a = abs(atan(p.y/p.x));\n        if (p.x < 0.0 && p.y >= 0.0 ) a += 3.146/2.0;\n        if (p.x < 0.0 && p.y < 0.0 ) a += 3.146;\n        if (p.x > 0.0 && p.y < 0.0 ) a += 3.146*3.0/2.0;\n\n	float r = sqrt(dot(p,p));\n	\n        vec2 uv;\n	if (mod(floor(a/sixty), 2.0) == 0.0) {\n		a = mod(a, sixty);\n		uv.x = r * cos(a);\n		uv.y = r * sin(a);\n	}\n	else {\n		a = sixty - mod(a, sixty);\n		uv.x = r * cos(a);\n		uv.y = r * sin(a);\n	}\n\n        vec3 col = texture2D(tex0, uv).xyz;\n\n        gl_FragColor = vec4(col,1.0);\n    }"
  });
}).call(this);
