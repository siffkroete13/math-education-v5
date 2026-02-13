// src/ui/LinearMapView.js
"use strict";

import { Vector3 } from "../math/Vector3.js";
import { Matrix3 } from "../math/Matrix3.js";

function cell(value, editable, onChange) {
    if (!editable) {
        return `<div class="cell">${value.toFixed(2)}</div>`;
    }
    return `<input class="cell" type="number" step="0.1" value="${value}"
        data-hook="edit">`;
}

export function bindLinearMapView(state) {

    const mDiv = document.getElementById("matrixA");
    const vDiv = document.getElementById("vectorV");
    const rDiv = document.getElementById("vectorR");

    state.onChange((s) => {
        if (!s.matrix || !s.vector || !s.resultVector) return;

        const is2D =
            s.matrix.m[0][2] === 0 &&
            s.matrix.m[1][2] === 0 &&
            s.matrix.m[2][0] === 0 &&
            s.matrix.m[2][1] === 0 &&
            s.matrix.m[2][2] === 1 &&
            s.vector.z === 0;

        // ---------- MATRIX ----------
        mDiv.innerHTML = "";

        const rows = is2D ? 2 : 3;
        const cols = is2D ? 2 : 3;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {

                const inp = document.createElement("input");
                inp.className = "cell";
                inp.type = "number";
                inp.step = "0.1";
                inp.value = s.matrix.m[row][col];

                inp.oninput = () => {

                    // Deep copy der 2D-Matrix
                    const newM = s.matrix.m.map(r => [...r]);

                    newM[row][col] = parseFloat(inp.value);

                    state.setMatrix(new Matrix3(newM));
                };

                mDiv.appendChild(inp);
            }

            mDiv.appendChild(document.createElement("br"));
        }

       // ---------- VECTOR ----------
        vDiv.innerHTML = "";

        const dims = is2D ? ["x", "y"] : ["x", "y", "z"];

        const inputs = [];

        dims.forEach((k) => {
            const inp = document.createElement("input");
            inp.className = "cell";
            inp.type = "number";
            inp.step = "0.1";
            inp.value = s.vector[k];

            inputs.push(inp);

            inp.oninput = () => {
                const x = parseFloat(inputs[0].value);
                const y = parseFloat(inputs[1].value);
                const z = is2D ? 0 : parseFloat(inputs[2].value);

                state.setVector(new Vector3(x, y, z));
            };


            vDiv.appendChild(inp);
            vDiv.appendChild(document.createElement("br"));
        });

        // ---------- RESULT ----------
        rDiv.innerHTML = "";
        dims.forEach((k) => {
            const d = document.createElement("div");
            d.className = "cell";
            d.textContent = s.resultVector[k].toFixed(2);
            rDiv.appendChild(d);
            rDiv.appendChild(document.createElement("br"));
        });
    });
}
