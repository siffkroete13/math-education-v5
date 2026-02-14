// src/render/Scene.js
"use strict";

/*

1) physics.update(dt)
   → Zustand ändert sich

2) Wandkollision korrigieren
   → Zustand leicht anpassen

3) Vertex-Array neu bauen
   → Zustand in Geometrie übersetzen

4) drawable.updatePositions()
   → GPU bekommt neue Daten

5) render()
   → GPU zeichnet


*/

import { Drawable } from "./Drawable.js";
import { Camera } from "./Camera.js";
import { CameraController } from "../controls/CameraController.js";
import { createPerspectiveProjection } from "./Projection.js";
import { PhysicsWorld } from "../physics/PhysicsWord.js";
import { WorldConfig } from "../config.js";

class Scene {

    constructor(canvas, gl, programInfo, unitSphere) {

        this.canvas = canvas;
        this.gl = gl;
        this.programInfo = programInfo;

        this.camera = new Camera();
        this.controller = new CameraController(this.camera, () => {});

        this.physics = new PhysicsWorld(WorldConfig.EXTENT);

        this.unitSphere = unitSphere;

        this.staticDrawables = [];
        this.dynamicDrawables = [];

        this.lastTime = 0;
    }

    addBody(body) {
        this.physics.add(body);
    }

    addStaticDrawable(d) {
        this.staticDrawables.push(d);
    }

    addDynamicDrawable(d) {
        this.dynamicDrawables.push(d);
    }

    start() {

        const loop = (time) => {

            const dt = (time - this.lastTime) * 0.001;
            this.lastTime = time;

            this.update(dt);
            this.render();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    update(dt) {

        this.physics.update(dt);

        const positions = [];

        for (const b of this.physics.bodies) {

            for (let i = 0; i < this.unitSphere.length; i += 3) {

                const ux = this.unitSphere[i];
                const uy = this.unitSphere[i + 1];
                const uz = this.unitSphere[i + 2];

                positions.push(
                    ux * b.radius + b.position.x,
                    uy * b.radius + b.position.y,
                    uz * b.radius + b.position.z
                );
            }
        }

        // wir haben nur EIN dynamic drawable
        if (this.dynamicDrawables.length > 0) {
            this.dynamicDrawables[0].updatePositions(positions);
        }
    }

    render() {

        const gl = this.gl;

        const projectionMatrix = createPerspectiveProjection(gl);
        const viewMatrix = this.camera.getViewMatrix();

        gl.clearColor(1,1,1,1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.cubeDrawable.draw(projectionMatrix, viewMatrix);
        this.sphereDrawable.draw(projectionMatrix, viewMatrix);
    }
}

export { Scene };
