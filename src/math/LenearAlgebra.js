'use strict'

/*
====================================================
LINEAR ALGEBRA – RECHENWERKZEUGE
====================================================

Dieses Modul enthält KEINE mathematischen Objekte,
sondern nur Rechenoperationen:

- Matrix-Multiplikation
- Inversen
- Debug-Ausgaben
- Hilfsfunktionen

Diese Funktionen haben KEINE Bedeutung für sich,
sie sind nur Werkzeuge.

====================================================
*/

// -----------------------------------------------
// Winkel
// -----------------------------------------------
export function rad(angle) {
    return angle * Math.PI / 180;
}


// ------------------------------------------------------
// 4x4 Matrix × 4x4 Matrix (column-major)   return A * B
// ------------------------------------------------------
// multiplyMat4(A, B)  =>  A * B
// (column Major d.h. columnMajor(M)  ==  rowMajor(Mᵀ))
//
// multiply4d(A, B) * v : dann wird B zuerst auf v angewandt und dann A so: A * B * v
export function multiply4d(a, b) {
    const result = new Array(16);

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            result[col * 4 + row] =
                a[0 * 4 + row] * b[col * 4 + 0] +
                a[1 * 4 + row] * b[col * 4 + 1] +
                a[2 * 4 + row] * b[col * 4 + 2] +
                a[3 * 4 + row] * b[col * 4 + 3];
        }
    }

    return result;
}

// ------------------------------------------------------
// 4x4 Matrix × 4x4 Matrix (column-major)   return B * A
// ------------------------------------------------------
// multiply4dReverse(A, B) => B * A
// (column Major d.h. columnMajor(M)  ==  rowMajor(Mᵀ))
//
// multiply4dReverse(A, B) * v : dann wird A zuerst auf v angewandt und dann B so: B * A * v
// historisch aus OpenGL / glMatrix für Pipeline irgendwas, darum reverse
export function multiply4dReverse (a, b) {

    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];

    return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
}

export function printMatrix4(matrix, name = '') {
    // Assumes the matrix is a 4x4 matrix in column-major order (as used in WebGL)
    if (matrix.length !== 16) {
        throw new Error("Invalid matrix length. Expected a 4x4 matrix.");
    }

    const fieldSize = 10; // Size of each field for alignment
    // console.log(name + ":");
    for (let i = 0; i < 4; i++) {
        let row = "";
        for (let j = 0; j < 4; j++) {
            // Format the number to a fixed width
            let num = matrix[j * 4 + i].toFixed(4);
            row += num.padStart(fieldSize, ' ') + " ";
        }
        // console.log(row);
    }
}

// Hilfsfunktion zur Multiplikation einer 4x4-Matrix mit einem 4D-Vektor
export function multiplyMatrixAndPoint4d(matrix, point) {
    const result = [0, 0, 0, 0];
    for (let row = 0; row < 4; row++) {
        result[row] =
            matrix[row * 4 + 0] * point[0] +
            matrix[row * 4 + 1] * point[1] +
            matrix[row * 4 + 2] * point[2] +
            matrix[row * 4 + 3] * point[3];
    }
    return result;
}

export function clone (model) {
    return JSON.parse(JSON.stringify(model));
}

export function inverse2d(matrix) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];

    const det = a * d - b * c;

    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    const invDet = 1 / det;

    return [
        [d * invDet, -b * invDet],
        [-c * invDet, a * invDet]
    ];
}

// Methode zur Invertierung einer 3x3 Matrix
export function inverse3d(matrix) {
    // Berechne die Inverse der Matrix (hier ist ein einfaches Beispiel für eine 3x3 Matrix)
    // Es ist eine vereinfachte Annahme, dass die Matrix eine 3x3 Matrix ist.
    const m = matrix;
    const det = m[0] * (m[4] * m[8] - m[7] * m[5]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);

    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    const invDet = 1 / det;

    return [
        [
            (m[4] * m[8] - m[7] * m[5]) * invDet,
            (m[2] * m[7] - m[1] * m[8]) * invDet,
            (m[1] * m[5] - m[2] * m[4]) * invDet
        ],
        [
            (m[5] * m[6] - m[3] * m[8]) * invDet,
            (m[0] * m[8] - m[2] * m[6]) * invDet,
            (m[2] * m[3] - m[0] * m[5]) * invDet
        ],
        [
            (m[3] * m[7] - m[4] * m[6]) * invDet,
            (m[1] * m[6] - m[0] * m[7]) * invDet,
            (m[0] * m[4] - m[1] * m[3]) * invDet
        ]
    ];
}


