/*
Mathematik
  ↓
Koordinatensystem / Vektoren / Basen
  ↓
GeometryBuilder (Übersetzer)
  ↓
Geometry (positions, colors)
  ↓
Model_VOB (WebGL / GPU)
  ↓
Shader → Pixel



ARCHITEKTURÜBERSICHT – MATHE / GEOMETRIE / RENDERING

Dieses Projekt ist bewusst didaktisch aufgebaut.
Ziel ist nicht „Engine-Benutzung“, sondern Verstehen:
Vektoren, Matrizen, Räume, Projektion, Pixel.

---------------------------------------------------
1) MATHE (src/math)
---------------------------------------------------
Hier lebt die Bedeutung.

- Vektoren
- Basen
- lineare Abbildungen
- Basiswechsel (nicht zu verwechseln mit View-Matrix, die macht auch basiswechsel aber auf Infrastruktur-Ebene, das hier ist didaktisch)
- explizite Rechnungen

WICHTIG:
Mathe weiss NICHTS von WebGL, Shadern oder Rendering.
Mathe arbeitet nur mit Zahlen.

---------------------------------------------------
2) BUILDERS (src/builders)
---------------------------------------------------
Builder sind die Brücke zwischen Mathe und Darstellung.

Aufgabe:
- nehmen mathematische Konzepte
- erzeugen daraus GEOMETRIE

Beispiele:
- CoordinateSystemBuilder → Achsen aus Basis
- CubeBuilder → Würfel aus Vektoren
- VectorBuilder → Pfeil aus Richtungsvektor

Builder:
- enthalten Mathematik
- erzeugen nur Daten
- geben Geometry-Objekte zurück

Builder machen KEIN Rendering.

---------------------------------------------------
3) GEOMETRY (Datenformat)
---------------------------------------------------
Geometry ist ein reines dummes Datenobjekt:

{
  positions: [...],
  colors: [...],
  primitives: "LINES",
  num_vertices: ...
}

Geometry:
- enthält KEINE Bedeutung
- enthält KEINE Transformation
- ist nur „was gezeichnet werden soll“

---------------------------------------------------
4) RENDERING (src/render)
---------------------------------------------------
Rendering ist Darstellung, nicht Bedeutung.

- Drawable:
  - lädt Geometry auf die GPU
  - führt drawArrays aus
  - kennt keine Mathe-Bedeutung

- Scene:
  - orchestriert alles
  - kennt Kamera & Projektion
  - zeichnet Drawables

- Camera:
  - erzeugt View-Matrix

- Projection:
  - erzeugt Projektionsmatrix (Frustum)

Rendering rechnet NICHT an der Geometrie.
Es zeigt nur das Ergebnis.

---------------------------------------------------
5) SHADER (src/shaders)
---------------------------------------------------
Shader sind Ausführungsmaschinen.

- nehmen Matrizen
- wenden sie auf Vertices an
- keine Logik, keine Bedeutung

Shader sind absichtlich „dumm“.

---------------------------------------------------
6) WICHTIGE DESIGNENTSCHEIDUNG
---------------------------------------------------
Dieses Projekt verzichtet bewusst auf Model-Matrizen (diejenigen die das Objekt selber drehen, nicht die Welt.)
in frühen Phasen.

Stattdessen:
- Geometrie wird explizit transformiert
- jede Zahl ist sichtbar
- jede Rechnung nachvollziehbar


---------------------------------------------------
MERKSATZ
---------------------------------------------------
Mathe erklärt.
Builder formen.
Rendering zeigt.
Shader führen aus.

*/


// src/app/index.js
"use strict";

import { WorldConfig } from "../config.js";
import { Matrix3 } from "../math/Matrix3.js";
import { MathState } from "../state/MathState.js";
import { loadText } from "../loaders/loadText.js";
import { createProgram } from "../gl/createProgram.js";
import { bindLinearMapView } from "../ui/LinearMapView.js";
import { CoordinateSystemBuilder } from "../builders/CoordinateSystemBuilder.js";
import { CubeWireframeBuilder } from "../builders/CubeWireframeBuilder.js";
import { VectorBuilder } from "../builders/VectorBuilder.js";
import { loadExperiment } from "../experiments/loadExperiment.js";
import { Scene } from "../render/Scene.js";


async function start() {

	// 1) Canvas + WebGL
	const canvas = document.querySelector("#meineWebGLCanvas");
	const gl = canvas.getContext("webgl");
	if (!gl) {
		alert("WebGL nicht verfügbar");
		return;
	}


	// 2) Shader laden
	const [vShaderCode, fShaderCode] = await Promise.all([
		loadText("/src/shaders/vShaderCode.glsl"),
		loadText("/src/shaders/fShaderCode.glsl"),
	]);


	const programInfo = createProgram(gl, vShaderCode, fShaderCode);
	gl.useProgram(programInfo.program);


	// 3) Scene
	const scene = new Scene(
		canvas, 
		gl,
		programInfo
		/* 
		{
			axes: CoordinateSystemBuilder.build(basisA, 1.0), 
			cube: CubeWireframeBuilder.build(1.0)
		}
		*/
	);

	
	// 4) State (Wahrheit)
	const state = new MathState();

	// 5) UI an State binden (nur lesen)
	bindLinearMapView(state);

	
	// Geometrie einmal erstellen
	this.cube = cube = scene.addGeometry(
		CubeWireframeBuilder.build(WorldConfig.EXTENT)
	);

	let vectorDrawable = null;
	let resultDrawable = null;

	// 6) Rendering an State binden (nur lesen)
	state.onChange((s) => {

		if (s.vector && !vectorDrawable) {
			vectorDrawable = scene.addGeometry(
				VectorBuilder.build(s.vector, { color: [1,0,0,1] })
			);
		}

		if (s.resultVector && !resultDrawable) {
			resultDrawable = scene.addGeometry(
				VectorBuilder.build(s.resultVector, { color: [0,1,0,1] })
			);
		}

		if (vectorDrawable) {
			vectorDrawable.updatePositions([
				0,0,0,
				s.vector.x,
				s.vector.y,
				s.vector.z
			]);
		}

		if (resultDrawable) {
			resultDrawable.updatePositions([
				0,0,0,
				s.resultVector.x,
				s.resultVector.y,
				s.resultVector.z
			]);
		}
	});

	// 7) Starten
	scene.start();
}


// DOM Ready
(function r(f) {
  	/in/.test(document.readyState) ? setTimeout(() => r(f), 9) : f();
})(start);



/*
Starten mit:

python -m http.server 8000

und dann aufrufen:

http://localhost:8000

Wenn es nicht funktioniert dann mit dem python extra script:

python server.py

*/