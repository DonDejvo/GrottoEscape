import { entity } from "./entity.js";
import { Vector } from "./vector.js";

export const physics = (() => {

    class Body extends entity.Component {
        constructor(params) {
            super();
            this._params = params;
            this._pos = new Vector(0, 0);
            this._oldPos = new Vector(0, 0);
            this._vel = new Vector(0, 0);
            this._friction = {
                x: (this._params.frictionX || 0),
                y: (this._params.frictionY || 0)
            };
            this._collide = {left: new Set(), right: new Set(), top: new Set(), bottom: new Set()};
        }
        InitComponent() {
            this._pos = this._parent._pos;
            this._oldPos = this._pos.Clone();
        }
        SetPosition(p) {
            this._pos.Copy(p);
            this._oldPos.Copy(p);
        }
        Update(_) {
            
        }
    }

    class Box extends Body {
        constructor(params) {
            super(params);
            this._width = params.width;
            this._height = params.height;
        }
        get left() {
            return this._pos.x - this._width / 2;
        }
        get right() {
            return this._pos.x + this._width / 2;
        }
        get top() {
            return this._pos.y - this._height / 2;
        }
        get bottom() {
            return this._pos.y + this._height / 2;
        }
    }

    class Line extends Body {
        constructor(params) {
            super(params);
            this._start = new Vector(this._params.start.x, this._params.start.y);
            this._end = new Vector(this._params.end.x, this._params.end.y);
        }
        InitComponent() {
            super.InitComponent();
            this._start.Add(this._pos);
            this._end.Add(this._pos);
        }
        Update(_) {
            
        }
    }

    const GRAVITY = 550;

    const ResolveCollision = (mover, platform) => {
        switch(platform.constructor.name) {
            case "Box":
                ResolveCollisionBox(mover, platform);
                break;
            case "Line":
                ResolveCollisionLine(mover, platform);
                break;
        }
    };

    const ResolveCollisionBox = (mover, platform) => {

        const vec = mover._pos.Clone().Sub(mover._oldPos);
        
        let collided = false;

        if(vec.y != 0) {
            let y;
            y = (vec.y > 0 ? platform.top - mover._height / 2 : platform.bottom + mover._height / 2);
        
            let a = vec.y / (y - mover._oldPos.y);
            if(a >= 1) {
                collided = true;
                let x = vec.x / a + mover._oldPos.x;
                if(Math.abs(x - platform._pos.x) < (mover._width + platform._width) / 2) {
                    if(vec.y > 0) {
                        mover._pos.y = y - 0.001;
                        mover._collide.bottom.add(platform);
                    } else {
                        mover._pos.y = y + 0.001;
                        mover._collide.top.add(platform);
                    }
                }
            }
        }
        if(!collided && vec.x != 0) {
            let x;
            x = (vec.x > 0 ? platform.left - mover._width / 2 : platform.right + mover._width / 2);

            let a = vec.x / (x - mover._oldPos.x);
            if(a >= 1) {
                let y = vec.y / a + mover._oldPos.y;
                if(Math.abs(y - platform._pos.y) < (mover._height + platform._height) / 2) {
                    if(vec.x > 0) {
                        mover._pos.x = x - 0.001;
                        mover._collide.right.add(platform);
                    } else {
                        mover._pos.x = x + 0.001;
                        mover._collide.left.add(platform);
                    }
                }
            }
        }

        
    };

    const ResolveCollisionLine = (mover, platform) => {
        if(
            (mover._pos.x + mover._width / 2 - platform._start.x) * (mover._pos.x - mover._width / 2 - platform._end.x) > 0 ||
            (mover._pos.y + mover._height / 2 - Math.min(platform._start.y, platform._end.y)) * (mover._pos.y - mover._height / 2 - Math.max(platform._start.y, platform._end.y)) > 0
        ) {
            return;
        }
        
        const f = (x) => {
            return platform._start.y + x / (platform._end.x - platform._start.x) * (platform._end.y - platform._start.y);
        };
        const leftBottom = Math.max(mover._pos.x - mover._width / 2 - platform._start.x, 0);
        const rightBottom = Math.min(mover._pos.x + mover._width / 2 - platform._start.x, platform._end.x - platform._start.x);

        const minY = Math.min(f(leftBottom), f(rightBottom));
        const dy = minY - mover._pos.y;
        if(dy > mover._height / 2) {
            return;
        }
        mover._pos.y -= mover._height / 2 - dy;
        mover._collide.bottom.add(platform);
    };

    const DetectCollision = (body1, body2) => {
        if(body1.constructor.name == "Box" && body2.constructor.name == "Box") {
            return DetectCollisionBoxVsBox(body1, body2);
        } else if(body1.constructor.name == "Box" && body2.constructor.name == "Line") {
            return DetectCollisionBoxVsLine(body1, body2);
        }
        return false;
    };

    const DetectCollisionBoxVsBox = (body1, body2) => {
        return Math.abs(body1._pos.x - body2._pos.x) < (body1._width + body2._width) / 2 &&
        Math.abs(body1._pos.y - body2._pos.y) < (body1._height + body2._height) / 2;
    }

    const DetectCollisionBoxVsLine = (body1, body2) => {
        const [minX, maxX] = body2._start.x < body2._end.x ? [body2._start.x, body2._end.x] : [body2._end.x, body2._start.x];
        const [minY, maxY] = body2._start.y < body2._end.y ? [body2._start.y, body2._end.y] : [body2._end.y, body2._start.y];
        return (body1.left - maxX) * (body1.right - minX) < 0 && (body1.top - maxY) * (body1.bottom - minY) < 0;
    }

    return {
        Box: Box,
        Line: Line,
        GRAVITY: GRAVITY,
        ResolveCollision: ResolveCollision,
        DetectCollision: DetectCollision
    }

})();
