// src/builders/CubeWireframeBuilder.js
"use strict";

/**
 * Erzeugt einen drahtgitter-Würfel (Wireframe)
 * symmetrisch um den Ursprung.
 *
 * Der Würfel dient als visuelle Raumreferenz.
 */
export class CubeWireframeBuilder {

	static build(size = 1) {

		const s = size;

		// 8 Ecken des Würfels
		const v = [
		[-s, -s, -s],
		[ s, -s, -s],
		[ s,  s, -s],
		[-s,  s, -s],
		[-s, -s,  s],
		[ s, -s,  s],
		[ s,  s,  s],
		[-s,  s,  s],
		];

		// Kanten (jeweils 2 Eckpunkte)
		const edges = [
			[0,1],[1,2],[2,3],[3,0], // unten
			[4,5],[5,6],[6,7],[7,4], // oben
			[0,4],[1,5],[2,6],[3,7]  // vertikal
		];

		const positions = [];
		const colors = [];

		for (const [a, b] of edges) {
			positions.push(...v[a], ...v[b]);

			// Grau, leicht transparent
			colors.push(
				0.7, 0.7, 0.7, 1,
				0.7, 0.7, 0.7, 1
			);
		}

		
		return {
			primitives: "LINES",
			num_dim: 3,
			num_color: 4,
			num_vertices: positions.length / 3,
			positions,
			colors
		};
	}
}