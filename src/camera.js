import { Vector } from "./vector.js";

export class Camera {
    constructor() {
        this._pos = new Vector(0, 0);
        this._scale = 1.0;
        this._target = null;
        this._vel = new Vector(0, 0);
    }
    Follow(target) {
        this._target = target;
    }
    Unfollow() {
        this._target = null;
    }
    SetPosition(p) {
        this._pos.Copy(p);
    }
    SetScale(s) {
        this._scale = s;
    }
    ScaleTo(s, dur) {

    }
    Update(elapsedTimeS) {
        if(this._target) {
            const t = 4 * elapsedTimeS;
            this._pos.Lerp(this._target._pos, t);
        } else {
            const vel = this._vel.Clone();
            vel.Mult(elapsedTimeS);
            this._pos.Add(vel);
        }

    }
}