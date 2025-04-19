import {Material, Engine, Actor} from "excalibur";

export function createWhiteMaterial(engine: Engine): Material {
  const shaderSource = {
    fragmentSource: `#version 300 es
    precision mediump float;

    in vec2 v_uv;
    out vec4 fragColor;

    uniform vec2 u_graphic_resolution;
    uniform sampler2D u_graphic;

    // Inigo Quilez pixel-art UV snapping
    vec2 uv_iq(in vec2 uv, in vec2 texture_size) {
      vec2 pixel = uv * texture_size;
      vec2 seam = floor(pixel + 0.5);
      vec2 dudv = fwidth(pixel);
      pixel = seam + clamp((pixel - seam) / dudv, -0.5, 0.5);
      return pixel / texture_size;
    }

    void main() {
      vec2 newUv = uv_iq(v_uv, u_graphic_resolution);
      vec4 texColor = texture(u_graphic, newUv);

      if (texColor.a < 0.01) {
        discard; // respect alpha mask
      }

      fragColor = vec4(1.0, 1.0, 1.0, texColor.a);
    }
  `,
  };
  return engine.graphicsContext.createMaterial(shaderSource);
}

export const actorFlashWhite = (engine: Engine, actor : Actor, durationMs: number) => {
    actor.graphics.material = createWhiteMaterial(engine);
    engine.clock.schedule(() => {
      actor.graphics.material = null;
    }, durationMs); // flash for 100ms
}