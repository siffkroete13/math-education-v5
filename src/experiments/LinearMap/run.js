// src/experiments/LinearMap/run.js
"use strict";

export function run(state, linearMapMatrix) {

    const data = this.setup(linearMapMatrix);

    // NUR Bedeutung setzen
    state.setBasisA(data.basisA);
    state.setBasisB(data.basisB);

    state.setVector(data.vector);
    state.setMatrix(data.linearMapMatrix);
    state.setResultVector(data.result);
}
