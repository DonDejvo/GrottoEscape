import { Drawable } from "./drawable.js";

export class Sprite extends Drawable {
    constructor(params) {
        super(params);
        this._anims = {};
        this._currentAnim = null;
        this._framePos = {x: 0, y: 0};
    }
    AddAnim(n, frames) {
        this._anims[n] = frames;
    }
    PlayAnim(n, rate, repeat, OnEnd) {
        this._playing = true;
        this._currentAnim = {
            name: n,
            rate: rate,
            repeat: repeat,
            OnEnd: OnEnd,
            frame: 0,
            counter: rate
        };
    }
    Update(timeElapsed) {
        if(!this._currentAnim) {
            return;
        }
        const currentAnim = this._currentAnim;
        currentAnim.counter += timeElapsed * 1000;
        if(currentAnim.counter >= currentAnim.rate) {
            this._framePos = this._anims[currentAnim.name][currentAnim.frame];
            currentAnim.counter = 0;
            ++currentAnim.frame;
            if(currentAnim.frame >= this._anims[currentAnim.name].length) {
                currentAnim.frame = 0;
                if(currentAnim.OnEnd) {
                    currentAnim.OnEnd();
                }
                if(!currentAnim.repeat) {
                    this._currentAnim = null;
                }
            }
        }
    }
    Draw(ctx) {
        ctx.save();
        ctx.translate(this._pos.x, this._pos.y);
        ctx.scale(this._flipX ? -1 : 1, this._flipY ? -1 : 1);
        ctx.drawImage(
            this._params.image,
            this._framePos.x * this._params.frameWidth, this._framePos.y * this._params.frameHeight, this._params.frameWidth, this._params.frameHeight,  
            -this._width / 2, -this._height / 2, this._width, this._height
        );
        ctx.restore();
    }
}