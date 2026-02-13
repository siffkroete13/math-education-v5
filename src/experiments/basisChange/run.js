// src/experiments/basisChange/run.js
"use strict";

export function run(scene, state) {
  	// this.setup() kommt aus index.js (default export {setup, run})
  	// Weil nach const experiment = await loadExperiment("basisChange")
	//
  	// ist experiment === 	{
  	//                        	setup: [Function],
  	// 							run:   [Function]
	// 						}
	//
	// und wenn experiment.run(..) aufruft dann ist this = experiment innerhalb von der funktion run(..).
	// Das ist dynamische bindung von this, sehr mühsam in js!
	const data = this.setup();

	// WICHTIG: Experiment setzt NUR Bedeutung (State), nicht Rendering.
	state.setBasisA(data.basisA);
	state.setBasisB(data.basisB);
	state.setVector(data.vector);

	// Kein scene.render() hier!
	// Das passiert automatisch ueber state.notify() -> Listener.
}