import { Vector } from "./vector.js";

export const entity = (() => {

    class Entity {
        constructor() {
            this._pos = new Vector(0, 0);
            this._components = {};
            this._parent = null;
            this._name = null;
        }
        Initialize() {}
        Deinitialize() {}
        Update(elapsedTimeS) {
            for(let k in this._components) {
                this._components[k].Update(elapsedTimeS);
            }
        }
        AddComponent(c) {
            this._components[c.constructor.name] = c;
            c._parent = this;
        }
        SetPosition(p) {
            this._pos.Copy(p);
        }
    }

    class Component {
        constructor() {
            this._parent = null;
        }
        Update(elapsedTimeS) {}
    }

    return {
        Entity: Entity,
        Component: Component
    };

})();