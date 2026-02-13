// src/state/MathState.js
"use strict";

import { Basis } from "../math/Basis.js";

export class MathState {
    constructor() {
        this.basisA = null;
        this.basisB = null;
        this.vector = null;
        this.matrix = null;
        this.resultVector = null;

        this.listeners = [];
    }

    onChange(fn) {
        this.listeners.push(fn);
    }

    notify() {
        for (const fn of this.listeners) {
            fn(this);
        }
    }

    setBasisA(basis) {
        this.basisA = basis;
        this.notify();
    }

    setBasisB(basis) {
        this.basisB = basis;
        this.notify();
    }

    setVector(v) {
        this.vector = v;

        // 🔥 HIER die Abbildung
        if (this.matrix) {
            this.resultVector = this.matrix.multiplyVector(v);
        }

        this.notify();
    }

    setMatrix(m) {
        this.matrix = m;

        // 🔥 BasisB aktualisieren
        this.basisB = Basis.standard().transform(m);
        // oder:
        // this.basisB = Basis.fromMatrix(m);

        if (this.vector) {
            this.resultVector = m.multiplyVector(this.vector);
        }

        this.notify();
    }
    
    setResultVector(v) {
        this.resultVector = v;
        this.notify();
    }
}
