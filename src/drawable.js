import { entity } from "./entity.js";
import { Vector } from "./vector.js";

export const drawable = (() => {

    class Drawable extends entity.Component {
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
            this._opacity = this._params.opacity !== undefined ? this._params.opacity : 1;
        }
        SetSize(w, h) {
            this._width = w;
            this._height = h;
        }
        Draw(_) {}
    }

    class Text extends Drawable {
        constructor(params) {
            super(params);
            this._text = this._params.text;
            this._fontSize = this._params.fontSize;
            this._fontFamily = (this._params.fontFamily || "Arial");
        }
        InitComponent() {
            this._pos = this._parent._pos;
        }
        Draw(ctx) {
            ctx.fillStyle = this._params.color;
            ctx.font = `${this._fontSize}px '${this._fontFamily}'`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this._text, this._pos.x, this._pos.y);
        }
    }

    class Layer extends Drawable {
        constructor(params) {
            super(params);
            this._x = 0;
            this._y = 0;
            this._gameSpeed = this._params.gameSpeed;
        }
        InitComponent() {
            this._pos = this._parent._pos;
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

    class Picture extends Drawable {
        constructor(params) {
            super(params);
            this._frameWidth = (this._params.frameWidth || this._width);
            this._frameHeight = (this._params.frameHeight || this._height);
            this._framePos = {
                x: (this._params.posX || 0),
                y: (this._params.posY || 0)
            }
        }
        InitComponent() {
            this._pos = this._parent._pos;
        }
        Draw(ctx) {
            ctx.save();
            ctx.translate(this._pos.x, this._pos.y);
            ctx.scale(this._flip.x ? -1 : 1, this._flip.y ? -1 : 1);
            ctx.drawImage(
                this._params.image,
                this._framePos.x * this._frameWidth, this._framePos.y * this._frameHeight, this._frameWidth, this._frameHeight, 
                -this._width / 2, -this._height / 2, this._width, this._height
            );
            ctx.restore();
        }
    }

    class Sprite extends Drawable {
        constructor(params) {
            super(params);
            this._anims = {};
            this._currentAnim = null;
            this._paused = true;
            this._framePos = {x: 0, y: 0};
        }
        InitComponent() {
            this._pos = this._parent._pos;
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
            ctx.globalAlpha = this._opacity;
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

    class Tile extends Drawable {
        constructor(params) {
            super(params);
            this._tileset = this._params.tileset;
            this._tile = {x: this._params.tileX, y: this._params.tileY};
        }
        InitComponent() {
            this._pos = this._parent._pos;
        }
        Draw(ctx) {
        const d = 0.4;
            ctx.drawImage(this._tileset.image, this._tile.x, this._tile.y, this._tileset.tileWidth, this._tileset.tileHeight, this._pos.x - (this._width + d) / 2, this._pos.y - (this._height + d) / 2, this._width + d, this._height + d);
        }
    }

    class AnimatedTile extends Tile {
        constructor(params) {
            super(params);
            this._frames = this._params.frames;
            this._frameRate = 180;
            this._frameIdx = 0;
            this._counter = 0;
            this._tile = this._frames[0];
        }
        Update(elapsedTimeS) {
            this._counter += 1000 * elapsedTimeS;
            if(this._counter >= this._frameRate) {
                this._counter = 0;
                ++this._frameIdx;
                if(this._frameIdx >= this._frames.length) {
                    this._frameIdx = 0;
                }
                this._tile = this._frames[this._frameIdx];
            }
        }
    }

    return {
        Text: Text,
        Layer: Layer,
        Sprite: Sprite,
        Tile: Tile,
        AnimatedTile: AnimatedTile,
        Picture: Picture
    }

})();