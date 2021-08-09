import { Drawable } from "./drawable.js";

export const tile = (() => {

    class Tile extends Drawable {
        constructor(params) {
            super(params);
            this._tileset = this._params.tileset;
            this._props = this._params.props;
            this._tileX = this._params.tileX;
            this._tileY = this._params.tileY;
        }
        Draw(ctx) {
            ctx.drawImage(this._tileset.image, this._tileX, this._tileY, this._tileset.tileWidth, this._tileset.tileHeight, this._pos.x - 0.2, this._pos.y - 0.2, this._width + 0.4, this._height + 0.4);
        }
    }

    class AnimatedTile extends Tile {
        constructor(params) {
            super(params);
            this._frames = this._params.frames;
            this._frameRate = 200;
            this._frameIdx = 0;
            this._counter = 0;
        }
        Draw(ctx) {
            const frame = this._frames[this._frameIdx];
            ctx.drawImage(this._tileset.image, frame.x, frame.y, this._tileset.tileWidth, this._tileset.tileHeight, this._pos.x - 0.2, this._pos.y - 0.2, this._width + 0.4, this._height + 0.4);
        }
        Update(elapsedTimeS) {
            this._counter += 1000 * elapsedTimeS;
            if(this._counter >= this._frameRate) {
                this._counter = 0;
                ++this._frameIdx;
                if(this._frameIdx >= this._frames.length) {
                    this._frameIdx = 0;
                }
            }
        }
    }

    return {
        Tile: Tile,
        AnimatedTile: AnimatedTile
    }

})();