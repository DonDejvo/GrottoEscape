import { entity } from "./entity.js";
import { physics } from "./physics.js";
import { Vector } from "./vector.js";

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

            const result = gridController.FindNearby(body._width * 4, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block"));

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

        }
    }

    class SkeletonController extends entity.Component {
        constructor() {
            super();
            this._movingRight = true;
            this._limits = {left: null, right: null};
            this._attacking = false;
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            const result = gridController.FindNearby(body._width * 4, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block") || client.entity.groupList.has("stairs"));

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
            let following = false;
            let movingRight = this._movingRight;

            if(distToPlayer <= 30 || this._attacking) {
                this._attacking = true;
                movingRight = body._pos.x < player._pos.x;
            } else
            if((this._limits.left === null || player._pos.x >= this._limits.left) && (this._limits.right === null || player._pos.x <= this._limits.right) && distToPlayer <= 200) {
                movingRight = body._pos.x < player._pos.x;
                following = true;
            } else if(Math.random() > 0.995) {
                movingRight = movingRight;
            }

            if(collide.left || collide.right) {
                body._vel.x = 0;
                if(collide.right) {
                    this._limits.right = body._pos.x;
                    movingRight = false;
                } else {
                    this._limits.left = body._pos.x;
                    movingRight = true;
                }
            }
            if(collide.top || collide.bottom) {
                body._vel.y = 0;
            }

            const currentAnim = sprite.currentAnim;
            if(this._attacking) {
                if(currentAnim != "attack") sprite.PlayAnim("attack", 180, true, () => {
                    this._attacking = false;
                });
            } else {
                if(currentAnim != "run") sprite.PlayAnim("run", 180, true);
            }

            if(!(following && Math.abs(player._pos.x - body._pos.x) < 50)) {
                this._movingRight = movingRight;
            }

            if(this._attacking) {
                body._vel.x = 0;
                sprite._flip.x = !this._movingRight;
            } else {
                if(this._movingRight) {
                    body._vel.x = 100;
                    sprite._flip.x = false;
                } else {
                    body._vel.x = -100;
                    sprite._flip.x = true;
                }
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
            const tiles = result.filter(client => client.entity.groupList.has("block"));

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
            if(this._counter >= 1800) {
                this._counter -= 1800;
                this._shooting = true;
            }

            const currentAnim = sprite.currentAnim;

            if(this._shooting) {
                if(currentAnim != "shoot") sprite.PlayAnim("shoot", 540, false, () => {
                    this._shooting = false;
                });
            } else {
                if(currentAnim != "idle") sprite.PlayAnim("idle", 180, true);
            }

            if(!this._shooting) {
                this._lookingRight = player._pos.x >= body._pos.x;
                sprite._flip.x = this._lookingRight;
            }

            body._vel.y += 550 * elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);

            body._collide.left.clear();
            body._collide.right.clear();
            body._collide.top.clear();
            body._collide.bottom.clear();

            for(let client of tiles) {
                physics.ResolveCollision(body, client.entity.GetComponent("body"));
            }

        }
    }

    return {
        BatController: BatController,
        SlimeController: SlimeController,
        SkeletonController: SkeletonController,
        LizardController: LizardController
    };

})();