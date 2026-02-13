// src/controls/CameraController.js
export class CameraController {
    constructor(camera, onChange) {
        this.camera = camera;
        this.onChange = onChange;

        window.addEventListener("keydown", this.handleKey.bind(this));
    }
    
    handleKey(e) {
        switch (e.key) {
            case "ArrowLeft":
                this.camera.angleY -= 5;
                break;
            case "ArrowRight":
                this.camera.angleY += 5;
                break;
            case "ArrowUp":
                this.camera.angleX -= 5;
                break;
            case "ArrowDown":
                this.camera.angleX += 5;
                break;
            default:
                return;
        }

        this.onChange(); // z.B. scene.render()
    }
}
