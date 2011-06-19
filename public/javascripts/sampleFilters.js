(function() {
  window.filters = {
    identity: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nvoid main(void)\n{\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n    \n    vec2 uv;\n    uv.x = p.x;\n    uv.y = 1.0 - p.y;\n    \n    vec3 col = texture2D(tex0, uv).xyz;\n    \n    gl_FragColor = vec4(col,1.0);\n}",
    kaleido: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float sides;\nuniform float phase;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n    \n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n    \n    float amount = sides * 6.0;\n    \n    uv.x = amount*a/3.1416;\n    uv.y = sin(amount*r+phase*6.2832) + .7*cos(amount*a+phase*6.2832);\n    \n    vec3 col =  texture2D(tex0,fract(uv)).xyz;\n    \n    gl_FragColor = vec4(col,1.0);\n}",
    tile: "#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float amount;\n\nvoid main(void)\n{\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n    \n    p.x = fract(p.x * 64.0 * amount);\n    p.y = fract(p.y * 64.0 * amount);\n    \n    vec2 uv;\n    uv.x = p.x;\n    uv.y = 1.0 - p.y;\n    \n    vec3 col = texture2D(tex0, uv).xyz;\n    \n    gl_FragColor = vec4(col,1.0);\n}"
  };
}).call(this);
