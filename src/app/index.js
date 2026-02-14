/*
===============================================================
INDEX.JS – EINSTIEGSPUNKT DER PHYSIK-ENGINE (3D KUGEL-SIMULATION)
===============================================================

DIESE DATEI IST DER STARTPUNKT DER GESAMTEN ANWENDUNG.

Sie übernimmt folgende Aufgaben:

---------------------------------------------------------------
GESAMTABLAUF – VON START BIS ANIMATION
---------------------------------------------------------------

1) Browser lädt index.js
2) start() wird ausgeführt
3) WebGL-Kontext wird initialisiert
4) Shader werden geladen und kompiliert
5) WebGL-Programm wird erzeugt
6) Einheitskugel-Geometrie wird einmal berechnet
7) Scene wird erzeugt
8) Bodies (physikalische Kugeln) werden erzeugt
9) Scene.start() startet die Game-Loop
10) Ab jetzt läuft alles automatisch pro Frame

---------------------------------------------------------------
DETAILIERTER ABLAUF
---------------------------------------------------------------

1) CANVAS + WEBGL
   ------------------------------------------------------------
   - Das HTML-Canvas wird geholt.
   - WebGL-Kontext wird erzeugt.
   - Ohne WebGL kann nichts gerendert werden.
   - Ab hier existiert eine Verbindung zur GPU.

2) SHADER LADEN
   ------------------------------------------------------------
   - Vertex-Shader und Fragment-Shader werden asynchron geladen.
   - Diese Programme laufen später auf der GPU.
   - Sie transformieren Vertices in Clip-Space
     und färben Pixel.

   Wichtig:
   Shader enthalten KEINE Physik.
   Shader enthalten KEINE Spiel-Logik.
   Shader sind reine Rechenmaschinen.

3) PROGRAMM ERZEUGEN
   ------------------------------------------------------------
   - Die Shader werden kompiliert.
   - Ein WebGL-Programm wird erstellt.
   - Dieses Programm verbindet CPU-Seite mit GPU-Seite.

4) EINHEITSKUGEL ERZEUGEN
   ------------------------------------------------------------
   - Es wird EINE Kugel mit Radius 1 um den Ursprung gebaut.
   - Diese Geometrie wird NIE wieder neu berechnet.
   - Sie ist das "Template" für alle Kugeln.

   Warum Einheitskugel?
   → Jede reale Kugel wird später durch:
        Skalierung (radius)
        + Translation (position)
     erzeugt.

   Das ist didaktisch sauber:
   Geometrie = konstant
   Physik = bestimmt Lage und Größe

5) SCENE ERZEUGEN
   ------------------------------------------------------------
   Scene ist die zentrale Orchestrierungs-Einheit.

   Sie enthält:
   - Kamera
   - PhysicsWorld
   - den einen Drawable-Buffer
   - die Game-Loop
   - Render-Funktion

   Wichtig:
   Scene verbindet Physik und Rendering.
   Physik kennt kein WebGL.
   WebGL kennt keine Physik.
   Scene ist die Brücke.

6) BODIES ERZEUGEN
   ------------------------------------------------------------
   Für jede Kugel wird ein Body erzeugt:

       {
           position: {x,y,z}
           velocity: {x,y,z}
           radius
           mass
       }

   Diese Bodies sind rein physikalische Objekte.
   Sie enthalten:
   - Zustand
   - Impuls
   - Kollisionsparameter

   PhysicsWorld speichert diese Bodies.
   Drawable kennt diese Bodies NICHT.

7) SCENE.START() → GAME LOOP BEGINNT
   ------------------------------------------------------------
   requestAnimationFrame startet eine Endlosschleife.

   Pro Frame passiert:

   a) dt wird berechnet (Zeit seit letztem Frame)
   b) physics.update(dt)
        → Bewegung (Euler)
        → Kugel-Kugel-Kollision
   c) Wandkollision wird berechnet
   d) Alle Kugeln werden in EIN großes Vertex-Array geschrieben
   e) Drawable.updatePositions(...)
        → GPU-Buffer wird neu befüllt
   f) render()
        → drawArrays wird ausgeführt

   Dieser Ablauf wiederholt sich 60x pro Sekunde.

---------------------------------------------------------------
ARCHITEKTUR-PRINZIPIEN DIE HIER GELTEN
---------------------------------------------------------------

1) KEIN GLOBALER STATE
   Keine reaktive Mathe-Struktur mehr.
   Physik läuft zeitbasiert.

2) EIN DRAW CALL
   Alle Kugeln werden in EINEM Buffer gerendert.
   Das ist effizienter als viele DrawCalls.

3) CPU-SKALIERUNG
   Radius wird auf CPU angewendet.
   Keine Model-Matrix.
   Keine Instancing-Technik.
   Alles explizit sichtbar.

4) SAUBERE TRENNUNG

   PhysicsWorld
       ↓
   Scene.update()
       ↓
   Drawable.updatePositions()
       ↓
   render()

---------------------------------------------------------------
WICHTIGE DIDAKTISCHE ENTSCHEIDUNG
---------------------------------------------------------------

Diese Version verzichtet bewusst auf:

- Model-Matrizen
- Instanced Rendering
- GPU-Transformation pro Objekt
- Engine-Abstraktionen

Warum?

Weil hier jede Zahl sichtbar bleibt.
Jede Transformation ist explizit.
Jede Kollision ist nachvollziehbar.

Das Ziel ist Verstehen, nicht Engine-Optimierung.

---------------------------------------------------------------
FAZIT
---------------------------------------------------------------

index.js ist NICHT die Physik.
index.js ist NICHT das Rendering.
index.js ist nur der Start und die Initialisierung.

Ab Scene.start() läuft alles autonom.

===============================================================
*/


// src/app/index.js
"use strict";

import { WorldConfig } from "../config.js";
import { loadText } from "../loaders/loadText.js";
import { createProgram } from "../gl/createProgram.js";
import { Drawable } from "../render/Drawable.js";
import { CubeWireframeBuilder } from "../builders/CubeWireframeBuilder.js";
import { Scene } from "../render/Scene.js";


async function start() {

	const canvas = document.querySelector("#meineWebGLCanvas");
    const gl = canvas.getContext("webgl");

    const [vShaderCode, fShaderCode] = await Promise.all([
        loadText("/src/shaders/vShaderCode.glsl"),
        loadText("/src/shaders/fShaderCode.glsl"),
    ]);

    const programInfo = createProgram(gl, vShaderCode, fShaderCode);
    gl.useProgram(programInfo.program);

    const unitSphere = buildUnitSphere(16, 16);

	const sphereDrawable = new Drawable(gl, programInfo, {
		positions: []
	});

	const cubeGeometry = CubeWireframeBuilder.build(WorldConfig.EXTENT);
	const cubeDrawable = new Drawable(gl, programInfo, cubeGeometry);

    const scene = new Scene(
		canvas,
		gl,
		programInfo,
		unitSphere
	);

	scene.addStaticDrawable(cubeDrawable);
	scene.addDynamicDrawable(sphereDrawable);

	const density = 7.850; // Also angenommen Einheiten seien cm
	
    // --- Bodies ---
    for (let i = 0; i < 6; i++) {

        const radius = 0.5 + Math.random();
		const mass = density * (4 / 3) * Math.PI * Math.pow(radius, 3);

        scene.addBody({
            position: {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8,
                z: (Math.random() - 0.5) * 8
            },
            velocity: {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4,
                z: (Math.random() - 0.5) * 4
            },
            radius: radius,
            mass: mass
        });
    }

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