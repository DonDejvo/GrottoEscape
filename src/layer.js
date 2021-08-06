import { Drawable } from "./drawable.js";

export class Layer extends Drawable {
    constructor(params) {
        super(params);
        this._x = 0;
        this._y = 0;
        this._gameSpeed = this._params.gameSpeed;
    }
    Update(elapsedTimeS) {
        this._x -= this._gameSpeed * this._params.speedModifier * elapsedTimeS;
        if(this._x < -this._width) {
            this._x += this._width;
        } else if(this._x > this._params.gameWidth) {
            this._x -= this._width;
        }
    }
    Draw(ctx) {
        ctx.save();
        ctx.translate(this._pos.x, this._pos.y);
        const image = this._params.image;
        ctx.drawImage(image, this._x, this._y, this._width, this._height);
        if(this._x > -this._params.gameWidth / 2) {
            ctx.drawImage(image, this._x - this._width, this._y, this._width, this._height);
        }
        if(this._x < -this._width + this._params.gameWidth / 2) {
            ctx.drawImage(image, this._x + this._width, this._y, this._width, this._height);
        }
        ctx.restore();
    }
}