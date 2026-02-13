"use strict";

/*
=====================================================
PROJECTION.JS – DARSTELLUNGS-MATHE (KAMERA / SICHT)
=====================================================

WICHTIGER KONTEXT (DIDAKTISCH):

Dieses Modul gehört bewusst NICHT in /math.

Warum?
- Die Mathematik hier beschreibt KEINE objektive Welt
- Sie beschreibt, wie eine KAMERA die Welt sieht
- Ohne Rendering (Bildschirm, Sichtkegel, Clipping)
  ergibt diese Mathematik keinen Sinn

Merksatz:
→ Projektion ist keine Welt-Mathematik
→ Projektion ist Darstellungs-Mathematik

-----------------------------------------------------
Pipeline-Kontext:

Weltkoordinaten
   ↓ (View-Matrix: Welt → Kamera)
Kamerakoordinaten
   ↓ (Projektionsmatrix: Kamera → Clip Space)
Clip Space (-1 .. 1)
   ↓ (Viewport)
Bildschirm

Dieses Modul liefert AUSSCHLIESSLICH:
→ Kamerakoordinaten → Clip Space
=====================================================
*/


// ===================================================
// PERSPEKTIVISCHE PROJEKTION
// ===================================================
/*
Dies ist die klassische Perspective Projection Matrix.

Was sie leistet:

- Alle Punkte im Sichtkegel (Frustum) der Kamera
  werden in den normierten Raum [-1, 1] abgebildet
- Das Clipping-Volume ist ein Würfel von -1 bis +1
- Das Aspect Ratio (Breite / Höhe) wird korrekt berücksichtigt
- z-Werte werden ebenfalls in [-1, 1] abgebildet
  (für Tiefentest & Clipping)

WICHTIG:
Diese Matrix geht davon aus, dass:
- die Kamera im Ursprung sitzt
- die Kamera entlang der -Z-Achse schaut
- die View-Matrix diese Voraussetzungen bereits hergestellt hat

Die ZENTRIERUNG der Kamera (Apex des Frustums)
passiert NICHT hier, sondern in der View-Matrix!

Diese Funktion ist also NUR für:
→ zentrierte Kamera
→ standardisierte Kamerakoordinaten
*/



function createPerspectiveProjection(gl) {

    // ------------------------------------------------
    // Kamera-Parameter (bewusst hier, nicht abstrahiert)
    // ------------------------------------------------

    // Field of View (vertikal), in Radiant
    const fov = 20 * (Math.PI / 180);

    // Aspect Ratio des Bildschirms
    // → DAS ist Darstellungsabhängigkeit
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    // Near- und Far-Plane des Frustums
    const zNear = 0.3;
    const zFar  = 100.0;

    // ------------------------------------------------
    // Mathematische Vorbereitung
    // ------------------------------------------------

    const angle = fov / 2.0;

    /*
    ACHTUNG (WICHTIG UND DIDAKTISCH):

    Die Matrix ist im COLUMN-MAJOR Format gespeichert,
    wie es WebGL (und OpenGL) erwarten.

    Das bedeutet:
    - Die "Spalten" der mathematischen Matrix
      stehen hier untereinander im Array
    - Beim Lesen wirkt die Matrix "transponiert"

    Das ist KEIN Denkfehler, sondern ein Speicherlayout-Thema.
    */

    // Dies ist die komplette Projektions-Matrix (Perspective-Projextion-Matrix). Alle Koordinaten der Vertices im Frustum werden richtig
    // in den Bereich von -1 zu 1 projeziert. Auch die Tatsache, dass aspect ration nicht gleich 1 ist wird beachtet durch diese Matrix.
    // Auch die z-Koordinaten werden zwischen -1 und 1 projeziert (für allfälliges weg clippen oder so).
    // Anfangs dachte ich, dass was fehlt, z.B. die Zentrierung von apex (Kamera) oder so. Aber diese Funktion ist nur für für zentrierte 
    // Kamera zugelassen.
    // Dann dachte ich auch, dass ja das Ganze auf ein clipping volume projeziert werden muss (clipping volume: Würfel von -1 zu 1) und dass
    // das dem Aspect Ratio wiederspricht, weil aspect ratio kann auch nicht gleich 1 sein. Aber es wird in den Formeln ebenfalls 
    // beachtet wie ich raus fand.
    const projectionMatrix = [

        // Spalte 0
        1.0 / (aspect * Math.tan(angle)),  0.0,  0.0,   0.0,

        // Spalte 1
        0.0,  1.0 / Math.tan(angle),        0.0,   0.0,

        // Spalte 2
        0.0,  0.0,  (zFar + zNear) / (zNear - zFar),  -1.0,

        // Spalte 3
        0.0,  0.0,  (2 * zFar * zNear) / (zNear - zFar),  0.0
    ];

    return projectionMatrix;
}


// ===================================================
// ORTHOGRAFISCHE PROJEKTION
// ===================================================
/*
Orthografische Projektion:

- KEINE Perspektive
- Parallele Kanten bleiben parallel
- Keine Tiefenverzerrung
- Oft verwendet für:
  - CAD
  - technische Zeichnungen
  - UI-Overlays
  - Debug-Ansichten

Hier wird ein Quader direkt
auf den Clip-Würfel [-1,1] abgebildet.
*/

function createOrthographicProjection(left, right, bottom, top, zNear, zFar) {

    const orthographicMatrix = [

        // Spalte 0
        2.0 / (right - left),  0.0,  0.0,  0.0,

        // Spalte 1
        0.0,  2.0 / (top - bottom),  0.0,  0.0,

        // Spalte 2
        0.0,  0.0,  -2.0 / (zFar - zNear),  0.0,

        // Spalte 3
        -(right + left) / (right - left),
        -(top + bottom) / (top - bottom),
        -(zFar + zNear) / (zFar - zNear),
        1.0
    ];

    return orthographicMatrix;
}


// ===================================================
// FRUSTUM-PROJEKTION (ALLGEMEIN)
// ===================================================
/*
Allgemeine Frustum-Projektion:

- Left / Right / Top / Bottom können unterschiedlich sein
- Kamera muss evtl. NICHT zentriert sein
- Grundlage für Off-Center-Projektionen
- Stereo-Rendering
- Shadow Maps

HINWEIS:
Falls das Frustum nicht symmetrisch ist,
muss zusätzlich eine View-Transformation erfolgen,
die den Apex (Kamera) ins Koordinatenzentrum verschiebt.
*/

function createFrustumProjection(left, right, bottom, top, zNear, zFar) {
    // Diese Funktion macht geanu das Gleiche wie createPerspectiveProjection(..) einfach mit anderen Argumenten.
	// Left und Right müssen gleich lang sein. Und auch top, bottom aber nur hier, im Allgemeinen müsste diese Funktion das auch beachten.
	// Falls die Kamera nicht im Zentrum steht (d.h. -left != right oder -bottom != top) dann müsste man die Funktion noch fertig schreiben.
	// In einem solchen Fall müsste man dann noch die Zentrierung der Kamera ausführen (Translate the apex of the frustum to the origin).
	// Die zentrierung der Kamera to the origin (apex ist die Kamera) kann man sich so vorstellen: Ist as apex nach rechts (x-Achse) v
    // erschoben, so schiebe man das Koordinatensystem auch nach Rechts Richtung der x-Achse so dass der Koordinaten-Ursprung auf das 
    // Apex zu liegen kommt. Als Folge verschieben sich die Koordinaten der einzelnen Vertices nach "Links" der x-Achse nach, also ins Minus.
    // Das Gleiche tue man natürlich für Y-Achse falls nötig.
	// Das "nach Rechts" könnte natürlich auch "nach Links" sein, das war nur ein Beispiel o.B.d.A. sozusagen.
    return [

        // Spalte 0
        (2 * zNear) / (right - left),  0.0,  0.0,  0.0,

        // Spalte 1
        0.0,  (2 * zNear) / (top - bottom),  0.0,  0.0,

        // Spalte 2
        (right + left) / (right - left),
        (top + bottom) / (top - bottom),
        -(zFar + zNear) / (zFar - zNear),
        -1.0,

        // Spalte 3
        0.0,  0.0,  -(2 * zFar * zNear) / (zFar - zNear),  0.0
    ];
}


// ===================================================
// EXPORTS
// ===================================================

export {
    createPerspectiveProjection,
    createOrthographicProjection,
    createFrustumProjection
};
