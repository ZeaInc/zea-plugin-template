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
attribute vec3 normals;
attribute vec2 texCoords;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="MyCustomGLSLHelpers.glsl"/>


/* VS Outputs */
varying float v_curveIndexWithinLoop;
varying float v_gradient;

void main(void) {
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;

  vec4 viewPos    = modelViewMatrix * positions;
  gl_Position     = projectionMatrix * viewPos;
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

<%include file="GLSLUtils.glsl"/>

uniform int flatten;

/* VS Outputs */
varying float v_curveIndexWithinLoop;
varying float v_gradient;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif
    
#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
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
