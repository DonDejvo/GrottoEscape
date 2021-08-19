import { Camera } from "./camera.js";
import { EntityManager } from "./entity-manager.js";

export class Scene {
    constructor(params) {
        this._params = params;
        this._entityManager = new EntityManager();
        this._drawable = [];
        this._camera = new Camera();
        this._paused = true;
        this._resources = this._params.resources;
        this._interactive = [];
    }
    Add(e, n) {
        e._scene = this;
        this._entityManager.Add(e, n);
        for(let k in e._components) {
            if(e._components[k].Draw) {
                this._AddDrawable(e._components[k]);
            }
        }
    }
    Remove(e) {
        this._entityManager.Remove(e);
        for(let k in e._components) {
            if(e._components[k].Draw) {
                this._RemoveDrawable(e._components[k]);
            }
        }
    }
    Get(n) {
        return this._entityManager.Get(n);
    }
    Filter(cb) {
        return this._entityManager.Filter(cb);
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
    _RemoveDrawable(e) {
        const i = this._drawable.indexOf(e);
        if(i > 0) {
            this._drawable.splice(i, 1);
        }
    }
    Play() {
        this._paused = false;
    }
    Pause() {
        this._paused = true;
    }
    Update(elapsedTimeS) {
        if(this._paused) {
            return;
        }
        this._entityManager.Update(elapsedTimeS);
        this._camera.Update(elapsedTimeS);
    }
    SetInteractive(e) {
        this._interactive.push(e);
    }
    OnClick() {}
}