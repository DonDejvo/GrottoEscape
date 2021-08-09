import { Camera } from "./camera.js";
import { EntityManager } from "./entity-manager.js";

export class Scene {
    constructor() {
        this._entityManager = new EntityManager();
        this._drawable = [];
        this._camera = new Camera();
        this._paused = true;
        this._eventByDevice = navigator.userAgent.match(/ipod|ipad|iphone/i) ? "touchstart" : "click";
    }
    Add(e, n) {
        e._scene = this;
        this._entityManager.Add(e, n);
        const drawobj = e.GetComponent("drawobj");
        if(drawobj) {
            this._AddDrawable(drawobj);
        }
    }
    Remove(e) {
        this._entityManager.Remove(e);
        const drawobj = e.GetComponent("drawobj");
        if(drawobj) {
            this._RemoveDrawable(drawobj);
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
}