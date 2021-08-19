import { entity } from "./entity.js";
import { physics } from "./physics.js";

export class StorypointHandler extends entity.Component {
    constructor() {
        super();
        this._visited = false;
    }
    Update() {
        if(this._visited) {
            return;
        }

        const body = this.GetComponent("body");
        const player = this.FindEntity("player").GetComponent("body");

        if(physics.DetectCollision(body, player)) {
            this._visited = true;
            const scene = this._parent._scene;

            try {
                for(let m of scene._data.messages[scene._storypointIndex]) {
                    scene.AddMessage("res/assets/png/" + m.image, m.text);
                }
    
                ++scene._storypointIndex;
            } catch(err) {
                console.log("messages missing");
            }
        }
    }
}