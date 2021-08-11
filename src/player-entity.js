import { entity } from "./entity.js";
import { physics } from "./physics.js";

export const player_entity = (() => {

    class Controller extends entity.Component {
        constructor() {
            super();
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const input = this.GetComponent("Input");
            const sprite = this.GetComponent("drawobj");

            if(input._keys.right) {
                if(!body._collide.right) body._vel.x += 720 * elapsedTimeS;
                sprite._flip.x = false;
            }
            if(input._keys.left) {
                if(!body._collide.left) body._vel.x -= 720 * elapsedTimeS;
                sprite._flip.x = true;
            }
            if(body._collide.bottom && input._keys.jump) body._vel.y = -330;

            body._vel.y += physics.GRAVITY * elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.x *= (1 - body._friction.x);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

            const result = gridController.FindNearby(body._width, body._height);
            const tiles = result.filter(client => client.entity.groupList.has("tile"));

            body._collide.left = body._collide.right = body._collide.top = body._collide.bottom = null;

            for(let client of tiles) {
                physics.ResolveCollision(body, client.entity.GetComponent("body"));
            }

            if(body._collide.left || body._collide.right) {
                body._vel.x = 0;
            }
            if(body._collide.top || body._collide.bottom) {
                body._vel.y = 0;
            }

            const currentAnim = sprite.currentAnim;

            if(!body._collide.bottom) {
                if(currentAnim != "jump") sprite.PlayAnim("jump", 200, false);
            } else {
                if(Math.abs(body._vel.x) > 50) {
                    if(currentAnim != "run") sprite.PlayAnim("run", 200, true);
                } else {
                    if(currentAnim != "idle") sprite.PlayAnim("idle", 200, false);
                }
            }

        }
    }

    class Input extends entity.Component {
        constructor(params) {
            super();
            this._params = params;
            this._keys = {
                left: false,
                right: false,
                up: false,
                down: false,
                jump: false,
                shoot: false
            };
        }
        Update(_) {
            const joystick = this._params.joystick;
            let joystickState = "idle";
            if(joystick.range > 0) {
                if(Math.abs(joystick._vec.x) > Math.abs(joystick._vec.y)) {
                    if(joystick._vec.x < 0) {
                        joystickState = "left";
                    } else {
                        joystickState = "right";
                    }
                } else {
                    if(joystick._vec.y < 0) {
                        joystickState = "up";
                    } else {
                        joystickState = "down";
                    }
                }
            }
            this._keys.left = this._keys.right = this._keys.up = this._keys.down = false;
            this._keys[joystickState] = true;
            this._keys.jump = this._params.jumpButton.pressed;
        }
    }

    return {
        Controller: Controller,
        Input: Input
    }

})();