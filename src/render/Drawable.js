// src/render/Drawable.js
"use strict";

class Drawable {

    constructor(gl, programInfo, geometry) {

        this.gl = gl;
        this.programInfo = programInfo;
        this.geometry = geometry;

        const primitiveName = geometry.primitives?.toUpperCase();
        this.primitiveType =
            gl[primitiveName] !== undefined
                ? gl[primitiveName]
                : gl.TRIANGLES;

        this.vertexCount =
            geometry.num_vertices ??
            (geometry.positions.length / geometry.num_dim);
        
        
        this.numDim = geometry.num_dim ?? 3;
        this.numColor = geometry.num_color ?? 3;

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // Positions
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.geometry.positions),
            gl.DYNAMIC_DRAW   // 🔥 wichtig
        );

        // Colors
        if (this.geometry.colors) {
            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(this.geometry.colors),
                gl.STATIC_DRAW
            );
        }
    }

    // 🔥 NEU: Positionen aktualisieren ohne neuen Buffer
    updatePositions(newPositions) {
        const gl = this.gl;

        this.geometry.positions = newPositions;
        this.vertexCount = newPositions.length / 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(newPositions),
            gl.DYNAMIC_DRAW
        );
    }

    draw(projectionMatrix, viewMatrix) {
        const gl = this.gl;
        const prog = this.programInfo;

        gl.uniformMatrix4fv(
            prog.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );

        gl.uniformMatrix4fv(
            prog.uniformLocations.modelViewMatrix,
            false,
            viewMatrix
        );

        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            prog.attribLocations.vertexPosition,
            this.numDim,
            gl.FLOAT,
            false,
            0,
            0
        );
        
        gl.enableVertexAttribArray(
            prog.attribLocations.vertexPosition
        );

        // Color
        if (this.colorBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(
                prog.attribLocations.vertexColor,
                this.numColor,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(
                prog.attribLocations.vertexColor
            );
        }

        gl.drawArrays(
            this.primitiveType,
            0,
            this.vertexCount
        );
    }
}

export { Drawable };
