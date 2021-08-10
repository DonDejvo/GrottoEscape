import { Drawable } from "./drawable.js";

export const tile = (() => {

    class Tile extends Drawable {
        constructor(params) {
            super(params);
            this._tileset = this._params.tileset;
            this._tile = {x: this._params.tileX, y: this._params.tileY};
        }
        Draw(ctx) {
            ctx.drawImage(this._tileset.image, this._tile.x, this._tile.y, this._tileset.tileWidth, this._tileset.tileHeight, this._pos.x - (this._width + 0.4) / 2, this._pos.y - (this._height + 0.4) / 2, this._width + 0.4, this._height + 0.4);
        }
    }

    class AnimatedTile extends Tile {
        constructor(params) {
            super(params);
            this._frames = this._params.frames;
            this._frameRate = 200;
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