import { Drawable } from "./drawable.js";

export const tile = (() => {

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
        Tile: Tile,
        AnimatedTile: AnimatedTile
    }

})();