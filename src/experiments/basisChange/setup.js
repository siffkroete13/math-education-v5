// src/experiments/basisChange/setup.js
"use strict";

import { Basis } from "../../math/Basis.js";
import { Vector3 } from "../../math/Vector3.js";

export function setup() {
  const basisA = Basis.standard();

  // schiefe Basis (nur Beispiel)
  const ANZ_GRAD = -20;
  const basisB = Basis.standard().rotateZ( (ANZ_GRAD / 180) * Math.PI); // ANZ_GRAD drehen


  const vector = new Vector3(7, 4, 0);

  return { basisA, basisB, vector };
}
