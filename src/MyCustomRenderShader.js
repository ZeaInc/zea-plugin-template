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
uniform vec4 color;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

/* VS Outputs */
varying vec3 v_worldPos;
varying vec3 v_bboxPos;


<%include file="GLSLUtils.glsl"/>
<%include file="MyCustomGLSLHelpers.glsl"/>


out vec4 fragColor;

void main(void) {
  vec3 camPos = vec3(cameraMatrix[3][0], cameraMatrix[3][1], cameraMatrix[3][2]);
  vec3 ro = v_worldPos;
  vec3 rd = normalize(v_worldPos - camPos);
  
  // ray march 
  vec4 res = render( ro, rd );
  if(res.t < 0.0) {
    discard;
    return;
  }

  // Calculate frag depth
  vec4 fragPos = vec4(ro + res.t * rd, 1.0);

  float far=gl_DepthRange.far; float near=gl_DepthRange.near;
  vec4 eye_space_pos = viewMatrix * fragPos;
  vec4 clip_space_pos = projectionMatrix * eye_space_pos;
  
  float ndc_depth = clip_space_pos.z / clip_space_pos.w;
  float depth = (((far-near) * ndc_depth) + near + far) / 2.0;
  gl_FragDepth = depth;


  // gamma
  vec3 col = pow( res.rgb, vec3(0.4545) );
  fragColor = vec4( col, 1.0 );

  // fragColor = color;
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
