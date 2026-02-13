// src/render/Scene.js
"use strict";

import { Drawable } from "./Drawable.js";
import { Camera } from "./Camera.js";
import { CameraController } from "../controls/CameraController.js";
import { createPerspectiveProjection } from "./Projection.js";

/**
 * Scene
 * -----
 * Orchestriert das Rendern.
 *
 * Verantwortung:
 * - besitzt den WebGL-Kontext
 * - besitzt das Shader-Programm (programInfo)
 * - hält Drawables (GPU-Repräsentationen von Geometrie)
 * - benutzt Kamera (View-Matrix)
 * - benutzt Projektion (Projection-Matrix)
 *
 * Bewusst NICHT hier:
 * - Shader laden
 * - Shader kompilieren
 * - fetch / Dateipfade
 * - Geometrie-Erzeugung
 * - Lineare Algebra (außer Übergabe von Matrizen)
 */
class Scene {
    constructor(canvas, gl, programInfo, geometries) {

        // -------------------------------------------------------------------------
        // Kontext
        // -------------------------------------------------------------------------
        this.canvas = canvas;
        this.gl = gl;
        
        // -------------------------------------------------------------------------
        // Shader-Programm (fertig übergeben!)
        // -------------------------------------------------------------------------
        this.programInfo = programInfo;
        this.gl.useProgram(this.programInfo.program);

        // -------------------------------------------------------------------------
        // Kamera (View)
        // -------------------------------------------------------------------------
        this.camera = new Camera();

        // -------------------------------------------------------------------------
        // Drawables (GPU-Objekte)
        // -------------------------------------------------------------------------
        this.drawables = [];
       
        if(geometries) {
            for (const key of Object.keys(geometries)) {
                this.drawables.push(
                    new Drawable(this.gl, this.programInfo, geometries[key])
                );
            }
        }

        this.controller = new CameraController(
            this.camera,
            () => this.render()
        );
    }


    // -------------------------------------------------------------------------
    // Add Drawables (GPU-Objekte)
    // -------------------------------------------------------------------------
    addGeometry(geometrie) {
        this.drawables.push(new Drawable(this.gl, this.programInfo, geometrie));
    }


    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    render() {
        const gl = this.gl;
        
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Projektion (Frustum → Clip Space)
        const projectionMatrix = createPerspectiveProjection(gl);

        // View (Welt → Kamera)
        const viewMatrix = this.camera.getViewMatrix();

        // Clear
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw Calls
        for (const drawable of this.drawables) {
            drawable.draw(projectionMatrix, viewMatrix);
        }
    }

    clear() {
        // WICHTIG: logische Szene leeren (Drawables entfernen)
        this.drawables = [];

        // Bildschirm leeren (nur visuell)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}

export { Scene };
