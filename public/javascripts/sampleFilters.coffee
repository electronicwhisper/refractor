window.filters = {
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
  kaleido: """
    #ifdef GL_ES
    precision highp float;
    #endif
    
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
        
        float amount = sides * 6.0;
        
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
}