// src/builders/VectorBuilder.js
export class VectorBuilder {

  static build(vector, options = {}) {

    const { color = [0, 0, 0, 1], scale = 1 } = options;

    const positions = [
      0, 0, 0,
      vector.x * scale,
      vector.y * scale,
      vector.z * scale
    ];

    const colors = [
      ...color,
      ...color
    ];

    return {
      primitives: "LINES",
      num_dim: 3,
      num_color: 4,
      num_vertices: 2,
      positions,
      colors
    };
  }
}