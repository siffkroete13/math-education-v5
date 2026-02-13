// src/builders/CubeBuilder.js
"use strict";

/**
 * CubeBuilder
 * -----------
 * Erzeugt die Geometrie (LINES) eines Würfels aus expliziter Mathematik.
 *
 * - KEIN WebGL
 * - KEINE Shader
 * - KEINE Kamera
 * - NUR: Vektoren → Geometrie
 */
export class CubeBuilder {

  /**
   * center: { x, y, z }
   * size: Kantenlänge
   */
  static build(center = { x: 0, y: 0, z: 0 }, size = 2) {

    const h = size / 2;

    // 8 Eckpunkte
    const v = {
      lbf: [-h, -h, -h],
      rbf: [ h, -h, -h],
      ltf: [-h,  h, -h],
      rtf: [ h,  h, -h],

      lbb: [-h, -h,  h],
      rbb: [ h, -h,  h],
      ltb: [-h,  h,  h],
      rtb: [ h,  h,  h]
    };

    // Kanten
    const edges = [
      v.lbf, v.rbf,  v.rbf, v.rtf,  v.rtf, v.ltf,  v.ltf, v.lbf,
      v.lbb, v.rbb,  v.rbb, v.rtb,  v.rtb, v.ltb,  v.ltb, v.lbb,
      v.lbf, v.lbb,  v.rbf, v.rbb,  v.ltf, v.ltb,  v.rtf, v.rtb
    ];

    const positions = [];
    for (const p of edges) {
      positions.push(
        p[0] + center.x,
        p[1] + center.y,
        p[2] + center.z
      );
    }

    // ✅ WICHTIG: vec4-Farben
    const colors = [];
    for (let i = 0; i < positions.length / 3; i++) {
      colors.push(0.2, 0.2, 0.2, 1.0);
    }

    return {
      primitives: "LINES",
      num_dim: 3,
      num_color: 4,          // ← DAS war der Killer
      num_vertices: positions.length / 3,
      positions,
      colors
    };
  }
}
