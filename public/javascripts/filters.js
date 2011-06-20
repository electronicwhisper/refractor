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
    kaleido: "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// based on 'Kaleidoscope' by iq (2009)\n// http://www.iquilezles.org/apps/shadertoy/\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float sides;\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    float amount = sides * 6.0;\n\n    uv.x = amount*a/3.1416;\n    uv.y = sin(amount*r+phase*6.2832) + .7*cos(amount*a+phase*6.2832);\n\n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    tile: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float amount;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    p = p * 12.0 * amount;\n\n    vec2 uv;\n    uv.x = (p.x + 0.5);\n    uv.y = (0.5 - p.y);\n\n    vec3 col = texture2D(tex0, fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    mirrorH: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = abs(p.x) + phase / 2.0;\n    uv.y = (0.5 - p.y);\n\n    vec3 col = texture2D(tex0, fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    mirrorV: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = p.x + 0.5;\n    uv.y = abs(p.y) + phase / 2.0;\n\n    vec3 col = texture2D(tex0, fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    twist: "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// based on 'Twist' by iq (2009)\n// http://www.iquilezles.org/apps/shadertoy/\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\nuniform float amount;\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    uv.x = r - phase;\n    uv.y = cos(0.5*a + 3.0*r*(amount-0.5));\n\n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}",
    tunnel: "#ifdef GL_ES\nprecision highp float;\n#endif\n\n// based on 'Tunnel' by iq (2009)\n// http://www.iquilezles.org/apps/shadertoy/\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    uv.x = .1/r + phase;\n    uv.y = a/3.1416;\n\n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n\n    gl_FragColor = vec4(col*r,1.0);\n}",
    metatile: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float amount;\n\nvoid main(void)\n{\n    vec2 p = -0.5 + gl_FragCoord.xy / resolution.xy;\n\n    vec2 uv;\n    uv.x = (p.x + 0.5);\n    uv.y = (0.5 - p.y);\n    \n    p = p * 100.0 * amount;\n    \n    vec2 uv2;\n    uv2.x = p.x;\n    uv2.y = 1.0 - p.y;\n\n    vec3 col = texture2D(tex0, uv).xyz;\n    vec3 col2 = texture2D(tex0, fract(uv2)).xyz;\n\n    gl_FragColor = vec4(col*amount+col2*(1.0-amount),1.0);\n}"
  });
}).call(this);
