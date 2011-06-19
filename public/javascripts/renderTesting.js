(function() {
  /*
  TESTING
  */  var canvas, identity, kaleido, t, tile;
  canvas = render.init();
  document.getElementById('container').appendChild(canvas);
  kaleido = render.makeFilter("#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\nuniform float time;\nuniform float tester;\n\nvoid main(void)\n{\n    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;\n    vec2 uv;\n\n    float a = atan(p.y,p.x);\n    float r = sqrt(dot(p,p));\n\n    uv.x =          7.0*a/3.1416;\n    uv.y = -time+ sin(7.0*r+time) + .7*cos(time+7.0*a);\n\n    //float w = .5+.5*(sin(time+7.0*r)+ .7*cos(time+7.0*a));\n\n    vec3 col =  texture2D(tex0,fract(uv*.5)).xyz;\n\n    gl_FragColor = vec4(col,1.0);\n}");
  identity = render.makeFilter("#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nvoid main(void)\n{\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n    \n    vec2 uv;\n    uv.x = p.x;\n    uv.y = 1.0 - p.y;\n    \n    vec3 col = texture2D(tex0, uv).xyz;\n    \n    gl_FragColor = vec4(col,1.0);\n}");
  tile = render.makeFilter("#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 resolution;\nuniform sampler2D tex0;\n\nuniform float amount;\n\nvoid main(void)\n{\n    vec2 p = gl_FragCoord.xy / resolution.xy;\n    \n    p.x = fract(p.x * 64.0 * amount);\n    p.y = fract(p.y * 64.0 * amount);\n    \n    vec2 uv;\n    uv.x = p.x;\n    uv.y = 1.0 - p.y;\n    \n    vec3 col = texture2D(tex0, uv).xyz;\n    \n    gl_FragColor = vec4(col,1.0);\n}");
  render.setPipeline("images/textures/sample.png", identity, identity, kaleido);
  render.setResolution(window.innerWidth, window.innerHeight);
  console.log(render.getParameters(3));
  render.setParameters(3, {
    time: 0
  });
  t = 0;
  setInterval(function() {
    render.setParameters(3, {
      time: t += 0.01
    });
    return render.render();
  }, 1000 / 30);
}).call(this);
