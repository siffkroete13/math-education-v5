// render/Camera.js
import { WorldConfig } from "../config.js";
import * as mat4 from "../math/mat4.js";
import { rad } from "../math/LenearAlgebra.js";


class Camera {
    constructor() {
        this.angleX = 0;
        this.angleY = 0;
        this.distance = WorldConfig.EXTENT * 6; // So in etwa dass man was sieht
    }

    getViewMatrix() {
        const viewMatrix = mat4.create();

        if(Math.abs(this.distance) > 0) mat4.translate(viewMatrix, viewMatrix, [0, 0, -this.distance]);
        if(Math.abs(this.angleX) > 0) mat4.rotate(viewMatrix, viewMatrix, rad(this.angleX), [1, 0, 0]);
        if(Math.abs(this.angleY) > 0) mat4.rotate(viewMatrix, viewMatrix, rad(this.angleY), [0, 1, 0]);

        return viewMatrix;
    }
}

export { Camera };
