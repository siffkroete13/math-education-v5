// src/experiments/loadExperiment.js
"use strict";

export function loadExperiment(name) {
    switch (name) {
        case "basisChange":
        return import("./"+name+"/index.js").then((m) => m.default);
        break
        case "linearMap":
        return import("./"+name+"/index.js").then((m) => m.default);
        break
        default:
        return Promise.reject(new Error("Unbekanntes Experiment: " + name));
    }
}