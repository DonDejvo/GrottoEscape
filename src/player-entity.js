import { entity } from "./entity.js";
import { physics } from "./physics.js";

export const player_entity = (() => {

    class Controller extends entity.Component {
        constructor() {
            super();
            this._climbing = false;
        }
        Update(elapsedTimeS) {
            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const input = this.GetComponent("Input");
            const sprite = this.GetComponent("drawobj");

            const result = gridController.FindNearby(body._width, body._height);
            const tiles = result.filter(client => client.entity.groupList.has("block"));
            const ledder = result.filter(client => client.entity.groupList.has("ledder"))
                .some(client => physics.DetectCollision(body, client.entity.GetComponent("body")));

            if(input._keys.right) {
                if(!body._collide.right) body._vel.x += 720 * elapsedTimeS;
                sprite._flip.x = false;
            }
            if(input._keys.left) {
                if(!body._collide.left) body._vel.x -= 720 * elapsedTimeS;
                sprite._flip.x = true;
            }
            if((body._collide.bottom || this._climbing) && input._keys.jump) {
                this._climbing = false;
                if(!body._collide.top) body._vel.y = -330;
            }

            if(((this._climbing && !body._collide.bottom) || (!this._climbing && (input._keys.up || input._keys.down))) && ledder) {
                this._climbing = true;
                if(input._keys.up) body._vel.y = -80;
                else if(input._keys.down) body._vel.y = 80;
                else body._vel.y = 0;
            } else if(body._collide.bottom || !ledder) {
                this._climbing = false;
            }

            if(!this._climbing) body._vel.y += physics.GRAVITY * elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.x *= (1 - body._friction.x);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

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
            let joystickState = {
                left: false,
                right: false,
                up: false,
                down: false,
            };
            
            if(joystick.rangeX > 0.5) {
                joystick._vec.x < 0 ? joystickState.left = true : joystickState.right = true;
            }
            if(joystick.rangeY > 0.5) {
                joystick._vec.y < 0 ? joystickState.up = true : joystickState.down = true;
            }
            this._keys.left = (joystickState.left || this._params.keyboard.IsPressed("a"));
            this._keys.right = (joystickState.right || this._params.keyboard.IsPressed("d"));
            this._keys.up = (joystickState.up || this._params.keyboard.IsPressed("w"));
            this._keys.down = (joystickState.down || this._params.keyboard.IsPressed("s"));
            this._keys.jump = (this._params.jumpButton.pressed || this._params.keyboard.IsPressed("k"));
        }
    }

    return {
        Controller: Controller,
        Input: Input
    }

})();