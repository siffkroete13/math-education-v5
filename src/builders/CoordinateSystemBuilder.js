// src/builders/CoordinateSystemBuilder.js
"use strict";

export class CoordinateSystemBuilder {

   static build(basis, length = 1, tickStep = 1, tickSize = 0.05, color = [1,0,0,1]) {

        const positions = [];
        const colors = [];

        function pushLine(a, b, color) {
            positions.push(
                a.x, a.y, a.z,
                b.x, b.y, b.z
            );
            colors.push(...color, ...color);
        }

        const axes = [
            { dir: basis.e1, ortho: basis.e2, color: color },
            { dir: basis.e2, ortho: basis.e1, color: color },
            { dir: basis.e3, ortho: basis.e1, color: color },
        ];

        for (const { dir, ortho, color } of axes) {

            // Achse
            pushLine(
                {
                    x: -dir.x * length,
                    y: -dir.y * length,
                    z: -dir.z * length
                },
                {
                    x:  dir.x * length,
                    y:  dir.y * length,
                    z:  dir.z * length
                },
                color
            );

            // Ticks
            for (let t = -length; t <= length; t += tickStep) {
                if (t === 0) continue;

                const center = {
                    x: dir.x * t,
                    y: dir.y * t,
                    z: dir.z * t
                };

                const offset = {
                    x: ortho.x * tickSize,
                    y: ortho.y * tickSize,
                    z: ortho.z * tickSize
                };

                pushLine(
                    {
                        x: center.x - offset.x,
                        y: center.y - offset.y,
                        z: center.z - offset.z
                    },
                    {
                        x: center.x + offset.x,
                        y: center.y + offset.y,
                        z: center.z + offset.z
                    },
                    color
                );
            }
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