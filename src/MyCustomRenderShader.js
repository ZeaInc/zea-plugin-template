import { GLShader, shaderLibrary } from '@zeainc/zea-engine'

/** Class representing a GL draw trim curve strips shader.
 * @extends GLShader
 * @ignore
 */
class MyCustomRenderShader extends GLShader {
  /**
   * Create a GL draw trim curve strips shader.
   * @param {any} gl - The gl value.
   */
  constructor(gl) {
    super(gl)

    this.setShaderStage(
      'VERTEX_SHADER',
      `
precision highp float;

attribute vec4 positions;

uniform vec3 boxSize;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;


/* VS Outputs */
varying vec3 v_worldPos;
varying vec3 v_bboxPos;

void main(void) {
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  vec4 pos = positions * vec4(boxSize, 1.0);

  vec4 viewPos    = modelViewMatrix * pos;
  
  v_worldPos = (modelMatrix * pos).xyz;
  v_bboxPos = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  gl_Position     = projectionMatrix * viewPos;
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;


uniform mat4 cameraMatrix;

uniform vec3 boxSize;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

#if defined(DRAW_COLOR)
uniform vec4 color;
#elif defined(DRAW_GEOMDATA)
uniform int passId;
uniform int itemId;
#elif defined(DRAW_HIGHLIGHT)
uniform vec4 highlightColor;
#endif

/* VS Outputs */
varying vec3 v_worldPos;
varying vec3 v_bboxPos;


<%include file="GLSLUtils.glsl"/>
<%include file="MyCustomGLSLHelpers.glsl"/>

vec4 render(vec3 ro, vec3 rd) {
  vec2 res = castRay(ro, rd);
  float t = res.x;
  float m = res.y;

  if (m > -0.5) {
    vec3 pos = ro + t * rd;
#if defined(DRAW_COLOR)

    vec3 nor = calcNormal(pos);

    // material
    vec3 col = color.rgb;

    // lighitng
    float occ = 1.0;// calcAO(pos, nor);
    vec3 lig = -rd;
    float amb = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);
    float dif = clamp(dot(nor, lig), 0.0, 1.0);

    float fre = pow(clamp(1.0 + dot(nor, rd), 0.0, 1.0), 2.0);

    vec3 ref = reflect(rd, nor);
    float spe = pow(clamp(dot(ref, lig), 0.0, 1.0), 100.0);

    // dif *= softshadow(pos, lig, 0.02, 2.5);

    vec3 brdf = vec3(0.0);
    brdf += 1.20 * dif * vec3(1.00, 0.90, 0.60);
    brdf += 1.20 * spe * vec3(1.00, 0.90, 0.60) * dif;

    // Additional specular lighting trick,
    // taken from "Wet stone" by TDM
    // https://www.shadertoy.com/view/ldSSzV
    nor = normalize(nor - normalize(pos) * 0.2);
    ref = reflect(rd, nor);
    spe = pow(clamp(dot(ref, lig), 0.0, 1.0), 100.0);
    brdf += 2.20 * spe * vec3(1.00, 0.90, 0.60) * dif;

    brdf += 0.40 * amb * vec3(0.50, 0.70, 1.00) * occ;
    brdf += 0.40 * fre * vec3(1.00, 1.00, 1.00) * occ;

    col = col * brdf;

    // col = mix(col, vec3(0.0), 1.0 - exp(-0.005 * t * t));
    return vec4(vec3(clamp(col, 0.0, 1.0)), t);

#else
    return vec4(vec3(0.0), t);
#endif
  }
  
  return vec4(vec3(0.0), -1.0);
}


out vec4 fragColor;

void main(void) {
  vec3 camPos = vec3(cameraMatrix[3][0], cameraMatrix[3][1], cameraMatrix[3][2]);
  vec3 ro = v_worldPos;
  vec3 rd = normalize(v_worldPos - camPos);
  
  // ray march 
  vec4 res = render( ro, rd );
  float t = res.a;
  if(t < 0.0) {
    discard;
    return;
  }

  // Calculate frag depth
  vec4 fragPos = vec4(ro + t * rd, 1.0);

  float far=gl_DepthRange.far; float near=gl_DepthRange.near;
  vec4 eye_space_pos = viewMatrix * fragPos;
  vec4 clip_space_pos = projectionMatrix * eye_space_pos;
  
  float ndc_depth = clip_space_pos.z / clip_space_pos.w;
  float depth = (((far-near) * ndc_depth) + near + far) / 2.0;
  gl_FragDepth = depth;

  // the shader can be compiled in 3 different modes. 
  // In 'DRAW_COLOR' mode the final pixel color is output to the fragment.
#if defined(DRAW_COLOR)
  // gamma
  vec3 col = pow( res.rgb, vec3(0.4545) );
  fragColor = vec4( col, 1.0 );
#elif defined(DRAW_GEOMDATA)
  // The Geom Data buffer is an offscreen buffer that stores identifying 
  // information in each pixel for the geometry rasterized to that pixel.
  // The Viewport queries this buffer to detect pointer interactions. 
  // The red channel stores the pass id, which tells the Viewport which 
  // pass to call  getGeomItemAndDist.
  // The pass can decide what to pack in the other 3 pixels to identify 
  // the drawn geometry, and also the distance to the rendered fragment.
  fragColor.r = float(passId); 
  fragColor.g = float(itemId);
  fragColor.b = 0.0;// spare: store some other useful data
  fragColor.a = length(camPos - fragPos.xyz);
#elif defined(DRAW_HIGHLIGHT)

  fragColor = highlightColor;

#endif
}
`
    )
  }

  static getParamDeclarations() {
    return [
      {
        name: 'BaseColor',
        defaultValue: new Color(1.0, 1.0, 0.5),
      },
      { name: 'Opacity', defaultValue: 1.0, range: [0, 1] },
      {
        name: 'EmissiveStrength',
        defaultValue: 0.0,
        range: [0, 1],
      },
    ]
  }
}

export { MyCustomRenderShader }
