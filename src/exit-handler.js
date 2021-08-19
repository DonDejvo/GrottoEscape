import { entity } from "./entity.js";
import { physics } from "./physics.js";

export class ExitHandler extends entity.Component {
    constructor(cb) {
        super();
        this._active = true;
        this._cb = cb;
    }
    Update(_) {
        const body = this.GetComponent("body");
        const player = this.FindEntity("player").GetComponent("body");

        if(this._active && physics.DetectCollision(body, player)) {
            this._active = false;
            this._cb();
        }
    }
}