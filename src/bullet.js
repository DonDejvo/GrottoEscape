import { entity } from "./entity.js";
import { physics } from "./physics.js";

export const bullet = (() => {

    class FireballController extends entity.Component {
        constructor(params) {
            super();
            this._targetGroup = params.target;
        }
        Update(elapsedTimeS) {

            const body = this.GetComponent("body");
            const gridController = this.GetComponent("SpatialGridController");
            const sprite = this.GetComponent("Sprite");

            if(sprite.currentAnim == "explode") {
                return;
            }

            const result = gridController.FindNearby(body._width * 2, body._height * 2);
            const tiles = result.filter(client => client.entity.groupList.has("block") || client.entity.groupList.has("stairs") || client.entity.groupList.has(this._targetGroup));

            body._oldPos.Copy(body._pos);
            const vel = body._vel.Clone();
            vel.Mult(elapsedTimeS);
            body._pos.Add(vel);

            for(let client of tiles) {
                if(physics.DetectCollision(body, client.entity.GetComponent("body"))) {
                    body._vel.x = 0;
                    sprite.PlayAnim("explode", 270, false, () => {
                        this._parent._scene.Remove(this._parent);
                    });
                    break;
                }
            }

        }
    }

    return {
        FireballController: FireballController
    };

})();