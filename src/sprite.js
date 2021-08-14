import { Drawable } from "./drawable.js";

export class Sprite extends Drawable {
    constructor(params) {
        super(params);
        this._anims = {};
        this._currentAnim = null;
        this._paused = true;
        this._framePos = {x: 0, y: 0};
    }
    AddAnim(n, frames) {
        this._anims[n] = frames;
    }
    PlayAnim(n, rate, repeat, OnEnd) {
        this._paused = false;
        const currentAnim = {
            name: n,
            rate: rate,
            repeat: repeat,
            OnEnd: OnEnd,
            frame: 0,
            counter: 0
        }
        this._currentAnim = currentAnim;
        this._framePos = this._anims[currentAnim.name][currentAnim.frame];
    }
    Pause() {
        this._paused = true;
    }
    Resume() {
        if(this._currentAnim) {
            this._paused = false;
        }
    }
    Update(timeElapsed) {
        if(this._paused) {
            return;
        }
        const currentAnim = this._currentAnim;
        currentAnim.counter += timeElapsed * 1000;
        if(currentAnim.counter >= currentAnim.rate) {
            currentAnim.counter = 0;
            ++currentAnim.frame;
            if(currentAnim.frame >= this._anims[currentAnim.name].length) {
                currentAnim.frame = 0;
                if(currentAnim.OnEnd) {
                    currentAnim.OnEnd();
                }
                if(!currentAnim.repeat) {
                    this._currentAnim = null;
                    this._paused = true;
                }
            }
            this._framePos = this._anims[currentAnim.name][currentAnim.frame];
        }
    }
    get currentAnim() {
        if(this._currentAnim) {
            return this._currentAnim.name;
        }
        return null;
    }
    Draw(ctx) {
        ctx.save();
        ctx.translate(this._pos.x, this._pos.y);
        ctx.scale(this._flip.x ? -1 : 1, this._flip.y ? -1 : 1);
        ctx.drawImage(
            this._params.image,
            this._framePos.x * this._params.frameWidth, this._framePos.y * this._params.frameHeight, this._params.frameWidth, this._params.frameHeight,  
            -this._width / 2, -this._height / 2, this._width, this._height
        );
        ctx.restore();
    }
}