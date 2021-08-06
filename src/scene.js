import { Camera } from "./camera.js";
import { EntityManager } from "./entity-manager.js";

export class Scene {
    constructor() {
        this._entityManager = new EntityManager();
        this._drawable = [];
        this._camera = new Camera();
    }
    Add(e, n) {
        this._entityManager.Add(e, n);
        if(e.Draw) {
            this._AddDrawable(e);
        }
    }
    Remove(e) {
        this._entityManager.Remove(e);
        if(e.Draw) {
            const i = this._drawable.indexOf(e);
            if(i > 0) {
                this._drawable.splice(i, 1);
            }
        }
    }
    _AddDrawable(e) {
        this._drawable.push(e);
        for(let i = this._drawable.length - 1; i > 0; --i) {
            if(e._zIndex >= this._drawable[i - 1]._zIndex) {
                break;
            }
            [this._drawable[i], this._drawable[i - 1]] = [this._drawable[i - 1], this._drawable[i]];
        }
    }
    Update(elapsedTimeS) {
        this._entityManager.Update(elapsedTimeS);
    }
}