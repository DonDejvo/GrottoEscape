import { Vector } from "./vector.js";

export class Camera {
    constructor() {
        this._pos = new Vector(0, 0);
        this._scale = 1.0;
        this._target = null;
    }
    Follow(target) {
        this._target = target;
    }
    Unfollow() {
        this._target = null;
    }
    Update(elapsedTimeS) {
        if(this._target) {
            const t = 4 * elapsedTimeS;
            this._pos.Lerp(this._target._pos, t);
        }
    }
}