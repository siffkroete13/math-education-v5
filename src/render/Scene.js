// src/render/Scene.js
"use strict";

import { Drawable } from "./Drawable.js";
import { Camera } from "./Camera.js";
import { CameraController } from "../controls/CameraController.js";
import { createPerspectiveProjection } from "./Projection.js";

class Scene {

    constructor(canvas, gl, programInfo) {

        this.canvas = canvas;
        this.gl = gl;
        this.programInfo = programInfo;

        this.gl.useProgram(this.programInfo.program);

        this.camera = new Camera();
        this.drawables = [];

        this.controller = new CameraController(
            this.camera,
            () => {}   // 🔥 kein render hier mehr
        );

        this.lastTime = 0;
    }

    addGeometry(geometry) {
        const drawable = new Drawable(this.gl, this.programInfo, geometry);
        this.drawables.push(drawable);
        return drawable;
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
        // hier könntest du später Animationen einbauen
    }

    render() {
        const gl = this.gl;

        const projectionMatrix = createPerspectiveProjection(gl);
        const viewMatrix = this.camera.getViewMatrix();

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (const drawable of this.drawables) {
            drawable.draw(projectionMatrix, viewMatrix);
        }
    }
}

export { Scene };
