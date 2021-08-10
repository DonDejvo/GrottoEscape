import { Vector } from "./vector.js";

export const entity = (() => {

    class Entity {
        constructor() {
            this._pos = new Vector(0, 0);
            this._components = {};
            this._parent = null;
            this._name = null;
            this._scene = null;
            this.groupList = new Set([]);
        }
        Update(elapsedTimeS) {
            for(let k in this._components) {
                this._components[k].Update(elapsedTimeS);
            }
        }
        AddComponent(c, n) {
            if(!n) {
                n = c.constructor.name;
            }
            this._components[n] = c;
            c._parent = this;
            c.InitComponent();
        }
        GetComponent(n) {
            return this._components[n];
        }
        SetPosition(p) {
            this._pos.Copy(p);
        }
        FindEntity(n) {
            return this._parent.Get(n);
        }
    }

    class Component {
        constructor() {
            this._parent = null;
        }
        InitComponent() {}
        GetComponent(n) {
            return this._parent.GetComponent(n);
        }
        FindEntity(n) {
            return this._parent.FindEntity(n);
        }
        Update(_) {}
    }

    return {
        Entity: Entity,
        Component: Component
    };

})();