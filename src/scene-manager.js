export class SceneManager {
    constructor() {
        this._currentSceneName = null;
        this._scenes = new Map();
    }
    AddScene(n, s) {
        this._scenes.set(n, s);
    }
    PlayScene(n) {
        this._currentSceneName = n;
        this._scenes.get(this._currentSceneName).Play();

    }
    PauseScene() {
        if(this._currentSceneName) {
            this._scenes.get(this._currentSceneName).Pause();
        }
    }
    Update(elapsedTimeS) {
        if(this._currentSceneName) {
            this._scenes.get(this._currentSceneName).Update(elapsedTimeS);
        }
    }
    get currentScene() {
        if(!this._currentSceneName) {
            return null;
        }
        return this._scenes.get(this._currentSceneName);
    }
}