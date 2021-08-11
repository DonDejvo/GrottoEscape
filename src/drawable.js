import { entity } from "./entity.js";

export class Drawable extends entity.Component {
    constructor(params) {
        super();
        this._params = params;
        this._width = this._params.width;
        this._height = this._params.height;
        this._zIndex = (this._params.zIndex || 0);
        this._flip = {
            x: (this._params.flipX || false),
            y: (this._params.flipY || false)
        };
    }
    InitComponent() {
        this._pos = this._parent._pos;
    }
    SetSize(w, h) {
        this._width = w;
        this._height = h;
    }
    Draw(_) {}
}