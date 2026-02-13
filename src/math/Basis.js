import { Matrix3 } from "./Matrix3.js";
import { Vector3 } from "./Vector3.js";

export class Basis {
    constructor(e1, e2, e3) {
        this.e1 = e1;
        this.e2 = e2;
        this.e3 = e3;
    }

    toMatrix() {
        return new Matrix3([
            [this.e1.x, this.e2.x, this.e3.x],
            [this.e1.y, this.e2.y, this.e3.y],
            [this.e1.z, this.e2.z, this.e3.z],
        ]);
    }

    // ------------------------
    // Basis aus Matrix erzeugen
    // (Spalten der Matrix = Basisvektoren)
    // ------------------------
    static fromMatrix(matrix) {
        const m = matrix.m;

        return new Basis(
            new Vector3(m[0][0], m[1][0], m[2][0]), // erste Spalte
            new Vector3(m[0][1], m[1][1], m[2][1]), // zweite Spalte
            new Vector3(m[0][2], m[1][2], m[2][2])  // dritte Spalte
        );
    }

    static standard() {
        return new Basis(
            new Vector3(1,0,0),
            new Vector3(0,1,0),
            new Vector3(0,0,1)
        );
    }

    // ------------------------
    // Basis mit Matrix transformieren
    // (aktive lineare Abbildung)
    // ------------------------
    transform(matrix) {
        return new Basis(
            matrix.multiplyVector(this.e1),
            matrix.multiplyVector(this.e2),
            matrix.multiplyVector(this.e3)
        );
    }

    // ------------------------
    // Rotation um X-Achse
    // ------------------------
    rotateX(angleRad) {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);

        const rot = (v) =>
        new Vector3(
            v.x,
            c * v.y - s * v.z,
            s * v.y + c * v.z
        );

        return new Basis(
            rot(this.e1),
            rot(this.e2),
            rot(this.e3)
        );
    }

    // ------------------------
    // Rotation um Y-Achse
    // ------------------------
    rotateY(angleRad) {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);

        const rot = (v) =>
        new Vector3(
            c * v.x + s * v.z,
            v.y,
            -s * v.x + c * v.z
        );

        return new Basis(
            rot(this.e1),
            rot(this.e2),
            rot(this.e3)
        );
    }

    // ------------------------
    // Rotation um Z-Achse
    // ------------------------
    rotateZ(angleRad) {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);

        const rot = (v) =>
            new Vector3(
                c * v.x - s * v.y,
                s * v.x + c * v.y,
                v.z
            );

        return new Basis(
            rot(this.e1),
            rot(this.e2),
            rot(this.e3)
        );
    }
}