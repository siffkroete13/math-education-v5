/**
 * CPU (JavaScript)
│
│  Geometry (positions, colors)
│
│  gl.bufferData(...)  ← KOPIE
│
▼
GPU-Speicher (Buffer)
│
│  Attribute zeigen in Buffer hinein
│
▼
Vertex-Shader
│
│  + Uniforms (global)
│
▼
gl_Position


GPU / WEBGL – KONZEPTUELLE ÜBERSICHT
==================================

Dieses Projekt benutzt WebGL bewusst didaktisch.
Ziel ist zu verstehen:
- welche Daten WO liegen
- wann sie gesetzt werden
- wie oft sie sich ändern
- wer (CPU oder GPU) sie benutzt

--------------------------------------------------
1) ZWEI GETRENNTE WELTEN
--------------------------------------------------

CPU (JavaScript)
- führt den Code aus
- berechnet Mathematik
- lädt Daten
- entscheidet, WAS gezeichnet wird

GPU (Grafikkarte)
- führt Shader aus
- verarbeitet Millionen Vertices / Pixel parallel
- kennt KEINE JavaScript-Objekte
- sieht nur rohe Zahlen

CPU und GPU haben getrennten Speicher.
Daten müssen explizit von CPU → GPU kopiert werden.

--------------------------------------------------
2) GPU-SPEICHER: BUFFER
--------------------------------------------------

Buffer sind Speicherbereiche auf der GPU.

In diesem Projekt verwenden wir hauptsächlich:

- ARRAY_BUFFER
  → speichert Vertex-Daten
  → z.B. Positionen, Farben, Normalen

Beispiel:
gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

WICHTIG:
- bufferData kopiert Daten EINMAL von CPU → GPU
- spätere Änderungen am JavaScript-Array haben KEINE Wirkung
- Buffer bleiben auf der GPU, bis sie gelöscht werden

Lebensdauer:
- meist: beim Erzeugen eines Drawable
- bleibt über viele Frames bestehen

--------------------------------------------------
3) ATTRIBUTE (vertex attributes)
--------------------------------------------------

Attribute sind GPU-Variablen,
die sich PRO VERTEX unterscheiden.

Typische Attribute:
- Position eines Vertex
- Farbe eines Vertex
- Normalenvektor

Im Vertex-Shader:
attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

Eigenschaften:
- ein Wert pro Vertex
- Werte kommen aus Buffern
- GPU iteriert automatisch über alle Vertices

Verbindung Buffer → Attribut:
gl.bindBuffer(...)
gl.vertexAttribPointer(...)
gl.enableVertexAttribArray(...)

Lebensdauer:
- Definition: einmal beim Setup
- Nutzung: bei jedem Draw-Call
- Wert: pro Vertex unterschiedlich

--------------------------------------------------
4) UNIFORMS
--------------------------------------------------

Uniforms sind GPU-Variablen,
die für ALLE Vertices und Pixel gleich sind.

Typische Uniforms:
- Projektionsmatrix
- View-Matrix
- Zeit
- Farbe
- Lichtparameter

Im Shader:
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

Eigenschaften:
- ein Wert pro Draw-Call
- gleich für alle Vertices
- wird von der CPU gesetzt

Setzen in JavaScript:
gl.uniformMatrix4fv(...)
gl.uniform1f(...)
gl.uniform3fv(...)

Lebensdauer:
- meist: pro Frame oder pro Objekt
- Werte bleiben gültig, bis sie überschrieben werden

--------------------------------------------------
5) VERTEX-SHADER
--------------------------------------------------

Der Vertex-Shader läuft:

- EINMAL PRO VERTEX
- vollständig auf der GPU
- parallel für alle Vertices

Aufgaben:
- liest Attribute (Position, Farbe, ...)
- benutzt Uniforms (Matrizen, Parameter)
- berechnet gl_Position

WICHTIG:
- Vertex-Shader kennt KEINE anderen Vertices
- kein globaler Zustand
- keine Schleifen über andere Vertices

--------------------------------------------------
6) FRAGMENT-SHADER
--------------------------------------------------

Der Fragment-Shader läuft:

- EINMAL PRO PIXEL (Fragment)
- nach der Rasterisierung
- oft millionenfach pro Frame

Aufgaben:
- berechnet die Farbe eines Pixels
- kann Uniforms lesen
- kann interpolierte Werte aus dem Vertex-Shader lesen

WICHTIG:
- Fragment-Shader kennt KEINE Vertices
- kennt nur den aktuellen Pixel

--------------------------------------------------
7) LEBENSDAUER-ÜBERSICHT
--------------------------------------------------

Pro Anwendung (einmal):
- Shader kompilieren
- Programme erstellen

Pro Objekt (einmal):
- Geometry erzeugen
- Buffer anlegen
- Drawable erstellen

Pro Frame:
- Clear Screen
- Uniforms setzen (z.B. View/Projection)
- drawArrays aufrufen

Pro Vertex:
- Vertex-Shader ausführen

Pro Pixel:
- Fragment-Shader ausführen

--------------------------------------------------
8) WICHTIGE MERKSÄTZE
--------------------------------------------------

- Buffer = GPU-Speicher
- Attribute = Daten pro Vertex
- Uniforms = Daten für alle Vertices
- Vertex-Shader = pro Vertex
- Fragment-Shader = pro Pixel
- GPU rechnet, CPU denkt

--------------------------------------------------
9) DIDAKTISCHE ENTSCHEIDUNG DIESES PROJEKTS
--------------------------------------------------

- Mathematik findet auf der CPU statt
- Geometrie wird explizit berechnet
- Shader sind bewusst "dumm"
- Keine versteckte Logik in der GPU (Optimierungen siehe unten)

Ziel:
Verstehen, nicht optimieren.

 * 
 * 

 * Drawable
 * --------
 * Ein Drawable ist die GPU-Repräsentation von Geometry-DATEN.
 *
 * WICHTIG:
 * - Drawable kennt KEINE Mathematik
 * - Drawable kennt KEINE Bedeutung
 * - Drawable kennt KEINE Kamera-Semantik
 *
 * Aufgabe:
 *   CPU-Daten  → GPU-Speicher
 *   GPU-Speicher → drawArrays

 *

 * Ein Drawable ist die Brücke zwischen CPU (JavaScript)
 * und GPU (WebGL).
 *
 * Es nimmt reine GEOMETRIE-DATEN (Zahlen)
 * und lädt sie in den Grafikspeicher.
 *
 * Drawable:
 * - macht KEINE Mathematik
 * - interpretiert KEINE Bedeutung
 * - reicht Daten nur weiter
 */



"use strict";



class Drawable {

    /**
     * Konstruktor
     *
     * gl          → Zugriff auf GPU
     * programInfo → Shader + Locations (Uniforms, Attributes)
     * geometry    → reine Daten (CPU-Speicher)
     */
    constructor(gl, programInfo, geometry) {

        // WebGL-Kontext (unsere Verbindung zur GPU)
        this.gl = gl;

        // Enthält:
        // - Shader-Programm
        // - wo Uniforms liegen
        // - wo Attribute liegen
        this.programInfo = programInfo;

        // Geometry lebt im CPU-Speicher (JavaScript-Objekt)
        this.geometry = geometry;

        // Referenzen auf GPU-Speicher (noch leer)
        this.vertexBuffer = null;
        this.colorBuffer = null;

        // Welches primitive wird gezeichnet? (LINES, TRIANGLES, ...)
        const primitiveName = geometry.primitives?.toUpperCase();
        this.primitiveType =
            gl[primitiveName] !== undefined
                ? gl[primitiveName]
                : gl.TRIANGLES;

        // Wie viele Vertices sollen gezeichnet werden?
        // Entweder explizit angegeben oder aus den Daten berechnet
        this.vertexCount =
            geometry.num_vertices ??
            (geometry.positions.length / geometry.num_dim);

        // JETZT: Daten von CPU → GPU kopieren
        this.initBuffers();
    }

    /**
     * initBuffers
     * -----------
     * Dieser Schritt ist extrem wichtig:
     *
     * Hier verlassen die Daten endgültig JavaScript
     * und landen im GPU-Speicher.
     *
     * Danach:
     * - JavaScript kann die Daten ändern,
     *   aber die GPU merkt davon NICHTS.
     */
    initBuffers() {
        const gl = this.gl;

        // ===============================
        // POSITIONS-BUFFER
        // ===============================

        // 1) GPU-Speicher anlegen
        this.vertexBuffer = gl.createBuffer();

        // 2) Sagen: dieser Buffer ist jetzt ein ARRAY_BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        // 3) CPU → GPU Kopie
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.geometry.positions),
            gl.STATIC_DRAW
        );

        // ===============================
        // COLOR-BUFFER (optional)
        // ===============================
        if (
            this.geometry.colors &&
            this.geometry.colors.length ===
                this.vertexCount * this.geometry.num_color
        ) {
            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(this.geometry.colors),
                gl.STATIC_DRAW
            );
        }
    }

    /**
     * draw
     * ----
     * Dieser Aufruf zeichnet das Objekt.
     *
     * WICHTIG:
     * - draw() läuft PRO FRAME
     * - Buffer liegen bereits auf der GPU
     * - jetzt werden nur noch ZEIGER gesetzt
     */
    draw(projectionMatrix, viewMatrix) {
        const gl = this.gl;
        const prog = this.programInfo;

        // ===============================
        // UNIFORMS
        // ===============================
        // Uniforms sind globale Werte:
        // - gleich für ALLE Vertices
        // - werden einmal pro Draw gesetzt

        gl.uniformMatrix4fv(
            prog.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );

        gl.uniformMatrix4fv(
            prog.uniformLocations.modelViewMatrix,
            false,
            viewMatrix
        );

        // ===============================
        // POSITION-ATTRIBUTE
        // ===============================
        // Attribute sind PRO VERTEX unterschiedlich

        // 1) richtigen Buffer auswählen
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        // 2) erklären, wie die Daten gelesen werden sollen
        gl.vertexAttribPointer(
            prog.attribLocations.vertexPosition,
            this.geometry.num_dim,   // z.B. vec3
            gl.FLOAT,
            false,
            0,
            0
        );

        // 3) Attribut aktivieren
        gl.enableVertexAttribArray(
            prog.attribLocations.vertexPosition
        );

        // ===============================
        // COLOR-ATTRIBUTE
        // ===============================
        if (this.colorBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(
                prog.attribLocations.vertexColor,
                this.geometry.num_color,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(
                prog.attribLocations.vertexColor
            );
        } else {
            // Keine Farben pro Vertex:
            // → eine konstante Farbe für alle Vertices
            gl.disableVertexAttribArray(
                prog.attribLocations.vertexColor
            );
            gl.vertexAttrib4fv(
                prog.attribLocations.vertexColor,
                this.geometry.colors
            );
        }

        // ===============================
        // DRAW CALL
        // ===============================
        // JETZT arbeitet die GPU:
        // - Vertex-Shader wird pro Vertex ausgeführt
        // - Fragment-Shader pro Pixel

        gl.drawArrays(
            this.primitiveType,
            0,
            this.vertexCount
        );
    }
}

export { Drawable };




/*
Konkrete Performance-Gewinne (realistisch)

Maßnahme	                                    Gewinn

Buffer nur einmal erstellen	                    ⭐⭐

Draw Calls reduzieren	                        ⭐⭐⭐

CPU → GPU Mathe verschieben	                    ⭐⭐⭐⭐

Instancing	                                    ⭐⭐⭐⭐⭐

*/