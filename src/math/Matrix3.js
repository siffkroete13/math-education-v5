import { Vector3 } from "./Vector3.js";

export class Matrix3 {
    constructor(m) {
        this.m = m; // 3x3 Array
    }

    multiplyVector(v) {
        
        let v3 = new Vector3();
        v3.x = this.m[0][0]*v.x + this.m[0][1]*v.y + this.m[0][2]*v.z;
        v3.y = this.m[1][0]*v.x + this.m[1][1]*v.y + this.m[1][2]*v.z;
        v3.z = this.m[2][0]*v.x + this.m[2][1]*v.y + this.m[2][2]*v.z;

        return v3;
    }

    static identity() {
        return new Matrix3([
            [1,0,0],
            [0,1,0],
            [0,0,1]
        ]);
    }
}