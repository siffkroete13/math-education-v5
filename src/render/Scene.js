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

        this.isRunning = false;
        this.animationId = null;
    }

    addBody(body) {
        this.physics.addBody(body);
    }

    addStaticDrawable(d) {
        this.staticDrawables.push(d);
    }

    addDynamicDrawable(d) {
        this.dynamicDrawables.push(d);
    }

    start() {

        if (this.isRunning) return; // verhindert doppelte Loops

        this.isRunning = true;

        const loop = (time) => {

            if (!this.isRunning) return;

            const dt = (time - this.lastTime) * 0.001;
            this.lastTime = time;

            this.update(dt);
            this.render();

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    stop() {

        this.isRunning = false;

        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    update(dt) {
        // console.log("Bodies:", this.physics.bodies.length);
       

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

        // console.log("Vertices:", positions.length);

        // wir haben nur EIN dynamic drawable
        if (this.dynamicDrawables.length > 0) {
            for(let i = 0; i < this.dynamicDrawables.length; ++i) {
                this.dynamicDrawables[i].updatePositions(positions);
            }
        }
    }

    render() {

        const gl = this.gl;

        const projectionMatrix = createPerspectiveProjection(gl);
        const viewMatrix = this.camera.getViewMatrix();

        gl.clearColor(1,1,1,1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.staticDrawables.length > 0) {
            for(let i = 0; i < this.dynamicDrawables.length; ++i) {
                this.dynamicDrawables[i].draw(projectionMatrix, viewMatrix);
            }
        }

        if (this.dynamicDrawables.length > 0) {
            for(let i = 0; i < this.dynamicDrawables.length; ++i) {
                this.staticDrawables[i].draw(projectionMatrix, viewMatrix);
            }
        }
    }
}

export { Scene };
