// Positionsdaten eines einzelnen Vertex (kommt aus dem Vertex-Buffer)
// Wird für JEDEN Vertex neu gesetzt
attribute vec4 aVertexPosition;

// Farbinformation eines einzelnen Vertex
// Ebenfalls pro Vertex unterschiedlich
attribute vec4 aVertexColor;

// Transformationsmatrix für Model + View (z.B. Kamera + Objektposition)
// Wird von JavaScript gesetzt und gilt für ALLE Vertices eines Draw-Calls
uniform mat4 uModelViewMatrix;

// Projektionsmatrix (Perspektive oder Orthogonal)
// Ebenfalls global für den gesamten Draw-Call
uniform mat4 uProjectionMatrix;

// Wird an den Fragment-Shader weitergegeben
// Wert wird zwischen Vertices interpoliert
varying lowp vec4 vColor;

void main(void) {

    // Größe des Punktes (nur relevant wenn GL_POINTS gerendert wird)
    gl_PointSize = 5.0;

    // Finale Position im Clip-Space
    // Reihenfolge: Projection * View/Model * Position
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    // Übergibt die Vertex-Farbe an den Fragment-Shader
    // GPU interpoliert automatisch zwischen den Vertices
    vColor = aVertexColor;
}