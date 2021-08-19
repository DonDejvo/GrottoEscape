import { drawable } from "./drawable.js";
import { enemy_entity } from "./enemy-entity.js";
import { entity } from "./entity.js";
import { physics } from "./physics.js";
import { player_entity } from "./player-entity.js";
import { Scene } from "./scene.js";
import { spatial_hash_grid } from "./spatial-hash-grid.js";
import { StorypointHandler } from "./storypoint.js";
import { Vector } from "./vector.js";

export class Level extends Scene {
    constructor(params) {
        super(params);
        this._data = this._params.data;
        this._textboxHandler = this._params.textboxHandler;
        this._input = this._params.input;
        this._storypointIndex = 0;
        this._Init();
    }
    _Init() {
        
        const tilemap = this._resources[this._data.tilemap];
        const tileset = this._params.tileset;
        const tileWidth = 48;
        const tileHeight = 48;

        this._grid = new spatial_hash_grid.SpatialHashGrid([[0, 0], [tileWidth * tilemap.width, tileHeight * tilemap.height]], [Math.floor(tilemap.width / 2), Math.floor(tilemap.height / 2)])

        const HandleObjectgroup = (layer, zIndex) => {
            
            const InitPlayer = (e) => {
                e.groupList.add("player");

                const sprite = new drawable.Sprite({
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
                sprite.AddAnim("ledder", [
                    {x: 4, y: 0}, {x: 4, y: 1}
                ]);
                sprite.AddAnim("shoot", [
                    {x: 3, y: 0}
                ]);
                sprite.AddAnim("die", [
                    {x: 3, y: 1}
                ]);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.72,
                    height: tileHeight * 0.96,
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
                e.AddComponent(new player_entity.Input({
                    keyboard: this._input.keyboard,
                    joystick: this._input.joystick,
                    jumpButton: this._input.jumpButton,
                    shootButton: this._input.shootButton
                }));

            }

            const InitBat = (e) => {

                e.groupList.add("enemy");
                e.groupList.add("bat");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["enemies"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("fly", [
                    {x: 2, y: 2}, {x: 0, y: 2}, {x: 1, y: 2}
                ]);
                sprite.PlayAnim("fly", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.8,
                    height: tileHeight * 0.7
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);

                e.AddComponent(new enemy_entity.BatController());
            }

            const InitSlime = (e) => {
                e.groupList.add("enemy");
                e.groupList.add("slime");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["enemies"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("move", [
                    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}
                ]);
                sprite.PlayAnim("move", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.7,
                    height: tileHeight * 0.8,
                    frictionY: 0.01
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);

                e.AddComponent(new enemy_entity.SlimeController());
            }

            const InitLizard = (e) => {
                e.groupList.add("enemy");
                e.groupList.add("lizard");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["enemies"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("idle", [
                    {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}
                ]);
                sprite.AddAnim("shoot", [
                    {x: 3, y: 1}
                ]);
                sprite.PlayAnim("idle", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.8,
                    height: tileHeight * 0.98,
                    frictionY: 0.01
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);

                e.AddComponent(new enemy_entity.LizardController());
            }

            const InitSkeleton = (e) => {
                e.groupList.add("enemy");
                e.groupList.add("skeleton");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["skeleton"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("run", [
                    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}
                ]);
                sprite.PlayAnim("run", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.8,
                    height: tileHeight * 0.98,
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

                e.AddComponent(new enemy_entity.SkeletonController());
            }

            const InitGhost = (e) => {
                e.groupList.add("enemy");
                e.groupList.add("ghost");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["ghost"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("fly", [
                    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}
                ]);
                sprite.PlayAnim("fly", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.8,
                    height: tileHeight * 0.98,
                    frictionX: 0.08,
                    frictionY: 0.04
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);

                e.AddComponent(new enemy_entity.GhostController());
            }

            const InitLavaball = (e) => {
                e.groupList.add("lavaball");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["lavaball"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("fly", [
                    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}
                ]);
                sprite.PlayAnim("fly", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.8,
                    height: tileHeight * 0.8,
                    frictionX: 0.01,
                    frictionY: 0.01
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);

                e.AddComponent(new enemy_entity.LavaballController());
            }

            const InitCrystal = (e) => {
                e.groupList.add("item");
                e.groupList.add("crystal");

                const sprite = new drawable.Sprite({
                    width: tileWidth,
                    height: tileHeight,
                    zIndex: zIndex,
                    image: this._resources["items"],
                    frameWidth: 16,
                    frameHeight: 16
                });
                sprite.AddAnim("spin", [
                    {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}
                ]);
                sprite.PlayAnim("spin", 180, true);
                e.AddComponent(sprite);

                const body = new physics.Box({
                    width: tileWidth * 0.3,
                    height: tileHeight * 0.5,
                });
                e.AddComponent(body, "body");

                const gridController = new spatial_hash_grid.SpatialGridController({
                    grid: this._grid,
                    width: body._width,
                    height: body._height
                });
                e.AddComponent(gridController);
            }

            const InitExit = (e) => {
                e.groupList.add("exit");

                const text = new drawable.Text({
                    width: tileWidth * 2,
                    height: tileHeight,
                    zIndex: zIndex,
                    fontSize: 24,
                    text: "EXIT",
                    color: "green"
                });
                e.AddComponent(text);

                const body = new physics.Box({
                    width: tileWidth * 2,
                    height: tileHeight * 1,
                });
                e.AddComponent(body, "body");
            }

            const InitStorypoint = (e) => {
                e.groupList.add("storypoint");

                const body = new physics.Box({
                    width: tileWidth * 3,
                    height: tileHeight * 3,
                });
                e.AddComponent(body, "body");

                e.AddComponent(new StorypointHandler());
            }

            for(let obj of layer.objects) {
                let elem, name;

                const pos = new Vector(obj.x * tileWidth / tilemap.tilewidth, obj.y * tileHeight / tilemap.tileheight);

                elem = new entity.Entity();
                elem.SetPosition(pos);

                switch(obj.name) {
                    case "player":
                        this._startPos = pos;
                        InitPlayer(elem);
                        name = "player";
                        break;
                    case "bat":
                        InitBat(elem);
                        break;
                    case "slime":
                        InitSlime(elem);
                        break;
                    case "lizard":
                        InitLizard(elem);
                        break;
                    case "skeleton":
                        InitSkeleton(elem);
                        break;
                    case "ghost":
                        InitGhost(elem);
                        break;
                    case "crystal":
                        InitCrystal(elem);
                        break;
                    case "lavaball":
                        InitLavaball(elem);
                        break;
                    case "exit":
                        InitExit(elem);
                        name = "exit";
                        break;
                    case "storypoint":
                        InitStorypoint(elem);
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
                    t = new drawable.AnimatedTile(params);
                } else {
                    params.tileX = id % tileset.columns * tileset.tileWidth;
                    params.tileY = Math.floor(id / tileset.columns) * tileset.tileHeight;
                    t = new drawable.Tile(params);
                }

                let elem = new entity.Entity();
                elem.SetPosition(new Vector(j % tilemap.width * tileWidth, Math.floor(j / tilemap.width) * tileHeight));
                elem.groupList.add("tile");
                elem.AddComponent(t);
                
                if(tilesetObj.props.collide) {
                    if(["block", "ledder", "platform", "lava", "water", "spikes"].includes(tilesetObj.props.type)) {
                        elem.groupList.add(tilesetObj.props.type);
                        const edges = [...new Array(4)].map((_, i) => Math.floor(tilesetObj.props.edges / Math.pow(10, 3 - i)) % 10);
                        const body = new physics.Box({
                            width: tileWidth,
                            height: tileHeight,
                            edges: edges
                        });
                        elem.AddComponent(body, "body");
                    } else if(tilesetObj.props.type == "stairs") {
                        elem.groupList.add(tilesetObj.props.type);
                        const body = new physics.Line({
                            start: {x: -tileWidth / 2, y: (0.5 - tilesetObj.props.start) * tileHeight},
                            end: {x: tileWidth / 2, y: (0.5 - tilesetObj.props.end) * tileHeight}
                        });
                        elem.AddComponent(body, "body");
                    }
                    const gridController = new spatial_hash_grid.SpatialGridController({
                        grid: this._grid,
                        width: tileWidth,
                        height: tileHeight
                    });
                    elem.AddComponent(gridController);
                }
                

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
    Play() {
        super.Play();
        document.querySelector("#game-controls").style.visibility = "visible";
    }
    Pause() {
        super.Pause();
        document.querySelector("#game-controls").style.visibility = "hidden";
    }
    OnClick() {
        this._NextMessage();
    }
    Remove(e) {
        super.Remove(e);
        if(e.GetComponent("SpatialGridController")) {
            e.GetComponent("SpatialGridController").Remove();
        }
    }
}