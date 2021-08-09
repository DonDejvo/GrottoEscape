export const tileset = (() => {

    class Tileset {
        constructor(tileset, image) {
            this._tileset = tileset;
            this.image = image;
            this._Init();
        }
        _Init() {
            this.tileWidth = this._tileset.tilewidth;
            this.tileHeight = this._tileset.tileheight;
            this.columns = this._tileset.columns;
            this._tiles = new Map([]);
            for(let e of this._tileset.tiles) {
                const obj = {};
                obj.animation = e.animation;
                obj.props = {};
                for(let prop of e.properties) {
                    obj.props[prop.name] = prop.value;
                }
                this._tiles.set(e.id, obj);
            }
        }
        Get(id) {
            if(!this._tiles.has(id)) {
                return {};
            }
            return this._tiles.get(id);
        }
    }

    return {
        Tileset: Tileset,
    }

})();