/**
 * @design-engineer/shaders - mountShader
 * Zero-dependency WebGL2 canvas runner for fullscreen fragment shaders.
 * Binds u_resolution, u_time, and a fullscreen clip-space quad.
 */

export interface ShaderMountInstance {
  canvas: HTMLCanvasElement;
  destroy: () => void;
  setUniform1f: (name: string, value: number) => void;
}

const VERTEX_SHADER_SRC = `#version 300 es
precision highp float;
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export function mountShader(
  canvas: HTMLCanvasElement,
  fragmentSource: string
): ShaderMountInstance {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    throw new Error('@design-engineer/shaders: WebGL2 context unsupported on this device.');
  }

  function createShader(type: number, src: string): WebGLShader {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, src);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      const err = gl!.getShaderInfoLog(shader);
      gl!.deleteShader(shader);
      throw new Error(`@design-engineer/shaders compilation error: ${err}`);
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fs = createShader(gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`@design-engineer/shaders link error: ${err}`);
  }

  gl.useProgram(program);

  const quadVertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uResLoc = gl.getUniformLocation(program, 'u_resolution');
  const uTimeLoc = gl.getUniformLocation(program, 'u_time');

  let rafId: number | null = null;
  const startTime = performance.now();
  let destroyed = false;

  function render(time: number) {
    if (destroyed || !gl) return;

    const w = canvas.clientWidth * window.devicePixelRatio;
    const h = canvas.clientHeight * window.devicePixelRatio;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    if (uResLoc) gl.uniform2f(uResLoc, canvas.width, canvas.height);
    if (uTimeLoc) gl.uniform1f(uTimeLoc, (time - startTime) * 0.001);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  return {
    canvas,
    destroy: () => {
      destroyed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
    setUniform1f: (name: string, value: number) => {
      const loc = gl.getUniformLocation(program, name);
      if (loc) gl.uniform1f(loc, value);
    }
  };
}
