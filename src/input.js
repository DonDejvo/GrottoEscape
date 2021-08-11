import { Vector } from "./vector.js";

export const input = (() => {

    class Button {
        constructor(domElement) {
            this._domElement = domElement;
            this.pressed = false;
            this._listeners = {};
            this._Init();
        }
        _Init() {
            const isTouch = "ontouchstart" in document;
            this._domElement.addEventListener(isTouch ? "touchstart" : "mousedown", () => {
                this._OnPress();
            });
            this._domElement.addEventListener(isTouch ? "touchend" : "mouseup", () => {
                this._OnRelease();
            });
        }
        _OnPress() {
            this.pressed = true;
            const ev = "press";
            this._HandleListeners(ev);
        }
        _OnRelease() {
            this.pressed = false;
            const ev = "release";
            this._HandleListeners(ev);
        }
        _HandleListeners(ev) {
            if(this._listeners[ev]) {
                for(let f of this._listeners[ev]) {
                    f();
                }
            }
        }
        AddListener(e, f) {
            if(!this._listeners[e]) {
                this._listeners[e] = [];
            }
            this._listeners[e].push(f);
        }
        RemoveListener(e, f) {
            const i = this._listeners[e].indexOf(f);
            if(i < 0) {
                return;
            }
            this._listeners[e].splice(i, 1);
        }
    }

    class Keyboard {
        constructor() {
            this._keys = new Set();
            this._listeners = {};
        }
        _Init() {
            document.addEventListener("keydown", (e) => {
                this._OnKeypress(e);
            });
            document.addEventListener("keyup", (e) => {
                this._OnKeyrelease(e);
            });
        }
        _OnKeypress(e) {
            this._keys.add(e.key);
            const ev = "keypress";
            this._HandleListeners(e.key, ev);
        }
        _OnKeyrelease(e) {
            this._keys.delete(e.key);
            const ev = "keyrelease";
            this._HandleListeners(e.key, ev);
        }
        IsPressed(key) {
            return this._keys.has(key);
        }
        _HandleListeners(key, ev) {
            if(this._listeners[key] && this._listeners[key][ev]) {
                for(let f of this._listeners[key][ev]) {
                    f();
                }
            }
        }
        AddListener(k, e, f) {
            if(!this._listeners[k]) {
                this._listeners[k] = {};
            }
            if(!this._listeners[k][e]) {
                this._listeners[k][e] = [];
            }
            this._listeners[k][e].push(f);
        }
        RemoveListener(k, e, f) {
            const i = this._listeners[k][e].indexOf(f);
            if(i < 0) {
                return;
            }
            this._listeners[k][e].splice(i, 1);
        }
    }

    class Joystick {
        constructor(domElement) {
            this._domElement = domElement;
            this.pressed = false;
            this._vec = new Vector(0, 0);
            this._listeners = {};
            this._Init();
        }
        _Init() {
            const isTouch = "ontouchstart" in document;
            this._domElement.addEventListener(isTouch ? "touchstart" : "mousedown", (e) => {
                this._OnPress(e);
            });
            this._domElement.addEventListener(isTouch ? "touchmove" : "mousemove", (e) => {
                this._OnMove(e);
            });
            this._domElement.addEventListener(isTouch ? "touchend" : "mouseup", (e) => {
                this._OnRelease(e);
            });
            this._OnResize();
            window.addEventListener("resize", () => {
                this._OnResize();
            });
        }
        _OnResize() {
            this._boundingRect = this._domElement.getBoundingClientRect();
        }
        _UpdateVec(pos) {
            this._vec.x = pos[0] - (this._boundingRect.left + this._boundingRect.width / 2);
            this._vec.y = pos[1] - (this._boundingRect.top + this._boundingRect.height / 2);
        }
        _OnPress(e) {
            const ev = "press";
            this.pressed = true;
            let touchIdx, pos;
            if(e.changedTouches) {
                touchIdx = e.changedTouches[0].identifier;
                pos = [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
            } else {
                touchIdx = 0;
                pos = [e.pageX, e.pageY];
            }
            this._touchIdx = touchIdx;
            this._UpdateVec(pos);
            this._HandleListeners(ev);
        }
        _OnMove(e) {
            if(!this.pressed) {
                return;
            }
            const ev = "move";
            if(e.changedTouches) {
                for(let touch of e.changedTouches) {
                    if(touch.identifier == this._touchIdx) {
                        this._UpdateVec([touch.pageX, touch.pageY]);
                        break;
                    }
                }
            } else {
                this._UpdateVec([e.pageX, e.pageY]);
            }
            this._HandleListeners(ev);

        }
        _OnRelease(e) {
            const ev = "release";
            this.pressed = false;
            this._vec.x = this._vec.y = 0;
            this._HandleListeners(ev);
        }
        _HandleListeners(ev) {
            if(this._listeners[ev]) {
                for(let f of this._listeners[ev]) {
                    f();
                }
            }
        }
        AddListener(e, f) {
            if(!this._listeners[e]) {
                this._listeners[e] = [];
            }
            this._listeners[e].push(f);
        }
        RemoveListener(e, f) {
            const i = this._listeners[e].indexOf(f);
            if(i < 0) {
                return;
            }
            this._listeners[e].splice(i, 1);
        }
        get range() {
            return Math.min(this._vec.Mag() / (Math.hypot(this._boundingRect.width, this._boundingRect.height) * 0.5), 1);
        }
        get angle() {
            return this._vec.Angle();
        }
    }

    return {
        Button: Button,
        Keyboard: Keyboard,
        Joystick: Joystick
    }

})();