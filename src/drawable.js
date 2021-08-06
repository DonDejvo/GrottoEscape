import { entity } from "./entity.js";

export class Drawable extends entity.Entity {
    constructor(params) {
        super();
        this._params = params;
        this._width = this._params.width;
        this._height = this._params.height;
        this._zIndex = (this._params.zIndex || 0);
    }
    SetSize(w, h) {
        this._width = w;
        this._height = h;
    }
    Draw() {}
}