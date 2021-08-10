import { entity } from "./entity.js";
import { physics } from "./physics.js";
import { player_entity } from "./player-entity.js";
import { Scene } from "./scene.js";
import { spatial_hash_grid } from "./spatial-hash-grid.js";
import { Sprite } from "./sprite.js";
import { tile } from "./tile.js";
import { Vector } from "./vector.js";

export class Level extends Scene {
    constructor(params) {
        super(params);
        this._Init();
    }
    _Init() {

        this._textboxHandler = this._params.textboxHandler;
        this._textboxHandler._domElement.addEventListener(this._eventByDevice, () => this._NextMessage());

        const tilemap = this._params.tilemap;
        const tileset = this._params.tileset;
        const tileWidth = this._params.tileWidth;
        const tileHeight = this._params.tileHeight;

        this._grid = new spatial_hash_grid.SpatialHashGrid([[0, 0], [tileWidth * tilemap.width, tileHeight * tilemap.height]], [Math.floor(tilemap.width / 2), Math.floor(tilemap.height / 2)])

        const HandleObjectgroup = (layer, zIndex) => {
            
            const InitPlayer = (e) => {
                const sprite = new Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["player"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("idle", [
                    {x: 1, y: 1}
                ]);
                sprite.AddAnim("run", [
                    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 1, y: 0}
                ]);
                sprite.AddAnim("jump", [
                    {x: 0, y: 1}
                ]);
                e.AddComponent(sprite, "drawobj");

                const body = new physics.Box({
                    width: tileWidth,
                    height: tileHeight,
                    frictionX: 0.08,
                    frictionY: 0.01
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);
                e.AddComponent(new player_entity.Controller());
            }

            for(let obj of layer.objects) {
                let elem, name;

                elem = new entity.Entity();
                elem.SetPosition(new Vector(obj.x * tileWidth / tilemap.tilewidth, obj.y * tileHeight / tilemap.tileheight));

                switch(obj.name) {
                    case "player":
                        InitPlayer(elem);
                        name = "player";
                        break;
                }
                
                this.Add(elem, name);
            }
        
        }

        const HandleTilelayer = (layer, zIndex) => {

            for(let j = 0; j < layer.data.length; ++j) {

                const id = (layer.data[j]) - 1;
                if(id < 0) continue;

                let t;
                
                const tilesetObj = tileset.Get(id);

                const params = {
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    tileset: tileset
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
                elem.SetPosition(new Vector(j % tilemap.width * tileWidth, Math.floor(j / tilemap.width) * tileHeight));
                elem.groupList.add("tile");
                elem.AddComponent(t, "drawobj");
                
                if(tilesetObj.props.collide) {
                    if(tilesetObj.props.type == "block") {
                        elem.groupList.add("block");
                        const body = new physics.Box({
                            width: tileWidth,
                            height: tileHeight
                        });
                        elem.AddComponent(body, "body");
                        const gridController = new spatial_hash_grid.SpatialGridController({
                            grid: this._grid,
                            width: body._width,
                            height: body._height
                        });
                        elem.AddComponent(gridController);
                    }
                }
                /*if(tilesetObj?.props?.collideType) {
                    const body = new physics.Box({
                        width: tileWidth,
                        height: tileHeight
                    });
                    elem.AddComponent(body, "body");
    
                    const gridController = new spatial_hash_grid.SpatialGridController({
                        grid: this._grid,
                        width: tileWidth,
                        height: tileHeight
                    });
                    elem.AddComponent(gridController);
                }*/
                

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
    AddMessage(imageURL, text) {
        this._textboxHandler.AddMessage(imageURL, text);
        if(!this._textboxHandler._blocked) {
            this._NextMessage();
        }
    }
    _NextMessage() {
        this._textboxHandler.NextMessage();
        if(this._textboxHandler._blocked) {
            this.Pause();
        } else {
            this.Play();
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