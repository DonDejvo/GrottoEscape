import { entity } from "./entity.js";
import { Scene } from "./scene.js";
import { tile } from "./tile.js";
import { Vector } from "./vector.js";

export class Level extends Scene {
    constructor(params) {
        super();
        this._params = params;
        this._Init();
    }
    _Init() {
        const tilemap = this._params.tilemap;
        const tileset = this._params.tileset;
        const tileWidth = this._params.tileWidth;
        const tileHeight = this._params.tileHeight;

        const HandleObjectgroup = (layer, zIndex) => {

            for(let obj of layer.objects) {
                let elem;

                elem = new entity.Entity();
                
                elem._zIndex = zIndex;
                elem.SetPosition(new Vector(obj.x, obj.y));
                this.Add(elem);
            }
        
        }

        const HandleTilelayer = (layer, zIndex) => {

            for(let j = 0; j < layer.data.length; ++j) {

                const id = (layer.data[j]) - 1;
                let t;
                
                const tilesetObj = tileset.Get(id);

                const params = {
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    tileset: tileset,
                    props: tilesetObj.props
                };

                if(tilesetObj.animation) {
                    const frames = [];
                    for (let frame of tilesetObj.animation) {
                        const tileId = frame.tileid;
                        const tileX = tileId % tileset.columns * tileset.tileWidth;
                        const tileY = Math.floor(tileId / tileset.columns) * tileset.tileHeight;
                        frames.push({ x: tileX, y: tileY });
                    }
                    params.frames = frames;
                    t = new tile.AnimatedTile(params);
                } else {
                    params.tileX = id % tileset.columns * tileset.tileWidth;
                    params.tileY = Math.floor(id / tileset.columns) * tileset.tileHeight;
                    t = new tile.Tile(params);
                }

                let elem = new entity.Entity();
                elem.AddComponent(t, "drawobj");
                elem.SetPosition(new Vector(j % tilemap.width * tileWidth, Math.floor(j / tilemap.width) * tileHeight));
                this.Add(elem);

            }
        
        }

        for(let i = 0; i < tilemap.layers.length; ++i) {
            if(tilemap.layers[i].type == "tilelayer") {
                HandleTilelayer(tilemap.layers[i], i);
            } else if(tilemap.layers[i].type == "objectgroup") {
                HandleObjectgroup(tilemap.layers[i], i);
            }
        }
    }
}

/*

    for(let i = 0; i < tilemap.layers.length; ++i) {
        if(tilemap.layers[i].type == "tilelayer") {
            HandleTilelayer(tilemap.layers[i], i);
        } else if(tilemap.layers[i].type == "objectgroup") {
            HandleObjectgroup(tilemap.layers[i], i);
        }
    }

*/

/*

const HandleObjectgroup = (layer, zIndex) {

    for(let obj of layer.objects) {
        let entity;
        switch(obj.name) {
            case "player":
                entity = new Player();
            case "exit":
                entity = new Exit();
                break;
        }
        entity._zIndex = zIndex;
        entity.SetPosition(new Vector(obj.x, obj.y));
        this.Add(entity);
    }

}

*/

/*

const HandleTilelayer = (layer, zIndex) {

    const id = (layer.data[j]) - 1;
    let tile;

    const params = {
        width: tileWidth,
        height: tileHeight,
        zIndex: zIndex,
        tileWidth:  tileset.tilewidth,
        tileHeight: tileset.tileheight
    };

    if(tileset[id].animation) {
        const frames = [];
        for(let frame of tileset[id].animation) {
            const tileX = frame % tileset.columns * tileset.tilewidth;
            const tileY = Math.floor(frame / tileset.columns) * tileset.tileheight;
            frames.push({x: tileX, y: tileY});
        }
        params.frames = frames;
        tile = new AnimatedTile(params);
    } else {
        params.tileX = id % tileset.columns * tileset.tilewidth;
        params.tileY = Math.floor(id / tileset.columns) * tileset.tileheight;
        tile = new Tile(params);
    }

    tile.SetPosition(new Vector(j % tilemap.width * tileWidth, Math.floor(j / tilemap.width) * tileHeight));
    this.Add(tile);

}

*/