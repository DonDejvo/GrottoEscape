import { entity } from "./entity.js";
import { physics } from "./physics.js";
import { Vector } from "./vector.js";

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

            const result = gridController.FindNearby(body._width * 2, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block") || client.entity.groupList.has("stairs"));
            const ledders = result.filter(client => client.entity.groupList.has("ledder"));

            let ledders1 = ledders.filter(client => physics.DetectCollision(body, client.entity.GetComponent("body")));
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

            const currentAnim = sprite.currentAnim;

            if(this._climbing && !collide.bottom) {
                if(input._keys.up || input._keys.down) {
                    if(currentAnim != "ledder") sprite.PlayAnim("ledder", 180, true);
                    sprite.Resume();
                } else {
                    if(currentAnim != "ledder") sprite.PlayAnim("ledder", 180, false);
                    sprite.Pause();
                }
            } else if(!collide.bottom) {
                if(currentAnim != "jump") sprite.PlayAnim("jump", 180, false);
            } else {
                if(Math.abs(body._vel.x) > 70) {
                    if(currentAnim != "run") sprite.PlayAnim("run", 180, true);
                } else {
                    if(currentAnim != "idle") sprite.PlayAnim("idle", 180, false);
                }
            }

            if(input._keys.right) {
                if(!collide.right) body._vel.x += 20; //860 * elapsedTimeS;
                sprite._flip.x = false;
                this._climbing = false;
            }
            if(input._keys.left) {
                if(!collide.left) body._vel.x -= 20; //860 * elapsedTimeS;
                sprite._flip.x = true;
                this._climbing = false;
            }
            if((collide.bottom || this._climbing) && input._keys.jump) {
                this._climbing = false;
                if(!collide.top) body._vel.y = -390; //-22000 * elapsedTimeS;
            }

            if(((this._climbing && !collide.bottom) || (!this._climbing && (input._keys.up || input._keys.down))) && ledders1.length > 0) {
                this._climbing = true;
                body._pos.x = ledders1[0].entity._pos.x;
                if(input._keys.up) body._vel.y = -120; //-8000 * elapsedTimeS;
                else if(input._keys.down) body._vel.y = 120; //8000 * elapsedTimeS;
                else body._vel.y = 0;
            } else if(collide.bottom || ledders1.length == 0) {
                this._climbing = false;
            }

            if(!this._climbing) body._vel.y += 550 * elapsedTimeS; //* elapsedTimeS;

            body._oldPos.Copy(body._pos);
            body._vel.x *= (1 - body._friction.x);
            body._vel.y *= (1 - body._friction.y);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);
            if(Array.from(body._collide.bottom).filter(platform => platform._parent && platform._parent.groupList.has("stairs")).length) {
                body._pos.y += Math.abs(body._vel.x * elapsedTimeS);
            }

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
                     this._climbing = false;
                     body._collide.bottom.add(ledder);
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
            if(joystick.range >= 0.25) {
            if(joystick.rangeX >= joystick.rangeY) {
                joystick._vec.x < 0 ? joystickState.left = true : joystickState.right = true;
            } else {
                joystick._vec.y < 0 ? joystickState.up = true : joystickState.down = true;
            }
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
