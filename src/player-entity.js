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

            if(!body._collide.bottom) body._vel.y += physics.GRAVITY * elapsedTimeS;
            if(!body._collide.right) body._vel.x += 720 * elapsedTimeS;
            if(body._collide.bottom) body._vel.y = -330;


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
    }

    return {
        Controller: Controller,
        Input: Input
    }

})();