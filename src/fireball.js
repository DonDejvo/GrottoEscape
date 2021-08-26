import { entity } from "./entity.js";
import { physics } from "./physics.js";
import { drawable } from "./drawable.js";
import { spatial_hash_grid } from "./spatial-hash-grid.js";

export const fireball = (() => {

    const CreateFireball = (producer, target) => {
        const e = new entity.Entity();
        e.groupList.add("fireball");

        e.SetPosition(producer.GetComponent("body")._pos);

        const sprite = new drawable.Sprite({
            zIndex: producer.GetComponent("Sprite")._zIndex,
            width: 48,
            height: 48,
            image: producer._parent._scene._resources["items"],
            frameWidth: 16,
            frameHeight: 16,
            flipX: !producer._lookingRight
        });
        sprite.AddAnim("fly", [
            { x: 0, y: 2 }, { x: 1, y: 2 }
        ]);
        sprite.AddAnim("explode", [
            { x: 3, y: 2 }, { x: 4, y: 2 }
        ]);
        sprite.PlayAnim("fly", 180, true);
        e.AddComponent(sprite);
        producer._parent._scene.Add(e);
        const body = new physics.Box({
            width: sprite._width * 0.5,
            height: sprite._height * 0.3
        });
        body._vel.x = producer._lookingRight ? 320 : -320;
        e.AddComponent(body, "body");

        const gridController = new spatial_hash_grid.SpatialGridController({
            grid: producer._parent._scene._grid,
            width: body._width,
            height: body._height
        });
        e.AddComponent(gridController);
        e.AddComponent(new FireballController({
            target: target
        }));
    }

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
                    if(client.entity.groupList.has(this._targetGroup)) {
                        const targetController = client.entity.GetComponent("Controller");
                        targetController.ReceiveDamage(20);
                    }
                    break;
                }
            }

        }
    }

    return {
        FireballController: FireballController,
        CreateFireball: CreateFireball
    };

})();