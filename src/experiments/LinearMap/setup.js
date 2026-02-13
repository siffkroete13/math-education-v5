// src/experiments/LinearMap/run.js
"use strict";

import { Basis } from "../../math/Basis.js";
import { Vector3 } from "../../math/Vector3.js";
import { Matrix3 } from "../../math/Matrix3.js";

export function setup(linearMapMatrix) {

    const basisA = Basis.standard();

    const basisB = Basis.standard().transform(linearMapMatrix); // ANZ_GRAD drehen

    const vector = new Vector3(3, 4, 0);

    const result = linearMapMatrix.multiplyVector(vector);

    return {
        basisA,
        basisB,
        vector,
        linearMapMatrix,
        result
    };
}