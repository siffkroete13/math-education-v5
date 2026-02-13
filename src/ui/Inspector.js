"use strict";

import { Vector3 } from "../math/Vector3.js";

export function bindInspector(state) {
    const vx = document.querySelector("#vx");
    const vy = document.querySelector("#vy");
    const vz = document.querySelector("#vz");
    
    // -----------------------------
    // READ SIDE: State → Inputs
    // -----------------------------
    state.onChange((s) => {
        if (!s.vector) return;

        // wichtig: nur setzen, nicht rechnen
        vx.value = s.vector.x;
        vy.value = s.vector.y;
        vz.value = s.vector.z;
    });

    // -----------------------------
    // WRITE SIDE: Inputs → State
    // -----------------------------
    function updateVectorFromInputs() {
        const x = parseFloat(vx.value);
        const y = parseFloat(vy.value);
        const z = parseFloat(vz.value);

        if ([x, y, z].some(Number.isNaN)) return;

        state.setVector(new Vector3(x, y, z));
    }



    vx.addEventListener("input", updateVectorFromInputs);
    vy.addEventListener("input", updateVectorFromInputs);
    vz.addEventListener("input", updateVectorFromInputs);

    // -----------------------------
    // SEMANTIC ACTION: Step Button
    // -----------------------------
    //
    // Semantic heisst hier: model-changing action oder auch: state-changing operation genannt
    const stepBtn = document.querySelector("#step");
    if (stepBtn) {
        stepBtn.onclick = () => {
            const v = state.vector;
            if (!v) return;
            state.setVector(new Vector3(v.x + 0.1, v.y, v.z));
        };
    }
}
