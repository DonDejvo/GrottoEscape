import { entity } from "./entity.js";
import { physics } from "./physics.js";
import { Vector } from "./vector.js";
import { spatial_hash_grid } from "./spatial-hash-grid.js";
import { bullet } from "./bullet.js";
import { drawable } from "./drawable.js";

export const enemy_entity = (() => {

    class BatController extends entity.Component {
        constructor() {
            super();
            this._movingRight = true;
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            const result = gridController.FindNearby(body._width * 2, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block"));

            const collide = {
                left: body._collide.left.size > 0,
                right: body._collide.right.size > 0,
            };

            if(collide.left || collide.right) {
                body._vel.x = 0;
                this._movingRight = !this._movingRight;
            }

            if(this._movingRight) {
                body._vel.x = 240;
                sprite._flip.x = false;
            } else {
                body._vel.x = -240;
                sprite._flip.x = true;
            }

            body._oldPos.Copy(body._pos);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

            body._collide.left.clear();
            body._collide.right.clear();
            body._collide.top.clear();
            body._collide.bottom.clear();

            for(let client of tiles) {
                physics.ResolveCollision(body, client.entity.GetComponent("body"));
            }

        }
    }

    class SlimeController extends entity.Component {
        constructor() {
            super();
            this._movingRight = true;
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            const player = this.FindEntity("player").GetComponent("body");

            const result = gridController.FindNearby(body._width * 4, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block") || client.entity.groupList.has("platform"));
            const ledders = result.filter(client => client.entity.groupList.has("ledder"));

            if(physics.DetectCollision(player, body)) {
                const playerController = player.GetComponent("Controller");
                playerController.ReceiveDamage(20);
            }

            const collide = {
                left: body._collide.left.size > 0,
                right: body._collide.right.size > 0,
                top: body._collide.top.size > 0,
                bottom: body._collide.bottom.size > 0
            };

            const b = new physics.Box({
                width: body._width,
                height: body._height
            });
            b._oldPos.Copy(new Vector(body._pos.x + (this._movingRight ? body._width : -body._width), body._pos.y));
            b._pos.Copy(new Vector(body._pos.x + (this._movingRight ? body._width : -body._width), body._pos.y + 1));

            for(let client of tiles) {
                physics.ResolveCollision(b, client.entity.GetComponent("body"));
            }

            if(collide.left || collide.right || (b._collide.bottom.size == 0 && collide.bottom)) {
                body._vel.x = 0;
                this._movingRight = !this._movingRight;
            }
            if(collide.top || collide.bottom) {
                body._vel.y = 0;
            }

            if(this._movingRight) {
                body._vel.x = 60;
                sprite._flip.x = false;
            } else {
                body._vel.x = -60;
                sprite._flip.x = true;
            }

            body._vel.y += 550 * elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

            body._collide.left.clear();
            body._collide.right.clear();
            body._collide.top.clear();
            body._collide.bottom.clear();

            for(let client of tiles) {
                physics.ResolveCollision(body, client.entity.GetComponent("body"));
            }

            let ledders2 = ledders.filter(client => physics.DetectCollision(body, client.entity.GetComponent("body")));

            if(ledders2.length == 1) {
                 const ledder =  ledders2[0].entity.GetComponent("body");
                 if(body.bottom >= ledder.top && body._oldPos.y + body._height / 2 <= ledder.top && !input._keys.down) {
                     body._pos.y = ledder.top - body._height / 2 - 0.001;
                     body._collide.bottom.add(ledder);
                 }
            }

        }
    }

    class SkeletonController extends entity.Component {
        constructor() {
            super();
            this._movingRight = true;
            this._limits = {left: null, right: null};
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            const result = gridController.FindNearby(body._width * 4, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block") || client.entity.groupList.has("stairs") || client.entity.groupList.has("platform"));

            const player = this.FindEntity("player").GetComponent("body");

            const collide = {
                left: body._collide.left.size > 0,
                right: body._collide.right.size > 0,
                top: body._collide.top.size > 0,
                bottom: body._collide.bottom.size > 0
            };

            if(!Array.from(body._collide.bottom).some(platform => platform._parent && platform._parent.groupList.has("stairs"))) {
                const b = new physics.Box({
                    width: body._width,
                    height: body._height
                });
                b._oldPos.Copy(new Vector(body._pos.x + (this._movingRight ? body._width : -body._width), body._pos.y));
                b._pos.Copy(new Vector(body._pos.x + (this._movingRight ? body._width : -body._width), body._pos.y + 1));
    
                for(let client of tiles) {
                    physics.ResolveCollision(b, client.entity.GetComponent("body"));
                }
    
                if(b._collide.bottom.size == 0 && collide.bottom) {
                    this._movingRight ? collide.right = true : collide.left = true;
                }
            }

            const distToPlayer = Vector.Dist(body._pos, player._pos);

            if((this._limits.left === null || player._pos.x >= this._limits.left) && (this._limits.right === null || player._pos.x <= this._limits.right) && distToPlayer <= 200) {
                if(Math.abs(player._pos.x - body._pos.x) > 50) this._movingRight = body._pos.x < player._pos.x;
            } else if(Math.random() > 0.995) {
                this._movingRight = !this._movingRight;
            }

            if(collide.left || collide.right) {
                body._vel.x = 0;
                if(collide.right) {
                    this._limits.right = body._pos.x;
                    this._movingRight = false;
                } else {
                    this._limits.left = body._pos.x;
                    this._movingRight = true;
                }
            }
            if(collide.top || collide.bottom) {
                body._vel.y = 0;
            }

            if(this._movingRight) {
                body._vel.x = 100;
                sprite._flip.x = false;
            } else {
                body._vel.x = -100;
                sprite._flip.x = true;
            }

            body._vel.y += 550 * elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);
            if(Array.from(body._collide.bottom).some(platform => platform._parent && platform._parent.groupList.has("stairs"))) {
                body._pos.y += Math.abs(body._vel.x * elapsedTimeS);
            }

            body._collide.left.clear();
            body._collide.right.clear();
            body._collide.top.clear();
            body._collide.bottom.clear();

            for(let client of tiles) {
                physics.ResolveCollision(body, client.entity.GetComponent("body"));
            }

        }
    }

    class LizardController extends entity.Component {
        constructor() {
            super();
            this._shooting = false;
            this._counter = 0;
            this._lookingRight = true;
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            const result = gridController.FindNearby(body._width * 4, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block") || client.entity.groupList.has("platform"));

            const player = this.FindEntity("player").GetComponent("body");

            const collide = {
                left: body._collide.left.size > 0,
                right: body._collide.right.size > 0,
                top: body._collide.top.size > 0,
                bottom: body._collide.bottom.size > 0
            };

            if(collide.left || collide.right) {
                body._vel.x = 0;
            }
            if(collide.top || collide.bottom) {
                body._vel.y = 0;
            }

            this._counter += elapsedTimeS * 1000;
            if(this._counter >= 3000) {
                this._counter -= 3000;
                this._shooting = true;
            }

            const currentAnim = sprite.currentAnim;

            if(this._shooting) {
                if(currentAnim != "shoot") sprite.PlayAnim("shoot", 540, false, () => {
                    this._shooting = false;
                    this._CreateFireball();
                });
            } else {
                if(currentAnim != "idle") sprite.PlayAnim("idle", 180, true);
            }

            if(!this._shooting) {
                this._lookingRight = player._pos.x >= body._pos.x;
                sprite._flip.x = !this._lookingRight;
            }

            body._vel.y += 550 * elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

            body._collide.left.clear();
            body._collide.right.clear();
            body._collide.top.clear();
            body._collide.bottom.clear();

            for(let client of tiles) {
                physics.ResolveCollision(body, client.entity.GetComponent("body"));
            }

        }
        _CreateFireball() {
            const e = new entity.Entity();
            e.groupList.add("fireball");

            e.SetPosition(this.GetComponent("body")._pos);

            const sprite = new drawable.Sprite({
                zIndex: this.GetComponent("Sprite")._zIndex,
                width: 48,
                height: 48,
                image: this._parent._scene._resources["items"],
                frameWidth: 16,
                frameHeight: 16,
                flipX: !this._lookingRight
            });
            sprite.AddAnim("fly", [
                {x: 0, y: 2}, {x: 1, y: 2}
            ]);
            sprite.AddAnim("explode", [
                {x: 3, y: 2}, {x: 4, y: 2}
            ]);
            sprite.PlayAnim("fly", 180, true);
            e.AddComponent(sprite);
            this._parent._scene.Add(e);
            const body = new physics.Box({
                width: sprite._width * 0.6,
                height: sprite._height * 0.4
            });
            body._vel.x = this._lookingRight ? 300 : -300;
            e.AddComponent(body, "body");

            const gridController = new spatial_hash_grid.SpatialGridController({
                grid: this._parent._scene._grid,
                width: body._width,
                height: body._height
            });
            e.AddComponent(gridController);
            e.AddComponent(new bullet.FireballController({
                target: "player"
            }));
        }
    }

    class GhostController extends entity.Component {
        constructor() {
            super();
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            const result = gridController.FindNearby(body._width * 2, body._height * 2);

            const player = this.FindEntity("player").GetComponent("body");

            const distToPlayer = Vector.Dist(player._pos, body._pos);

            if(distToPlayer <= 300 && !physics.DetectCollision(player, body)) {
                const vel = player._pos.Clone();
                vel.Sub(body._pos);
                vel.Unit();
                vel.Mult(10);
                body._vel.Add(vel);
            }


            if(body._vel.x > 0) {
                sprite._flip.x = false;
            } else {
                sprite._flip.x = true;
            }

            body._oldPos.Copy(body._pos);
            body._vel.x *= (1 - body._friction.x);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

        }
    }

    class LavaballController extends entity.Component {
        constructor() {
            super();
        }
        InitComponent() {
            this._startPosY = this._parent._pos.y;
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            if(body._pos.y > this._startPosY) {
                body._pos.y = this._startPosY;
                body._vel.y = -700;
            }

            body._vel.y += 550 * elapsedTimeS;

            sprite._flip.y = body._vel.y > 0;

            body._oldPos.Copy(body._pos);
            body._vel.x *= (1 - body._friction.x);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

        }
    }

    return {
        BatController: BatController,
        SlimeController: SlimeController,
        SkeletonController: SkeletonController,
        LizardController: LizardController,
        GhostController: GhostController,
        LavaballController: LavaballController
    };

})();